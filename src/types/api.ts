export const JobStatus = {
  Pending: 'pending',
  Processing: 'processing',
  Completed: 'completed',
  Failed: 'failed',
} as const;
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export const Plan = {
  Free: 'free',
  Creator: 'creator',
  Pro: 'pro',
  Business: 'business',
} as const;
export type Plan = (typeof Plan)[keyof typeof Plan];

export const StyleModelStatus = {
  Pending: 'pending',
  Training: 'training',
  Ready: 'ready',
  Failed: 'failed',
} as const;
export type StyleModelStatus = (typeof StyleModelStatus)[keyof typeof StyleModelStatus];

export interface User {
  id: string;
  channelId: string;
  channelName: string;
  plan: Plan;
  createdAt: string;
}

export interface PlanInfo {
  plan: Plan;
  generationCountMonth: number;
  monthlyLimit: number;
  remaining: number;
}

export interface GenerationJob {
  id: string;
  userId: string;
  styleModelId: string | null;
  prompt: string;
  status: JobStatus;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface JobDetail {
  jobId: string;
  status: JobStatus;
  prompt: string;
  createdAt: string;
  imageUrl?: string;
  thumbnailId?: string;
  error?: string;
}

export interface HistoryResponse {
  jobs: GenerationJob[];
  totalCount: number;
  limit: number;
  offset: number;
}

export interface StyleModel {
  id: string;
  userId: string;
  name: string;
  type: string;
  s3Key: string | null;
  styleMetadata: Record<string, unknown> | null;
  sourceVideoCount: number;
  status: StyleModelStatus;
  createdAt: string;
  updatedAt: string;
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
}

export interface LayerInfo {
  label: string;
  url: string;
}

export interface EditRecord {
  id: string;
  jobId: string;
  operations: unknown[];
  resultLayers: Record<string, string>;
  createdAt: string;
}

export interface Template {
  id: string;
  userId: string;
  name: string;
  prompt: string;
  styleModelId: string | null;
  sourceJobId: string | null;
  previewS3Key: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  jobId: string;
  createdAt: string;
}

export interface FavoriteWithJob extends Favorite {
  job?: GenerationJob;
}

export interface FavoritesResponse {
  favorites: FavoriteWithJob[];
  totalCount: number;
  limit: number;
  offset: number;
}

export interface Webhook {
  id: string;
  userId: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BillingInfo {
  plan: Plan;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
}

export interface Analytics {
  totalGenerations: number;
  totalStyles: number;
  totalFavorites: number;
  generationsThisWeek: number;
  lastGenerationAt: string | null;
}

export interface PresignedUpload {
  uploadUrl: string;
  s3Key: string;
}

// === Admin ===
export interface AdminServiceHealth {
  status: string;
  version?: string;
  latencyMs?: number;
}

export interface AdminHealthResponse {
  status: string;
  services: Record<string, AdminServiceHealth>;
  checkedAt: string;
}

export interface AdminJobStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface AdminStatsResponse {
  users: { total: number };
  jobs: AdminJobStats;
  styleModels: { total: number };
}

export interface MaintenanceStatus {
  maintenance: boolean;
  message: string;
}
