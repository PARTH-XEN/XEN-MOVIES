// Web Audio API Spatial Synthesizer with 4 Distinct Sound Packs
// Zero external audio assets required

export const SOUND_PACKS = [
  {
    id: 'cyber-glass',
    name: 'Cyber Glass',
    desc: 'visionOS crystal glass taps & resonant reflections',
    icon: '💎'
  },
  {
    id: 'hologram-synth',
    name: 'Hologram Synth',
    desc: 'Futuristic sci-fi cyber lasers & resonant synth pulses',
    icon: '🔮'
  },
  {
    id: 'mechanical',
    name: 'Mechanical Switch',
    desc: 'Tactile mechanical keyboard switch snap & thud',
    icon: '⌨️'
  },
  {
    id: 'arcade-8bit',
    name: 'Retro Arcade 8-Bit',
    desc: 'Nostalgic chiptune bleeps & gaming jump blips',
    icon: '👾'
  },
  {
    id: 'neon-pulse',
    name: 'Neon Laser Pulse',
    desc: 'Electric synthwave laser zap & high-voltage surge',
    icon: '⚡'
  },
  {
    id: 'wooden-marimba',
    name: 'Acoustic Marimba',
    desc: 'Organic wooden tone mallet strikes & mellow warmth',
    icon: '🪵'
  },
  {
    id: 'space-bass',
    name: 'Deep Space Bass',
    desc: 'Heavy 808 sub-bass thud & sci-fi airlock sweep',
    icon: '🪐'
  },
  {
    id: 'minimal-bubble',
    name: 'Liquid Bubble Pop',
    desc: 'Crisp aquatic water droplet pop & glass ripple',
    icon: '🫧'
  }
];

class SpatialAudioController {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.soundPack = 'cyber-glass';

