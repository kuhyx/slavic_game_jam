# Danger Field Game

A challenging browser-based danger field game where players must navigate through a deadly minefield using visual and audio cues. One wrong step ends the game!

## Features

### Core Gameplay
- **Player Movement**: Navigate using WASD keys or arrow keys
- **Open Minefield**: No internal walls - only outer boundary is impassable
- **Deadly Dangers**: Both visual and hidden dangers end the game instantly
- **High Stakes**: Navigate carefully - there are no second chances!
- **Goal**: Reach the exit (🏁) without touching any dangerous squares

### Feedback Systems
- **Visual Feedback**: 
  - **Safe squares**: Pure white appearance
  - **Visual danger squares**: Animated red with warning patterns (no audio)
  - **Audio danger squares**: Look identical to safe squares (white)
  - Exit square pulses green with a flag symbol
  - Player has a glowing green circle with subtle animations

- **Audio Feedback**: 
  - **Directional proximity warnings**: Spatial audio indicates direction of hidden dangers
    - **Left/Right**: Sound pans to the side where danger is located
    - **Up/Down**: Pitch changes (higher for above, lower for below)
    - **Multiple directions**: Combined audio cues for complex danger patterns
  - **Danger sounds**: When stepping on audio danger squares
  - **Victory melody**: When completing the maze
  - Built with Web Audio API with stereo panning and pitch modulation

- **Haptic Feedback**: 
  - **Game Over**: Strong vibration pattern when touching dangerous squares
  - **Victory**: Celebration vibration pattern when reaching the exit
  - Toggle on/off functionality

### Technical Features
- **HTML5 Canvas Rendering**: Smooth 60fps graphics
- **Modular Architecture**: Clean separation of concerns
- **Responsive Design**: Works on desktop and mobile devices
- **Modern JavaScript**: ES6+ features and modules
- **Open Field Design**: No maze walls, only boundary constraints

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- Modern web browser with Web Audio API support

### Installation
1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the provided local URL (typically `http://localhost:5173`)

### Building for Production
```bash
npm run build
```

## How to Play

1. **Movement**: Use WASD keys or arrow keys to move your character (green circle)
2. **Avoid All Dangers**: Both red squares and hidden audio dangers are **deadly**!
3. **Game Over**: Stepping on any dangerous square ends the game immediately
4. **Directional Audio Cues**: 
   - **Left/Right panning**: Sound comes from the side where hidden dangers are located
   - **Pitch variation**: Higher pitch for dangers above, lower pitch for dangers below
   - **Proximity warnings**: Listen carefully to avoid hidden dangers
5. **Open Navigation**: Move freely through the field - only the outer boundary blocks you
6. **Find the Exit**: Navigate to the green flag (🏁) to complete the level
7. **Challenge**: Complete the field without touching any dangerous squares!
8. **Headphone Recommended**: Use headphones or good speakers for optimal directional audio experience

## Game Controls

- **W / ↑**: Move up
- **A / ←**: Move left  
- **S / ↓**: Move down
- **D / →**: Move right
- **Sound Toggle**: Enable/disable audio feedback
- **Vibration Toggle**: Enable/disable haptic feedback

## Technical Architecture

The game is built with a modular architecture:

- `game.js`: Main game loop and state management
- `player.js`: Player entity and rendering
- `maze.js`: Field generation and rendering
- `audio.js`: Sound effects and Web Audio API integration  
- `input.js`: Keyboard input handling
- `style.css`: Game styling and responsive design

## Browser Compatibility

- **Audio**: Requires Web Audio API support with stereo panning (all modern browsers)
- **Vibration**: Requires Vibration API support (mobile browsers, some desktop)
- **Graphics**: HTML5 Canvas support (all modern browsers)
- **Directional Audio**: Best experienced with headphones or stereo speakers

## Development

This project uses Vite for fast development and building. The codebase follows modern JavaScript standards with ES6+ modules.

### Project Structure
```
src/
├── main.js      # Entry point
├── game.js      # Main game class
├── player.js    # Player entity
├── maze.js      # Maze generation and rendering
├── audio.js     # Audio system
├── input.js     # Input handling
└── style.css    # Styling
```

## License

This project is open source and available under the MIT License.
