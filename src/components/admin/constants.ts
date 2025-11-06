export const ADMIN_CONSTANTS = {
  // Password requirements
  MIN_PASSWORD_LENGTH: 4,
  DEFAULT_ADMIN_PASSWORD: 'admin123',
  
  // Win simulation
  SIMULATION_COUNTDOWN: 7, // seconds
  PRIZE_ANIMATION_DURATION: 3000, // milliseconds
  MAX_ANIMATION_SPINS: 20,
  FINAL_SEQUENCE_SPINS: 3,
  FINAL_SEQUENCE_DELAY: 300, // milliseconds
  
  // Pagination and display limits
  MAX_LOGS_DISPLAY: 100,
  LOGS_PER_PAGE: 50,
  MAX_AVAILABLE_NUMBERS_DISPLAY: 50,
  
  // Device limits defaults
  DEFAULT_MAX_PLAYS: 10,
  DEFAULT_MAX_WINS: 3,
  
  // Difficulty levels
  DIFFICULTY_VERY_EASY: 20,
  DIFFICULTY_EASY: 40,
  DIFFICULTY_MEDIUM: 60,
  DIFFICULTY_HARD: 80,
  
  // Prize distribution thresholds
  PRIZE_LOW_THRESHOLD: 0.1,
  PRIZE_MEDIUM_THRESHOLD: 0.3,
  
  // CSV export settings
  CSV_HEADERS: ['ID', 'Player Name', 'Device ID', 'Result', 'Prize Number', 'Battery Level', 'Duration (s)', 'Timestamp'],

  // Analytics specific
  ANALYTICS_TOP_DEVICES_LIMIT: 10,
  ANALYTICS_RECENT_GAMES_LIMIT: 5,
  ANALYTICS_HOURLY_DATA_POINTS: 24,
} as const;

export const ADMIN_MESSAGES = {
  PASSWORD_WRONG: 'Password salah!',
  PASSWORD_TOO_SHORT: 'Password baru harus minimal 4 karakter!',
  PASSWORD_MISMATCH: 'Konfirmasi password tidak cocok!',
  PASSWORD_WRONG_OLD: 'Password lama salah!',
  PASSWORD_CHANGED: 'Password berhasil diubah!',
  SETTINGS_SAVED: 'Pengaturan berhasil disimpan dan diterapkan ke game!',
  CONFIRM_DISCARD: 'Apakah Anda yakin ingin membuang semua perubahan yang belum disimpan?',
  CONFIRM_RESET_LOGS: 'Apakah Anda yakin ingin menghapus semua log permainan? Tindakan ini tidak dapat dibatalkan.',
  CONFIRM_RESET_NUMBERS: 'Apakah Anda yakin ingin mereset semua riwayat? Ini akan menghapus semua nomor yang sudah digunakan.',
  CONFIRM_RESET_PRIZES: 'Reset hadiah akan mengembalikan jumlah hadiah ke maksimal. Apakah Anda juga ingin mereset riwayat nomor pemenang?',
  CONFIRM_RESET_PRIZE_NUMBERS: 'Reset riwayat nomor pemenang?',
  NO_PRIZES_LEFT: 'Tidak ada hadiah tersisa untuk disimulasikan!',
  NO_NUMBERS_AVAILABLE: 'Tidak ada nomor hadiah tersedia untuk disimulasikan!',
  NAME_EXISTS_OR_EMPTY: 'Nama sudah ada atau kosong!',
  DEVICE_EXISTS_OR_EMPTY: 'Device ID sudah ada dalam whitelist atau kosong!',
  INVALID_PRIZE_NUMBER: 'Nomor tidak valid atau sudah digunakan!',
  
  // Analytics specific messages
  ANALYTICS_NO_DATA: 'Belum ada data analytics',
  ANALYTICS_EXPORT_SUCCESS: 'Data analytics berhasil diekspor',
  ANALYTICS_CLEAR_CONFIRM: 'Apakah Anda yakin ingin menghapus semua data analytics?',
} as const;

export const ADMIN_COLORS = {
  DIFFICULTY_VERY_EASY: 'text-green-600',
  DIFFICULTY_EASY: 'text-lime-600',
  DIFFICULTY_MEDIUM: 'text-yellow-600',
  DIFFICULTY_HARD: 'text-orange-600',
  DIFFICULTY_VERY_HARD: 'text-red-600',
  
  PROGRESS_GOOD: 'bg-green-500',
  PROGRESS_WARNING: 'bg-yellow-500',
  PROGRESS_DANGER: 'bg-red-500',
} as const;

export const DIFFICULTY_LEVELS = [
  { threshold: ADMIN_CONSTANTS.DIFFICULTY_VERY_EASY, label: 'Sangat Mudah', color: ADMIN_COLORS.DIFFICULTY_VERY_EASY },
  { threshold: ADMIN_CONSTANTS.DIFFICULTY_EASY, label: 'Mudah', color: ADMIN_COLORS.DIFFICULTY_EASY },
  { threshold: ADMIN_CONSTANTS.DIFFICULTY_MEDIUM, label: 'Sedang', color: ADMIN_COLORS.DIFFICULTY_MEDIUM },
  { threshold: ADMIN_CONSTANTS.DIFFICULTY_HARD, label: 'Sulit', color: ADMIN_COLORS.DIFFICULTY_HARD },
  { threshold: 100, label: 'Sangat Sulit', color: ADMIN_COLORS.DIFFICULTY_VERY_HARD },
] as const;

export const FILTER_OPTIONS = {
  LOG_FILTERS: [
    { value: 'all', label: 'Semua' },
    { value: 'wins', label: 'Menang' },
    { value: 'losses', label: 'Kalah' }
  ],
  TIME_FILTERS: [
    { value: 'all', label: 'Semua Waktu' },
    { value: 'today', label: 'Hari Ini' },
    { value: 'week', label: '7 Hari Terakhir' },
    { value: 'month', label: '30 Hari Terakhir' }
  ]
} as const;