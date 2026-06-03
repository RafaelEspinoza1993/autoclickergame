export const RAINBOW = ['#ff2d6f','#ff8a3d','#ffe24d','#4dff9e','#3dd6ff','#9a6bff','#ff5ed6'];

export const BASE_STORAGE = 500;

export const UPGRADES = [
  { id:'flag',    emoji:'🏳️‍🌈', cost:10,     rate:0.5,  color:'#ff2d6f' },
  { id:'wand',    emoji:'✨',          cost:50,     rate:2,    color:'#ff8a3d' },
  { id:'uni',     emoji:'🦄',          cost:200,    rate:8,    color:'#ffe24d' },
  { id:'diamond', emoji:'💎',          cost:1000,   rate:32,   color:'#4dff9e' },
  { id:'disco',   emoji:'🪩',          cost:5000,   rate:128,  color:'#3dd6ff' },
  { id:'crown',   emoji:'👑',          cost:25000,  rate:512,  color:'#9a6bff' },
  { id:'legend',  emoji:'🌈',          cost:100000, rate:2048, color:'#ff5ed6' },
];

export const STORAGE_UPGRADES = [
  { id:'st1', emoji:'📦', cost:150,     cap:5000,     color:'#ff8a3d' },
  { id:'st2', emoji:'🏪', cost:2500,    cap:20000,    color:'#ffe24d' },
  { id:'st3', emoji:'🏭', cost:25000,   cap:150000,   color:'#4dff9e' },
  { id:'st4', emoji:'🏙️', cost:300000,  cap:2000000,  color:'#9a6bff' },
  { id:'st5', emoji:'♾️', cost:3000000, cap:Infinity, color:'#ff5ed6' },
];

export const CLICK_UPGRADES = [
  { id:'ck1', emoji:'👆', cost:25,     power:1,   color:'#ff8a3d' },
  { id:'ck2', emoji:'✌️', cost:500,    power:5,   color:'#ffe24d' },
  { id:'ck3', emoji:'🤙', cost:5000,   power:25,  color:'#4dff9e' },
  { id:'ck4', emoji:'🖐️', cost:60000,  power:125, color:'#9a6bff' },
  { id:'ck5', emoji:'🫶', cost:800000, power:625, color:'#ff5ed6' },
];

export const LEVEL_THRESHOLDS = [0, 250, 2500, 25000, 200000];

export const ENEMY_EMOJI = { basic:'👾', fast:'👻', tough:'🤖', boss:'😈' };
export const CHALLENGE_REWARD = 200;
