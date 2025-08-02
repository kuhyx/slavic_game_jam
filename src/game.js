import { Player } from './player.js';
import { Maze } from './maze.js';
import { AudioSystem } from './audio.js';
import { InputHandler } from './input.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.running = false;
    this.lastTime = 0;
    
    // Game settings
    this.cellSize = 50;
    this.cols = Math.floor(canvas.width / this.cellSize);
    this.rows = Math.floor(canvas.height / this.cellSize);
    
    // Initialize game systems
    this.maze = new Maze(this.cols, this.rows);
    this.player = new Player(1, 1, this.cellSize);
    this.audioSystem = new AudioSystem();
    this.inputHandler = new InputHandler();
    
    // Game state
    this.soundEnabled = true;
    this.speechEnabled = true;
    this.vibrationEnabled = true;
    this.debugMode = false;
    this.lastProximityWarning = 0;
    
    // Move tracking for replay
    this.playerMoves = [];
    this.gameStartTime = null;
    this.currentMazeLayout = null;
    
    this.setupControls();
    this.bindEvents();
  }
  
  setupControls() {
    const soundToggle = document.getElementById('soundToggle');
    const speechToggle = document.getElementById('speechToggle');
    const vibrationToggle = document.getElementById('vibrationToggle');
    const debugToggle = document.getElementById('debugToggle');
    
    soundToggle.addEventListener('click', () => {
      this.soundEnabled = !this.soundEnabled;
      soundToggle.textContent = `🔊 Sound: ${this.soundEnabled ? 'ON' : 'OFF'}`;
      if (!this.soundEnabled) {
        this.audioSystem.stopAll();
      }
    });

    speechToggle.addEventListener('click', () => {
      this.speechEnabled = !this.speechEnabled;
      speechToggle.textContent = `🗣️ Speech: ${this.speechEnabled ? 'ON' : 'OFF'}`;
      this.audioSystem.setSpeechEnabled(this.speechEnabled);
    });
    
    vibrationToggle.addEventListener('click', () => {
      this.vibrationEnabled = !this.vibrationEnabled;
      vibrationToggle.textContent = `📳 Vibration: ${this.vibrationEnabled ? 'ON' : 'OFF'}`;
    });

    debugToggle.addEventListener('click', () => {
      this.debugMode = !this.debugMode;
      debugToggle.textContent = `🐛 Debug: ${this.debugMode ? 'ON' : 'OFF'}`;
      
      // Show/hide debug controls
      const debugControls = document.getElementById('debugControls');
      debugControls.style.display = this.debugMode ? 'block' : 'none';
      
      // Setup debug button listeners if debug mode is enabled
      if (this.debugMode) {
        this.setupDebugControls();
      }
    });
  }

  setupDebugControls() {
    const testUp = document.getElementById('testUp');
    const testDown = document.getElementById('testDown');
    const testLeft = document.getElementById('testLeft');
    const testRight = document.getElementById('testRight');
    const testMultiple = document.getElementById('testMultiple');
    const testAllDirections = document.getElementById('testAllDirections');

    // Remove existing listeners to prevent duplicates
    const buttons = [testUp, testDown, testLeft, testRight, testMultiple, testAllDirections];
    buttons.forEach(button => {
      if (button) {
        button.replaceWith(button.cloneNode(true));
      }
    });

    // Get fresh references after cloning
    const newTestUp = document.getElementById('testUp');
    const newTestDown = document.getElementById('testDown');
    const newTestLeft = document.getElementById('testLeft');
    const newTestRight = document.getElementById('testRight');
    const newTestMultiple = document.getElementById('testMultiple');
    const newTestAllDirections = document.getElementById('testAllDirections');

    // Add click listeners
    newTestUp?.addEventListener('click', () => {
      console.log('Debug: Testing UP direction');
      this.audioSystem.debugTestDirection('up');
    });

    newTestDown?.addEventListener('click', () => {
      console.log('Debug: Testing DOWN direction');
      this.audioSystem.debugTestDirection('down');
    });

    newTestLeft?.addEventListener('click', () => {
      console.log('Debug: Testing LEFT direction');
      this.audioSystem.debugTestDirection('left');
    });

    newTestRight?.addEventListener('click', () => {
      console.log('Debug: Testing RIGHT direction');
      this.audioSystem.debugTestDirection('right');
    });

    newTestMultiple?.addEventListener('click', () => {
      console.log('Debug: Testing UP and RIGHT directions');
      this.audioSystem.debugTestMultipleDirections(['up', 'right']);
    });

    newTestAllDirections?.addEventListener('click', () => {
      console.log('Debug: Testing ALL directions');
      this.audioSystem.debugTestMultipleDirections(['up', 'down', 'left', 'right']);
    });
  }
  
  bindEvents() {
    this.inputHandler.onMove = (direction) => {
      this.movePlayer(direction);
    };
  }
  
  movePlayer(direction) {
    const newX = this.player.x + direction.x;
    const newY = this.player.y + direction.y;
    
    // Check boundaries and walls
    if (this.maze.canMoveTo(newX, newY)) {
      this.player.moveTo(newX, newY);
      
      // Track player move for replay
      this.trackMove(newX, newY);
      
      // Check if player stepped on a visual danger square
      if (this.maze.isDangerousVisual(newX, newY)) {
        this.handleVisualDanger();
      }
      
      // Check if player stepped on an audio danger square
      if (this.maze.isDangerousAudio(newX, newY)) {
        this.handleAudioDanger();
      }
      
      // Check if player reached the exit
      if (this.maze.isExit(newX, newY)) {
        this.handleWin();
      }
    }
  }
  
  trackMove(x, y) {
    // Track player move with timestamp
    const timestamp = Date.now();
    this.playerMoves.push({
      x: x,
      y: y,
      timestamp: timestamp,
      relativeTime: timestamp - (this.gameStartTime || timestamp)
    });
  }
  
  handleVisualDanger() {
    // Visual danger squares end the game
    this.gameOver();
  }
  
  handleAudioDanger() {
    // Audio danger squares end the game
    this.gameOver();
  }
  
  gameOver() {
    if (this.soundEnabled) {
      this.audioSystem.playGameOverSound();
    }
    
    if (this.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 300]); // Game over vibration pattern
    }
    
    setTimeout(() => {
      this.showReplay('Game Over! You stepped on a dangerous square.');
    }, 500);
  }
  
  handleWin() {
    if (this.soundEnabled) {
      this.audioSystem.playWinSound();
    }
    
    if (this.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 100]); // Victory pattern
    }
    
    setTimeout(() => {
      this.showReplay('🎉 Congratulations! You survived the danger field!');
    }, 500);
  }
  
  showReplay(message) {
    // Create and show replay modal
    this.createReplayModal(message);
    this.startReplayAnimation();
  }
  
  createReplayModal(message) {
    // Remove existing modal if any
    const existingModal = document.getElementById('replayModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // Create modal HTML
    const modal = document.createElement('div');
    modal.id = 'replayModal';
    modal.innerHTML = `
      <div class="replay-backdrop">
        <div class="replay-content">
          <h2>${message}</h2>
          <div class="replay-stats">
            <p>Moves: ${this.playerMoves.length}</p>
            <p>Time: ${Math.round((Date.now() - this.gameStartTime) / 1000)}s</p>
          </div>
          <canvas id="replayCanvas" width="800" height="600"></canvas>
          <div class="replay-controls">
            <button id="restartBtn">🔄 Play Again</button>
            <button id="closeReplayBtn">❌ Close</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('restartBtn').addEventListener('click', () => {
      this.closeReplay();
      this.resetGame();
    });
    
    document.getElementById('closeReplayBtn').addEventListener('click', () => {
      this.closeReplay();
    });
  }
  
  startReplayAnimation() {
    const replayCanvas = document.getElementById('replayCanvas');
    const replayCtx = replayCanvas.getContext('2d');
    
    if (!replayCanvas || !replayCtx) return;
    
    let currentMoveIndex = 0;
    const animationSpeed = 300; // ms per move
    
    // Draw initial state
    this.drawReplayFrame(replayCtx, replayCanvas, -1);
    
    // Animate player moves
    const animateMove = () => {
      if (currentMoveIndex < this.playerMoves.length) {
        this.drawReplayFrame(replayCtx, replayCanvas, currentMoveIndex);
        currentMoveIndex++;
        setTimeout(animateMove, animationSpeed);
      }
    };
    
    // Start animation after a short delay
    setTimeout(animateMove, 1000);
  }
  
  drawReplayFrame(ctx, canvas, moveIndex) {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw maze with all audio dangers visible
    this.maze.render(ctx, this.cellSize, true); // Force debug mode for replay
    
    // Draw path up to current move
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (moveIndex >= 0 && this.playerMoves.length > 0) {
      ctx.beginPath();
      // Start from initial position
      ctx.moveTo(1 * this.cellSize + this.cellSize/2, 1 * this.cellSize + this.cellSize/2);
      
      // Draw line to each move up to current index
      for (let i = 0; i <= moveIndex && i < this.playerMoves.length; i++) {
        const move = this.playerMoves[i];
        ctx.lineTo(move.x * this.cellSize + this.cellSize/2, move.y * this.cellSize + this.cellSize/2);
      }
      ctx.stroke();
    }
    
    // Draw current player position
    if (moveIndex >= 0 && moveIndex < this.playerMoves.length) {
      const currentMove = this.playerMoves[moveIndex];
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(
        currentMove.x * this.cellSize + this.cellSize/2,
        currentMove.y * this.cellSize + this.cellSize/2,
        this.cellSize * 0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    } else if (moveIndex === -1) {
      // Draw initial position
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(
        1 * this.cellSize + this.cellSize/2,
        1 * this.cellSize + this.cellSize/2,
        this.cellSize * 0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
  
  closeReplay() {
    const modal = document.getElementById('replayModal');
    if (modal) {
      modal.remove();
    }
  }
  
  resetGame() {
    this.maze.generate();
    this.player.moveTo(1, 1);
    
    // Reset move tracking
    this.playerMoves = [];
    this.gameStartTime = Date.now();
    
    // Store current maze layout for replay
    this.currentMazeLayout = this.maze.cloneMaze();
  }
  
  update(deltaTime) {
    this.player.update(deltaTime);
    
    // Check proximity to audio danger squares and play directional warning speech
    if (this.speechEnabled) {
      const directions = this.maze.getAudioDangerDirections(this.player.x, this.player.y);
      if (directions.squares.length > 0) {
        this.playDirectionalProximityWarning(directions);
      }
    }
  }

  playDirectionalProximityWarning(directions) {
    // Play a directional warning speech when near audio danger squares
    // Use a timer to avoid playing too frequently
    const now = Date.now();
    if (!this.lastProximityWarning || now - this.lastProximityWarning > 1500) {
      console.log('Playing directional proximity sound');
      this.audioSystem.playDirectionalProximitySound(directions);
      this.lastProximityWarning = now;
    }
  }
  
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render maze with debug mode
    this.maze.render(this.ctx, this.cellSize, this.debugMode);
    
    // Render player
    this.player.render(this.ctx);
  }
  
  gameLoop(currentTime) {
    if (!this.running) return;
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    requestAnimationFrame((time) => this.gameLoop(time));
  }
  
  start() {
    this.running = true;
    this.maze.generate();
    
    // Initialize move tracking
    this.playerMoves = [];
    this.gameStartTime = Date.now();
    this.currentMazeLayout = this.maze.cloneMaze();
    
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.gameLoop(time));
  }
  
  stop() {
    this.running = false;
    this.audioSystem.stopAll();
  }
}
