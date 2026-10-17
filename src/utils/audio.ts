// Web Audio API Synthesizer for Retro Sci-Fi Arcade Audio

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.15, delay: number = 0) {
    const c = this.getContext();
    if (!c) return;
    try {
      const t0 = c.currentTime + delay;
      const osc = c.createOscillator();
      const gain = c.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);

      gain.gain.setValueAtTime(volume, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

      osc.connect(gain);
      gain.connect(c.destination);

      osc.start(t0);
      osc.stop(t0 + duration + 0.03);
    } catch {
      // AudioContext failure recovery
    }
  }

  public playSweep(f0: number, f1: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.15, delay: number = 0) {
    const c = this.getContext();
    if (!c) return;
    try {
      const t0 = c.currentTime + delay;
      const osc = c.createOscillator();
      const gain = c.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(1, f0), t0);
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + duration);

      gain.gain.setValueAtTime(volume, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

      osc.connect(gain);
      gain.connect(c.destination);

      osc.start(t0);
      osc.stop(t0 + duration + 0.03);
    } catch {
      // AudioContext failure recovery
    }
  }

  public playNoise(duration: number, volume: number = 0.18, delay: number = 0) {
    const c = this.getContext();
    if (!c) return;
    try {
      const t0 = c.currentTime + delay;
      const bufferSize = Math.max(1, Math.floor(c.sampleRate * duration));
      const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const noise = c.createBufferSource();
      noise.buffer = buffer;

      const filter = c.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 850;

      const gain = c.createGain();
      gain.gain.setValueAtTime(volume, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(c.destination);

      noise.start(t0);
      noise.stop(t0 + duration + 0.03);
    } catch {
      // AudioContext failure recovery
    }
  }

  public play(name: 'roll' | 'launch' | 'hop' | 'capture' | 'finish' | 'win' | 'forfeit' | 'select' | 'tick') {
    if (this.isMuted) return;

    switch (name) {
      case 'roll':
        this.playTone(300, 0.04, 'square', 0.06, 0);
        this.playTone(360, 0.04, 'square', 0.06, 0.06);
        this.playTone(420, 0.05, 'square', 0.06, 0.12);
        break;

      case 'launch':
        this.playSweep(240, 780, 0.24, 'sawtooth', 0.14, 0);
        this.playTone(880, 0.1, 'sine', 0.12, 0.18);
        break;

      case 'hop':
        this.playTone(540, 0.05, 'triangle', 0.12, 0);
        break;

      case 'capture':
        this.playTone(560, 0.06, 'square', 0.16, 0);
        this.playNoise(0.18, 0.22, 0.02);
        this.playSweep(460, 90, 0.26, 'sawtooth', 0.18, 0.05);
        break;

      case 'finish':
        this.playTone(660, 0.1, 'sine', 0.16, 0);
        this.playTone(880, 0.12, 'sine', 0.16, 0.1);
        this.playTone(1046, 0.18, 'triangle', 0.14, 0.2);
        break;

      case 'win':
        [523, 659, 784, 1046, 1318].forEach((f, idx) => {
          this.playTone(f, 0.22, 'sine', 0.18, idx * 0.12);
        });
        break;

      case 'forfeit':
        this.playTone(180, 0.28, 'sawtooth', 0.14, 0);
        this.playTone(120, 0.35, 'sawtooth', 0.16, 0.18);
        break;

      case 'select':
        this.playTone(720, 0.04, 'sine', 0.09, 0);
        break;

      case 'tick':
        this.playTone(400, 0.03, 'sine', 0.05, 0);
        break;
    }
  }
}

export const sound = new SoundEngine();
