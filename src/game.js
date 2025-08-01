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
    this.speechEnabled = true;
    this.vibrationEnabled = true;
    this.debugMode = false; // Debug mode to show audio danger squares
    this.lastProximityWarning = 0;
    
    this.setupControls();
    this.bindEvents();
  }
  
  setupControls() {
    const newGameBtn = document.getElementById('newGameBtn');
    const debugToggle = document.getElementById('debugToggle');
    const soundToggle = document.getElementById('soundToggle');
    const speechToggle = document.getElementById('speechToggle');
    const vibrationToggle = document.getElementById('vibrationToggle');
    
    newGameBtn.addEventListener('click', () => {
      this.newGame();
    });

    debugToggle.addEventListener('click', () => {
      this.debugMode = !this.debugMode;
      debugToggle.textContent = `🐛 Debug: ${this.debugMode ? 'ON' : 'OFF'}`;
      
      // Show/hide debug info panel
      const debugInfo = document.getElementById('debugInfo');
      debugInfo.style.display = this.debugMode ? 'block' : 'none';
      
      // Update the maze to show/hide debug indicators
      this.maze.setDebugMode(this.debugMode);
      
      // Update current animals info in debug panel
      if (this.debugMode) {
        this.updateDebugInfo();
      }
      
      if (this.speechEnabled) {
        this.audioSystem.speak(this.debugMode ? 'Debug mode enabled. Audio danger squares are now visible.' : 'Debug mode disabled. Audio danger squares are hidden.');
      }
    });

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
  }
  
  bindEvents() {
    this.inputHandler.onMove = (animalMove) => {
      this.movePlayer(animalMove);
    };
    
    this.inputHandler.onInvalidMove = (invalidAnimal) => {
      this.handleInvalidAnimal(invalidAnimal);
    };
    
    this.inputHandler.onAnimalsChanged = (selectedAnimals) => {
      this.handleAnimalsChanged(selectedAnimals);
    };
  }
  
  handleAnimalsChanged(selectedAnimals) {
    // Update audio system with new animal data
    this.audioSystem.updateAnimalData(selectedAnimals);
    
    if (this.speechEnabled) {
      this.audioSystem.speak('New animals selected! Check the updated directions.');
    }
  }
  
  movePlayer(animalMove) {
    const direction = { x: animalMove.x, y: animalMove.y };
    const newX = this.player.x + direction.x;
    const newY = this.player.y + direction.y;
    
    // Check boundaries and walls
    if (this.maze.canMoveTo(newX, newY)) {
      this.player.moveTo(newX, newY);
      
      // Play animal sound for successful move (placeholder)
      this.audioSystem.playAnimalSound(animalMove.sound);
      
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
    } else {
      // Cannot move in that direction - play danger animal sound
      this.handleBlockedMove(animalMove);
    }
  }
  
  handleInvalidAnimal(invalidAnimal) {
    // Play a danger sound for invalid animal name
    this.audioSystem.playDangerSound('invalid_animal');
    
    if (this.speechEnabled) {
      this.audioSystem.speak(`Invalid animal: ${invalidAnimal}. Try bird, mole, wolf, or horse.`);
    }
  }
  
  handleBlockedMove(animalMove) {
    // Play danger sound for the specific animal when blocked
    this.audioSystem.playDangerSound(animalMove.sound);
    
    if (this.speechEnabled) {
      const directionName = this.getDirectionName(animalMove);
      this.audioSystem.speak(`Cannot go ${directionName}. Wall or boundary.`);
    }
  }
  
  getDirectionName(animalMove) {
    if (animalMove.x === 0 && animalMove.y === -1) return 'up';
    if (animalMove.x === 0 && animalMove.y === 1) return 'down';
    if (animalMove.x === -1 && animalMove.y === 0) return 'left';
    if (animalMove.x === 1 && animalMove.y === 0) return 'right';
    return 'unknown';
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
      alert('Game Over! You stepped on a dangerous square.\nReturning to start...');
      this.resetGame();
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
      alert('🎉 Congratulations! You survived the danger field!\nGenerating new challenge...');
      this.resetGame();
    }, 500);
  }
  
  resetGame() {
    this.maze.generate();
    this.player.moveTo(1, 1);
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
    
    // Initialize the UI with current animals
    this.updateAnimalDisplay();
    
    // Initialize debug info if debug mode is on
    if (this.debugMode) {
      this.updateDebugInfo();
    }
    
    requestAnimationFrame((time) => this.gameLoop(time));
  }
  
  // Restart game with new randomized animals
  newGame() {
    // Reset player position
    this.player.moveTo(1, 1);
    
    // Generate new maze
    this.maze.generate();
    
    // Randomize animals
    this.inputHandler.randomizeAnimals();
    
    // Update display
    this.updateAnimalDisplay();
    
    if (this.speechEnabled) {
      this.audioSystem.speak('New game started with different animals!');
    }
  }
  
  // Update the animal display in the UI
  updateAnimalDisplay() {
    const displayInfo = this.inputHandler.getDisplayInfo();
    
    // Update each direction display
    const directions = ['up', 'down', 'left', 'right'];
    directions.forEach(direction => {
      const element = document.querySelector(`[data-direction="${direction}"]`);
      if (element) {
        const info = displayInfo[direction];
        element.innerHTML = `${info.emoji} <strong>${info.names}</strong> → Move ${direction.toUpperCase()}`;
      }
    });
    
    // Update debug info if debug mode is enabled
    if (this.debugMode) {
      this.updateDebugInfo();
    }
  }
  
  // Update debug information panel
  updateDebugInfo() {
    const displayInfo = this.inputHandler.getDisplayInfo();
    const currentAnimalsElement = document.getElementById('currentAnimals');
    
    if (currentAnimalsElement) {
      const animalSummary = [
        `Up: ${displayInfo.up.emoji} ${displayInfo.up.primaryName}`,
        `Down: ${displayInfo.down.emoji} ${displayInfo.down.primaryName}`,
        `Left: ${displayInfo.left.emoji} ${displayInfo.left.primaryName}`,
        `Right: ${displayInfo.right.emoji} ${displayInfo.right.primaryName}`
      ].join(' | ');
      
      currentAnimalsElement.textContent = animalSummary;
    }
  }
  
  stop() {
    this.running = false;
    this.audioSystem.stopAll();
  }
}
