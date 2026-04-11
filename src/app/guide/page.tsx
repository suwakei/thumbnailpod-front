"use client";

import {
  BookOpen,
  Sparkles,
  Layers,
  Pencil,
  MonitorPlay,
  Palette,
  Download,
  MousePointer2,
  Type,
  Move,
  ZoomIn,
  Keyboard,
  ArrowRight,
  FileText,
  Heart,
  Webhook,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import styles from "./page.module.css";

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function Step({ number, title, description, icon }: StepProps) {
  return (
    <div className={styles.step}>
      <div className={styles.stepNumber}>{number}</div>
      <div className={styles.stepIcon}>{icon}</div>
      <div className={styles.stepContent}>
        <h3 className={styles.stepTitle}>{title}</h3>
        <p className={styles.stepDesc}>{description}</p>
      </div>
    </div>
  );
}

interface ShortcutProps {
  keys: string;
  description: string;
}

function Shortcut({ keys, description }: ShortcutProps) {
  return (
    <div className={styles.shortcutRow}>
      <kbd className={styles.kbd}>{keys}</kbd>
      <span className={styles.shortcutDesc}>{description}</span>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureIcon}>{icon}</div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDesc}>{description}</p>
    </div>
  );
}

export default function GuidePage() {
  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.header}>
          <BookOpen size={20} className={styles.headerIcon} />
          <h1 className={styles.title}>使い方ガイド</h1>
        </div>

        {/* Quick Start */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Sparkles size={16} />
            クイックスタート
          </h2>
          <p className={styles.sectionDesc}>
            ThumbnailPodでサムネイルを作成する基本的な流れです。
          </p>
          <Card padding="lg">
            <div className={styles.steps}>
              <Step
                number={1}
                title="プロンプトを入力"
                description="ダッシュボードの生成フォームに、作りたいサムネイルのイメージをテキストで入力します。「ゲーム実況のサムネイル、驚いた表情、赤い背景」のように具体的に記述するほど、意図に近い結果が得られます。"
                icon={<FileText size={20} />}
              />
              <div className={styles.stepArrow}>
                <ArrowRight size={16} />
              </div>
              <Step
                number={2}
                title="AIが生成"
                description="AIがプロンプトを解析し、サムネイル画像を自動生成します。生成には通常10〜30秒かかります。ステータスがリアルタイムで更新されるので、そのままお待ちください。"
                icon={<Sparkles size={20} />}
              />
              <div className={styles.stepArrow}>
                <ArrowRight size={16} />
              </div>
              <Step
                number={3}
                title="エディタで編集"
                description="生成されたサムネイルをCanvasエディタで自由に編集できます。テキストの追加・変更、色調補正、レイヤーの表示/非表示切り替えなど、細かい調整が可能です。"
                icon={<Pencil size={20} />}
              />
              <div className={styles.stepArrow}>
                <ArrowRight size={16} />
              </div>
              <Step
                number={4}
                title="ダウンロード or YouTube適用"
                description="完成したサムネイルをPNG/PSD/ZIPでダウンロードするか、YouTube動画に直接適用できます。YouTube連携済みなら、ワンクリックでサムネイルを更新できます。"
                icon={<Download size={20} />}
              />
            </div>
          </Card>
        </section>

        {/* Features */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Layers size={16} />
            主要機能
          </h2>
          <div className={styles.featureGrid}>
            <FeatureCard
              icon={<Sparkles size={24} />}
              title="AI サムネイル生成"
              description="テキストプロンプトからAIがサムネイル画像を自動生成します。スタイルモデルを指定すれば、チャンネルの雰囲気に合った画像を生成できます。"
            />
            <FeatureCard
              icon={<Palette size={24} />}
              title="スタイル学習"
              description="既存のサムネイルや画像を学習させ、独自のスタイルモデルを作成できます。チャンネルの統一感を保ちつつ新しいサムネイルを生成できます。"
            />
            <FeatureCard
              icon={<Pencil size={24} />}
              title="Canvas エディタ"
              description="fabric.jsベースの高機能エディタ。レイヤー管理、テキスト編集、色調補正、ドラッグ&ドロップによる位置調整が可能です。"
            />
            <FeatureCard
              icon={<Layers size={24} />}
              title="レイヤー分離"
              description="AIが生成した画像を背景・テキスト・人物などのレイヤーに自動分離。各レイヤーを個別にダウンロードしたり、エディタで編集できます。"
            />
            <FeatureCard
              icon={<MonitorPlay size={24} />}
              title="YouTube 連携"
              description="YouTubeチャンネルと連携し、動画一覧から直接サムネイルを差し替えられます。OAuth認証で安全に接続します。"
            />
            <FeatureCard
              icon={<Download size={24} />}
              title="マルチフォーマット DL"
              description="PNG（Web用）、PSD（Photoshop編集用）、ZIP（一括ダウンロード）の3形式に対応。レイヤー別のダウンロードも可能です。"
            />
            <FeatureCard
              icon={<FileText size={24} />}
              title="テンプレート"
              description="よく使うプロンプトとスタイルの組み合わせをテンプレートとして保存。次回以降、ワンクリックで同じ設定から生成を開始できます。"
            />
            <FeatureCard
              icon={<Heart size={24} />}
              title="お気に入り"
              description="気に入ったサムネイルをお気に入りに登録。過去の生成結果からベストなものを素早く参照できます。"
            />
            <FeatureCard
              icon={<Webhook size={24} />}
              title="Webhook"
              description="生成完了やスタイル学習完了などのイベントをWebhookで外部サービスに通知。自動化ワークフローを構築できます。"
            />
          </div>
        </section>

        {/* Editor Guide */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Pencil size={16} />
            エディタの使い方
          </h2>
          <Card padding="lg">
            <div className={styles.editorGuide}>
              <div className={styles.toolGuide}>
                <h3 className={styles.subTitle}>ツール</h3>
                <div className={styles.toolList}>
                  <div className={styles.toolItem}>
                    <div className={styles.toolIcon}>
                      <MousePointer2 size={18} />
                    </div>
                    <div>
                      <strong>選択ツール</strong>
                      <p>
                        オブジェクトをクリックして選択・移動・リサイズ・回転ができます。
                      </p>
                    </div>
                  </div>
                  <div className={styles.toolItem}>
                    <div className={styles.toolIcon}>
                      <Type size={18} />
                    </div>
                    <div>
                      <strong>テキストツール</strong>
                      <p>
                        右パネルからテキストを追加。フォント・サイズ・色・スタイルをカスタマイズできます。
                      </p>
                    </div>
                  </div>
                  <div className={styles.toolItem}>
                    <div className={styles.toolIcon}>
                      <Move size={18} />
                    </div>
                    <div>
                      <strong>移動ツール</strong>
                      <p>
                        キャンバス全体をドラッグしてパン（移動）できます。
                      </p>
                    </div>
                  </div>
                  <div className={styles.toolItem}>
                    <div className={styles.toolIcon}>
                      <ZoomIn size={18} />
                    </div>
                    <div>
                      <strong>ズームツール</strong>
                      <p>
                        マウスホイールまたはツールバーのボタンでズームイン/アウトできます。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.toolGuide}>
                <h3 className={styles.subTitle}>右パネル</h3>
                <div className={styles.panelDesc}>
                  <div className={styles.panelItem}>
                    <strong>レイヤー</strong> &mdash;
                    レイヤーの表示/非表示、ロック、並び順、不透明度を管理。テキストレイヤーは削除も可能です。
                  </div>
                  <div className={styles.panelItem}>
                    <strong>テキスト</strong> &mdash;
                    新規テキストの追加。フォントファミリー（8種類）、サイズ（8〜200px）、色（プリセット10色+カスタム）、太字/斜体/配置を設定。
                  </div>
                  <div className={styles.panelItem}>
                    <strong>色調</strong> &mdash;
                    選択中のレイヤーに対して明るさ・コントラスト・彩度をスライダーで調整。リセットボタンで初期状態に戻せます。
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Keyboard Shortcuts */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Keyboard size={16} />
            キーボードショートカット
          </h2>
          <Card padding="lg">
            <div className={styles.shortcutGrid}>
              <div className={styles.shortcutGroup}>
                <h3 className={styles.shortcutGroupTitle}>ツール切替</h3>
                <Shortcut keys="V" description="選択ツール" />
                <Shortcut keys="T" description="テキストツール" />
                <Shortcut keys="H" description="移動ツール" />
                <Shortcut keys="Z" description="ズームツール" />
              </div>
              <div className={styles.shortcutGroup}>
                <h3 className={styles.shortcutGroupTitle}>操作</h3>
                <Shortcut keys="Ctrl + Z" description="元に戻す（Undo）" />
                <Shortcut keys="Ctrl + Shift + Z" description="やり直し（Redo）" />
                <Shortcut keys="Ctrl + S" description="保存" />
              </div>
              <div className={styles.shortcutGroup}>
                <h3 className={styles.shortcutGroupTitle}>ビュー</h3>
                <Shortcut keys="マウスホイール" description="ズームイン/アウト" />
                <Shortcut keys="ツールバー [+] [-]" description="段階ズーム" />
                <Shortcut keys="ツールバー [fit]" description="画面に合わせる" />
              </div>
            </div>
          </Card>
        </section>

        {/* Tips */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Sparkles size={16} />
            プロンプトのコツ
          </h2>
          <Card padding="lg">
            <div className={styles.tips}>
              <div className={styles.tip}>
                <span className={styles.tipLabel}>具体的に書く</span>
                <p className={styles.tipDesc}>
                  「良いサムネイル」ではなく「赤い背景に白い太文字で&quot;衝撃&quot;と書かれた、驚いた表情の人物がいるゲーム実況サムネイル」のように詳細に記述しましょう。
                </p>
              </div>
              <div className={styles.tip}>
                <span className={styles.tipLabel}>スタイルモデルを活用</span>
                <p className={styles.tipDesc}>
                  過去の成功したサムネイルからスタイルモデルを学習させると、チャンネルの統一感を保ちながら新しいサムネイルを生成できます。
                </p>
              </div>
              <div className={styles.tip}>
                <span className={styles.tipLabel}>色やレイアウトを指定</span>
                <p className={styles.tipDesc}>
                  「左に人物、右にテキスト」「背景はグラデーション」「コントラストの高い配色」のように、構図や色味を明確にすると精度が上がります。
                </p>
              </div>
              <div className={styles.tip}>
                <span className={styles.tipLabel}>テンプレートに保存</span>
                <p className={styles.tipDesc}>
                  うまくいったプロンプトはテンプレートとして保存しておきましょう。シリーズ動画の統一サムネイルを効率的に作成できます。
                </p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
