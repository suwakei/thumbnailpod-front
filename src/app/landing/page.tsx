"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Palette,
  Zap,
  Layers,
  MonitorPlay,
  Download,
  Wand2,
  ChevronRight,
  Loader2,
  Clock,
  TrendingUp,
  BarChart3,
  ImagePlus,
  Pencil,
  Target,
  DollarSign,
  Timer,
  AlertTriangle,
} from "lucide-react";
import { ROUTES, PLAN_FEATURES } from "@/consts";
import { getOAuthURL } from "@/lib/api";
import styles from "./page.module.css";

const painPoints = [
  {
    icon: Timer,
    title: "毎回30分以上かかる",
    desc: "週3本投稿で月12時間。Canvaのテンプレをいじるだけでも積み重なると膨大な時間に。",
  },
  {
    icon: AlertTriangle,
    title: "テンプレがマンネリ化",
    desc: "同じレイアウトの使い回しでCTRが徐々に低下。視聴者に「またこのパターンか」と思われている。",
  },
  {
    icon: DollarSign,
    title: "外注は月5万円〜",
    desc: "デザイナーに頼むと1枚2,000〜5,000円。週3本で月3〜6万円のコストが発生。",
  },
];

const features = [
  {
    icon: Wand2,
    title: "プロンプト1行で3パターン",
    desc: "テキストで指示するだけ。A/Bテスト用に複数バリエーションを数秒で生成。外注の100分の1の時間。",
    accent: "coral",
  },
  {
    icon: ImagePlus,
    title: "自分の顔写真 + AI合成",
    desc: "参照画像をアップロードして、自分の写真を活かしたサムネイルを生成。「AIっぽさ」のない自然な仕上がり。",
    accent: "cyan",
  },
  {
    icon: Palette,
    title: "チャンネルのスタイル学習",
    desc: "過去のサムネイルから配色・レイアウト・雰囲気をAIが学習。統一感を保ちながら新鮮なデザインを。",
    accent: "coral",
  },
  {
    icon: Pencil,
    title: "ブラウザ完結エディタ",
    desc: "テキスト編集・色調補正・レイヤー管理をCanvasエディタで。Photoshopを開く必要なし。",
    accent: "cyan",
  },
  {
    icon: MonitorPlay,
    title: "YouTube直接更新",
    desc: "ワンクリックで動画サムネイルを差し替え。YouTube Studioを開く手間ゼロ。",
    accent: "coral",
  },
  {
    icon: Layers,
    title: "レイヤー分離出力",
    desc: "背景・人物・テキストを独立レイヤーで出力。PSD/PNG/ZIPでさらに細かい編集も可能。",
    accent: "cyan",
  },
];

const ctrResults = [
  { channel: "ゲーム実況チャンネル", before: 3.2, after: 6.8, subs: "3.2万" },
  { channel: "ビジネス解説チャンネル", before: 4.1, after: 7.5, subs: "5.8万" },
  { channel: "Vlogチャンネル", before: 2.8, after: 5.4, subs: "1.4万" },
];

const steps = [
  {
    num: "01",
    title: "チャンネル連携",
    desc: "YouTubeアカウントでログインするだけ",
  },
  {
    num: "02",
    title: "スタイル学習",
    desc: '過去サムネイルからあなたの"らしさ"を抽出',
  },
  {
    num: "03",
    title: "プロンプト + 参照画像",
    desc: "テキストと写真で作りたいサムネイルを指示",
  },
  {
    num: "04",
    title: "即座に完成",
    desc: "数秒で複数バリエーションを生成・編集・適用",
  },
];

const comparisons = [
  {
    label: "外注デザイナー",
    cost: "月3〜6万円",
    time: "1枚あたり1〜2日",
    variation: "修正依頼が必要",
    highlight: false,
  },
  {
    label: "ThumbnailPod",
    cost: "月2,980円〜",
    time: "1枚あたり10秒",
    variation: "3パターン同時生成",
    highlight: true,
  },
  {
    label: "Canva (自作)",
    cost: "無料〜月1,500円",
    time: "1枚あたり30分",
    variation: "手動で作り直し",
    highlight: false,
  },
];

