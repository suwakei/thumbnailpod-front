import { test } from '@playwright/test';
import { ApiMock, seedAuthCookie } from './fixtures/api-mock';

// ---------------------------------------------------------------------------
// Viewport
// ---------------------------------------------------------------------------
test.use({ viewport: { width: 1440, height: 900 } });

// ---------------------------------------------------------------------------
// Mock data (snake_case — backend format)
// ---------------------------------------------------------------------------

const mockUser = {
  id: 'user-1',
  channel_id: 'UCxxx',
  channel_name: 'TestChannel',
  role: 'user',
  plan: 'creator',
  created_at: '2026-01-01T00:00:00Z',
};

const mockAdmin = { ...mockUser, role: 'admin' };

const mockPlan = {
  plan: 'creator',
  generation_count_month: 15,
  monthly_limit: 50,
  remaining: 35,
};

// --- Jobs (history list shape) -------------------------------------------

const completedJob = {
  id: 'job-completed-1',
  user_id: 'user-1',
  style_model_id: null,
  prompt: '衝撃のニュース！赤い背景に驚く表情の人物',
  status: 'completed',
  error_message: null,
  created_at: '2026-04-14T10:00:00Z',
  completed_at: '2026-04-14T10:01:30Z',
};

const processingJob = {
  id: 'job-processing-1',
  user_id: 'user-1',
  style_model_id: null,
  prompt: '最新ガジェットレビュー — 青い背景',
  status: 'processing',
  error_message: null,
  created_at: '2026-04-15T02:00:00Z',
  completed_at: null,
};

const pendingJob = {
  id: 'job-pending-1',
  user_id: 'user-1',
  style_model_id: null,
  prompt: 'バズる料理動画サムネイル',
  status: 'pending',
  error_message: null,
  created_at: '2026-04-15T09:00:00Z',
  completed_at: null,
};

const failedJob = {
  id: 'job-failed-1',
  user_id: 'user-1',
  style_model_id: null,
  prompt: '失敗テスト',
  status: 'failed',
  error_message: 'GPU out of memory',
  created_at: '2026-04-15T01:00:00Z',
  completed_at: null,
};

// --- Job details (detail endpoint shape) ---------------------------------

const completedJobDetail = {
  job_id: 'job-completed-1',
  status: 'completed',
  prompt: '衝撃のニュース！赤い背景に驚く表情の人物',
  created_at: '2026-04-14T10:00:00Z',
  image_url: 'https://placehold.co/1280x720/e74c3c/ffffff?text=Thumbnail',
  thumbnail_id: 'thumb-1',
  error: null,
};

const processingJobDetail = {
  job_id: 'job-processing-1',
  status: 'processing',
  prompt: '最新ガジェットレビュー — 青い背景',
  created_at: '2026-04-15T02:00:00Z',
  image_url: null,
  thumbnail_id: null,
  error: null,
};

const failedJobDetail = {
  job_id: 'job-failed-1',
  status: 'failed',
  prompt: '失敗テスト',
  created_at: '2026-04-15T01:00:00Z',
  image_url: null,
  thumbnail_id: null,
  error: 'GPU out of memory',
};

// --- Layers --------------------------------------------------------------

const mockLayers = {
  job_id: 'job-completed-1',
  layers: [
    { label: 'composite', url: 'https://placehold.co/1280x720/e74c3c/ffffff?text=Composite' },
    { label: 'text_layer', url: 'https://placehold.co/1280x720/00000000/ffffff?text=Text+Layer' },
    { label: 'person_layer', url: 'https://placehold.co/1280x720/00000000/ffffff?text=Person' },
    { label: 'background_layer', url: 'https://placehold.co/1280x720/3498db/ffffff?text=Background' },
    { label: 'effect_layer', url: 'https://placehold.co/1280x720/00000000/ffffff?text=Effects' },
  ],
  psd_url: null,
};

const emptyLayers = {
  job_id: 'job-completed-1',
  layers: [],
  psd_url: null,
};

// --- Style models --------------------------------------------------------

