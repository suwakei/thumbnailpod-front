import { test, expect } from '@playwright/test';
import { ApiMock } from './fixtures/api-mock';

test.describe('Landing page', () => {
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
  });

  test('ヒーロー見出しと CTA が表示される', async ({ page }) => {
    await page.goto('/landing');

    await expect(
      page.getByRole('heading', { level: 1, name: /サムネイルを自動生成/ }),
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: '無料で始める' }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Googleでログイン/ }),
    ).toBeVisible();
  });

  test('機能・使い方・価格セクションへアンカー遷移できる', async ({ page }) => {
    await page.goto('/landing');

    const featuresLink = page.getByRole('link', { name: 'Features' });
    await featuresLink.click();
    await expect(page).toHaveURL(/#features$/);

    await page.getByRole('link', { name: 'How it works' }).click();
    await expect(page).toHaveURL(/#how$/);

    await page.getByRole('link', { name: 'Pricing' }).click();
    await expect(page).toHaveURL(/#pricing$/);
  });

  test('ログイン CTA クリックで OAuth URL が取得される', async ({ page }) => {
    const oauthRequest = page.waitForRequest((req) =>
      req.url().includes('/auth/youtube/url'),
    );

    // Stop the navigation so we can assert without leaving the test origin.
    await page.route('https://accounts.google.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: 'stub' }),
    );

    await page.goto('/landing');
    await page.getByRole('button', { name: '無料で始める' }).first().click();

    await oauthRequest;
  });
});
