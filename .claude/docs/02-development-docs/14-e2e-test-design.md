# E2E テスト設計

## フレームワーク

**Playwright** を使用する。ユニット・コンポーネントテスト（Vitest）では検証できないユーザーシナリオ全体を E2E でカバーする。

---

## ファイル構成

```
e2e/
├── auth.spec.ts           # 認証シナリオ
├── generate.spec.ts       # サムネイル生成シナリオ
├── history.spec.ts        # 生成履歴シナリオ
├── style.spec.ts          # スタイル学習シナリオ
├── fixtures/
│   └── auth.ts            # 認証済みフィクスチャ（共通ログイン処理）
└── pages/
    ├── LoginPage.ts        # ページオブジェクトモデル
    ├── DashboardPage.ts
    ├── HistoryPage.ts
    └── StylePage.ts

playwright.config.ts        # Playwright 設定
```

---

## Playwright 設定

```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    // 認証状態のセットアップ（他テスト実行前に一度だけ）
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 認証フィクスチャ（認証済み状態の共有）

E2E テストでは毎回ログインフローを実行するのではなく、認証済みの Cookie / Storage State を使い回す。

```ts
// e2e/auth.setup.ts
import { test as setup } from "@playwright/test";

const authFile = "e2e/.auth/user.json";

setup("テストユーザーでログイン", async ({ page }) => {
  // テスト環境専用のログインエンドポイントを使用（Google OAuth をバイパス）
  await page.goto("/api/e2e/login");

  // 認証後のリダイレクト先を確認
  await page.waitForURL("/");

  // 認証状態を保存（以降のテストで再利用）
  await page.context().storageState({ path: authFile });
});
```

**注意**: テスト用ログインエンドポイント (`/api/e2e/login`) は `NODE_ENV === 'test'` のときのみ有効にし、本番ビルドには含めない。

---

## ページオブジェクトモデル（POM）

セレクタやインタラクションをページごとにカプセル化し、テストコードの可読性と保守性を高める。

```ts
// e2e/pages/DashboardPage.ts
import type { Page } from "@playwright/test";

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/");
  }

  async fillPrompt(prompt: string) {
    await this.page.getByLabel("プロンプト").fill(prompt);
  }

  async selectStyleModel(modelName: string) {
    await this.page.getByRole("combobox", { name: "スタイルモデル" }).click();
    await this.page.getByRole("option", { name: modelName }).click();
  }

  async clickGenerate() {
    await this.page.getByRole("button", { name: "生成する" }).click();
  }

  async waitForGenerationComplete(timeout = 30_000) {
    await this.page
      .getByRole("img", { name: "生成されたサムネイル" })
      .waitFor({ timeout });
  }

  async getErrorMessage() {
    return this.page.getByRole("alert").textContent();
  }
}
```

---

## テストシナリオ

### 認証（`auth.spec.ts`）

```ts
import { test, expect } from "@playwright/test";

// このファイルは setup に依存しないため storageState を使わない
test.use({ storageState: { cookies: [], origins: [] } });

test("未認証でダッシュボードにアクセスするとログインページにリダイレクトされる", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL("/login");
});

test("ログインページが表示される", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("button", { name: /Google でログイン/i }),
  ).toBeVisible();
});
```

### サムネイル生成（`generate.spec.ts`）

```ts
import { test, expect } from "@playwright/test";
import { DashboardPage } from "./pages/DashboardPage";

test("プロンプトを入力してサムネイルを生成できる", async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();

  await dashboard.fillPrompt("明るいポップなデザインのサムネイル");
  await dashboard.clickGenerate();

  // ローディング状態を確認
  await expect(page.getByText("生成中...")).toBeVisible();

  // 完了を待機（最大 30 秒）
  await dashboard.waitForGenerationComplete();
  await expect(
    page.getByRole("img", { name: "生成されたサムネイル" }),
  ).toBeVisible();
});

test("月次上限超過時にエラーメッセージが表示される", async ({ page }) => {
  // MSW または API モックで 429 を返す設定が必要
  const dashboard = new DashboardPage(page);
  await dashboard.goto();

  await dashboard.fillPrompt("テスト");
  await dashboard.clickGenerate();

  await expect(page.getByRole("alert")).toContainText("月次生成上限");
});

test("プロンプトが空のまま送信するとバリデーションエラーが表示される", async ({
  page,
}) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();

  await dashboard.clickGenerate();

  await expect(page.getByText("プロンプトを入力してください")).toBeVisible();
});
```

### 生成履歴（`history.spec.ts`）

```ts
import { test, expect } from "@playwright/test";

test("生成履歴が表示される", async ({ page }) => {
  await page.goto("/history");
  // 履歴グリッドが表示されること（0 件でも空状態 UI が出ること）
  await expect(page.getByRole("main")).toBeVisible();
});

test("ステータスフィルターで履歴を絞り込める", async ({ page }) => {
  await page.goto("/history");

  await page.getByRole("combobox", { name: "ステータス" }).click();
  await page.getByRole("option", { name: "完了" }).click();

  await expect(page).toHaveURL(/status=completed/);
});

test("存在しないジョブIDにアクセスすると 404 ページが表示される", async ({
  page,
}) => {
  await page.goto("/history/non-existent-job-id");
  await expect(page.getByText("ジョブが見つかりません")).toBeVisible();
});
```

### スタイル学習（`style.spec.ts`）

```ts
import { test, expect } from "@playwright/test";

test("スタイル一覧が表示される", async ({ page }) => {
  await page.goto("/style");
  await expect(
    page.getByRole("button", { name: /新しいスタイルを追加/i }),
  ).toBeVisible();
});
```

---

## テスト環境のセットアップ

### バックエンドのモック戦略

E2E テストはバックエンド API への実際のリクエストを行わない。Next.js の Route Handler (`app/api/`) をテスト用エンドポイントで差し替えるか、MSW の Service Worker モードを使用する。

```
環境変数 PLAYWRIGHT_API_MOCK=true のとき：
  → MSW の browser モードで API をモック

環境変数 PLAYWRIGHT_API_MOCK=false（デフォルト）：
  → ステージング環境のバックエンドに接続
```

### テスト用シードデータ

テスト実行前に API を通じてシードデータを投入する場合は `globalSetup` に記述する。

---

## CI での実行

```yaml
# .github/workflows/e2e.yml（PR マージ前に実行）
- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Build Next.js
  run: npm run build

- name: Run E2E tests
  run: npx playwright test
  env:
    PLAYWRIGHT_BASE_URL: http://localhost:3000
    PLAYWRIGHT_API_MOCK: "true"

- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
```

---

## 禁止事項

| 禁止                                     | 代替                                           |
| ---------------------------------------- | ---------------------------------------------- |
| `page.waitForTimeout(ms)` によるスリープ | `waitFor` / `waitForURL` / `waitForSelector`   |
| 実際の Google OAuth フローの実行         | テスト用ログインエンドポイントで Cookie を設定 |
| テスト間の状態共有（共有 DB・Cookie）    | `storageState` を各テストで独立させる          |
| CSS クラス名によるセレクタ               | `getByRole` / `getByLabel` / `getByText`       |
| テスト内での `setTimeout` / `sleep`      | Playwright の組み込み待機 API を使う           |
