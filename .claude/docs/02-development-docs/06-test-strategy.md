# テスト戦略

## テストの種類と目的

| 種類                 | ツール                         | 目的                                | 実行タイミング    |
| -------------------- | ------------------------------ | ----------------------------------- | ----------------- |
| ユニットテスト       | Vitest                         | ユーティリティ・hooks・マッパー関数 | ローカル・CI      |
| コンポーネントテスト | Vitest + React Testing Library | コンポーネントの振る舞い            | ローカル・CI      |
| E2E テスト           | Playwright                     | ユーザーシナリオ全体                | CI（PR マージ前） |

---

## テストファイルの配置

```
src/
├── components/features/generation/
│   ├── GenerationForm.tsx
│   └── GenerationForm.test.tsx     ← コンポーネントと同階層
│
├── hooks/
│   ├── useGenerationPolling.ts
│   └── useGenerationPolling.test.ts
│
└── lib/api/
    ├── generate.ts
    └── generate.test.ts

e2e/
├── generate.spec.ts
└── auth.spec.ts
```

---

## テスト戦略の方針

### テストピラミッド

```
        /E2E\       ← 少数・シナリオ重視
       /------\
      / コンポ  \    ← 中程度・振る舞い検証
     /----------\
    / ユニット    \  ← 多数・関数レベル
   /--------------\
```

### What to test / What NOT to test

| テストすること                   | テストしないこと                   |
| -------------------------------- | ---------------------------------- |
| ユーザーが見る・操作する振る舞い | React 内部の実装詳細（state 値等） |
| エラー表示・ローディング状態     | コンポーネントの props を直接検証  |
| フォームバリデーション           | 単純な getter/setter               |
| API エラー時の UI 変化           | スタイル（CSS クラス名）           |

---

## コンポーネントテストのパターン

```tsx
// GenerationForm.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { GenerationForm } from "./GenerationForm";

test("プロンプトを入力して送信するとローディング状態になる", async () => {
  render(<GenerationForm />);

  await userEvent.type(
    screen.getByLabelText("プロンプト"),
    "カラフルなサムネイル",
  );
  await userEvent.click(screen.getByRole("button", { name: "生成する" }));

  expect(screen.getByText("生成中...")).toBeInTheDocument();
});

test("API エラー時にエラーメッセージを表示する", async () => {
  server.use(
    http.post("/api/v1/generate", () =>
      HttpResponse.json({ message: "monthly limit exceeded" }, { status: 429 }),
    ),
  );

  render(<GenerationForm />);
  await userEvent.type(screen.getByLabelText("プロンプト"), "テスト");
  await userEvent.click(screen.getByRole("button", { name: "生成する" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("月次生成上限");
});
```

---

## API モック（MSW）

```ts
// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/api/v1/generate", () =>
    HttpResponse.json(
      { job_id: "test-uuid", status: "pending" },
      { status: 201 },
    ),
  ),

  http.get("/api/v1/generate/:jobId", ({ params }) =>
    HttpResponse.json({
      job_id: params.jobId,
      status: "completed",
      image_url: "https://example.com/thumb.jpg",
    }),
  ),
];
```

```ts
// src/mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

---

## hooks のテスト

```ts
import { renderHook, waitFor } from "@testing-library/react";
import { useGenerationPolling } from "./useGenerationPolling";

test("ジョブが completed になったらポーリングが停止する", async () => {
  const { result } = renderHook(() => useGenerationPolling("test-uuid"));

  await waitFor(() => expect(result.current.status).toBe("completed"));
  // 以降はポーリングが止まることを確認
});
```

---

## E2E テスト（Playwright）

```ts
// e2e/generate.spec.ts
import { test, expect } from "@playwright/test";

test("サムネイルを生成できる", async ({ page }) => {
  await page.goto("/");
  await page.fill('[aria-label="プロンプト"]', "カラフルなサムネイル");
  await page.click('button:has-text("生成する")');

  await expect(page.getByText("生成中")).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Generated thumbnail" }),
  ).toBeVisible({
    timeout: 30000,
  });
});
```

---

## CI でのテスト実行

```yaml
# .github/workflows/ci.yml（テスト部分）
- name: Unit / Component Tests
  run: npm test -- --run

- name: E2E Tests
  run: npx playwright test
```

---

## 禁止事項

- `setTimeout` / `sleep` によるタイミング待機（`waitFor` を使う）
- スナップショットテストの多用（振る舞いテストを優先）
- テスト間の状態共有（`beforeEach` でリセット）
- 実際のネットワーク通信（MSW でモックする）
