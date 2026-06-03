/* ════════════════════════════════════════════════════════════════
   arena.js — ambient corner scene + 500-click defense challenge
   depends on: i18n.js, audio.js ; calls global awardChallenge()
   ════════════════════════════════════════════════════════════════ */

const Arena = (() => {
  // ── shared ───────────────────────────────────────────────────
  const ENEMY_EMOJI = { basic:'👾', fast:'👻', tough:'🤖', boss:'😈' };

  // ════════════════════════════════════════════════════════════
  // AMBIENT corner scene (decorative)
  // ════════════════════════════════════════════════════════════
  let aCv, aCtx, aw, ah, aScene;
  function initAmbient() {
    aCv = document.getElementById('ambient-canvas');
    aCtx = aCv.getContext('2d');
    const wrap = document.getElementById('ambient');
    function resize() {
      const r = wrap.getBoundingClientRect();
      aw = aCv.width = Math.max(2, Math.floor(r.width * 2));
      ah = aCv.height = Math.max(2, Math.floor(r.height * 2));
    }
    resize(); window.addEventListener('resize', resize);
    aScene = { players:[], shots:[], foes:[], parts:[], scroll:0, frame:0, foeT:0 };
    requestAnimationFrame(ambientLoop);
  }
  function ambientLoop() {
    const s = aScene; s.frame++; s.scroll -= 1;
    // sky
    const g = aCtx.createLinearGradient(0,0,0,ah);
    g.addColorStop(0,'#1a1230'); g.addColorStop(1,'#0a0818');
    aCtx.fillStyle = g; aCtx.fillRect(0,0,aw,ah);
    // stars
    aCtx.fillStyle='rgba(255,255,255,0.25)';
    for(let i=0;i<18;i++) aCtx.fillRect((i*61 + s.scroll*0.4)%aw, (i*37)%(ah*0.6), 2,2);
    // ground
    const gy = ah-22;
    aCtx.fillStyle='#241a3a'; aCtx.fillRect(0,gy,aw,22);
    aCtx.fillStyle='rgba(255,255,255,0.06)';
    for(let i=0;i<14;i++) aCtx.fillRect((i*40+s.scroll)%(aw+12)-6, gy+6, 6,2);

    // owned upgrades parade
    const owned = (window.State ? UPGRADES.filter(u=>State.owned[u.id]) : []);
    s.players = s.players.filter(p => owned.some(u=>u.id===p.id));
    owned.forEach((u,i)=>{ if(!s.players.some(p=>p.id===u.id)) s.players.push({id:u.id,emoji:u.emoji,color:u.color,bob:Math.random()*6,cd:20}); });
    // spawn ambient foes only if players exist
    if (owned.length){ s.foeT--; if(s.foeT<=0){ s.foeT=70+Math.random()*60; s.foes.push({x:aw+10,hp:1,hit:0}); } }
    aCtx.textAlign='center'; aCtx.textBaseline='bottom';
    s.players.forEach((p,i)=>{
      p.bob+=0.1; p.cd--;
      const px=20+i*26, py=gy+2+Math.sin(p.bob)*2;
      if(p.cd<=0){ p.cd=35+i*4; s.shots.push({x:px+10,y:gy-8,color:p.color}); }
      aCtx.font='22px serif'; aCtx.shadowBlur=10; aCtx.shadowColor=p.color;
      aCtx.fillText(p.emoji, px, py); aCtx.shadowBlur=0;
    });
    // shots
    s.shots.forEach(sh=>{ sh.x+=5; aCtx.fillStyle='#fff'; aCtx.fillRect(sh.x,sh.y,7,3); aCtx.fillStyle=sh.color; aCtx.fillRect(sh.x-1,sh.y-1,9,5);
      s.foes.forEach(f=>{ if(f.hp>0 && Math.abs(sh.x-f.x)<14){ f.hp--; f.hit=5; sh.dead=true; if(f.hp<=0){ for(let k=0;k<8;k++) s.parts.push({x:f.x,y:gy-8,dx:(Math.random()-.5)*5,dy:(Math.random()-.5)*5,life:18,c:RAINBOW[(Math.random()*7)|0]}); } } });
    });
    s.shots = s.shots.filter(sh=>!sh.dead && sh.x<aw+10);
    // foes
    s.foes.forEach(f=>{ f.x-=1.1; if(f.hit>0)f.hit--; aCtx.font='20px serif'; aCtx.fillStyle=f.hit>0?'#fff':'#ddd'; aCtx.fillText('👾', f.x, gy+2); });
    s.foes = s.foes.filter(f=>f.hp>0 && f.x>-20);
    // parts
    s.parts.forEach(p=>{ p.x+=p.dx;p.y+=p.dy;p.dy+=0.2;p.life--; aCtx.globalAlpha=p.life/18; aCtx.fillStyle=p.c; aCtx.fillRect(p.x,p.y,3,3); aCtx.globalAlpha=1; });
    s.parts = s.parts.filter(p=>p.life>0);

    requestAnimationFrame(ambientLoop);
  }
  function celebrate() {
    if(!aScene) return;
    const gy = ah-22;
    for(let k=0;k<22;k++) aScene.parts.push({x:Math.random()*aw,y:gy-10,dx:(Math.random()-.5)*6,dy:-Math.random()*5-1,life:24,c:RAINBOW[(Math.random()*7)|0]});
  }

  // ════════════════════════════════════════════════════════════
  // CHALLENGE — wave defense
  // ════════════════════════════════════════════════════════════
  let cCv, cCtx, cw, ch, raf=null, last=0, ch_active=false;
  let game = null;
  const REWARD = 200;

  function initChallenge() {
    cCv = document.getElementById('ch-canvas');
    cCtx = cCv.getContext('2d');
    const wrap = document.getElementById('ch-canvas-wrap');
    function resize() {
      const r = wrap.getBoundingClientRect();
      cw = cCv.width = Math.max(2, Math.floor(r.width));
      ch = cCv.height = Math.max(2, Math.floor(r.height));
    }
    window.addEventListener('resize', () => { if (ch_active) resize(); });
    wrap.addEventListener('pointerdown', onPointer);
    document.getElementById('ch-continue').addEventListener('click', closeChallenge);
    Arena._resizeChallenge = resize;
  }

  function startChallenge(wave) {
    Audio8.ensure();
    Audio8.startChallengeMusic();
    const modal = document.getElementById('challenge');
    modal.classList.add('show');
    document.getElementById('ambient').classList.add('hidden');
    document.getElementById('ch-result').className = 'ch-result';
    document.getElementById('ch-title').textContent = t().chTitle;
    document.getElementById('ch-instr').textContent = t().chInstr;
    document.getElementById('ch-wave-lab').textContent = t().chWave;
    document.getElementById('ch-wave').textContent = wave;
    document.getElementById('ch-hp-lab').textContent = t().chBase;
    document.getElementById('ch-time-lab').textContent = t().chTime;
    document.getElementById('ch-kills-lab').textContent = t().chKills;
    Arena._resizeChallenge();

    const owned = UPGRADES.filter(u => State.owned[u.id]);
    const dur = Math.min(26, 16 + wave); // seconds
    game = {
      wave, t: dur, dur, hp: 100, maxHp: 100, kills: 0,
      enemies: [], shots: [], parts: [],
      turrets: owned.map((u,i)=>({ emoji:u.emoji, color:u.color, cd: 30+i*5, rate: 28+i*3 })),
      spawnT: 30, shake: 0, over: false, clickDmg: 2 + Math.floor(wave/3),
    };
    ch_active = true;
    last = performance.now();
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loopChallenge);
  }

  function spawnEnemy() {
    const w = game.wave;
    const roll = Math.random();
    let type = 'basic';
    if (w >= 3 && roll < 0.18) type = 'tough';
    else if (roll < 0.30) type = 'fast';
    const baseSpeed = (cw/ (game.dur)) * 0.5; // px/s roughly crossing in ~2x duration
    const e = { type, x: cw + 24, y: 0, r: 16, hit: 0 };
    if (type === 'fast') { e.hp = 1; e.speed = 70 + w*6; e.dmg = 7; e.r = 13; }
    else if (type === 'tough') { e.hp = 4 + Math.floor(w/2); e.speed = 28 + w*2; e.dmg = 16; e.r = 19; }
    else { e.hp = 2; e.speed = 42 + w*4; e.dmg = 9; e.r = 16; }
    e.maxHp = e.hp;
    const gy = ch - 34;
    e.y = gy - e.r;
    game.enemies.push(e);
  }

  function onPointer(ev) {
    if (!game || game.over) return;
    const wrap = document.getElementById('ch-canvas-wrap');
    const r = wrap.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width * cw;
    const y = (ev.clientY - r.top) / r.height * ch;
    // hit topmost (rightmost) enemy in radius
    let best=null, bd=1e9;
    game.enemies.forEach(e=>{
      const dx=e.x-x, dy=(e.y+e.r*0.2)-y, d=dx*dx+dy*dy;
      const rr=(e.r+10)*(e.r+10);
      if (d<rr && d<bd){ bd=d; best=e; }
    });
    if (best){ damageEnemy(best, game.clickDmg, true); }
    else { Audio8.click(); }
  }

  function damageEnemy(e, dmg, byClick) {
    e.hp -= dmg; e.hit = 6;
    if (byClick) Audio8.hit();
    if (e.hp <= 0 && !e.dead) {
      e.dead = true; game.kills++;
      burst(e.x, e.y, e.type==='tough'?20:10);
      Audio8.hit();
    }
  }
  function burst(x,y,n){ for(let i=0;i<n;i++) game.parts.push({x,y,dx:(Math.random()-.5)*6,dy:(Math.random()-.5)*6,life:20+Math.random()*12,c:RAINBOW[(Math.random()*7)|0],s:2+Math.random()*2}); }

  function loopChallenge(now) {
    const dt = Math.min(0.05, (now - last)/1000); last = now;
    if (!ch_active) return;
    if (!game.over) update(dt);
    draw();
    raf = requestAnimationFrame(loopChallenge);
  }

  function update(dt) {
    game.t -= dt;
    if (game.shake>0) game.shake = Math.max(0, game.shake - dt*30);

    // spawning (rate scales with wave)
    game.spawnT -= dt*60;
    if (game.spawnT <= 0) { spawnEnemy(); game.spawnT = Math.max(22, 60 - game.wave*4) + Math.random()*20; }

    const baseEdge = 44;
    // enemies
    game.enemies.forEach(e=>{
      e.x -= e.speed*dt; if (e.hit>0) e.hit--;
      if (e.x <= baseEdge && !e.dead) {
        e.dead = true; game.hp -= e.dmg; game.shake = 7;
        burst(baseEdge, e.y, 8); Audio8.bossHit();
        if (game.hp <= 0) { game.hp = 0; endChallenge(false); }
      }
    });
    game.enemies = game.enemies.filter(e=>!e.dead);

    // turrets auto-fire
    const gy = ch - 34;
    game.turrets.forEach((tr,i)=>{
      tr.cd -= dt*60;
      if (tr.cd<=0){ tr.cd = tr.rate; game.shots.push({x:34, y:gy-10-i*3, color:tr.color, dmg:2}); }
    });
    // shots
    game.shots.forEach(sh=>{
      sh.x += 360*dt;
      game.enemies.forEach(e=>{ if(!e.dead && !sh.dead && Math.abs(sh.x-e.x)<e.r && Math.abs(sh.y-e.y)<e.r){ sh.dead=true; damageEnemy(e, sh.dmg, false); } });
    });
    game.shots = game.shots.filter(sh=>!sh.dead && sh.x<cw+20);

    // particles
    game.parts.forEach(p=>{ p.x+=p.dx;p.y+=p.dy;p.dy+=0.18;p.life--; });
    game.parts = game.parts.filter(p=>p.life>0);

    // win on time
    if (game.t <= 0 && !game.over) { game.t = 0; endChallenge(true); }

    // live HUD
    document.getElementById('ch-hp').style.width = (game.hp/game.maxHp*100)+'%';
    document.getElementById('ch-time').style.width = (game.t/game.dur*100)+'%';
    document.getElementById('ch-kills').textContent = game.kills;
  }

  function draw() {
    // bg
    const g = cCtx.createLinearGradient(0,0,0,ch);
    g.addColorStop(0,'#170f2e'); g.addColorStop(1,'#0a0818');
    cCtx.save();
    if (game.shake>0) cCtx.translate((Math.random()-.5)*game.shake, (Math.random()-.5)*game.shake);
    cCtx.fillStyle=g; cCtx.fillRect(-10,-10,cw+20,ch+20);
    // stars
    cCtx.fillStyle='rgba(255,255,255,0.18)';
    for(let i=0;i<40;i++) cCtx.fillRect((i*53)%cw,(i*29)%(ch*0.7),2,2);
    // ground
    const gy = ch-34;
    cCtx.fillStyle='#241a3a'; cCtx.fillRect(0,gy+18,cw,16);
    cCtx.fillStyle='rgba(255,255,255,0.06)';
    for(let i=0;i<cw/26;i++) cCtx.fillRect(i*26,gy+22,8,3);

    // base (left) — rainbow factory tower
    const baseEdge = 44;
    const grad = cCtx.createLinearGradient(0,0,baseEdge,0);
    RAINBOW.forEach((c,i)=>grad.addColorStop(i/(RAINBOW.length-1), c));
    cCtx.fillStyle = grad;
    cCtx.fillRect(0, 18, baseEdge-6, gy+0);
    cCtx.fillStyle='rgba(0,0,0,0.25)'; cCtx.fillRect(0,18,4,gy);
    cCtx.font='22px serif'; cCtx.textAlign='center'; cCtx.textBaseline='middle';
    cCtx.fillText('🏭', (baseEdge-6)/2, gy-6);

    // turrets stacked at base
    game.turrets.forEach((tr,i)=>{
      cCtx.font='18px serif'; cCtx.textAlign='center'; cCtx.textBaseline='bottom';
      cCtx.shadowBlur=8; cCtx.shadowColor=tr.color;
      cCtx.fillText(tr.emoji, baseEdge+8+ (i%3)*14, gy+2 - Math.floor(i/3)*16);
      cCtx.shadowBlur=0;
    });

    // shots
    game.shots.forEach(sh=>{ cCtx.fillStyle='#fff'; cCtx.fillRect(sh.x,sh.y,8,3); cCtx.fillStyle=sh.color; cCtx.fillRect(sh.x-1,sh.y-1,10,5); });

    // enemies
    game.enemies.forEach(e=>{
      const flash = e.hit>0;
      cCtx.font = (e.r*1.4)+'px serif'; cCtx.textAlign='center'; cCtx.textBaseline='middle';
      if (flash){ cCtx.shadowBlur=16; cCtx.shadowColor='#fff'; }
      cCtx.globalAlpha = 1;
      cCtx.fillText(ENEMY_EMOJI[e.type]||'👾', e.x, e.y);
      cCtx.shadowBlur=0;
      if (e.maxHp>1){ const bw=e.r*2; cCtx.fillStyle='rgba(0,0,0,0.5)'; cCtx.fillRect(e.x-bw/2,e.y-e.r-7,bw,4); cCtx.fillStyle=e.type==='tough'?'#ff5ed6':'#ffe24d'; cCtx.fillRect(e.x-bw/2,e.y-e.r-7,bw*(e.hp/e.maxHp),4); }
    });

    // particles
    game.parts.forEach(p=>{ cCtx.globalAlpha=Math.max(0,p.life/30); cCtx.fillStyle=p.c; cCtx.fillRect(p.x,p.y,p.s,p.s); });
    cCtx.globalAlpha=1;
    cCtx.restore();
  }

  function endChallenge(survived) {
    if (game.over) return;
    game.over = true;
    const res = document.getElementById('ch-result');
    const h = document.getElementById('ch-result-title');
    const p = document.getElementById('ch-result-sub');
    const rw = document.getElementById('ch-result-reward');
    if (survived) {
      res.className = 'ch-result win show';
      h.textContent = t().winTitle; p.textContent = t().winSub;
      rw.textContent = t().reward(REWARD); rw.style.display='block';
      Audio8.fanfare();
      if (window.awardChallenge) awardChallenge(REWARD);
      if (window.launchConfetti) launchConfetti(120);
    } else {
      res.className = 'ch-result lose show';
      h.textContent = t().loseTitle; p.textContent = t().loseSub;
      rw.style.display='none';
      Audio8.fail();
    }
    document.getElementById('ch-continue').textContent = t().continue;
  }

  function closeChallenge() {
    ch_active = false;
    if (raf) cancelAnimationFrame(raf); raf = null;
    document.getElementById('challenge').classList.remove('show');
    document.getElementById('ambient').classList.remove('hidden');
    Audio8.resumeNormalMusic();
  }

  function init() { initAmbient(); initChallenge(); }
  return { init, celebrate, startChallenge };
})();
