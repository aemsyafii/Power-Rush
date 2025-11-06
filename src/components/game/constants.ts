export const GAME_CONSTANTS = {
  // Game timing
  COUNTDOWN_SECONDS: 3,
  CONTINUE_COUNTDOWN_SECONDS: 7,
  WIN_PREVENTION_DELAY: 30000, // 30 seconds
  
  // Prize animation
  PRIZE_ANIMATION_DURATION: 3000, // 3 seconds
  MAX_ANIMATION_SPINS: 20,
  FINAL_SEQUENCE_SPINS: 3,
  FINAL_SEQUENCE_DELAY: 300, // milliseconds
  
  // Battery visual thresholds
  BATTERY_LOW_THRESHOLD: 30,
  BATTERY_MEDIUM_THRESHOLD: 70,
  
  // New Manual Random System
  DEFAULT_DURATION: 25, // D = 25 seconds (optimal for UX)
  MIN_CLICK_GAP: 67, // milliseconds (anti-spam) - reduced from 100ms to allow faster legitimate clicking
  CAP_TPS: 15, // Maximum clicks per second (increased from 9 to 15 - human limit for fast clickers)
  R_LO: 2, // Easy rate (tps)
  R_HI: 12, // Hard rate (tps) - increased to allow higher difficulty
  GAMMA: 1.3, // Non-linear difficulty curve exponent
  
  // Variance function: η(diff) = lerp(0.25 → 0.08, from 0% → 100%)
  VARIANCE_MIN: 0.08, // Variance at 100% difficulty (tight range)
  VARIANCE_MAX: 0.25, // Variance at 0% difficulty (wide range)
  
  // Lucky/Hard spike chances (optional)
  LUCKY_SPIKE_CHANCE: 0.05, // 5% chance for easier round
  HARD_SPIKE_CHANCE: 0.05, // 5% chance for harder round
  SPIKE_MULTIPLIER: 0.1, // ±10% adjustment for spikes
  
  // Animation settings
  ENERGY_PARTICLES_COUNT: 6,
  PARTICLE_ANIMATION_BASE_DURATION: 1000,
  PARTICLE_ANIMATION_RANDOM_RANGE: 500,
} as const;

export const GAME_COLORS = {
  // Ubah warna tabung baterai agar lebih mudah dilihat: merah-kuning-hijau
  BATTERY_LOW: 'bg-red-500 shadow-red-500/50',      // Merah untuk level rendah
  BATTERY_MEDIUM: 'bg-yellow-500 shadow-yellow-500/50',  // Kuning untuk level sedang
  BATTERY_HIGH: 'bg-green-500 shadow-green-500/50',   // Hijau untuk level tinggi
  BATTERY_LOW_GLOW: 'rgba(239, 68, 68, 0.6)',       // Glow merah
  BATTERY_MEDIUM_GLOW: 'rgba(234, 179, 8, 0.6)',     // Glow kuning
  BATTERY_HIGH_GLOW: 'rgba(34, 197, 94, 0.6)',       // Glow hijau
} as const;

export const KEYBOARD_KEYS = {
  SPACE: 'Space',
  ENTER: 'Enter',
} as const;

export const GAME_STATES = {
  INSTRUCTIONS: 'instructions',
  COUNTDOWN: 'countdown', 
  PLAYING: 'playing',
  RESULT: 'result',
} as const;