# パフォーマンスモニタリング

## 監視対象の指標

| 指標                          | ツール                                     | 閾値                   |
| ----------------------------- | ------------------------------------------ | ---------------------- |
| Core Web Vitals (LCP/INP/CLS) | Vercel Analytics / Google Search Console   | LCP < 2.5s, CLS < 0.1  |
| JavaScript エラー             | Sentry（将来対応）                         | エラー率 < 0.1%        |
| API レスポンスタイム          | ブラウザ Network タブ / Sentry Performance | p95 < 3s               |
| バンドルサイズ                | `next build` 出力 / Bundle Analyzer        | 初期 JS < 200KB (gzip) |

---

## Web Vitals の計測

Next.js の組み込み機能で Core Web Vitals を収集できる。

```tsx
// app/layout.tsx
export function reportWebVitals(metric: NextWebVitalsMetric) {
  // 将来: Sentry や独自のアナリティクスに送信
  if (process.env.NODE_ENV === "development") {
    console.log(metric);
  }
}
```

---

## Bundle Analyzer の使用方法

バンドルサイズが大きいと感じたときに実行する。

```bash
# インストール（未導入の場合）
npm install -D @next/bundle-analyzer

# 実行
ANALYZE=true npm run build
```

```ts
// next.config.ts
import bundleAnalyzer from "@next/bundle-analyzer";
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});
export default withBundleAnalyzer({});
```

---

## エラーモニタリング（将来対応）

Sentry を導入することで以下を自動収集できる：

- JavaScript エラーのスタックトレース
- ユーザー影響の範囲（エラーが発生したユーザー数）
- パフォーマンストレース（API レスポンス、コンポーネントレンダリング時間）

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## ローカルでのパフォーマンス確認

```bash
# 本番ビルドでのパフォーマンス確認
npm run build && npm start

# Lighthouse で計測（Chrome DevTools > Lighthouse タブ）
# または
npx lighthouse http://localhost:3000 --view
```

---

## パフォーマンス劣化の検知

CI でバンドルサイズを記録し、PR ごとの増加を検知する（将来対応）：

```yaml
# .github/workflows/ci.yml に追加
- name: Build & Analyze
  run: npm run build
  # next build の出力でページごとのサイズを確認可能
```

`next build` の出力例：

```
Route (app)                Size     First Load JS
┌ ○ /                     5.2 kB   87.4 kB
├ ○ /history              3.1 kB   85.3 kB
└ ○ /style                2.8 kB   85.0 kB
```

First Load JS が 200KB を超えるページがある場合はダイナミックインポートを検討する。
