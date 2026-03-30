# 型定義規則

## ファイル配置

```
src/types/
├── api.ts        # バックエンド API レスポンス型（snake_case フィールド）
├── domain.ts     # フロントエンドのドメイン型（camelCase）
└── index.ts      # 再エクスポート
```

---

## API レスポンス型（`types/api.ts`）

バックエンドの JSON レスポンスに忠実な型を定義する。フィールド名は **snake_case** のまま。

```ts
// types/api.ts

export type JobStatus = "pending" | "processing" | "completed" | "failed";
export type Plan = "free" | "creator" | "pro" | "business";
export type StyleModelStatus = "pending" | "training" | "ready" | "failed";

export interface GenerationJobResponse {
  job_id: string;
  status: JobStatus;
  created_at: string;
  image_url?: string;
  thumbnail_id?: string;
  error?: string;
}

export interface UserProfileResponse {
  id: string;
  channel_id: string;
  channel_name: string;
  plan: Plan;
  created_at: string;
}

export interface UserPlanResponse {
  plan: Plan;
  generation_count_month: number;
  monthly_limit: number | null; // null = 無制限
}

export interface StyleModelResponse {
  id: string;
  name: string;
  type: "style_ref" | "lora";
  status: StyleModelStatus;
  source_video_count: number;
  created_at: string;
}

export interface YouTubeVideoResponse {
  video_id: string;
  title: string;
  thumbnail_url: string;
  published_at: string;
}
```

---

## フロントエンドドメイン型（`types/domain.ts`）

UI に特化した型や、API 型を camelCase に変換したものはここに置く。

```ts
// types/domain.ts
import type { GenerationJobResponse, JobStatus } from "./api";

export interface GenerationJob {
  jobId: string;
  status: JobStatus;
  createdAt: Date;
  imageUrl?: string;
  thumbnailId?: string;
  errorMessage?: string;
}

// API レスポンスをドメイン型に変換するマッパー
export function toGenerationJob(res: GenerationJobResponse): GenerationJob {
  return {
    jobId: res.job_id,
    status: res.status,
    createdAt: new Date(res.created_at),
    imageUrl: res.image_url,
    thumbnailId: res.thumbnail_id,
    errorMessage: res.error,
  };
}
```

---

## 定数の型安全な定義

`enum` の代わりに `as const` + Union 型を使う。

```ts
// constants/plans.ts
import type { Plan } from "@/types";

export const PLAN_LIMITS = {
  free: 10,
  creator: 100,
  pro: 500,
  business: null, // 無制限
} as const satisfies Record<Plan, number | null>;

export const PLAN_LABELS = {
  free: "フリー",
  creator: "クリエイター",
  pro: "プロ",
  business: "ビジネス",
} as const satisfies Record<Plan, string>;
```

---

## Props 型の定義規則

- `interface` で定義し、コンポーネントファイル内に置く
- オプショナルプロパティは `?` を使う（`| undefined` を使わない）
- children を受け取る場合は `children: React.ReactNode`

```ts
interface ThumbnailCardProps {
  job: GenerationJob;
  onDownload: (jobId: string) => void;
  onApplyToVideo?: (jobId: string) => void;
}
```

---

## 型ガードの定義規則

型ガードは `is` 構文を使い、型アサーション（`as`）を避ける。

```ts
// 正
function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

// 避ける
const err = e as ApiError;
```

---

## 型インポートの規則

型のみのインポートは `import type` を使う（バンドルサイズ削減）。

```ts
// 正
import type { GenerationJob } from "@/types";
import type { FC, ReactNode } from "react";

// クラス（ランタイム値）は通常インポート
import { ApiError } from "@/lib/api/error";
```

---

## 禁止事項

| 禁止                            | 代替                                   |
| ------------------------------- | -------------------------------------- |
| `any`                           | `unknown` + 型ガード                   |
| `!` 非 null アサーション        | `?.` / if ガード                       |
| `as` キャスト（型アサーション） | 型ガード / 型推論                      |
| `enum`                          | `as const` + Union 型                  |
| `object` / `{}`                 | 具体的な型 / `Record<string, unknown>` |
