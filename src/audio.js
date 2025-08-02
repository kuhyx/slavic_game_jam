export class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.gainNode = null;
    this.activeSounds = new Set();
    this.initialized = false;
    this.lastSpokenDirection = '';
    this.speechEnabled = true;
    
    this.initializeAudio();
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
      await this.audioContext.resume();
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
    console.log('speakDirections called with:', directions);
    
    if (!this.speechEnabled) {
      console.log('Speech is disabled');
      return;
    }
    
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }

    // Determine which directions to announce
    const activeDirections = [];
    
    if (directions.up) activeDirections.push('up');
    if (directions.down) activeDirections.push('down');
    if (directions.left) activeDirections.push('left');
    if (directions.right) activeDirections.push('right');

    console.log('Active directions:', activeDirections);

    if (activeDirections.length === 0) {
      console.log('No active directions to announce');
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

    console.log('Text to speak:', textToSpeak);
    console.log('Last spoken direction:', this.lastSpokenDirection);

    // Avoid repeating the same direction announcement
    if (textToSpeak === this.lastSpokenDirection) {
      console.log('Skipping duplicate direction announcement');
      return;
    }
    this.lastSpokenDirection = textToSpeak;

    // Stop any currently playing speech
    speechSynthesis.cancel();

    try {
      // Check if speechSynthesis is ready
      if (speechSynthesis.speaking) {
        console.log('Speech synthesis is currently speaking, canceling...');
        speechSynthesis.cancel();
      }

      // Wait a bit for cancellation to complete
      setTimeout(() => {
        try {
          // Create and configure the speech utterance
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.rate = 1.0; // Normal speech rate to avoid issues
          utterance.pitch = 1.0;
          utterance.volume = 0.8;
          utterance.lang = 'en-US'; // Explicitly set language
          
          // Enhanced event handlers
          utterance.onstart = () => {
            console.log('Speech started for:', textToSpeak);
          };

          utterance.onend = () => {
            console.log('Speech ended for:', textToSpeak);
            setTimeout(() => {
              this.lastSpokenDirection = '';
            }, 500);
          };

          utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error, 'for text:', textToSpeak);
            console.error('Error details:', event);
            
            // Try to recover by clearing the last spoken direction
            setTimeout(() => {
              this.lastSpokenDirection = '';
            }, 100);
            
            // Fallback: try a simpler approach
            this.fallbackSpeech(textToSpeak);
          };

          utterance.onpause = () => {
            console.log('Speech paused');
          };

          utterance.onresume = () => {
            console.log('Speech resumed');
          };

          // Check if voices are available
          const voices = speechSynthesis.getVoices();
          console.log('Available voices:', voices.length, voices.map(v => v.name));
          
          if (voices.length > 0) {
            // Try to use a default English voice
            const englishVoice = voices.find(voice => 
              voice.lang.startsWith('en') && voice.default
            ) || voices.find(voice => 
              voice.lang.startsWith('en')
            ) || voices[0];
            
            if (englishVoice) {
              utterance.voice = englishVoice;
              console.log('Using voice:', englishVoice.name, englishVoice.lang);
            }
          }

          console.log('Starting speech synthesis for:', textToSpeak);
          
          // Speak the directions
          speechSynthesis.speak(utterance);
          
        } catch (innerError) {
          console.error('Inner error in speech synthesis:', innerError);
          this.fallbackSpeech(textToSpeak);
        }
      }, 100); // Small delay to ensure cancellation completes
      
    } catch (error) {
      console.error('Outer error in speech synthesis:', error);
      this.fallbackSpeech(textToSpeak);
    }
  }

  setSpeechEnabled(enabled) {
    this.speechEnabled = enabled;
    if (!enabled) {
      speechSynthesis.cancel();
      this.lastSpokenDirection = '';
    }
  }

  // Debug methods for testing directions
  debugTestDirection(direction) {
    console.log('Debug: Testing direction:', direction);
    const testDirections = {
      up: direction === 'up',
      down: direction === 'down',
      left: direction === 'left',
      right: direction === 'right',
      squares: [{ x: 0, y: 0, dx: 0, dy: 0 }] // Mock square data
    };
    this.speakDirections(testDirections);
  }

  debugTestMultipleDirections(directionsArray) {
    console.log('Debug: Testing multiple directions:', directionsArray);
    const testDirections = {
      up: directionsArray.includes('up'),
      down: directionsArray.includes('down'),
      left: directionsArray.includes('left'),
      right: directionsArray.includes('right'),
      squares: [{ x: 0, y: 0, dx: 0, dy: 0 }] // Mock square data
    };
    this.speakDirections(testDirections);
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
}
