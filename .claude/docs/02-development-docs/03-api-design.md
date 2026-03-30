# API インテグレーション設計

## 基本方針

- バックエンド API への通信は `src/lib/api/` 配下に集約する
- 通信ロジックをコンポーネントに直接書かない
- レスポンスの型は `src/types/api.ts` に定義し、`lib/api/` で使う

---

## API クライアントの構造

```
src/lib/api/
├── client.ts        # fetch ラッパー（共通エラーハンドリング）
├── auth.ts          # 認証系 API
├── generate.ts      # 生成ジョブ系 API
├── style.ts         # スタイル学習系 API
├── youtube.ts       # YouTube 連携系 API
└── error.ts         # ApiError クラス
```

---

## fetch ラッパー（`lib/api/client.ts`）

```ts
// lib/api/client.ts
import { ApiError } from "./error";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (res.status === 401) {
    // トークンリフレッシュを試みる
    const refreshed = await tryRefreshToken();
    if (!refreshed) {
      throw new ApiError(401, "Unauthorized");
    }
    // リトライ
    return apiFetch(path, init);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? "Unknown error");
  }

  return res.json();
}
```

---

## ApiError クラス（`lib/api/error.ts`）

```ts
// lib/api/error.ts
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isNotFound() {
    return this.status === 404;
  }
  get isUnauthorized() {
    return this.status === 401;
  }
  get isForbidden() {
    return this.status === 403;
  }
  get isRateLimited() {
    return this.status === 429;
  }
}
```

---

## 各 API モジュールのパターン

```ts
// lib/api/generate.ts
import { apiFetch } from "./client";
import type {
  CreateJobResponse,
  GenerationJob,
  GenerationHistory,
} from "@/types/api";

export function createGenerationJob(
  prompt: string,
  styleModelId?: string,
): Promise<CreateJobResponse> {
  return apiFetch("/api/v1/generate", {
    method: "POST",
    body: JSON.stringify({ prompt, style_model_id: styleModelId }),
  });
}

export function getGenerationJob(jobId: string): Promise<GenerationJob> {
  return apiFetch(`/api/v1/generate/${jobId}`);
}

export function getGenerationHistory(
  limit = 20,
  offset = 0,
): Promise<GenerationHistory> {
  return apiFetch(`/api/v1/generate/history?limit=${limit}&offset=${offset}`);
}
```

---

## レスポンス型定義（`types/api.ts`）

バックエンドのレスポンス JSON に対応する型を定義する。フィールド名は snake_case のまま使う。

```ts
// types/api.ts

export interface CreateJobResponse {
  job_id: string;
  status: JobStatus;
}

export interface GenerationJob {
  job_id: string;
  status: JobStatus;
  created_at: string; // ISO 8601
  image_url?: string; // status === 'completed' のみ
  thumbnail_id?: string;
  error?: string; // status === 'failed' のみ
}

export interface GenerationHistory {
  jobs: GenerationJob[];
}

export interface UserProfile {
  id: string;
  channel_id: string;
  channel_name: string;
  plan: Plan;
  created_at: string;
}

export interface UserPlan {
  plan: Plan;
  generation_count_month: number;
  monthly_limit: number | null; // null = 無制限
}

export type JobStatus = "pending" | "processing" | "completed" | "failed";
export type Plan = "free" | "creator" | "pro" | "business";
```

---

## Server Component からの呼び出し

Server Component からは直接 `lib/api/` の関数を呼ぶ（fetch はサーバー側で実行）。

```tsx
// app/(dashboard)/history/page.tsx
import { getGenerationHistory } from "@/lib/api/generate";

export default async function HistoryPage() {
  const data = await getGenerationHistory();
  return <HistoryList jobs={data.jobs} />;
}
```

---

## クエリパラメータの規則

バックエンドに合わせて snake_case を使う。

| パラメータ | 型     | デフォルト | 説明               |
| ---------- | ------ | ---------- | ------------------ |
| `limit`    | number | 20         | 取得件数           |
| `offset`   | number | 0          | オフセット         |
| `status`   | string | -          | ステータスフィルタ |

---

## エラーハンドリングの責務分担

| 箇所                | 対応                                                               |
| ------------------- | ------------------------------------------------------------------ |
| `lib/api/client.ts` | 401 → トークンリフレッシュ＆リトライ、その他 → `ApiError` を throw |
| Server Component    | `try/catch` して `notFound()` / `redirect()` / エラー UI           |
| Client Component    | `try/catch` して state にエラーを保持 → UI に表示                  |
| TanStack Query      | `onError` / `error` ステートで UI 表示                             |
