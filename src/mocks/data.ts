export const mockUser = {
  id: "user-001",
  channel_id: "UC_mock_channel_123",
  channel_name: "ThumbnailPod Demo",
  plan: "creator",
  created_at: "2025-11-01T10:00:00Z",
};

export const mockPlanInfo = {
  plan: "creator",
  generation_count_month: 12,
  monthly_limit: 50,
  remaining: 38,
};

export const mockJobs = [
  {
    id: "job-001",
    user_id: "user-001",
    style_model_id: "model-001",
    prompt: "衝撃のニュース！赤い背景に驚く表情の人物、大きな白文字タイトル",
    status: "completed",
    error_message: null,
    created_at: "2026-04-01T14:30:00Z",
    completed_at: "2026-04-01T14:32:00Z",
  },
  {
    id: "job-002",
    user_id: "user-001",
    style_model_id: null,
    prompt: "プログラミング解説動画、コードエディタ画面とキャラクター",
    status: "completed",
    error_message: null,
    created_at: "2026-03-30T09:15:00Z",
    completed_at: "2026-03-30T09:18:00Z",
  },
  {
    id: "job-003",
    user_id: "user-001",
    style_model_id: "model-001",
    prompt: "旅行Vlog風、青空とビーチの風景に人物シルエット",
    status: "processing",
    error_message: null,
    created_at: "2026-04-02T08:00:00Z",
    completed_at: null,
  },
  {
    id: "job-004",
    user_id: "user-001",
    style_model_id: null,
    prompt: "ゲーム実況、暗い背景にネオンカラーのタイトル",
    status: "completed",
    error_message: null,
    created_at: "2026-03-28T20:45:00Z",
    completed_at: "2026-03-28T20:48:00Z",
  },
  {
    id: "job-005",
    user_id: "user-001",
    style_model_id: null,
    prompt: "料理動画、おしゃれな盛り付けとレシピタイトル",
    status: "failed",
    error_message: "Generation timeout exceeded",
    created_at: "2026-03-25T12:00:00Z",
    completed_at: null,
  },
  {
    id: "job-006",
    user_id: "user-001",
    style_model_id: "model-002",
    prompt: "筋トレ解説、ジムの風景にビフォーアフター",
    status: "pending",
    error_message: null,
    created_at: "2026-04-02T10:30:00Z",
    completed_at: null,
  },
];

export const mockJobDetail = {
  job_id: "job-001",
  status: "completed",
  prompt: "衝撃のニュース！赤い背景に驚く表情の人物、大きな白文字タイトル",
  created_at: "2026-04-01T14:30:00Z",
  image_url: null,
  thumbnail_id: "thumb-001",
  error: null,
};

export const mockStyleModels = [
  {
    id: "model-001",
    user_id: "user-001",
    name: "メインチャンネルスタイル",
    type: "lora",
    s3_key: null,
    style_metadata: null,
    source_video_count: 24,
    status: "ready",
    created_at: "2026-02-15T10:00:00Z",
    updated_at: "2026-02-15T12:30:00Z",
  },
  {
    id: "model-002",
    user_id: "user-001",
    name: "ゲーム実況スタイル",
    type: "lora",
    s3_key: null,
    style_metadata: null,
    source_video_count: 18,
    status: "training",
    created_at: "2026-04-01T08:00:00Z",
    updated_at: "2026-04-01T08:00:00Z",
  },
  {
    id: "model-003",
    user_id: "user-001",
    name: "サブチャンネル用",
    type: "lora",
    s3_key: null,
    style_metadata: null,
    source_video_count: 10,
    status: "ready",
    created_at: "2026-03-10T15:00:00Z",
    updated_at: "2026-03-10T17:00:00Z",
  },
];

export const mockYouTubeVideos = [
  {
    video_id: "dQw4w9WgXcQ",
    title: "【衝撃】AIが変える動画制作の未来 — 2026年最新トレンド",
    thumbnail_url: "",
    published_at: "2026-03-28T12:00:00Z",
  },
  {
    video_id: "abc123def45",
    title: "プログラミング入門 #15 — TypeScriptでWebアプリを作ろう",
    thumbnail_url: "",
    published_at: "2026-03-20T09:00:00Z",
  },
  {
    video_id: "xyz789ghi01",
    title: "VLOG | 春の京都旅行🌸 2泊3日の絶景スポット巡り",
    thumbnail_url: "",
    published_at: "2026-03-15T18:00:00Z",
  },
  {
    video_id: "game456play",
    title: "【マイクラ】大型アプデ来た！新バイオーム全紹介",
    thumbnail_url: "",
    published_at: "2026-03-10T20:00:00Z",
  },
  {
    video_id: "cook789chef",
    title: "10分で作れる絶品パスタ3選 — 一人暮らし応援レシピ",
    thumbnail_url: "",
    published_at: "2026-03-05T11:00:00Z",
  },
];

export const mockLayers = [
  { label: "composite", url: "" },
  { label: "text_layer", url: "" },
  { label: "person_layer", url: "" },
  { label: "background_layer", url: "" },
];

export const mockTemplates = [
  {
    id: "tpl-001",
    user_id: "user-001",
    name: "ニュース速報テンプレート",
    prompt: "衝撃ニュース！赤背景に大文字タイトル",
    style_model_id: "model-001",
    source_job_id: "job-001",
    preview_s3_key: null,
    created_at: "2026-03-01T10:00:00Z",
    updated_at: "2026-03-01T10:00:00Z",
  },
  {
    id: "tpl-002",
    user_id: "user-001",
    name: "ゲーム実況テンプレート",
    prompt: "ゲーム実況、暗い背景にネオンカラー",
    style_model_id: null,
    source_job_id: null,
    preview_s3_key: null,
    created_at: "2026-03-15T10:00:00Z",
    updated_at: "2026-03-15T10:00:00Z",
  },
];

export const mockFavorites = [
  {
    id: "fav-001",
    user_id: "user-001",
    job_id: "job-001",
    created_at: "2026-04-01T15:00:00Z",
  },
  {
    id: "fav-002",
    user_id: "user-001",
    job_id: "job-002",
    created_at: "2026-03-30T10:00:00Z",
  },
];

export const mockWebhooks = [
  {
    id: "wh-001",
    user_id: "user-001",
    url: "https://example.com/webhook",
    events: ["job.completed", "job.failed"],
    secret: "whsec_test_123",
    active: true,
    created_at: "2026-03-20T10:00:00Z",
    updated_at: "2026-03-20T10:00:00Z",
  },
];

export const mockBillingInfo = {
  plan: "creator",
  stripe_customer_id: "cus_mock123",
  stripe_subscription_id: "sub_mock456",
  current_period_end: "2026-05-01T00:00:00Z",
};

export const mockAnalytics = {
  total_generations: 47,
  total_styles: 3,
  total_favorites: 12,
  generations_this_week: 8,
  last_generation_at: "2026-04-02T10:30:00Z",
};
