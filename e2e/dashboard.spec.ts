import { test, expect } from '@playwright/test';
import { ApiMock, seedAuthCookie } from './fixtures/api-mock';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  channel_name: 'E2E Channel',
  role: 'user',
  plan: 'free',
};

const mockPlan = {
  plan: 'free',
  generation_count_month: 3,
  monthly_limit: 10,
};

const mockHistoryEmpty = { jobs: [], total: 0 };

const mockHistoryWithJobs = {
  jobs: [
    {
      id: 'job-1',
      prompt: '衝撃のニュース！赤い背景に驚く表情の人物',
      status: 'completed',
      created_at: '2026-04-14T10:00:00Z',
      thumbnail_url: null,
    },
    {
      id: 'job-2',
      prompt: '新作ゲーム発表トレーラー',
      status: 'processing',
      created_at: '2026-04-15T02:00:00Z',
      thumbnail_url: null,
    },
  ],
  total: 2,
};

const mockStyleModels = { models: [] };

async function authedMock(page: import('@playwright/test').Page) {
  await seedAuthCookie(page);
  const api = new ApiMock(page);
  api.json('/users/me', mockUser);
  api.json('/users/me/plan', mockPlan);
  api.json('/style/models', mockStyleModels);
  return api;
}

test.describe('Dashboard', () => {
  test('未認証ユーザーはログインページへリダイレクトされる', async ({ page }) => {
    const api = new ApiMock(page);
    api.get('/users/me', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'unauthorized' }),
      }),
    );
    await api.install();

    await page.goto('/');
    await page.waitForURL('**/login', { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login$/);
  });

  test('履歴が空のときは EmptyState が表示される', async ({ page }) => {
    const api = await authedMock(page);
    api.get(/^\/generate\/history/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockHistoryEmpty),
      }),
    );
    await api.install();

    await page.goto('/');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Dashboard' }),
    ).toBeVisible();
    await expect(page.getByText('今月の生成')).toBeVisible();
    await expect(page.getByText('3', { exact: true })).toBeVisible();
    await expect(page.getByText('まだ生成履歴がありません')).toBeVisible();
  });

  test('履歴があるときはジョブカードが並ぶ', async ({ page }) => {
    const api = await authedMock(page);
    api.get(/^\/generate\/history/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockHistoryWithJobs),
      }),
    );
    await api.install();

    await page.goto('/');

    await expect(page.getByText('衝撃のニュース！赤い背景に驚く表情の人物')).toBeVisible();
    await expect(page.getByText('新作ゲーム発表トレーラー')).toBeVisible();

    await expect(page.getByText('completed', { exact: false })).toBeVisible();
    await expect(page.getByText('processing', { exact: false })).toBeVisible();
  });

  test('プロンプトが空のときは生成ボタンが無効', async ({ page }) => {
    const api = await authedMock(page);
    api.get(/^\/generate\/history/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockHistoryEmpty),
      }),
    );
    await api.install();

    await page.goto('/');

    const generateBtn = page.getByRole('button', { name: /生成する/ });
    await expect(generateBtn).toBeDisabled();

    await page
      .getByPlaceholder(/サムネイルの内容を説明してください/)
      .fill('テストプロンプト');
    await expect(generateBtn).toBeEnabled();
  });

  test('生成ボタンをクリックするとジョブが作成されトーストが出る', async ({ page }) => {
    const api = await authedMock(page);
    api.get(/^\/generate\/history/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockHistoryEmpty),
      }),
    );

    let createCalled = false;
    api.post(/^\/generate$/, (route) => {
      createCalled = true;
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ job_id: 'new-job', status: 'pending' }),
      });
    });
    await api.install();

    await page.goto('/');
    await page
      .getByPlaceholder(/サムネイルの内容を説明してください/)
      .fill('赤背景に白文字のインパクトサムネ');
    await page.getByRole('button', { name: /生成する/ }).click();

    await expect(page.getByText('サムネイル生成を開始しました')).toBeVisible();
    expect(createCalled).toBe(true);
  });
});
