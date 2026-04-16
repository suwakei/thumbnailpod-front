import { test, expect } from '@playwright/test';
import { ApiMock } from './fixtures/api-mock';

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    const api = new ApiMock(page);
    api.get('/auth/youtube/url', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://accounts.google.com/o/oauth2/v2/auth?stub=1' }),
      }),
    );
    await api.install();

    // Prevent accidental navigation to Google during the test.
    await page.route('https://accounts.google.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: 'stub' }),
    );
  });

  test('タイトル・説明・ログインボタンが表示される', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'ThumbnailPod' })).toBeVisible();
    await expect(page.getByText('AI Thumbnail Studio')).toBeVisible();
    await expect(page.getByText(/クリック率を最大化するサムネイルを自動生成/)).toBeVisible();

    await expect(
      page.getByRole('button', { name: /YouTubeアカウントでログイン/ }),
    ).toBeVisible();
  });

  test('3 つの機能紹介カードが表示される', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByText('スタイル学習', { exact: true })).toBeVisible();
    await expect(page.getByText('ワンクリック生成', { exact: true })).toBeVisible();
    await expect(page.getByText('YouTube直接更新', { exact: true })).toBeVisible();
  });

  test('ログインボタンをクリックすると OAuth URL が取得される', async ({ page }) => {
    const oauthRequest = page.waitForRequest((req) =>
      req.url().includes('/auth/youtube/url'),
    );

    await page.goto('/login');
    await page.getByRole('button', { name: /YouTubeアカウントでログイン/ }).click();

    await oauthRequest;
  });
});