export default function LandingPage() {
  const [loginLoading, setLoginLoading] = useState(false);
  const [annual, setAnnual] = useState(false);

  async function handleGoogleLogin() {
    setLoginLoading(true);
    try {
      const { url } = await getOAuthURL();
      window.location.href = url;
    } catch {
      setLoginLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* ===== Background layers ===== */}
      <div className={styles.bgLayer}>
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
        <div className={styles.bgOrb3} />
        <div className={styles.bgGrid} />
      </div>

      {/* ===== Header ===== */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href={ROUTES.landing} className={styles.logoLink}>
            <div className={styles.logoMark}>
              <Sparkles size={16} />
            </div>
            <span className={styles.logoText}>ThumbnailPod</span>
          </Link>

          <nav className={styles.headerNav}>
            <a href="#pain" className={styles.navLink}>
              課題
            </a>
            <a href="#features" className={styles.navLink}>
              機能
            </a>
            <a href="#results" className={styles.navLink}>
              実績
            </a>
            <a href="#pricing" className={styles.navLink}>
              料金
            </a>
          </nav>

          <button
            className={styles.loginBtn}
            onClick={handleGoogleLogin}
            disabled={loginLoading}
          >
            {loginLoading ? (
              <Loader2 size={16} className={styles.spinner} />
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                className={styles.googleIcon}
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            無料で始める
          </button>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <Target size={12} />
          週3本以上投稿するYouTuberへ
        </div>

        <h1 className={styles.heroTitle}>
          サムネイル制作を
          <br />
          <span className={styles.heroAccent}>月12時間 → 10分</span>に
        </h1>

        <p className={styles.heroSub}>
          自分の写真 + テキスト指示で、チャンネルの雰囲気に合ったサムネイルをAIが自動生成。
          <br />
          外注コスト月5万円を、月2,980円に。
        </p>

        <div className={styles.heroCta}>
          <button
            className={styles.ctaPrimary}
            onClick={handleGoogleLogin}
            disabled={loginLoading}
          >
            無料で15回試す
            <ArrowRight size={16} />
          </button>
          <a href="#results" className={styles.ctaSecondary}>
            CTR改善事例を見る
            <ChevronRight size={14} />
          </a>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>10秒</span>
            <span className={styles.heroStatLabel}>1枚の生成時間</span>
          </div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>+93%</span>
            <span className={styles.heroStatLabel}>平均CTR改善率</span>
          </div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatValue}>1/20</span>
            <span className={styles.heroStatLabel}>外注比コスト</span>
          </div>
        </div>

        {/* Hero visual mock */}
        <div className={styles.heroVisual}>
          <div className={styles.mockEditor}>
            <div className={styles.mockToolbar}>
              <div className={styles.mockDots}>
                <span />
                <span />
                <span />
              </div>
              <span className={styles.mockTitle}>ThumbnailPod Editor</span>
            </div>
            <div className={styles.mockCanvas}>
              <div className={styles.mockLayer} data-label="background" />
              <div className={styles.mockLayer} data-label="person" />
              <div className={styles.mockLayer} data-label="text" />
              <div className={styles.mockLayerPanel}>
                <div className={styles.mockLayerItem}>
                  <Layers size={10} /> composite
                </div>
                <div className={styles.mockLayerItem}>
                  <Layers size={10} /> text_layer
                </div>
                <div className={styles.mockLayerItem}>
                  <Layers size={10} /> person_layer
                </div>
                <div className={styles.mockLayerItem}>
                  <Layers size={10} /> background
                </div>
              </div>
            </div>
          </div>
          <div className={styles.mockGlow} />
        </div>
      </section>

      {/* ===== Pain Points ===== */}
      <section className={styles.painSection} id="pain">
        <div className={styles.sectionLabel}>Problem</div>
        <h2 className={styles.sectionTitle}>
          週3本投稿で、サムネイルに
          <span className={styles.heroAccent}>月12時間</span>
          使っていませんか？
        </h2>
        <p className={styles.sectionSub}>
          1万〜10万登録者のチャンネルが最も感じるサムネイルの課題
        </p>

        <div className={styles.painGrid}>
          {painPoints.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className={styles.painCard}>
                <div className={styles.painIcon}>
                  <Icon size={22} />
                </div>
                <h3 className={styles.painTitle}>{p.title}</h3>
                <p className={styles.painDesc}>{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className={styles.features} id="features">
        <div className={styles.sectionLabel}>Solution</div>
        <h2 className={styles.sectionTitle}>
          プロの仕上がりを、
          <span className={styles.heroAccent}>AIの速度</span>で
        </h2>
        <p className={styles.sectionSub}>
          写真アップロード・AI生成・編集・YouTube適用まで全工程をカバー
        </p>

        <div className={styles.featureGrid}>
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={styles.featureCard}
                data-accent={f.accent}
              >
                <div className={styles.featureIcon}>
                  <Icon size={20} />
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== CTR Results ===== */}
      <section className={styles.resultsSection} id="results">
        <div className={styles.sectionLabel}>Results</div>
        <h2 className={styles.sectionTitle}>
          平均CTR
          <span className={styles.heroAccent}> +93%</span>
          改善
        </h2>
        <p className={styles.sectionSub}>
          ThumbnailPodに切り替えたチャンネルのCTR変化
        </p>

        <div className={styles.ctrGrid}>
          {ctrResults.map((r) => (
            <div key={r.channel} className={styles.ctrCard}>
              <div className={styles.ctrChannel}>
                <span className={styles.ctrName}>{r.channel}</span>
                <span className={styles.ctrSubs}>{r.subs}登録者</span>
              </div>
              <div className={styles.ctrBars}>
                <div className={styles.ctrBarRow}>
                  <span className={styles.ctrBarLabel}>Before</span>
                  <div className={styles.ctrBarTrack}>
                    <div
                      className={styles.ctrBarFillBefore}
                      style={{ width: `${(r.before / 10) * 100}%` }}
                    />
                  </div>
                  <span className={styles.ctrBarValue}>{r.before}%</span>
                </div>
                <div className={styles.ctrBarRow}>
                  <span className={styles.ctrBarLabel}>After</span>
                  <div className={styles.ctrBarTrack}>
                    <div
                      className={styles.ctrBarFillAfter}
                      style={{ width: `${(r.after / 10) * 100}%` }}
                    />
                  </div>
                  <span className={styles.ctrBarValueHighlight}>
                    {r.after}%
                  </span>
                </div>
              </div>
              <div className={styles.ctrImprovement}>
                <TrendingUp size={14} />
                +{Math.round(((r.after - r.before) / r.before) * 100)}%
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Comparison ===== */}
      <section className={styles.comparisonSection}>
        <div className={styles.sectionLabel}>Compare</div>
        <h2 className={styles.sectionTitle}>
          他の方法と
          <span className={styles.heroAccent}>比較</span>
        </h2>

        <div className={styles.comparisonGrid}>
          {comparisons.map((c) => (
            <div
              key={c.label}
              className={`${styles.comparisonCard} ${c.highlight ? styles.comparisonCardHighlight : ""}`}
            >
              {c.highlight && (
                <div className={styles.comparisonBadge}>おすすめ</div>
              )}
              <h3 className={styles.comparisonName}>{c.label}</h3>
              <dl className={styles.comparisonList}>
                <div className={styles.comparisonRow}>
                  <dt>
                    <DollarSign size={14} /> コスト
                  </dt>
                  <dd>{c.cost}</dd>
                </div>
                <div className={styles.comparisonRow}>
                  <dt>
                    <Clock size={14} /> 所要時間
                  </dt>
                  <dd>{c.time}</dd>
                </div>
                <div className={styles.comparisonRow}>
                  <dt>
                    <Layers size={14} /> バリエーション
                  </dt>
                  <dd>{c.variation}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className={styles.howSection} id="how">
        <div className={styles.sectionLabel}>How it works</div>
        <h2 className={styles.sectionTitle}>
          <span className={styles.heroAccent}>4ステップ</span>で完成
        </h2>

        <div className={styles.stepsRow}>
          {steps.map((s, i) => (
            <div key={s.num} className={styles.stepCard}>
              <span className={styles.stepNum}>{s.num}</span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
              {i < steps.length - 1 && (
                <div className={styles.stepArrow}>
                  <ChevronRight size={16} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== Coming Soon: Analytics ===== */}
      <section className={styles.analyticsTeaser}>
        <div className={styles.analyticsTeaserInner}>
          <div className={styles.comingSoonBadge}>Coming Soon</div>
          <h2 className={styles.analyticsTeaserTitle}>
            <BarChart3 size={28} />
            YouTube Analytics 連携
          </h2>
          <p className={styles.analyticsTeaserDesc}>
            どのサムネイルがCTRが高かったか、ダッシュボードで一目瞭然。
            データに基づいたサムネイル改善サイクルを、ThumbnailPod内で完結。
          </p>
          <div className={styles.analyticsMockGrid}>
            <div className={styles.analyticsMockCard}>
              <span className={styles.analyticsMockLabel}>平均CTR</span>
              <span className={styles.analyticsMockValue}>6.2%</span>
              <span className={styles.analyticsMockDelta}>+1.8%</span>
            </div>
            <div className={styles.analyticsMockCard}>
              <span className={styles.analyticsMockLabel}>
                最高CTRサムネイル
              </span>
              <span className={styles.analyticsMockValue}>9.1%</span>
              <span className={styles.analyticsMockDelta}>Top</span>
            </div>
            <div className={styles.analyticsMockCard}>
              <span className={styles.analyticsMockLabel}>今月の生成数</span>
              <span className={styles.analyticsMockValue}>24枚</span>
              <span className={styles.analyticsMockDelta}>+8</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section className={styles.pricing} id="pricing">
        <div className={styles.sectionLabel}>Pricing</div>
        <h2 className={styles.sectionTitle}>
          外注の<span className={styles.heroAccent}>1/20</span>のコストで
        </h2>

        {/* Billing toggle */}
        <div className={styles.billingToggle}>
          <button
            className={`${styles.billingOption} ${!annual ? styles.billingOptionActive : ""}`}
            onClick={() => setAnnual(false)}
          >
            月払い
          </button>
          <button
            className={`${styles.billingOption} ${annual ? styles.billingOptionActive : ""}`}
            onClick={() => setAnnual(true)}
          >
            年払い
            <span className={styles.billingSave}>2ヶ月分おトク</span>
          </button>
        </div>

        <div className={styles.pricingGrid}>
          {Object.entries(PLAN_FEATURES).map(([key, plan]) => {
            const displayPrice = annual
              ? plan.annualPrice || plan.price
              : plan.price;
            const displaySub = annual
              ? plan.annualPriceSub || plan.priceSub
              : plan.priceSub;
            const monthlyNote = annual ? plan.annualMonthly : undefined;

            return (
              <div
                key={key}
                className={`${styles.planCard} ${key === "creator" ? styles.planCardFeatured : ""}`}
              >
                {key === "creator" && (
                  <div className={styles.planBadge}>
                    週3本投稿に最適
                  </div>
                )}
                <h3 className={styles.planName} style={{ color: plan.color }}>
                  {plan.label}
                </h3>
                <div className={styles.planPricing}>
                  <span className={styles.planPrice}>{displayPrice}</span>
                  {displaySub && (
                    <span className={styles.planPriceSub}>{displaySub}</span>
                  )}
                </div>
                {monthlyNote && (
                  <span className={styles.planMonthly}>{monthlyNote}</span>
                )}
                <ul className={styles.planFeatures}>
                  {plan.features.map((feat) => (
                    <li key={feat}>{feat}</li>
                  ))}
                </ul>
                <button
                  className={
                    key === "creator" ? styles.planBtnPrimary : styles.planBtn
                  }
                  onClick={handleGoogleLogin}
                  disabled={loginLoading}
                >
                  {key === "free" ? "無料で始める" : "始める"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== Footer CTA ===== */}
      <section className={styles.footerCta}>
        <h2 className={styles.footerCtaTitle}>
          サムネイルに時間を使うのは、もう終わり
        </h2>
        <p className={styles.footerCtaSub}>
          月12時間のサムネイル制作を10分に。まずは無料で体験。
        </p>
        <button
          className={styles.ctaPrimary}
          onClick={handleGoogleLogin}
          disabled={loginLoading}
        >
          無料で15回試す
          <ArrowRight size={16} />
        </button>
      </section>

      {/* ===== Footer ===== */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <Sparkles size={14} />
            <span>ThumbnailPod</span>
          </div>
          <p className={styles.footerCopy}>
            &copy; 2026 ThumbnailPod. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
