/* ════════════════════════════════════════════════════════════════
   audio.js — synth SFX, layered chiptune music, mute, win kiss
   ════════════════════════════════════════════════════════════════ */

const Audio8 = (() => {
  let ctx = null;
  let muted = localStorage.getItem('ai_muted') === '1';
  let master = null;

  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 1;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function setMuted(m) {
    muted = m;
    localStorage.setItem('ai_muted', m ? '1' : '0');
    if (master) master.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.02);
  }
  function isMuted() { return muted; }

  function tone({ type='square', freq=440, t=0, dur=0.1, vol=0.15, glideTo=null, dest=null }) {
    const c = ensure();
    const start = c.currentTime + t;
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, start + dur);
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.0008, start + dur);
    osc.connect(g); g.connect(dest || master);
    osc.start(start); osc.stop(start + dur + 0.02);
    return { osc, g };
  }

  // ── one-shots ──────────────────────────────────────────────────
  let _combo = 0, _comboT = null;
  function click() {
    _combo = Math.min(_combo + 1, 8);
    clearTimeout(_comboT);
    _comboT = setTimeout(() => { _combo = 0; }, 420);
    const base  = 1300 + _combo * 80;
    const glide = 520  + _combo * 40;
    tone({ type:'square', freq:base,     glideTo:glide,    dur:0.07, vol:0.12 });
    tone({ type:'sine',   freq:base * 2, dur:0.04, vol:0.05 });
    if (_combo >= 6) {
      // sparkling harmony at high combos
      tone({ type:'sine', freq:base * 1.5, dur:0.06, vol:0.04 });
    }
  }

  function buy() {
    [880, 1100, 1320, 1760].forEach((f, i) =>
      tone({ type:'square', freq:f, t:i*0.05, dur:0.1, vol:0.1 }));
    tone({ type:'triangle', freq:440, glideTo:880, dur:0.18, vol:0.08 });
  }

  function buyClick() {
    // rapid ascending trill — feels sharp & precise
    [1760, 2093, 2637, 3136].forEach((f, i) =>
      tone({ type:'square', freq:f, t:i*0.03, dur:0.07, vol:0.08 }));
    tone({ type:'sine', freq:2637, glideTo:5274, dur:0.22, vol:0.05 });
  }

  function buyStorage() {
    // deep resonant expansion — weight & space
    [80, 100, 130, 165].forEach((f, i) =>
      tone({ type:'sine', freq:f, t:i*0.09, dur:0.4, vol:0.16 }));
    tone({ type:'triangle', freq:220, glideTo:440, dur:0.45, vol:0.09 });
  }

  // ── storage alarm ──────────────────────────────────────────────
  let _lastStoreBeep = 0;
  function storageWarn(pct) {
    const c = ensure();
    const now = c.currentTime;
    const gap = pct >= 100 ? 1.2 : 4.0;
    if (now - _lastStoreBeep < gap) return;
    _lastStoreBeep = now;
    if (pct >= 100) {
      tone({ type:'square', freq:880, glideTo:440, dur:0.12, vol:0.16 });
      tone({ type:'square', freq:880, glideTo:440, t:0.20, dur:0.12, vol:0.12 });
    } else {
      tone({ type:'sine', freq:660, glideTo:880, dur:0.1, vol:0.09 });
    }
  }

  // deep "Mortal-Kombat-announcer" stinger
  function announce() {
    const c = ensure();
    // low impact whoosh
    tone({ type:'sawtooth', freq:160, glideTo:50, dur:0.5, vol:0.22 });
    tone({ type:'square', freq:90, glideTo:60, dur:0.45, vol:0.14 });
    // metallic shimmer on top
    [1568, 2093, 2637].forEach((f,i)=>tone({type:'sine',freq:f,t:0.04+i*0.02,dur:0.25,vol:0.05}));
    // noise hit
    const dur = 0.25, sr = c.sampleRate, buf = c.createBuffer(1, sr*dur, sr);
    const d = buf.getChannelData(0);
    for (let i=0;i<d.length;i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/d.length, 2);
    const src = c.createBufferSource(); src.buffer = buf;
    const g = c.createGain(); g.gain.value = 0.18;
    const f = c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=1200;
    src.connect(f); f.connect(g); g.connect(master); src.start();
  }

  function laugh(level=1) {
    const notes = [600,720,660,820,760,920,860,1040];
    const count = Math.min(4 + level*2, notes.length);
    const intensity = 0.18 + level*0.05;
    for (let i=0;i<count;i++) {
      const f = notes[i];
      tone({ type:'sine', freq:f, glideTo:f*1.4, t:i*0.09, dur:0.11, vol:intensity });
    }
  }

  function hit() { tone({ type:'square', freq:240, glideTo:60, dur:0.1, vol:0.16 }); }
  function bossHit() {
    [90,70,50].forEach((f,i)=>tone({type:'sawtooth',freq:f,t:i*0.12,dur:0.2,vol:0.2}));
  }
  function fail() {
    [440,330,220,160].forEach((f,i)=>tone({type:'triangle',freq:f,t:i*0.12,dur:0.22,vol:0.16}));
  }
  function fanfare() {
    [523,659,784,1046,1318].forEach((f,i)=>tone({type:'square',freq:f,t:i*0.1,dur:0.3,vol:0.12}));
  }

  // long, loud smooch for winning the whole game 💋
  function kiss() {
    const c = ensure();
    const dur = 1.6;
    // suction sweep
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, c.currentTime + 0.5);
    osc.frequency.exponentialRampToValueAtTime(220, c.currentTime + 1.3);
    g.gain.setValueAtTime(0.001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.32, c.currentTime + 0.3);
    g.gain.setValueAtTime(0.32, c.currentTime + 1.0);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    // wobble for the smacking texture
    const lfo = c.createOscillator(), lg = c.createGain();
    lfo.type='sine'; lfo.frequency.value=14; lg.gain.value=120;
    lfo.connect(lg); lg.connect(osc.frequency);
    osc.connect(g); g.connect(master);
    osc.start(); lfo.start();
    osc.stop(c.currentTime + dur); lfo.stop(c.currentTime + dur);
    // the final "MUAH!" pop
    tone({ type:'sine', freq:520, glideTo:140, t:1.25, dur:0.4, vol:0.34 });
    tone({ type:'triangle', freq:260, glideTo:80, t:1.28, dur:0.35, vol:0.2 });
  }

  // ── layered chiptune music ─────────────────────────────────────
  const BPM = 132, BEAT = 60 / BPM;
  const TRACKS = {
    flag:   { wave:'square',   vol:0.05, notes:[[0,130.8],[1,164.8],[2,196],[3,164.8],[4,130.8],[5,196],[6,246.9],[7,196]] },
    wand:   { wave:'square',   vol:0.035,notes:[[0,523],[0.5,587],[1,659],[1.5,784],[2,880],[2.5,784],[3,659],[3.5,587],[4,523],[4.5,659],[5,784],[5.5,880],[6,1046],[6.5,880],[7,784],[7.5,659]] },
    uni:    { wave:'triangle', vol:0.05, notes:[[0,261.6],[2,329.6],[4,392],[6,523],[1,329.6],[3,392],[5,523],[7,659]] },
    diamond:{ wave:'square',   vol:0.028,notes:(()=>{const n=[];for(let b=0;b<8;b+=0.5)n.push([b,523+((b*131)%600)]);return n;})() },
    disco:  { wave:'square',   vol:0.04, notes:[[0,1046],[0.5,1174],[1,1318],[1.5,1174],[2,1396],[2.5,1318],[3,1174],[3.5,1046],[4,784],[4.5,880],[5,1046],[5.5,1174],[6,1318],[6.5,1396],[7,1568],[7.5,1760]] },
    crown:  { wave:'sawtooth', vol:0.022,notes:(()=>{const n=[];for(let b=0;b<8;b+=0.5)if((b*7)%3<2)n.push([b,200+((b*97)%700)]);return n;})() },
    legend: { wave:'square',   vol:0.038,notes:[[0,784],[0.5,1046],[1,1174],[1.5,1318],[2,1396],[2.5,1568],[3,1760],[3.5,1975],[4,1760],[4.5,1568],[5,1396],[5.5,1318],[6,1174],[6.5,1046],[7,880],[7.5,784]] },
  };
  // bass + kick foundation once any track is active
  const BASS = { wave:'triangle', vol:0.07, notes:[[0,65.4],[2,65.4],[4,87.3],[6,65.4]] };

  let playing = false, timer = null, beat = 0, ownedRef = () => ({});

  function scheduleBeat() {
    if (!playing) return;
    const c = ensure();
    const la = c.currentTime + 0.08;
    const owned = ownedRef();
    const ids = Object.keys(owned).filter(id => owned[id]);
    const win = beat % 8;

    // kick
    tone({ type:'sine', freq:120, glideTo:42, dur:0.13, vol:0.16 });
    // bass
    BASS.notes.forEach(([b,f])=>{ if (Math.floor(b)===win) tone({type:BASS.wave,freq:f,dur:0.2,vol:BASS.vol}); });

    ids.forEach(id => {
      const tr = TRACKS[id]; if (!tr) return;
      tr.notes.forEach(([b,f]) => {
        if (Math.floor(b) === win) {
          const off = (b - Math.floor(b)) * BEAT;
          tone({ type:tr.wave, freq:f, t:off, dur:0.09, vol:tr.vol });
        }
      });
    });
    beat++;
    timer = setTimeout(scheduleBeat, BEAT * 1000);
  }

  function startMusic(getOwned) {
    ownedRef = getOwned;
    if (playing) return;
    ensure(); playing = true; beat = 0; scheduleBeat();
  }
  function stopMusic() { playing = false; if (timer) clearTimeout(timer); timer = null; }
  function syncMusic(getOwned) {
    ownedRef = getOwned;
    const any = Object.values(getOwned()).some(Boolean);
    if (any && !playing) startMusic(getOwned);
    else if (!any && playing) stopMusic();
  }

  // ── challenge tension music ────────────────────────────────────
  // A-minor descending line over a driving sawtooth kick at 152 BPM
  const CH_BPM = 152, CH_BEAT = 60 / 152;
  const CH_LEAD = [
    [0,880],[0.5,784],[1,698.5],[1.5,784],
    [2,880],[2.5,1046.5],[3,880],[3.5,784],
    [4,698.5],[4.5,784],[5,659.3],[5.5,523.2],
    [6,587.3],[6.5,493.9],[7,440],[7.5,493.9],
  ];
  const CH_BASS = [[0,110],[2,130.8],[4,98],[6,110]];
  let chPlaying = false, chTimer = null, chBeat = 0;

  function scheduleCh() {
    if (!chPlaying) return;
    const win = chBeat % 8;
    // driving sawtooth kick
    tone({ type:'sawtooth', freq:140, glideTo:40, dur:0.09, vol:0.18 });
    // bass ostinato
    CH_BASS.forEach(([b, f]) => { if (b === win) tone({ type:'sawtooth', freq:f, dur:0.2, vol:0.07 }); });
    // tense melody
    CH_LEAD.forEach(([b, f]) => {
      if (Math.floor(b) === win) {
        const off = (b - Math.floor(b)) * CH_BEAT;
        tone({ type:'sawtooth', freq:f, t:off, dur:0.07, vol:0.055 });
      }
    });
    chBeat++;
    chTimer = setTimeout(scheduleCh, CH_BEAT * 1000);
  }

  function startChallengeMusic() {
    if (chPlaying) return;
    stopMusic();
    ensure(); chPlaying = true; chBeat = 0; scheduleCh();
  }
  function resumeNormalMusic() {
    chPlaying = false;
    if (chTimer) { clearTimeout(chTimer); chTimer = null; }
    syncMusic(ownedRef);
  }

  return { ensure, setMuted, isMuted, click, buy, buyClick, buyStorage, storageWarn,
           announce, laugh, hit, bossHit, fail, fanfare, kiss,
           startMusic, stopMusic, syncMusic, startChallengeMusic, resumeNormalMusic };
})();
