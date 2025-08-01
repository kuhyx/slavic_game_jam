export class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.gainNode = null;
    this.activeSounds = new Set();
    this.initialized = false;
    this.lastSpokenDirection = '';
    this.speechEnabled = true;
    this.animalData = null; // Store current animal data
    
    this.initializeAudio();
  }
  
  // Update animal data when animals are randomized
  updateAnimalData(selectedAnimals) {
    this.animalData = selectedAnimals;
    console.log('Updated animal data in audio system:', this.animalData);
  }
  
  // Test method to check if audio files are accessible
  async testAudioFile(audioPath) {
    console.log(`Testing audio file: ${audioPath}`);
    try {
      const audio = new Audio(audioPath);
      return new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => {
          console.log(`✅ Audio file test successful: ${audioPath}`);
          resolve(true);
        });
        
        audio.addEventListener('error', (error) => {
          console.error(`❌ Audio file test failed: ${audioPath}`, error);
          reject(error);
        });
        
        audio.load();
      });
    } catch (error) {
      console.error(`❌ Audio file test exception: ${audioPath}`, error);
      throw error;
    }
  }
  
  async initializeAudio() {
    try {
      // Create audio context (requires user interaction)
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0.3; // Set volume to 30%
      
      this.initialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }
  
  async ensureAudioContext() {
    if (!this.initialized) {
      await this.initializeAudio();
    }
    
    if (this.audioContext && this.audioContext.state === 'suspended') {
      console.log('Audio context suspended, attempting to resume...');
      try {
        await this.audioContext.resume();
        console.log('Audio context resumed successfully');
      } catch (error) {
        console.error('Failed to resume audio context:', error);
      }
    }
  }
  
  createOscillator(frequency, type = 'sine', duration = 0.2, panValue = 0, pitchBend = 0) {
    if (!this.audioContext || !this.initialized) return null;
    
    const oscillator = this.audioContext.createOscillator();
    const envelope = this.audioContext.createGain();
    const panner = this.audioContext.createStereoPanner();
    
    oscillator.connect(envelope);
    envelope.connect(panner);
    panner.connect(this.gainNode);
    
    oscillator.frequency.value = frequency + pitchBend;
    oscillator.type = type;
    
    // Set stereo panning (-1 = left, 0 = center, 1 = right)
    panner.pan.value = Math.max(-1, Math.min(1, panValue));
    
    // Create ADSR envelope
    const now = this.audioContext.currentTime;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(1, now + 0.01); // Attack
    envelope.gain.exponentialRampToValueAtTime(0.01, now + duration); // Decay
    
    oscillator.start(now);
    oscillator.stop(now + duration);
    
    this.activeSounds.add(oscillator);
    oscillator.onended = () => {
      this.activeSounds.delete(oscillator);
    };
    
    return oscillator;
  }
  
  createNoise(duration = 0.1) {
    if (!this.audioContext || !this.initialized) return null;
    
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const source = this.audioContext.createBufferSource();
    const filter = this.audioContext.createBiquadFilter();
    const envelope = this.audioContext.createGain();
    
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.gainNode);
    
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    
    const now = this.audioContext.currentTime;
    envelope.gain.setValueAtTime(0.5, now);
    envelope.gain.linearRampToValueAtTime(0, now + duration);
    
    source.start(now);
    
    this.activeSounds.add(source);
    source.onended = () => {
      this.activeSounds.delete(source);
    };
    
    return source;
  }
  
  async playDangerSound() {
    await this.ensureAudioContext();
    
    // Create a danger sound with multiple frequencies and noise
    this.createOscillator(150, 'sawtooth', 0.3);
    this.createOscillator(200, 'square', 0.2);
    this.createNoise(0.15);
    
    // Add a low rumble
    setTimeout(() => {
      this.createOscillator(80, 'sine', 0.4);
    }, 100);
  }
  
  async playProximitySound() {
    await this.ensureAudioContext();
    
    // Create a subtle warning sound for proximity to audio danger
    this.createOscillator(300, 'sine', 0.1);
    this.createOscillator(250, 'sine', 0.1);
  }
  
  async playDirectionalProximitySound(directions) {
    // Use text-to-speech instead of sounds
    this.speakDirections(directions);
  }

  speakDirections(directions) {
    if (!this.speechEnabled || !('speechSynthesis' in window)) {
      return;
    }

    // Determine which directions to announce
    const activeDirections = [];
    
    if (directions.up) activeDirections.push('up');
    if (directions.down) activeDirections.push('down');
    if (directions.left) activeDirections.push('left');
    if (directions.right) activeDirections.push('right');

    if (activeDirections.length === 0) {
      return;
    }

    // Create the text to speak
    let textToSpeak;
    if (activeDirections.length === 1) {
      textToSpeak = activeDirections[0];
    } else if (activeDirections.length === 2) {
      textToSpeak = activeDirections.join(' and ');
    } else {
      textToSpeak = activeDirections.slice(0, -1).join(', ') + ', and ' + activeDirections[activeDirections.length - 1];
    }

    // Avoid repeating the same direction announcement
    if (textToSpeak === this.lastSpokenDirection) {
      return;
    }
    this.lastSpokenDirection = textToSpeak;

    // Stop any currently playing speech
    speechSynthesis.cancel();

    // Create and configure the speech utterance
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.2; // Slightly faster speech
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    // Clear the last spoken direction when speech ends
    utterance.onend = () => {
      setTimeout(() => {
        this.lastSpokenDirection = '';
      }, 500); // Small delay to prevent immediate repetition
    };

    // Speak the directions
    speechSynthesis.speak(utterance);
  }

  setSpeechEnabled(enabled) {
    this.speechEnabled = enabled;
    if (!enabled) {
      speechSynthesis.cancel();
      this.lastSpokenDirection = '';
    }
  }
  
  async playWinSound() {
    await this.ensureAudioContext();
    
    // Create a victory melody
    const notes = [262, 330, 392, 523]; // C, E, G, C (one octave higher)
    
    notes.forEach((frequency, index) => {
      setTimeout(() => {
        this.createOscillator(frequency, 'sine', 0.4);
      }, index * 100);
    });
    
    // Add harmony
    setTimeout(() => {
      this.createOscillator(659, 'sine', 0.6); // E
    }, 200);
  }
  
  async playGameOverSound() {
    await this.ensureAudioContext();
    
    // Create a descending game over sound
    const notes = [330, 294, 262, 220]; // E, D, C, A (descending)
    
    notes.forEach((frequency, index) => {
      setTimeout(() => {
        this.createOscillator(frequency, 'sawtooth', 0.5);
      }, index * 150);
    });
    
    // Add a final low note
    setTimeout(() => {
      this.createOscillator(147, 'square', 1.0); // Low D
    }, 600);
  }
  
  playMoveSound() {
    if (!this.initialized) return;
    
    // Subtle movement sound
    this.createOscillator(440, 'sine', 0.05);
  }
  
  // Placeholder method for animal sounds
  async playAnimalSound(direction) {
    await this.ensureAudioContext();
    
    console.log(`Attempting to play animal sound for direction: ${direction}`);
    console.log(`Animal data available:`, this.animalData);
    
    // Try to load and play actual audio file if available
    if (this.animalData && this.animalData[direction]) {
      const animal = this.animalData[direction];
      console.log(`Animal found:`, animal);
      
      // Try to play the actual audio file
      try {
        await this.playAudioFile(animal.audioFile);
        console.log(`${animal.emoji} Successfully played ${animal.names[0]} sound: ${animal.audioFile}`);
        return;
      } catch (error) {
        console.warn(`Could not play audio file ${animal.audioFile}:`, error);
        console.log('Falling back to placeholder sound');
      }
    } else {
      console.log('No animal data available, using placeholder sound');
    }
    
    // Fallback to placeholder sounds for different directions
    console.log(`Playing placeholder sound for direction: ${direction}`);
    switch (direction) {
      case 'up':
        // High pitched chirp
        this.createOscillator(800, 'sine', 0.2);
        setTimeout(() => this.createOscillator(1000, 'sine', 0.15), 100);
        console.log('🦅 Playing bird sound placeholder');
        break;
      case 'down':
        // Low rumbling sound
        this.createOscillator(150, 'sawtooth', 0.3);
        console.log('🦔 Playing mole sound placeholder');
        break;
      case 'left':
        // Howling sound
        this.createOscillator(300, 'triangle', 0.4);
        setTimeout(() => this.createOscillator(350, 'triangle', 0.3), 200);
        console.log('🐺 Playing wolf sound placeholder');
        break;
      case 'right':
        // Galloping rhythm
        this.createOscillator(200, 'square', 0.1);
        setTimeout(() => this.createOscillator(250, 'square', 0.1), 100);
        setTimeout(() => this.createOscillator(200, 'square', 0.1), 200);
        setTimeout(() => this.createOscillator(250, 'square', 0.1), 300);
        console.log('🐎 Playing horse sound placeholder');
        break;
      default:
        console.log('Playing default move sound');
        this.playMoveSound();
    }
  }
  
  // Danger sounds for when movement is blocked
  async playDangerSound(direction) {
    await this.ensureAudioContext();
    
    // Try to load and play actual danger audio file if available
    if (this.animalData && this.animalData[direction]) {
      const animal = this.animalData[direction];
      
      // Try to play the actual danger audio file
      try {
        await this.playAudioFile(animal.dangerAudioFile);
        console.log(`${animal.emoji}⚠️ Playing ${animal.names[0]} danger sound: ${animal.dangerAudioFile}`);
        return;
      } catch (error) {
        console.warn(`Could not play danger audio file ${animal.dangerAudioFile}, using placeholder sound`);
      }
    }
    
    // Play distorted/warning version of animal sounds
    switch (direction) {
      case 'up':
        // Distressed bird sound
        this.createOscillator(800, 'sawtooth', 0.3);
        this.createOscillator(600, 'sawtooth', 0.3);
        console.log('🦅⚠️ Playing bird danger sound placeholder');
        break;
      case 'down':
        // Angry mole sound
        this.createOscillator(100, 'square', 0.4);
        setTimeout(() => this.createOscillator(80, 'square', 0.3), 150);
        console.log('🦔⚠️ Playing mole danger sound placeholder');
        break;
      case 'left':
        // Aggressive wolf sound
        this.createOscillator(250, 'sawtooth', 0.5);
        setTimeout(() => this.createOscillator(200, 'sawtooth', 0.4), 100);
        console.log('🐺⚠️ Playing wolf danger sound placeholder');
        break;
      case 'right':
        // Rearing horse sound
        this.createOscillator(300, 'triangle', 0.2);
        setTimeout(() => this.createOscillator(400, 'triangle', 0.3), 100);
        setTimeout(() => this.createOscillator(500, 'triangle', 0.2), 200);
        console.log('🐎⚠️ Playing horse danger sound placeholder');
        break;
      case 'invalid_animal':
        // Generic error sound
        this.createOscillator(150, 'sawtooth', 0.3);
        setTimeout(() => this.createOscillator(120, 'sawtooth', 0.3), 200);
        console.log('❌ Playing invalid animal sound placeholder');
        break;
      default:
        // Generic danger sound
        this.createOscillator(200, 'sawtooth', 0.4);
    }
  }
  
  // Method to play actual audio files
  async playAudioFile(audioPath) {
    if (!this.audioContext || !this.initialized) {
      throw new Error('Audio context not initialized');
    }
    
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioPath);
      
      console.log(`Attempting to load audio file: ${audioPath}`);
      
      audio.addEventListener('canplaythrough', () => {
        console.log(`Audio file loaded successfully: ${audioPath}`);
        audio.play()
          .then(() => {
            console.log(`Audio file played successfully: ${audioPath}`);
            resolve();
          })
          .catch(error => {
            console.error(`Failed to play audio file ${audioPath}:`, error);
            reject(error);
          });
      });
      
      audio.addEventListener('error', (error) => {
        console.error(`Failed to load audio file ${audioPath}:`, error);
        reject(error);
      });
      
      audio.addEventListener('loadstart', () => {
        console.log(`Started loading audio file: ${audioPath}`);
      });
      
      // Set volume
      audio.volume = this.gainNode ? this.gainNode.gain.value : 0.3;
      
      // Try to load the audio file
      audio.load();
    });
  }
  
  stopAll() {
    this.activeSounds.forEach(sound => {
      try {
        if (sound.stop) {
          sound.stop();
        }
      } catch (error) {
        // Sound may have already stopped
      }
    });
    this.activeSounds.clear();
  }
  
  setVolume(volume) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
  
  // General speech synthesis method
  speak(text) {
    if (!this.speechEnabled || !text) {
      return;
    }
    
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }
    
    // Stop any current speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    // Speak the text
    speechSynthesis.speak(utterance);
  }
  
  // Set speech enabled/disabled
  setSpeechEnabled(enabled) {
    this.speechEnabled = enabled;
    
    // If disabling speech, stop any current speech
    if (!enabled && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }
  
  // Game over sound
  async playGameOverSound() {
    await this.ensureAudioContext();
    
    // Create a descending game over sound
    const notes = [330, 294, 262, 220]; // E, D, C, A (descending)
    
    notes.forEach((frequency, index) => {
      setTimeout(() => {
        this.createOscillator(frequency, 'sawtooth', 0.5);
      }, index * 150);
    });
    
    // Add a final low note
    setTimeout(() => {
      this.createOscillator(147, 'square', 1.0); // Low D
    }, 600);
  }
  
  // Victory sound
  async playWinSound() {
    await this.ensureAudioContext();
    
    // Create a victory melody
    const notes = [262, 330, 392, 523]; // C, E, G, C (one octave higher)
    
    notes.forEach((frequency, index) => {
      setTimeout(() => {
        this.createOscillator(frequency, 'sine', 0.4);
      }, index * 100);
    });
    
    // Add harmony
    setTimeout(() => {
      this.createOscillator(659, 'sine', 0.6); // E
    }, 200);
  }
  
  // Play directional proximity sound (uses the existing speakDirections method)
  playDirectionalProximitySound(directions) {
    this.speakDirections(directions);
  }
}
