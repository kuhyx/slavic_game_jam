export class Maze {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.grid = [];
    this.dangerousSquares = new Set();
    this.exitX = cols - 2;
    this.exitY = rows - 2;
    
    // Cell types
    this.WALL = 0;
    this.SAFE = 1;
    this.DANGEROUS_VISUAL = 2;  // Visually dangerous, no audio
    this.DANGEROUS_AUDIO = 3;   // Looks safe, has audio when near
    this.DANGEROUS_HIDDEN = 4;  // Invisible, only detectable with Shift+direction
    this.EXIT = 5;
  }
  
  generate() {
    // Initialize grid with safe squares
    this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(this.SAFE));
    this.dangerousSquares.clear();
    
    // Create outer boundary walls only
    this.createOuterWalls();
    
    // Set exit (ensure it's not on the outer wall)
    this.exitX = this.cols - 2;
    this.exitY = this.rows - 2;
    this.grid[this.exitY][this.exitX] = this.EXIT;
    
    // Add dangerous squares while ensuring a path exists
    this.addDangerousSquaresWithPathGuarantee();
  }
  
  createOuterWalls() {
    // Create walls only on the outer perimeter
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (x === 0 || x === this.cols - 1 || y === 0 || y === this.rows - 1) {
          this.grid[y][x] = this.WALL;
        }
      }
    }
  }
  
  addDangerousSquares() {
    const innerSafeSquares = [];
    
    // Find all inner safe squares (excluding outer wall boundary and player start)
    for (let y = 1; y < this.rows - 1; y++) {
      for (let x = 1; x < this.cols - 1; x++) {
        if (this.grid[y][x] === this.SAFE && !(x === 1 && y === 1) && !(x === this.exitX && y === this.exitY)) {
          innerSafeSquares.push({ x, y });
        }
      }
    }
    
    // Make 30% of inner safe squares dangerous (15% visual, 15% audio)
    const totalDangerousCount = Math.floor(innerSafeSquares.length * 0.3);
    const visualDangerousCount = Math.floor(totalDangerousCount * 0.5);
    const audioDangerousCount = totalDangerousCount - visualDangerousCount;
    
    this.shuffle(innerSafeSquares);
    
    // Add visual-only dangerous squares
    for (let i = 0; i < visualDangerousCount; i++) {
      const { x, y } = innerSafeSquares[i];
      this.grid[y][x] = this.DANGEROUS_VISUAL;
      this.dangerousSquares.add(`${x},${y}`);
    }
    
    // Add audio-only dangerous squares
    for (let i = visualDangerousCount; i < visualDangerousCount + audioDangerousCount; i++) {
      const { x, y } = innerSafeSquares[i];
      this.grid[y][x] = this.DANGEROUS_AUDIO;
      this.dangerousSquares.add(`${x},${y}`);
    }
  }

  addDangerousSquaresWithPathGuarantee() {
    const innerSafeSquares = [];
    
    // Find all inner safe squares (excluding outer wall boundary, player start, and exit)
    for (let y = 1; y < this.rows - 1; y++) {
      for (let x = 1; x < this.cols - 1; x++) {
        if (this.grid[y][x] === this.SAFE && !(x === 1 && y === 1) && !(x === this.exitX && y === this.exitY)) {
          innerSafeSquares.push({ x, y });
        }
      }
    }
    
    // Calculate target number of dangerous squares (40% of inner safe squares)
    const totalDangerousCount = Math.floor(innerSafeSquares.length * 0.4);
    const visualDangerousCount = Math.floor(totalDangerousCount * 0.33);
    const audioDangerousCount = Math.floor(totalDangerousCount * 0.33);
    const hiddenDangerousCount = totalDangerousCount - visualDangerousCount - audioDangerousCount;
    
    this.shuffle(innerSafeSquares);
    
    let addedDangerous = 0;
    let addedVisual = 0;
    let addedAudio = 0;
    let addedHidden = 0;
    
    // Add dangerous squares one by one, checking path after each addition
    for (let i = 0; i < innerSafeSquares.length && addedDangerous < totalDangerousCount; i++) {
      const { x, y } = innerSafeSquares[i];
      
      // Determine what type of dangerous square to add
      let dangerType;
      if (addedVisual < visualDangerousCount) {
        dangerType = this.DANGEROUS_VISUAL;
      } else if (addedAudio < audioDangerousCount) {
        dangerType = this.DANGEROUS_AUDIO;
      } else if (addedHidden < hiddenDangerousCount) {
        dangerType = this.DANGEROUS_HIDDEN;
      } else {
        break; // We've added enough dangerous squares
      }
      
      // Temporarily place the dangerous square
      const originalType = this.grid[y][x];
      this.grid[y][x] = dangerType;
      
      // Check if a path still exists from start to exit
      if (this.hasPathToExit(1, 1)) {
        // Path exists, keep this dangerous square
        this.dangerousSquares.add(`${x},${y}`);
        addedDangerous++;
        if (dangerType === this.DANGEROUS_VISUAL) {
          addedVisual++;
        } else if (dangerType === this.DANGEROUS_AUDIO) {
          addedAudio++;
        } else {
          addedHidden++;
        }
      } else {
        // Path blocked, revert this square to safe
        this.grid[y][x] = originalType;
      }
    }
  }

  // Breadth-first search to check if a safe path exists from start to exit
  hasPathToExit(startX, startY) {
    const visited = new Set();
    const queue = [{ x: startX, y: startY }];
    const targetKey = `${this.exitX},${this.exitY}`;
    
    while (queue.length > 0) {
      const { x, y } = queue.shift();
      const key = `${x},${y}`;
      
      if (key === targetKey) {
        return true; // Found path to exit
      }
      
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);
      
      // Check all four directions
      const directions = [
        { dx: 0, dy: -1 }, // up
        { dx: 0, dy: 1 },  // down
        { dx: -1, dy: 0 }, // left
        { dx: 1, dy: 0 }   // right
      ];
      
      for (const { dx, dy } of directions) {
        const newX = x + dx;
        const newY = y + dy;
        const newKey = `${newX},${newY}`;
        
        // Check if the new position is valid and safe to walk
        if (newX >= 0 && newX < this.cols && 
            newY >= 0 && newY < this.rows && 
            !visited.has(newKey) &&
            this.isSafeToWalk(newX, newY)) {
          queue.push({ x: newX, y: newY });
        }
      }
    }
    
    return false; // No safe path found
  }

  // Check if a position is safe to walk (only safe squares and exit)
  isSafeToWalk(x, y) {
    const cellType = this.grid[y][x];
    return cellType === this.SAFE || cellType === this.EXIT;
  }

  // Check if a position is walkable (not a wall - for game movement)
  isWalkable(x, y) {
    const cellType = this.grid[y][x];
    // Player can walk on all squares except walls
    // Dangerous squares end the game but are still walkable for movement
    return cellType !== this.WALL;
  }
  
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  canMoveTo(x, y) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
      return false;
    }
    return this.isWalkable(x, y);
  }
  
  isDangerous(x, y) {
    return this.grid[y][x] === this.DANGEROUS_VISUAL || this.grid[y][x] === this.DANGEROUS_AUDIO;
  }
  
  isDangerousVisual(x, y) {
    return this.grid[y][x] === this.DANGEROUS_VISUAL;
  }
  
  isDangerousAudio(x, y) {
    return this.grid[y][x] === this.DANGEROUS_AUDIO;
  }
  
  isDangerousHidden(x, y) {
    return this.grid[y][x] === this.DANGEROUS_HIDDEN;
  }
  
  isNearAudioDanger(playerX, playerY, range = 1) {
    // Check if player is within range of any audio danger squares
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const checkX = playerX + dx;
        const checkY = playerY + dy;
        if (checkX >= 0 && checkX < this.cols && checkY >= 0 && checkY < this.rows) {
          if (this.grid[checkY][checkX] === this.DANGEROUS_AUDIO) {
            return true;
          }
        }
      }
    }
    return false;
  }
  
  getAudioDangerDirections(playerX, playerY, range = 1) {
    // Get all directions where audio danger squares are located (cardinal directions only)
    const directions = {
      left: false,
      right: false,
      up: false,
      down: false,
      squares: []
    };
    
    // Only check cardinal directions (no corners)
    const cardinalDirections = [
      { dx: -1, dy: 0, dir: 'left' },   // left
      { dx: 1, dy: 0, dir: 'right' },   // right
      { dx: 0, dy: -1, dir: 'up' },     // up
      { dx: 0, dy: 1, dir: 'down' }     // down
    ];
    
    for (const { dx, dy, dir } of cardinalDirections) {
      for (let dist = 1; dist <= range; dist++) {
        const checkX = playerX + (dx * dist);
        const checkY = playerY + (dy * dist);
        
        if (checkX >= 0 && checkX < this.cols && checkY >= 0 && checkY < this.rows) {
          if (this.grid[checkY][checkX] === this.DANGEROUS_AUDIO) {
            directions.squares.push({ x: checkX, y: checkY, dx: dx * dist, dy: dy * dist });
            directions[dir] = true;
          }
        }
      }
    }
    
    return directions;
  }
  
  isExit(x, y) {
    return this.grid[y][x] === this.EXIT;
  }
  
  render(ctx, cellSize, debugMode = false) {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const pixelX = x * cellSize;
        const pixelY = y * cellSize;
        
        switch (this.grid[y][x]) {
          case this.WALL:
            ctx.fillStyle = '#333333';
            ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
            // Add some texture to walls
            ctx.fillStyle = '#444444';
            ctx.fillRect(pixelX + 2, pixelY + 2, cellSize - 4, cellSize - 4);
            break;
            
          case this.SAFE:
            // Safe squares - white
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
            // Add subtle grid lines
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;
            ctx.strokeRect(pixelX, pixelY, cellSize, cellSize);
            break;

          case this.DANGEROUS_AUDIO:
            if (debugMode) {
              // In debug mode, show audio danger squares with a blue overlay
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
              
              // Add blue debug overlay with pulsing effect
              const time = Date.now() * 0.004;
              const pulse = (Math.sin(time + x + y) + 1) * 0.5;
              const alpha = 0.3 + pulse * 0.4;
              ctx.fillStyle = `rgba(0, 100, 255, ${alpha})`;
              ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
              
              // Add debug border
              ctx.strokeStyle = '#0066ff';
              ctx.lineWidth = 2;
              ctx.strokeRect(pixelX, pixelY, cellSize, cellSize);
              
              // Add audio symbol
              ctx.fillStyle = '#ffffff';
              ctx.font = `${cellSize * 0.4}px Arial`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('🔊', pixelX + cellSize / 2, pixelY + cellSize / 2);
            } else {
              // In normal mode, audio-danger squares look identical to safe squares (white)
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
              // Add subtle grid lines
              ctx.strokeStyle = '#e0e0e0';
              ctx.lineWidth = 1;
              ctx.strokeRect(pixelX, pixelY, cellSize, cellSize);
            }
            break;
            
          case this.DANGEROUS_HIDDEN:
            if (debugMode) {
              // In debug mode, show hidden danger squares with a purple overlay
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
              
              // Add purple debug overlay with pulsing effect
              const hiddenTime = Date.now() * 0.004;
              const hiddenPulse = (Math.sin(hiddenTime + x + y) + 1) * 0.5;
              const hiddenAlpha = 0.3 + hiddenPulse * 0.4;
              ctx.fillStyle = `rgba(128, 0, 128, ${hiddenAlpha})`;
              ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
              
              // Add debug border
              ctx.strokeStyle = '#800080';
              ctx.lineWidth = 2;
              ctx.strokeRect(pixelX, pixelY, cellSize, cellSize);
              
              // Add hidden symbol
              ctx.fillStyle = '#ffffff';
              ctx.font = `${cellSize * 0.4}px Arial`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('👁️', pixelX + cellSize / 2, pixelY + cellSize / 2);
            } else {
              // In normal mode, hidden danger squares look identical to safe squares
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
              // Add subtle grid lines
              ctx.strokeStyle = '#e0e0e0';
              ctx.lineWidth = 1;
              ctx.strokeRect(pixelX, pixelY, cellSize, cellSize);
            }
            break;
            
          case this.DANGEROUS_VISUAL:
            // Visual-only danger squares - animated red appearance
            const time = Date.now() * 0.003;
            const intensity = (Math.sin(time + x + y) + 1) * 0.5;
            const red = Math.floor(150 + intensity * 105);
            ctx.fillStyle = `rgb(${red}, 50, 50)`;
            ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
            
            // Add warning pattern
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + intensity * 0.3})`;
            ctx.fillRect(pixelX + 5, pixelY + 5, cellSize - 10, cellSize - 10);
            
            // Add border
            ctx.strokeStyle = '#ff6666';
            ctx.lineWidth = 2;
            ctx.strokeRect(pixelX, pixelY, cellSize, cellSize);
            break;
            
          case this.EXIT:
            // Animated exit square
            const exitTime = Date.now() * 0.005;
            const exitGlow = (Math.sin(exitTime) + 1) * 0.5;
            const green = Math.floor(100 + exitGlow * 155);
            ctx.fillStyle = `rgb(50, ${green}, 50)`;
            ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
            
            // Add exit symbol
            ctx.fillStyle = '#ffffff';
            ctx.font = `${cellSize * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🏁', pixelX + cellSize / 2, pixelY + cellSize / 2);
            break;
        }
      }
    }
  }
  
  cloneMaze() {
    // Create a deep copy of the current maze state for replay
    return {
      grid: this.grid.map(row => [...row]),
      dangerousSquares: new Set(this.dangerousSquares),
      exitX: this.exitX,
      exitY: this.exitY,
      cols: this.cols,
      rows: this.rows
    };
  }
}
