// === Route paths ===
export const ROUTES = {
  dashboard: '/',
  history: '/history',
  historyDetail: (jobId: string) => `/history/${jobId}`,
  style: '/style',
  youtube: '/youtube',
  settings: '/settings',
  login: '/login',
  authCallback: '/auth/callback',
  templates: '/templates',
  favorites: '/favorites',
  webhooks: '/webhooks',
  billing: '/billing',
  admin: '/admin',
} as const;

// === API endpoint paths ===
export const API_PATHS = {
  auth: {
    oauthUrl: '/auth/youtube/url',
    oauthCallback: '/auth/youtube/callback',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  users: {
    me: '/users/me',
    myPlan: '/users/me/plan',
    analytics: '/users/me/analytics',
    deleteMe: '/users/me',
  },
  generate: {
    create: '/generate',
    status: (jobId: string) => `/generate/${jobId}`,
    history: (limit: number, offset: number) =>
      `/generate/history?limit=${limit}&offset=${offset}`,
    segment: (jobId: string) => `/generate/${jobId}/segment`,
    layers: (jobId: string) => `/generate/${jobId}/layers`,
    edit: (jobId: string) => `/generate/${jobId}/edit`,
    edits: (jobId: string) => `/generate/${jobId}/edits`,
    batch: '/generate/batch',
    stream: (jobId: string) => `/generate/${jobId}/stream`,
  },
  thumbnails: {
    download: (thumbnailId: string, format: string, layer?: string) => {
      let path = `/thumbnails/${thumbnailId}/download?format=${format}`;
      if (layer) path += `&layer=${layer}`;
      return path;
    },
  },
  style: {
    learn: '/style/learn',
    models: '/style/models',
    model: (modelId: string) => `/style/models/${modelId}`,
  },
  templates: {
    create: '/templates',
    list: '/templates',
    get: (templateId: string) => `/templates/${templateId}`,
    update: (templateId: string) => `/templates/${templateId}`,
    delete: (templateId: string) => `/templates/${templateId}`,
  },
  favorites: {
    list: (limit: number, offset: number) => `/favorites?limit=${limit}&offset=${offset}`,
    add: (jobId: string) => `/generate/${jobId}/favorite`,
    remove: (jobId: string) => `/generate/${jobId}/favorite`,
  },
  webhooks: {
    create: '/webhooks',
    list: '/webhooks',
    update: (webhookId: string) => `/webhooks/${webhookId}`,
    delete: (webhookId: string) => `/webhooks/${webhookId}`,
  },
  billing: {
    info: '/billing',
  },
  upload: {
    presign: '/upload/presign',
  },
  youtube: {
    videos: '/youtube/videos',
    videoThumbnail: (videoId: string) =>
      `/youtube/videos/${videoId}/thumbnail`,
  },
  admin: {
    health: '/admin/health',
    stats: '/admin/stats',
    maintenance: '/admin/maintenance',
  },
} as const;

// === HTTP status codes ===
export const HTTP_STATUS = {
  noContent: 204,
  created: 201,
} as const;

// === Polling ===
export const JOB_POLLING_INTERVAL_MS = 3000;

// === Pagination ===
export const PAGE_SIZE = {
  historyGrid: 12,
  dashboardRecent: 6,
  youtubeHistory: 50,
  youtubeJobPicker: 12,
} as const;

// === Query client defaults ===
export const QUERY_DEFAULTS = {
  staleTimeMs: 30_000,
  retry: 1,
  refetchOnWindowFocus: false,
} as const;

// === External URLs ===
export const EXTERNAL_URLS = {
  youtubeWatch: (videoId: string) =>
    `https://youtube.com/watch?v=${videoId}`,
} as const;

// === Locale ===
export const DATE_LOCALE = 'ja-JP';

// === Job statuses ===
export const JOB_STATUS = {
  pending: 'pending',
  processing: 'processing',
  completed: 'completed',
  failed: 'failed',
} as const;

// === Style model statuses ===
export const STYLE_MODEL_STATUS = {
  ready: 'ready',
} as const;

// === Download formats ===
export const WEBHOOK_EVENTS = ['job.completed', 'job.failed', 'style.trained', 'style.failed'] as const;

export const DOWNLOAD_FORMAT = {
  png: 'png',
  psd: 'psd',
  zip: 'zip',
} as const;

// === Plan definitions ===
export const PLAN_FEATURES: Record<
  string,
  { label: string; color: string; features: string[] }
> = {
  free: {
    label: 'Free',
    color: 'var(--text-tertiary)',
    features: ['月5回の生成', '基本スタイル学習', 'PNG ダウンロード'],
  },
  creator: {
    label: 'Creator',
    color: 'var(--accent)',
    features: [
      '月50回の生成',
      '高度なスタイル学習',
      'PSD/ZIP ダウンロード',
      'YouTube直接更新',
    ],
  },
  pro: {
    label: 'Pro',
    color: 'var(--action)',
    features: [
      '月200回の生成',
      '全スタイル機能',
      '優先処理',
      'API アクセス',
    ],
  },
  business: {
    label: 'Business',
    color: '#c084fc',
    features: [
      '無制限生成',
      'チーム機能',
      '専用サポート',
      'カスタムモデル',
    ],
  },
};
