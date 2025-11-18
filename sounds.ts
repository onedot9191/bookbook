
let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let reverbNode: ConvolverNode | null = null;

const getAudioContext = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  return new AudioContext();
};

// Create a simple impulse response for reverb
const createImpulseResponse = (ctx: AudioContext, duration: number, decay: number, reverse: boolean) => {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const n = reverse ? length - i : i;
    // Exponential decay
    const val = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    left[i] = val;
    right[i] = val;
  }
  return impulse;
};

const initAudio = () => {
  if (!audioContext) {
    audioContext = getAudioContext();
    
    // Master Chain: Compressor -> Destination
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    
    compressor.connect(audioContext.destination);
    
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.5; // Master volume
    masterGain.connect(compressor);

    // Reverb Bus
    reverbNode = audioContext.createConvolver();
    reverbNode.buffer = createImpulseResponse(audioContext, 2.0, 2.0, false);
    const reverbGain = audioContext.createGain();
    reverbGain.gain.value = 0.4; // Reverb mix
    reverbNode.connect(reverbGain);
    reverbGain.connect(masterGain);
  }
  
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  
  return { ctx: audioContext, out: masterGain!, reverb: reverbNode! };
};

// Helper to play a tone with envelope
const playTone = (
  ctx: AudioContext, 
  dest: AudioNode, 
  reverb: AudioNode,
  freq: number, 
  type: OscillatorType, 
  startTime: number, 
  duration: number, 
  vol: number,
  options: { slideTo?: number, vibrato?: boolean } = {}
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  if (options.slideTo) {
    osc.frequency.exponentialRampToValueAtTime(options.slideTo, startTime + duration);
  }
  
  if (options.vibrato) {
     const vibOsc = ctx.createOscillator();
     const vibGain = ctx.createGain();
     vibOsc.frequency.value = 10; // 10Hz vibrato
     vibGain.gain.value = 10; // +/- 10Hz depth
     vibOsc.connect(vibGain);
     vibGain.connect(osc.frequency);
     vibOsc.start(startTime);
     vibOsc.stop(startTime + duration);
  }

  // Envelope
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.01); // Attack
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Decay

  osc.connect(gain);
  gain.connect(dest);
  // Send some signal to reverb for space
  gain.connect(reverb);

  osc.start(startTime);
  osc.stop(startTime + duration);
};

export const playSound = (type: 'correct' | 'wrong-1' | 'wrong-2' | 'complete' | 'finish') => {
  try {
    const { ctx, out, reverb } = initAudio();
    const now = ctx.currentTime;

    switch (type) {
      case 'correct':
        // Magical "Ching"
        // Major 7th chord stack: C6, E6, G6, B6
        const root = 1046.50; // C6
        [1, 1.25, 1.5, 1.875].forEach((ratio, i) => {
            playTone(ctx, out, reverb, root * ratio, 'sine', now + (i * 0.03), 0.4, 0.2);
            playTone(ctx, out, reverb, root * ratio, 'triangle', now + (i * 0.03), 0.4, 0.05); // Add some harmonics
        });
        break;

      case 'wrong-1':
        // 1st Attempt: Warning / Wobble
        // A quick, nervous vibration. Not too harsh, but indicates "Try again"
        playTone(ctx, out, reverb, 220, 'triangle', now, 0.15, 0.25, { slideTo: 180, vibrato: true });
        playTone(ctx, out, reverb, 225, 'sine', now + 0.05, 0.15, 0.25, { slideTo: 185 });
        break;

      case 'wrong-2':
        // 2nd Attempt: Failure / Locked
        // Revised to be "Similar to 1st but intensified".
        // Deeper, heavier slide downwards. Less "wobble", more "sinking".
        // Not discordant, just final.
        
        // Layer 1: Low Triangle slide (The body)
        playTone(ctx, out, reverb, 160, 'triangle', now, 0.25, 0.3, { slideTo: 90 });
        
        // Layer 2: Low Sine slide (The weight)
        playTone(ctx, out, reverb, 150, 'sine', now, 0.25, 0.4, { slideTo: 70 });

        // Layer 3: Subtle Sawtooth for the "Wrong" texture
        playTone(ctx, out, reverb, 155, 'sawtooth', now, 0.2, 0.15, { slideTo: 85 });
        break;

      case 'complete':
        // Level Up Sweep
        // Fast Arpeggio C Major
        const scale = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; 
        scale.forEach((freq, i) => {
            playTone(ctx, out, reverb, freq, 'sine', now + (i * 0.06), 0.6, 0.2);
            playTone(ctx, out, reverb, freq * 0.5, 'triangle', now + (i * 0.06), 0.6, 0.1);
        });
        // Noise Swoosh
        const noise = ctx.createBufferSource();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for(let i=0; i<data.length; i++) data[i] = Math.random() * 2 - 1;
        noise.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(200, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(5000, now + 0.3);
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.1, now);
        noiseGain.gain.linearRampToValueAtTime(0, now + 0.4);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(out);
        noiseGain.connect(reverb);
        noise.start(now);
        break;

      case 'finish':
        // Grand Fanfare + Fireworks
        // Big Chords
        const chordC = [261.63, 329.63, 392.00, 523.25]; // C Major
        const chordG = [196.00, 246.94, 293.66, 392.00]; // G Major
        const chordC_High = [523.25, 659.25, 783.99, 1046.50]; 

        // Sequence: C -> G -> C (Staccato -> Staccato -> Long)
        const strum = (chord: number[], time: number, dur: number) => {
            chord.forEach((f, i) => {
                // Mix saw and triangle for brass-like sound
                playTone(ctx, out, reverb, f, 'sawtooth', time + (i*0.01), dur, 0.15); 
                playTone(ctx, out, reverb, f, 'triangle', time + (i*0.01), dur, 0.2);
            });
        };

        strum(chordC, now, 0.3);
        strum(chordG, now + 0.4, 0.3);
        strum(chordC_High, now + 0.8, 2.5);
        
        // Cymbal crash simulation
        const crash = ctx.createBufferSource();
        const cBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const cDat = cBuf.getChannelData(0);
        for(let i=0; i<cDat.length; i++) cDat[i] = (Math.random() * 2 - 1);
        crash.buffer = cBuf;
        const cFilter = ctx.createBiquadFilter();
        cFilter.type = 'highpass';
        cFilter.frequency.value = 1000;
        const cGain = ctx.createGain();
        cGain.gain.setValueAtTime(0.3, now + 0.8);
        cGain.gain.exponentialRampToValueAtTime(0.01, now + 2.8);
        crash.connect(cFilter);
        cFilter.connect(cGain);
        cGain.connect(reverb);
        cGain.connect(out);
        crash.start(now + 0.8);

        break;
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};
