export class InputHandler {
  constructor() {
    this.keys = new Set();
    this.onMove = null; // Callback for movement
    this.onProbe = null; // Callback for probing with Shift+direction
    this.moveDelay = 150; // Milliseconds between moves
    this.lastMoveTime = 0;
    
    this.bindEvents();
  }
  
  bindEvents() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // Prevent default behavior for game keys
    document.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        e.preventDefault();
      }
    });
  }
  
  handleKeyDown(e) {
    this.keys.add(e.code);
    this.processMovement();
  }
  
  handleKeyUp(e) {
    this.keys.delete(e.code);
  }
  
  processMovement() {
    const now = Date.now();
    if (now - this.lastMoveTime < this.moveDelay) {
      return; // Too soon to move again
    }
    
    let direction = null;
    const isShiftHeld = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    
    // Check for movement keys (WASD or Arrow keys)
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) {
      direction = { x: 0, y: -1 };
    } else if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) {
      direction = { x: 0, y: 1 };
    } else if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) {
      direction = { x: -1, y: 0 };
    } else if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) {
      direction = { x: 1, y: 0 };
    }
    
    if (direction) {
      if (isShiftHeld && this.onProbe) {
        // Shift is held, this is a probe action
        this.onProbe(direction);
        this.lastMoveTime = now;
      } else if (!isShiftHeld && this.onMove) {
        // Normal movement
        this.onMove(direction);
        this.lastMoveTime = now;
      }
    }
  }
  
  // Method to handle continuous key holding
  update() {
    if (this.keys.size > 0) {
      this.processMovement();
    }
  }
  
  // Get current input state
  getInputState() {
    return {
      up: this.keys.has('KeyW') || this.keys.has('ArrowUp'),
      down: this.keys.has('KeyS') || this.keys.has('ArrowDown'),
      left: this.keys.has('KeyA') || this.keys.has('ArrowLeft'),
      right: this.keys.has('KeyD') || this.keys.has('ArrowRight'),
      shift: this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'),
    };
  }
  
  // Toggle Caps Lock as fallback for vibration
  toggleCapsLock() {
    // Create a temporary input to simulate caps lock toggle
    const temp = document.createElement('input');
    temp.style.position = 'absolute';
    temp.style.left = '-9999px';
    document.body.appendChild(temp);
    temp.focus();
    
    // Simulate caps lock key press
    const event = new KeyboardEvent('keydown', {
      key: 'CapsLock',
      code: 'CapsLock',
      keyCode: 20,
      which: 20
    });
    temp.dispatchEvent(event);
    
    setTimeout(() => {
      document.body.removeChild(temp);
    }, 100);
  }
  
  // Clean up event listeners
  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }
}