const mockModels = {
  models: [
    {
      id: 'model-1', user_id: 'user-1', name: 'ゲーム実況スタイル', type: 'custom',
      s3_key: null, style_metadata: null, source_video_count: 12,
      status: 'ready', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T01:00:00Z',
    },
    {
      id: 'model-2', user_id: 'user-1', name: 'ニュース系', type: 'custom',
      s3_key: null, style_metadata: null, source_video_count: 8,
      status: 'training', created_at: '2026-04-10T00:00:00Z', updated_at: '2026-04-10T00:00:00Z',
    },
    {
      id: 'model-3', user_id: 'user-1', name: '失敗モデル', type: 'custom',
      s3_key: null, style_metadata: null, source_video_count: 3,
      status: 'failed', created_at: '2026-04-12T00:00:00Z', updated_at: '2026-04-12T00:00:00Z',
    },
  ],
};

// --- YouTube videos ------------------------------------------------------

const mockVideos = {
  videos: [
    {
      video_id: 'vid-1', title: '【速報】新型GPU発表！性能がヤバい',
      thumbnail_url: 'https://placehold.co/320x180/e74c3c/ffffff?text=Video+1',
      published_at: '2026-04-10T10:00:00Z',
    },
    {
      video_id: 'vid-2', title: '初心者向けPython入門講座 #1',
      thumbnail_url: 'https://placehold.co/320x180/3498db/ffffff?text=Video+2',
      published_at: '2026-04-08T15:00:00Z',
    },
    {
      video_id: 'vid-3', title: 'VLOGカメラ比較レビュー 2026年版',
      thumbnail_url: 'https://placehold.co/320x180/2ecc71/ffffff?text=Video+3',
      published_at: '2026-04-05T09:00:00Z',
    },
  ],
};

// --- Favorites -----------------------------------------------------------

const mockFavorites = {
  favorites: [
    { id: 'fav-1', user_id: 'user-1', job_id: 'job-completed-1', created_at: '2026-04-14T12:00:00Z', job: completedJob },
  ],
  total_count: 1,
  limit: 20,
  offset: 0,
};

// --- Templates -----------------------------------------------------------

const mockTemplates = {
  templates: [
    {
      id: 'tmpl-1', user_id: 'user-1', name: 'ニュース速報テンプレ',
      prompt: '赤い背景に白い太文字でニュース見出し', style_model_id: null,
      source_job_id: null, preview_s3_key: null,
      created_at: '2026-04-01T00:00:00Z', updated_at: '2026-04-01T00:00:00Z',
    },
    {
      id: 'tmpl-2', user_id: 'user-1', name: 'レビュー動画用',
      prompt: '製品画像を大きく配置、評価を星で表示', style_model_id: 'model-1',
      source_job_id: null, preview_s3_key: null,
      created_at: '2026-04-05T00:00:00Z', updated_at: '2026-04-05T00:00:00Z',
    },
  ],
};

// --- Webhooks ------------------------------------------------------------

const mockWebhooks = {
  webhooks: [
    {
      id: 'wh-1', user_id: 'user-1', url: 'https://example.com/webhook',
      events: ['job.completed', 'job.failed'], secret: 'whsec_xxx',
      active: true, created_at: '2026-04-01T00:00:00Z', updated_at: '2026-04-01T00:00:00Z',
    },
  ],
};

// --- Admin ---------------------------------------------------------------

const mockAdminHealth = {
  status: 'healthy',
  services: {
    backend: { status: 'healthy', version: '1.2.0', latency_ms: 12 },
    ai: { status: 'healthy', version: '0.9.0', latency_ms: 45 },
    database: { status: 'healthy', latency_ms: 3 },
  },
  checked_at: '2026-04-15T10:00:00Z',
};

const mockAdminStats = {
  users: { total: 150 },
  jobs: { total: 1234, pending: 5, processing: 3, completed: 1200, failed: 26 },
  style_models: { total: 45 },
};

// --- Analytics / Billing / Edit history ----------------------------------

