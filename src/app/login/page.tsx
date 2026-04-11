"use client";

import { useState } from "react";
import {
  Sparkles,
  MonitorPlay,
  ArrowRight,
  Shield,
  Zap,
  Palette,
} from "lucide-react";
import { getOAuthURL } from "@/lib/api";
import Button from "@/components/ui/Button";
import styles from "./page.module.css";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const { url } = await getOAuthURL();
      window.location.href = url;
    } catch (err) {
      console.error("OAuth URL fetch failed:", err);
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg}>
        <div className={styles.gradient1} />
        <div className={styles.gradient2} />
        <div className={styles.grid} />
      </div>

      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.logoMark}>
            <Sparkles size={28} />
          </div>
          <h1 className={styles.title}>ThumbnailPod</h1>
          <p className={styles.subtitle}>AI Thumbnail Studio</p>
          <p className={styles.description}>
            あなたのYouTubeチャンネルのスタイルを学習し、
            <br />
            クリック率を最大化するサムネイルを自動生成
          </p>
        </div>

        <div className={styles.loginCard}>
          <Button
            size="lg"
            onClick={handleLogin}
            loading={loading}
            className={styles.googleBtn}
          >
            <MonitorPlay size={20} />
            YouTubeアカウントでログイン
            <ArrowRight size={16} />
          </Button>
          <p className={styles.hint}>
            YouTube Data API を使用してチャンネル情報にアクセスします
          </p>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <Palette size={18} />
            </div>
            <div>
              <div className={styles.featureTitle}>スタイル学習</div>
              <div className={styles.featureDesc}>
                過去のサムネイルからあなた独自のスタイルを AI が学習
              </div>
            </div>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <Zap size={18} />
            </div>
            <div>
              <div className={styles.featureTitle}>ワンクリック生成</div>
              <div className={styles.featureDesc}>
                プロンプトを入力するだけで高品質なサムネイルを生成
              </div>
            </div>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <Shield size={18} />
            </div>
            <div>
              <div className={styles.featureTitle}>YouTube直接更新</div>
              <div className={styles.featureDesc}>
                生成したサムネイルをそのまま動画に適用可能
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
