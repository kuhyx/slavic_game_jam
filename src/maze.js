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
    this.EXIT = 4;
  }
  
  generate() {
    // Initialize grid with safe squares
    this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(this.SAFE));
    this.dangerousSquares.clear();
    
    // Create outer boundary walls only
    this.createOuterWalls();
    
    // Add dangerous squares (about 30% of inner safe squares)
    this.addDangerousSquares();
    
    // Set exit (ensure it's not on the outer wall)
    this.exitX = this.cols - 2;
    this.exitY = this.rows - 2;
    this.grid[this.exitY][this.exitX] = this.EXIT;
    this.dangerousSquares.delete(`${this.exitX},${this.exitY}`);
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
    return this.grid[y][x] !== this.WALL;
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
    // Get all directions where audio danger squares are located
    const directions = {
      left: false,
      right: false,
      up: false,
      down: false,
      squares: []
    };
    
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        if (dx === 0 && dy === 0) continue; // Skip player's current position
        
        const checkX = playerX + dx;
        const checkY = playerY + dy;
        
        if (checkX >= 0 && checkX < this.cols && checkY >= 0 && checkY < this.rows) {
          if (this.grid[checkY][checkX] === this.DANGEROUS_AUDIO) {
            directions.squares.push({ x: checkX, y: checkY, dx, dy });
            
            // Determine primary directions
            if (dx < 0) directions.left = true;
            if (dx > 0) directions.right = true;
            if (dy < 0) directions.up = true;
            if (dy > 0) directions.down = true;
          }
        }
      }
    }
    
    return directions;
  }
  
  isExit(x, y) {
    return this.grid[y][x] === this.EXIT;
  }
  
  render(ctx, cellSize) {
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
          case this.DANGEROUS_AUDIO:
            // Safe squares and audio-danger squares look identical (white)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
            // Add subtle grid lines
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;
            ctx.strokeRect(pixelX, pixelY, cellSize, cellSize);
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
}