const mockAnalytics = {
  total_generations: 42, total_styles: 3, total_favorites: 7,
  generations_this_week: 5, last_generation_at: '2026-04-15T10:00:00Z',
};

const mockBilling = {
  plan: 'creator', stripe_customer_id: 'cus_xxx',
  stripe_subscription_id: 'sub_xxx', current_period_end: '2026-05-01T00:00:00Z',
};

const mockEditHistory = { edits: [] };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function setupAuth(
  page: import('@playwright/test').Page,
  userOverride?: Record<string, unknown>,
) {
  await seedAuthCookie(page);
  const api = new ApiMock(page);
  api.json('/users/me', userOverride ?? mockUser);
  api.json('/users/me/plan', mockPlan);
  return api;
}

async function waitForShell(page: import('@playwright/test').Page) {
  await page.locator('text=ThumbnailPod').first().waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForTimeout(400);
}

async function capture(page: import('@playwright/test').Page, name: string) {
  await page.waitForTimeout(600);
  await page.screenshot({
    path: `e2e/screenshots/${name}.png`,
    fullPage: true,
  });
}

// ===========================================================================
// PUBLIC PAGES
// ===========================================================================

test.describe('Screenshots — Public Pages', () => {
  test('landing', async ({ page }) => {
    const api = new ApiMock(page);
    api.get('/auth/youtube/url', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://accounts.google.com/stub' }),
      }),
    );
    await api.install();

    await page.route('https://accounts.google.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: 'stub' }),
    );

    await page.goto('/landing');
    await page.waitForLoadState('networkidle');
    await capture(page, 'landing');
  });

  test('login', async ({ page }) => {
    const api = new ApiMock(page);
    api.get('/auth/youtube/url', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://accounts.google.com/stub' }),
      }),
    );
    await api.install();

    await page.route('https://accounts.google.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: 'stub' }),
    );

    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await capture(page, 'login');
  });
});

// ===========================================================================
// DASHBOARD
// ===========================================================================

test.describe('Screenshots — Dashboard', () => {
  test('dashboard--empty', async ({ page }) => {
    const api = await setupAuth(page);
    api.json(/^\/generate\/history/, { jobs: [], total_count: 0, limit: 6, offset: 0 });
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/');
    await waitForShell(page);
    await capture(page, 'dashboard--empty');
  });

  test('dashboard--with-jobs', async ({ page }) => {
    const api = await setupAuth(page);
    api.json(/^\/generate\/history/, {
      jobs: [completedJob, processingJob, pendingJob, failedJob],
      total_count: 4,
      limit: 6,
      offset: 0,
    });
    api.json('/style/models', mockModels);
    await api.install();

    await page.goto('/');
    await waitForShell(page);
    await capture(page, 'dashboard--with-jobs');
  });
});

// ===========================================================================
// HISTORY
// ===========================================================================

test.describe('Screenshots — History', () => {
  const extraJobs = [
    { ...completedJob, id: 'job-completed-2', prompt: 'ゲーム実況 — 感動のエンディング' },
    { ...completedJob, id: 'job-completed-3', prompt: '大食いチャレンジ！限界突破' },
  ];

  test('history--empty', async ({ page }) => {
    const api = await setupAuth(page);
    api.json(/^\/generate\/history/, { jobs: [], total_count: 0, limit: 20, offset: 0 });
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/history');
    await waitForShell(page);
    await capture(page, 'history--empty');
  });

  test('history--with-jobs', async ({ page }) => {
    const api = await setupAuth(page);
    api.json(/^\/generate\/history/, {
      jobs: [completedJob, processingJob, pendingJob, failedJob, ...extraJobs],
      total_count: 6,
      limit: 20,
      offset: 0,
    });
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/history');
    await waitForShell(page);
    await capture(page, 'history--with-jobs');
  });
});

// ===========================================================================
// HISTORY DETAIL
// ===========================================================================

