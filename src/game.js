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
    this.cellSize = 40;
    this.cols = Math.floor(canvas.width / this.cellSize);
    this.rows = Math.floor(canvas.height / this.cellSize);
    
    // Initialize game systems
    this.maze = new Maze(this.cols, this.rows);
    this.player = new Player(1, 1, this.cellSize);
    this.audioSystem = new AudioSystem();
    this.inputHandler = new InputHandler();
    
    // Game state
    this.soundEnabled = true;
    this.vibrationEnabled = true;
    this.lastProximityWarning = 0;
    
    this.setupControls();
    this.bindEvents();
  }
  
  setupControls() {
    const soundToggle = document.getElementById('soundToggle');
    const vibrationToggle = document.getElementById('vibrationToggle');
    
    soundToggle.addEventListener('click', () => {
      this.soundEnabled = !this.soundEnabled;
      soundToggle.textContent = `🔊 Sound: ${this.soundEnabled ? 'ON' : 'OFF'}`;
      if (!this.soundEnabled) {
        this.audioSystem.stopAll();
      }
    });
    
    vibrationToggle.addEventListener('click', () => {
      this.vibrationEnabled = !this.vibrationEnabled;
      vibrationToggle.textContent = `📳 Vibration: ${this.vibrationEnabled ? 'ON' : 'OFF'}`;
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
  
  handleVisualDanger() {
    // Visual danger squares only provide vibration feedback (no audio)
    if (this.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate([150, 50, 150]); // Quick double vibration
    }
  }
  
  handleAudioDanger() {
    // Audio danger squares provide both sound and vibration
    if (this.soundEnabled) {
      this.audioSystem.playDangerSound();
    }
    
    if (this.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]); // Pattern: vibrate-pause-vibrate
    }
  }
  
  handleWin() {
    if (this.soundEnabled) {
      this.audioSystem.playWinSound();
    }
    
    if (this.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 100]); // Victory pattern
    }
    
    setTimeout(() => {
      alert('Congratulations! You completed the labyrinth!');
      this.resetGame();
    }, 500);
  }
  
  resetGame() {
    this.maze.generate();
    this.player.moveTo(1, 1);
  }
  
  update(deltaTime) {
    this.player.update(deltaTime);
    
    // Check proximity to audio danger squares and play directional warning sounds
    if (this.soundEnabled) {
      const directions = this.maze.getAudioDangerDirections(this.player.x, this.player.y);
      if (directions.squares.length > 0) {
        this.playDirectionalProximityWarning(directions);
      }
    }
  }
  
  playDirectionalProximityWarning(directions) {
    // Play a directional warning sound when near audio danger squares
    // Use a timer to avoid playing too frequently
    const now = Date.now();
    if (!this.lastProximityWarning || now - this.lastProximityWarning > 1000) {
      this.audioSystem.playDirectionalProximitySound(directions);
      this.lastProximityWarning = now;
    }
  }
  
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render maze
    this.maze.render(this.ctx, this.cellSize);
    
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
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.gameLoop(time));
  }
  
  stop() {
    this.running = false;
    this.audioSystem.stopAll();
  }
}
