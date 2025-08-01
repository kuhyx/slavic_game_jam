import './style.css'
import { Game } from './game.js'

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new Game(canvas);
  
  // Start the game
  game.start();
});