test.describe('Screenshots — History Detail', () => {
  test('history-detail--completed', async ({ page }) => {
    const api = await setupAuth(page);
    api.json(/^\/generate\/job-completed-1$/, completedJobDetail);
    api.json(/^\/generate\/job-completed-1\/layers$/, mockLayers);
    api.json(/^\/generate\/job-completed-1\/edit-history$/, mockEditHistory);
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/history/job-completed-1');
    await waitForShell(page);
    await capture(page, 'history-detail--completed');
  });

  test('history-detail--completed-layers', async ({ page }) => {
    const api = await setupAuth(page);
    api.json(/^\/generate\/job-completed-1$/, completedJobDetail);
    api.json(/^\/generate\/job-completed-1\/layers$/, mockLayers);
    api.json(/^\/generate\/job-completed-1\/edit-history$/, mockEditHistory);
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/history/job-completed-1');
    await waitForShell(page);

    // Try to click a layers tab/section if one exists
    const layersTab = page.getByText(/レイヤー|layers/i).first();
    if (await layersTab.isVisible().catch(() => false)) {
      await layersTab.click();
      await page.waitForTimeout(400);
    }

    await capture(page, 'history-detail--completed-layers');
  });

  test('history-detail--processing', async ({ page }) => {
    const api = await setupAuth(page);
    api.json(/^\/generate\/job-processing-1$/, processingJobDetail);
    api.json(/^\/generate\/job-processing-1\/layers$/, { job_id: 'job-processing-1', layers: [], psd_url: null });
    api.json(/^\/generate\/job-processing-1\/edit-history$/, mockEditHistory);
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/history/job-processing-1');
    await waitForShell(page);
    await capture(page, 'history-detail--processing');
  });

  test('history-detail--failed', async ({ page }) => {
    const api = await setupAuth(page);
    api.json(/^\/generate\/job-failed-1$/, failedJobDetail);
    api.json(/^\/generate\/job-failed-1\/layers$/, { job_id: 'job-failed-1', layers: [], psd_url: null });
    api.json(/^\/generate\/job-failed-1\/edit-history$/, mockEditHistory);
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/history/job-failed-1');
    await waitForShell(page);
    await capture(page, 'history-detail--failed');
  });
});

// ===========================================================================
// EDITOR
// ===========================================================================

test.describe('Screenshots — Editor', () => {
  test('editor--loaded', async ({ page }) => {
    const api = await setupAuth(page);
    api.json(/^\/generate\/job-completed-1$/, completedJobDetail);
    api.json(/^\/generate\/job-completed-1\/layers$/, mockLayers);
    api.json(/^\/generate\/job-completed-1\/edit-history$/, mockEditHistory);
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/editor/job-completed-1');
    await waitForShell(page);
    await page.waitForTimeout(1000);
    await capture(page, 'editor--loaded');
  });
});

// ===========================================================================
// DOWNLOAD
// ===========================================================================

test.describe('Screenshots — Download', () => {
  test('download--with-layers', async ({ page }) => {
    const api = await setupAuth(page);
    api.json(/^\/generate\/job-completed-1$/, completedJobDetail);
    api.json(/^\/generate\/job-completed-1\/layers$/, mockLayers);
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/download/job-completed-1');
    await waitForShell(page);
    await capture(page, 'download--with-layers');
  });

  test('download--no-layers', async ({ page }) => {
    const api = await setupAuth(page);
    api.json(/^\/generate\/job-completed-1$/, completedJobDetail);
    api.json(/^\/generate\/job-completed-1\/layers$/, emptyLayers);
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/download/job-completed-1');
    await waitForShell(page);
    await capture(page, 'download--no-layers');
  });
});

// ===========================================================================
// BATCH
// ===========================================================================

test.describe('Screenshots — Batch', () => {
  test('batch--initial', async ({ page }) => {
    const api = await setupAuth(page);
    api.json('/style/models', mockModels);
    api.json(/^\/generate\/history/, { jobs: [], total_count: 0, limit: 20, offset: 0 });
    api.json(/^\/templates$/, mockTemplates);
    await api.install();

    await page.goto('/batch');
    await waitForShell(page);
    await capture(page, 'batch--initial');
  });
});

