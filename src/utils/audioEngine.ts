/**
 * Ambient Audio Synthesizer utilizing Web Audio API for immersive, calming background audio.
 * Provides authentic, high-quality audio playback experience without external asset failures.
 */

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private gainNode: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private toneOsc1: OscillatorNode | null = null;
  private toneOsc2: OscillatorNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private volume: number = 0.8;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(trackCategory: string = 'General') {
    try {
      this.initContext();
      if (!this.ctx) return;
      this.stop();

      // Master Gain
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.15, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);

      // Low pass filter for soft warm acoustic character
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(580, this.ctx.currentTime);
      this.filterNode.connect(this.gainNode);

      // Gentle pink noise / mountain breeze generator
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      // Filter breeze slightly
      const breezeFilter = this.ctx.createBiquadFilter();
      breezeFilter.type = 'bandpass';
      breezeFilter.frequency.setValueAtTime(420, this.ctx.currentTime);
      breezeFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      this.noiseNode.connect(breezeFilter);
      breezeFilter.connect(this.filterNode);
      this.noiseNode.start();

      // Soft contemplative harmonics (pentatonic frequencies for Munnar mountain calm)
      const baseFreq = trackCategory === 'Poetry' ? 174.61 : trackCategory === 'Editorial' ? 220 : 196;
      this.toneOsc1 = this.ctx.createOscillator();
      this.toneOsc1.type = 'sine';
      this.toneOsc1.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

      this.toneOsc2 = this.ctx.createOscillator();
      this.toneOsc2.type = 'triangle';
      this.toneOsc2.frequency.setValueAtTime(baseFreq * 1.5, this.ctx.currentTime);

      const toneGain = this.ctx.createGain();
      toneGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      this.toneOsc1.connect(toneGain);
      this.toneOsc2.connect(toneGain);
      toneGain.connect(this.filterNode);

      this.toneOsc1.start();
      this.toneOsc2.start();

      this.isPlaying = true;
    } catch (e) {
      console.warn('Audio synthesis initialization notice:', e);
    }
  }

  public stop() {
    try {
      if (this.noiseNode) {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
        this.noiseNode = null;
      }
      if (this.toneOsc1) {
        this.toneOsc1.stop();
        this.toneOsc1.disconnect();
        this.toneOsc1 = null;
      }
      if (this.toneOsc2) {
        this.toneOsc2.stop();
        this.toneOsc2.disconnect();
        this.toneOsc2 = null;
      }
      this.isPlaying = false;
    } catch {
      // Audio nodes might already be stopped
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.15, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.15, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }
}

export const soundscape = new SoundscapeEngine();
