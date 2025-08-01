# Danger Field Game

A browser-based danger field game where players navigate through an open area filled with hidden and visible dangers. The game provides multiple types of feedback to enhance the gaming experience.

## Features

### Core Gameplay
- **Player Movement**: Navigate using WASD keys or arrow keys
- **Open Field**: No internal walls - only outer boundary is impassable
- **Mixed Dangers**: Scattered visual and audio danger squares throughout the field
- **Goal**: Reach the exit (🏁) while avoiding various types of dangers

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
  - **Visual danger**: Quick double vibration (no audio)
  - **Audio danger**: Long vibration pattern with audio
  - **Victory**: Celebration vibration pattern
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
2. **Visual Dangers**: Red animated squares are dangerous - avoid them for safety
3. **Hidden Audio Dangers**: Some white squares look safe but are dangerous
4. **Directional Audio Cues**: 
   - **Left/Right panning**: Sound comes from the side where hidden dangers are located
   - **Pitch variation**: Higher pitch for dangers above, lower pitch for dangers below
   - **Rhythmic patterns**: Different timing patterns indicate direction
5. **Open Navigation**: Move freely through the field - only the outer boundary blocks you
6. **Find the Exit**: Navigate to the green flag (🏁) to complete the level
7. **Headphone Recommended**: Use headphones or good speakers for optimal directional audio experience

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