// ===========================================================================
// STYLE MODELS
// ===========================================================================

test.describe('Screenshots — Style Models', () => {
  test('style--empty', async ({ page }) => {
    const api = await setupAuth(page);
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/style');
    await waitForShell(page);
    await capture(page, 'style--empty');
  });

  test('style--with-models', async ({ page }) => {
    const api = await setupAuth(page);
    api.json('/style/models', mockModels);
    await api.install();

    await page.goto('/style');
    await waitForShell(page);
    await capture(page, 'style--with-models');
  });
});

// ===========================================================================
// YOUTUBE
// ===========================================================================

test.describe('Screenshots — YouTube', () => {
  test('youtube--empty', async ({ page }) => {
    const api = await setupAuth(page);
    api.json(/^\/youtube\/videos/, { videos: [] });
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/youtube');
    await waitForShell(page);
    await capture(page, 'youtube--empty');
  });

  test('youtube--with-videos', async ({ page }) => {
    const api = await setupAuth(page);
    api.json(/^\/youtube\/videos/, mockVideos);
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/youtube');
    await waitForShell(page);
    await capture(page, 'youtube--with-videos');
  });
});

// ===========================================================================
// FAVORITES
// ===========================================================================

test.describe('Screenshots — Favorites', () => {
  test('favorites--empty', async ({ page }) => {
    const api = await setupAuth(page);
    api.json(/^\/favorites/, { favorites: [], total_count: 0, limit: 20, offset: 0 });
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/favorites');
    await waitForShell(page);
    await capture(page, 'favorites--empty');
  });

  test('favorites--with-data', async ({ page }) => {
    const api = await setupAuth(page);
    api.json(/^\/favorites/, mockFavorites);
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/favorites');
    await waitForShell(page);
    await capture(page, 'favorites--with-data');
  });
});

// ===========================================================================
// TEMPLATES
// ===========================================================================

test.describe('Screenshots — Templates', () => {
  test('templates--empty', async ({ page }) => {
    const api = await setupAuth(page);
    api.json(/^\/templates/, { templates: [] });
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/templates');
    await waitForShell(page);
    await capture(page, 'templates--empty');
  });

  test('templates--with-data', async ({ page }) => {
    const api = await setupAuth(page);
    api.json(/^\/templates/, mockTemplates);
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/templates');
    await waitForShell(page);
    await capture(page, 'templates--with-data');
  });
});

// ===========================================================================
// WEBHOOKS
// ===========================================================================

test.describe('Screenshots — Webhooks', () => {
  test('webhooks--empty', async ({ page }) => {
    const api = await setupAuth(page);
    api.json(/^\/webhooks/, { webhooks: [] });
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/webhooks');
    await waitForShell(page);
    await capture(page, 'webhooks--empty');
  });

  test('webhooks--with-data', async ({ page }) => {
    const api = await setupAuth(page);
    api.json(/^\/webhooks/, mockWebhooks);
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/webhooks');
    await waitForShell(page);
    await capture(page, 'webhooks--with-data');
  });
});

// ===========================================================================
// SETTINGS
// ===========================================================================

test.describe('Screenshots — Settings', () => {
  test('settings', async ({ page }) => {
    const api = await setupAuth(page);
    api.json('/style/models', { models: [] });
    api.json(/^\/users\/me\/analytics/, mockAnalytics);
    api.json(/^\/users\/me\/billing/, mockBilling);
    await api.install();

    await page.goto('/settings');
    await waitForShell(page);
    await capture(page, 'settings');
  });
});

// ===========================================================================
// ADMIN
// ===========================================================================

test.describe('Screenshots — Admin', () => {
  test('admin', async ({ page }) => {
    const api = await setupAuth(page, mockAdmin);
    api.json(/^\/admin\/health/, mockAdminHealth);
    api.json(/^\/admin\/stats/, mockAdminStats);
    api.json('/style/models', { models: [] });
    await api.install();

    await page.goto('/admin');
    await waitForShell(page);
    await capture(page, 'admin');
  });
});