    if (typeof window !== 'undefined') {
      const savedSound = localStorage.getItem('xen_spatial_sound');
      if (savedSound !== null) {
        this.enabled = savedSound === 'true';
      }
      const savedPack = localStorage.getItem('xen_sound_pack');
      if (savedPack && SOUND_PACKS.some(p => p.id === savedPack)) {
        this.soundPack = savedPack;
      }

      // iOS Safari WebKit: Auto-unlock AudioContext on first user gesture (touch/click/key)
      const unlockAudio = () => {
        this.init();
        if (this.ctx && this.ctx.state === 'running') {
          ['touchstart', 'touchend', 'mousedown', 'keydown'].forEach(evt => {
            window.removeEventListener(evt, unlockAudio, { passive: true });
          });
        }
      };
      ['touchstart', 'touchend', 'mousedown', 'keydown'].forEach(evt => {
        window.addEventListener(evt, unlockAudio, { passive: true, once: true });
      });
    }
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleSound(forceState) {
    this.enabled = forceState !== undefined ? forceState : !this.enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('xen_spatial_sound', String(this.enabled));
    }
    return this.enabled;
  }

  setSoundPack(packId) {
    if (SOUND_PACKS.some(p => p.id === packId)) {
      this.soundPack = packId;
      if (typeof window !== 'undefined') {
        localStorage.setItem('xen_sound_pack', packId);
      }
      this.preview(packId);
    }
    return this.soundPack;
  }

  getSoundPack() {
    return this.soundPack;
  }

  // Preview a specific sound pack
  preview(packId) {
    this.playClick(packId, true);
  }

  // UI Tap / Click Sound with 4 Selectable Sound Packs
  playClick(packOverride, force = false) {
    if (!this.enabled && !force) return;
    try {
      this.init();
      if (!this.ctx) return;

      const pack = packOverride || this.soundPack;
      const now = this.ctx.currentTime;

      switch (pack) {
        // PACK 1: Cyber Glass (visionOS metallic glass snap)
        case 'cyber-glass': {
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(880, now);
          osc1.frequency.exponentialRampToValueAtTime(280, now + 0.045);

          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1760, now);
          osc2.frequency.exponentialRampToValueAtTime(440, now + 0.035);

          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.055);
          osc2.stop(now + 0.055);
          break;
        }

        // PACK 2: Hologram Synth (Sci-Fi laser pulse & resonant chirp)
        case 'hologram-synth': {
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(2400, now);
          filter.frequency.exponentialRampToValueAtTime(600, now + 0.06);
          filter.Q.setValueAtTime(4, now);

          gain.gain.setValueAtTime(0.07, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.07);
          break;
        }

        // PACK 3: Mechanical Switch (Tactile keyboard switch snap + keycap thud)
        case 'mechanical': {
          // 1. Snappy click
          const clickOsc = this.ctx.createOscillator();
          const clickGain = this.ctx.createGain();
          clickOsc.type = 'triangle';
          clickOsc.frequency.setValueAtTime(2200, now);
          clickOsc.frequency.exponentialRampToValueAtTime(120, now + 0.02);
          clickGain.gain.setValueAtTime(0.08, now);
          clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
          clickOsc.connect(clickGain);
          clickGain.connect(this.ctx.destination);
          clickOsc.start(now);
          clickOsc.stop(now + 0.025);

          // 2. Body thud
          const thudOsc = this.ctx.createOscillator();
          const thudGain = this.ctx.createGain();
          thudOsc.type = 'sine';
          thudOsc.frequency.setValueAtTime(160, now);
          thudOsc.frequency.exponentialRampToValueAtTime(50, now + 0.035);
          thudGain.gain.setValueAtTime(0.06, now);
          thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
          thudOsc.connect(thudGain);
          thudGain.connect(this.ctx.destination);
          thudOsc.start(now);
          thudOsc.stop(now + 0.045);
          break;
        }

        // PACK 4: Retro Arcade 8-Bit (Classic NES / GameBoy jump & coin bleep)
        case 'arcade-8bit': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'square';
          // Instant arpeggiated step
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(880, now + 0.02);
          osc.frequency.setValueAtTime(1320, now + 0.04);

          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.07);
          break;
        }

        // PACK 5: Neon Laser Pulse (Electric synthwave zap)
        case 'neon-pulse': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(1800, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }

        // PACK 6: Acoustic Marimba (Warm wooden resonator)
        case 'wooden-marimba': {
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(523.25, now); // C5
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(1569.75, now); // 3rd harmonic overtone

          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.095);
          osc2.stop(now + 0.095);
          break;
        }

        // PACK 7: Deep Space Bass (Sci-fi 808 sub-bass thud)
        case 'space-bass': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(35, now + 0.07);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.085);
          break;
        }

        // PACK 8: Liquid Bubble Pop (Crisp droplet)
        case 'minimal-bubble': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          // Upward water droplet pitch sweep
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(1400, now + 0.035);

          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }

        default: {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.045);
        }
      }
    } catch {
      // Audio autoplay policy catch
    }
  }

  // Hover Blip with Stereo Panning
  playHover(panX = 0) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (this.soundPack === 'arcade-8bit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(659, now); // E5
        gain.gain.setValueAtTime(0.018, now);
      } else if (this.soundPack === 'mechanical') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        gain.gain.setValueAtTime(0.022, now);
      } else if (this.soundPack === 'hologram-synth') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.025);
        gain.gain.setValueAtTime(0.015, now);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.03);
        gain.gain.setValueAtTime(0.025, now);
      }

      let node = osc;
      if (this.ctx.createStereoPanner) {
        const panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-1, Math.min(1, panX)), now);
        node.connect(panner);
        node = panner;
      }

      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      node.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Catch
    }
  }

  // Harmonic chord chime for modal opening
  playOpen() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const chord = this.soundPack === 'arcade-8bit'
        ? [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6 in 8bit style
        : [523.25, 659.25, 783.99, 1046.5];
      const now = this.ctx.currentTime;

      chord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = this.soundPack === 'arcade-8bit' ? 'square' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.025);

        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.03 / (idx + 1), now + idx * 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28 + idx * 0.02);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.025);
        osc.stop(now + 0.32);
      });
    } catch {
      // Catch
    }
  }

  // Slide swoosh
  playSlide() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.06);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.075);
    } catch {
      // Catch
    }
  }
}

export const spatialAudio = new SpatialAudioController();
