# テスト規則

## テストフレームワーク

- **ユニット・コンポーネントテスト**: Vitest + React Testing Library
- **E2E テスト**: Playwright
- **API モック**: MSW (Mock Service Worker)

---

## ファイル配置

```
src/
├── components/
│   └── features/
│       ├── ThumbnailCard.tsx
│       └── ThumbnailCard.test.tsx   ← 同階層に配置
│
├── hooks/
│   ├── useGenerationJob.ts
│   └── useGenerationJob.test.ts
│
└── lib/api/
    ├── generate.ts
    └── generate.test.ts

e2e/                                 ← Playwright テスト
├── generate.spec.ts
└── auth.spec.ts
```

---

## コンポーネントテストの方針

- **What to test**: ユーザーが見る・操作する振る舞い（テキスト表示・ボタンクリック・エラーメッセージ）
- **What NOT to test**: 実装の詳細（内部 state・props の直接検証・メソッド呼び出し）
- `getByRole` / `getByText` / `getByLabelText` を優先。`getByTestId` は最終手段

```tsx
// 正：ユーザー視点
test('生成ボタンをクリックするとローディング状態になる', async () => {
  render(<GenerationForm />);
  await userEvent.click(screen.getByRole('button', { name: '生成する' }));
  expect(screen.getByText('生成中...')).toBeInTheDocument();
});

// 避ける：実装の詳細
test('isLoading state が true になる', () => { ... });
```

---

## API モック

- テスト内で実際のネットワーク通信を行わない
- MSW ハンドラーは `src/mocks/handlers.ts` に集約する
- 正常系・異常系（4xx/5xx）の両方をテストする

```ts
// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/api/v1/generate", () => {
    return HttpResponse.json(
      { job_id: "test-uuid", status: "pending" },
      { status: 201 },
    );
  }),
];
```

---

## hooks のテスト

カスタム hooks は `renderHook` でテストする。

```ts
import { renderHook, waitFor } from "@testing-library/react";

test("ジョブステータスを取得できる", async () => {
  const { result } = renderHook(() => useGenerationJob("test-uuid"));
  await waitFor(() => expect(result.current.status).toBe("completed"));
});
```

---

## 禁止事項

- スナップショットテストの多用（変更のたびに更新が必要で意味が薄い）
- `setTimeout` / `sleep` によるタイミング待機（`waitFor` を使う）
- テスト間の状態共有（各テストは独立して実行できること）
