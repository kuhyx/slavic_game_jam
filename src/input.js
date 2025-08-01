import { generateRandomAnimalSet, createAnimalDirections, getDisplayInfo } from './animals.js';

export class InputHandler {
  constructor() {
    this.onMove = null; // Callback for movement
    this.onInvalidMove = null; // Callback for invalid movement
    this.onAnimalsChanged = null; // Callback when animals are randomized
    this.currentInput = '';
    this.isListening = false;
    
    // Generate random animals for this game session
    this.selectedAnimals = generateRandomAnimalSet();
    this.animalDirections = createAnimalDirections(this.selectedAnimals);
    this.displayInfo = getDisplayInfo(this.selectedAnimals);
    
    this.bindEvents();
  }
  
  bindEvents() {
    // Create input field if it doesn't exist
    this.createInputField();
    
    // Listen for Enter key on the input field
    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.processAnimalInput();
      }
    });
    
    // Focus the input field
    this.inputField.focus();
  }
  
  
  createInputField() {
    // Check if input field already exists
    this.inputField = document.getElementById('animalInput');
    if (!this.inputField) {
      // Create the input field and add it to the game container
      this.inputField = document.createElement('input');
      this.inputField.id = 'animalInput';
      this.inputField.type = 'text';
      this.inputField.placeholder = 'Type an animal name to move...';
      this.inputField.className = 'animal-input';
      
      // Add to the controls section
      const controls = document.querySelector('.controls');
      if (controls) {
        controls.appendChild(this.inputField);
      }
    }
  }
  
  processAnimalInput() {
    const input = this.inputField.value.toLowerCase().trim();
    this.inputField.value = ''; // Clear input
    
    if (input === '') return;
    
    // Check if the input matches any animal
    const animalMove = this.animalDirections[input];
    
    if (animalMove && this.onMove) {
      // Valid animal - trigger movement
      this.onMove(animalMove);
    } else if (this.onInvalidMove) {
      // Invalid animal - trigger danger sound
      this.onInvalidMove(input);
    }
  }
  
  getDirectionEmojis() {
    return {
      up: '🦅',    // Bird for up
      down: '🦔',  // Mole for down  
      left: '🐺',  // Wolf for left
      right: '🐎'  // Horse for right
    };
  }
  
  getValidAnimals() {
    return Object.keys(this.animalDirections);
  }
  
  // Randomize animals for a new game
  randomizeAnimals() {
    this.selectedAnimals = generateRandomAnimalSet();
    this.animalDirections = createAnimalDirections(this.selectedAnimals);
    this.displayInfo = getDisplayInfo(this.selectedAnimals);
    
    // Update the UI display
    this.updateAnimalDisplay();
    
    // Notify game that animals have changed
    if (this.onAnimalsChanged) {
      this.onAnimalsChanged(this.selectedAnimals);
    }
  }
  
  // Update the animal direction display in the UI
  updateAnimalDisplay() {
    const directions = ['up', 'down', 'left', 'right'];
    
    directions.forEach(direction => {
      const element = document.querySelector(`[data-direction="${direction}"]`);
      if (element) {
        const info = this.displayInfo[direction];
        element.innerHTML = `${info.emoji} <strong>${info.names}</strong> → Move ${direction.toUpperCase()}`;
      }
    });
  }
  
  // Get current selected animals info for display
  getSelectedAnimals() {
    return this.selectedAnimals;
  }
  
  // Get display info for UI
  getDisplayInfo() {
    return this.displayInfo;
  }

  // Method to handle continuous key holding - no longer needed
  update() {
    // No longer needed for animal input system
  }

  // Get current input state - simplified for animal system
  getInputState() {
    return {
      currentInput: this.inputField ? this.inputField.value : '',
      isActive: this.inputField === document.activeElement
    };
  }

  // Clean up event listeners
  destroy() {
    if (this.inputField) {
      this.inputField.remove();
    }
  }
}
