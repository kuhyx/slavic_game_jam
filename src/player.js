export class Player {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = '#4CAF50';
    this.animationTime = 0;
    this.isMoving = false;
    this.moveSpeed = 5; // Animation speed multiplier
  }
  
  moveTo(x, y) {
    this.x = x;
    this.y = y;
    this.isMoving = true;
    this.animationTime = 0;
  }
  
  update(deltaTime) {
    if (this.isMoving) {
      this.animationTime += deltaTime * this.moveSpeed;
      if (this.animationTime >= 1000) { // 1 second animation
        this.isMoving = false;
        this.animationTime = 0;
      }
    }
  }
  
  render(ctx) {
    const pixelX = this.x * this.size;
    const pixelY = this.y * this.size;
    
    // Add a subtle pulse animation
    const pulse = Math.sin(Date.now() * 0.005) * 0.1 + 1;
    const radius = (this.size * 0.3) * pulse;
    
    // Draw player as a circle with glow effect
    ctx.save();
    
    // Glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    
    // Main player circle
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(
      pixelX + this.size / 2,
      pixelY + this.size / 2,
      radius,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Inner highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#81C784';
    ctx.beginPath();
    ctx.arc(
      pixelX + this.size / 2 - 3,
      pixelY + this.size / 2 - 3,
      radius * 0.6,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    ctx.restore();
  }
}
