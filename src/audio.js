export class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.gainNode = null;
    this.activeSounds = new Set();
    this.initialized = false;
    
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
    await this.ensureAudioContext();
    
    // Calculate the dominant direction for panning
    let panValue = 0;
    let pitchModifier = 0;
    
    // Horizontal panning (left/right)
    if (directions.left && !directions.right) {
      panValue = -0.7; // Pan left
    } else if (directions.right && !directions.left) {
      panValue = 0.7; // Pan right
    }
    
    // Vertical pitch variation (up/down)
    if (directions.up && !directions.down) {
      pitchModifier = 50; // Higher pitch for above
    } else if (directions.down && !directions.up) {
      pitchModifier = -50; // Lower pitch for below
    }
    
    // Create directional warning sounds
    this.createOscillator(300, 'sine', 0.15, panValue, pitchModifier);
    this.createOscillator(250, 'sine', 0.15, panValue, pitchModifier * 0.5);
    
    // Add subtle rhythmic variation based on direction
    if (directions.up) {
      // Quick double beep for above
      setTimeout(() => {
        this.createOscillator(350, 'sine', 0.05, panValue, pitchModifier);
      }, 80);
    } else if (directions.down) {
      // Slower, deeper sound for below
      this.createOscillator(200, 'sine', 0.2, panValue, pitchModifier);
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
