// Animal data constants for the labyrinth game
// Each direction has multiple animals with different names, emojis, and audio files

export const ANIMAL_DATABASE = {
  up: [
    {
      emoji: '🦅',
      names: ['bird', 'eagle', 'hawk', 'falcon', 'raven', 'crow'],
      audioFile: 'sounds/bee_danger.mp3',
      dangerAudioFile: 'sounds/bee_danger.mp3'
    },
    {
      emoji: '🕊️',
      names: ['dove', 'pigeon', 'seagull', 'owl', 'sparrow'],
      audioFile: 'sounds/bee_danger.mp3',
      dangerAudioFile: 'sounds/bee_danger.mp3'
    },
    {
      emoji: '🦆',
      names: ['duck', 'goose', 'swan', 'pelican'],
      audioFile: 'sounds/bee_danger.mp3',
      dangerAudioFile: 'sounds/bee_danger.mp3'
    },
    {
      emoji: '🐝',
      names: ['bee', 'wasp', 'hornet', 'bumblebee'],
      audioFile: 'sounds/bee_danger.mp3',
      dangerAudioFile: 'sounds/bee_danger.mp3'
    }
  ],
  
  down: [
    {
      emoji: '🦔',
      names: ['mole', 'hedgehog', 'badger', 'groundhog'],
      audioFile: 'sounds/bee_danger.mp3',
      dangerAudioFile: 'sounds/bee_danger.mp3'
    },
    {
      emoji: '🐍',
      names: ['snake', 'viper', 'cobra', 'python', 'adder'],
      audioFile: 'sounds/bee_danger.mp3',
      dangerAudioFile: 'sounds/bee_danger.mp3'
    },
    {
      emoji: '🦎',
      names: ['lizard', 'gecko', 'iguana', 'salamander'],
      audioFile: 'sounds/bee_danger.mp3',
      dangerAudioFile: 'sounds/bee_danger.mp3'
    },
    {
      emoji: '🕷️',
      names: ['spider', 'tarantula', 'arachnid'],
      audioFile: 'sounds/bee_danger.mp3',
      dangerAudioFile: 'sounds/bee_danger.mp3'
    }
  ],
  
  left: [
    {
      emoji: '🐺',
      names: ['wolf', 'dog', 'fox', 'coyote', 'jackal'],
      audioFile: 'sounds/bee_danger.mp3',
      dangerAudioFile: 'sounds/bee_danger.mp3'
    },
    {
      emoji: '🐈',
      names: ['cat', 'feline', 'kitten', 'lynx', 'bobcat'],
      audioFile: 'sounds/bee_danger.mp3',
      dangerAudioFile: 'sounds/bee_danger.mp3'
    },
    {
      emoji: '🦝',
      names: ['raccoon', 'bandit', 'ringtail'],
      audioFile: 'sounds/bee_danger.mp3',
      dangerAudioFile: 'sounds/bee_danger.mp3'
    },
    {
      emoji: '🐿️',
      names: ['squirrel', 'chipmunk', 'marmot'],
      audioFile: 'sounds/bee_danger.mp3',
      dangerAudioFile: 'sounds/bee_danger.mp3'
    }
  ],
  
  right: [
    {
      emoji: '🐎',
      names: ['horse', 'stallion', 'mare', 'pony', 'mustang'],
      audioFile: 'sounds/bee_danger.mp3',
      dangerAudioFile: 'sounds/bee_danger.mp3'
    },
    {
      emoji: '🦌',
      names: ['deer', 'stag', 'doe', 'elk', 'reindeer'],
      audioFile: 'sounds/bee_danger.mp3',
      dangerAudioFile: 'sounds/bee_danger.mp3'
    },
    {
      emoji: '🐄',
      names: ['cow', 'bull', 'ox', 'buffalo', 'bison'],
      audioFile: 'sounds/bee_danger.mp3',
      dangerAudioFile: 'sounds/bee_danger.mp3'
    },
    {
      emoji: '🐐',
      names: ['goat', 'ram', 'sheep', 'lamb'],
      audioFile: 'sounds/bee_danger.mp3',
      dangerAudioFile: 'sounds/bee_danger.mp3'
    }
  ]
};

// Helper function to get a random animal for each direction
export function generateRandomAnimalSet() {
  const directions = ['up', 'down', 'left', 'right'];
  const selectedAnimals = {};
  
  directions.forEach(direction => {
    const animals = ANIMAL_DATABASE[direction];
    const randomIndex = Math.floor(Math.random() * animals.length);
    selectedAnimals[direction] = animals[randomIndex];
  });
  
  return selectedAnimals;
}

// Helper function to create animal direction mappings for the input handler
export function createAnimalDirections(selectedAnimals) {
  const animalDirections = {};
  const directionCoords = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  
  Object.entries(selectedAnimals).forEach(([direction, animal]) => {
    const coords = directionCoords[direction];
    
    // Add all animal names for this direction
    animal.names.forEach(name => {
      animalDirections[name.toLowerCase()] = {
        x: coords.x,
        y: coords.y,
        emoji: animal.emoji,
        sound: direction, // Use direction as sound identifier
        audioFile: animal.audioFile,
        dangerAudioFile: animal.dangerAudioFile
      };
    });
  });
  
  return animalDirections;
}

// Helper function to get display information for UI
export function getDisplayInfo(selectedAnimals) {
  return {
    up: {
      emoji: selectedAnimals.up.emoji,
      names: selectedAnimals.up.names.join(', '),
      primaryName: selectedAnimals.up.names[0]
    },
    down: {
      emoji: selectedAnimals.down.emoji,
      names: selectedAnimals.down.names.join(', '),
      primaryName: selectedAnimals.down.names[0]
    },
    left: {
      emoji: selectedAnimals.left.emoji,
      names: selectedAnimals.left.names.join(', '),
      primaryName: selectedAnimals.left.names[0]
    },
    right: {
      emoji: selectedAnimals.right.emoji,
      names: selectedAnimals.right.names.join(', '),
      primaryName: selectedAnimals.right.names[0]
    }
  };
}
