# パフォーマンス最適化

## Next.js のレンダリング戦略

| 戦略                           | 使うタイミング               | 例                                    |
| ------------------------------ | ---------------------------- | ------------------------------------- |
| Server Component（デフォルト） | データ表示・静的コンテンツ   | 生成履歴一覧、スタイルモデル一覧      |
| Client Component               | インタラクション・ポーリング | 生成フォーム、リアルタイム状態        |
| Static Generation              | ほぼ変化しないページ         | ランディングページ                    |
| ISR（`revalidate`）            | 低頻度更新データ             | スタイルモデル一覧（30 秒キャッシュ） |
| Dynamic（`no-store`）          | 常に最新が必要なデータ       | ジョブステータス                      |

---

## 画像最適化

`next/image` を使う。`<img>` タグを直接使わない。

```tsx
// 正
import Image from 'next/image';

<Image
  src={thumbnail.imageUrl}
  alt="Generated thumbnail"
  width={1280}
  height={720}
  priority={isAboveFold}  // ファーストビューの画像は priority=true
/>

// 避ける
<img src={thumbnail.imageUrl} />
```

### S3 からの画像表示

S3 の署名付き URL からの画像は `next.config.ts` に許可ドメインを追加する。

```ts
// next.config.ts
export default {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};
```

---

## バンドルサイズの削減

### ダイナミックインポート

大きなコンポーネント・ライブラリは必要なときだけ読み込む。

```tsx
// 動的インポート（コードスプリッティング）
import dynamic from "next/dynamic";

const HeavyEditor = dynamic(() => import("@/components/HeavyEditor"), {
  loading: () => <Skeleton />,
  ssr: false, // ブラウザ専用コンポーネントの場合
});
```

### 型インポートの `import type` 化

ランタイムに不要な型は `import type` にする。

```ts
import type { GenerationJob } from "@/types";
```

---

## フェッチのキャッシュ活用

```ts
// 生成履歴: タグベース再検証（新規生成後に revalidateTag）
fetch(url, { next: { tags: ["generation-history"] } });

// スタイルモデル: 30 秒キャッシュ
fetch(url, { next: { revalidate: 30 } });

// ジョブステータス（ポーリング中）: キャッシュなし
fetch(url, { cache: "no-store" });
```

---

## ポーリングの最適化

生成ジョブのポーリングは以下を守る：

- 完了・失敗後は即座にポーリングを停止する（`clearInterval`）
- インターバルは 2 秒以上（バックエンドへの負荷を考慮）
- コンポーネントのアンマウント時にクリーンアップする

```ts
useEffect(() => {
  if (!jobId || isTerminal(status)) return;

  const id = setInterval(async () => {
    const job = await getGenerationJob(jobId);
    setStatus(job.status);
  }, 2000);

  return () => clearInterval(id); // クリーンアップ
}, [jobId, status]);

function isTerminal(s: JobStatus | null) {
  return s === "completed" || s === "failed";
}
```

---

## Web Vitals の目標値

| 指標                      | 目標     | 測定方法                           |
| ------------------------- | -------- | ---------------------------------- |
| LCP（最大コンテンツ描画） | < 2.5 秒 | Vercel Analytics / Chrome DevTools |
| FID / INP（入力遅延）     | < 100 ms | Chrome DevTools                    |
| CLS（レイアウトシフト）   | < 0.1    | Chrome DevTools                    |
| TTFB（最初のバイト）      | < 800 ms | Network タブ                       |

---

## 不要な再レンダリングの防止

```tsx
// メモ化が有効なケース：重い計算・安定した子コンポーネント
const sortedJobs = useMemo(
  () => jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  [jobs],
);

// コールバックの安定化（子コンポーネントへ props として渡す場合）
const handleDownload = useCallback((jobId: string) => {
  // ...
}, []); // 依存なしなら空配列
```

`useMemo` / `useCallback` は計測して必要だと判明した場合に使う。
パフォーマンス問題がないのに先回りして使うのは避ける。
