import { get, post, put, del } from "./client";
import { API_PATHS } from "@/consts";
import type {
  User,
  PlanInfo,
  JobDetail,
  HistoryResponse,
  StyleModel,
  YouTubeVideo,
  LayerInfo,
  EditRecord,
  Template,
  FavoritesResponse,
  Webhook,
  BillingInfo,
  Analytics,
  PresignedUpload,
  AdminHealthResponse,
  AdminStatsResponse,
  MaintenanceStatus,
} from "@/types/api";

// === Auth ===
export async function getOAuthURL(): Promise<{ url: string }> {
  return get(API_PATHS.auth.oauthUrl);
}

export async function postOAuthCallback(code: string, state: string) {
  return post<{ userId: string; channelName: string; plan: string }>(
    API_PATHS.auth.oauthCallback,
    { code, state },
  );
}

export async function refreshToken() {
  return post<{ accessToken: string }>(API_PATHS.auth.refresh);
}

export async function logout() {
  return del<void>(API_PATHS.auth.logout);
}

// === Users ===
export async function getMe(): Promise<User> {
  return get(API_PATHS.users.me);
}

export async function getMyPlan(): Promise<PlanInfo> {
  return get(API_PATHS.users.myPlan);
}

// === Generate ===
export async function createGenerationJob(
  prompt: string,
  styleModelId?: string,
  referenceImageKeys?: string[],
) {
  return post<{ jobId: string; status: string }>(API_PATHS.generate.create, {
    prompt,
    styleModelId,
    referenceImageKeys:
      referenceImageKeys && referenceImageKeys.length > 0
        ? referenceImageKeys
        : undefined,
  });
}

export async function getJobStatus(jobId: string): Promise<JobDetail> {
  return get(API_PATHS.generate.status(jobId));
}

export async function getHistory(
  limit = 20,
  offset = 0,
): Promise<HistoryResponse> {
  return get(API_PATHS.generate.history(limit, offset));
}

// === Segment / Layers ===
export async function segmentJob(jobId: string) {
  return post<{
    jobId: string;
    layers: Array<{ label: string; s3Key: string }>;
  }>(API_PATHS.generate.segment(jobId));
}

export async function getLayers(jobId: string) {
  return get<{ jobId: string; layers: LayerInfo[]; psdUrl?: string }>(
    API_PATHS.generate.layers(jobId),
  );
}

// === Edit ===
export async function editThumbnail(jobId: string, operations: unknown[]) {
  return post<{
    jobId: string;
    layers: Record<string, string>;
    unchangedLayers: string[];
  }>(API_PATHS.generate.edit(jobId), { operations });
}

export async function getEditHistory(jobId: string) {
  return get<{ edits: EditRecord[] }>(API_PATHS.generate.edits(jobId));
}

// === Download ===
export async function getDownloadURL(
  thumbnailId: string,
  format = "png",
  layer?: string,
) {
  return get<{ downloadUrl: string }>(
    API_PATHS.thumbnails.download(thumbnailId, format, layer),
  );
}

// === Style ===
export async function createLearnJob(name: string, imageUrls: string[]) {
  return post<{ modelId: string; status: string }>(API_PATHS.style.learn, {
    name,
    imageUrls,
  });
}

export async function getStyleModels() {
  return get<{ models: StyleModel[] }>(API_PATHS.style.models);
}

export async function getStyleModel(modelId: string): Promise<StyleModel> {
  return get(API_PATHS.style.model(modelId));
}

export async function deleteStyleModel(modelId: string) {
  return del<void>(API_PATHS.style.model(modelId));
}

// === YouTube ===
export async function getYouTubeVideos() {
  return get<{ videos: YouTubeVideo[] }>(API_PATHS.youtube.videos);
}

export async function updateVideoThumbnail(
  videoId: string,
  thumbnailId: string,
) {
  return put<{ status: string }>(API_PATHS.youtube.videoThumbnail(videoId), {
    thumbnailId,
  });
}

// === Templates ===
export async function createTemplate(
  name: string,
  prompt: string,
  styleModelId?: string,
  sourceJobId?: string,
) {
  return post<Template>(API_PATHS.templates.create, {
    name,
    prompt,
    styleModelId,
    sourceJobId,
  });
}
export async function getTemplates() {
  return get<{ templates: Template[] }>(API_PATHS.templates.list);
}
export async function getTemplate(templateId: string): Promise<Template> {
  return get(API_PATHS.templates.get(templateId));
}
export async function updateTemplate(
  templateId: string,
  data: { name?: string; prompt?: string; styleModelId?: string },
) {
  return put<Template>(API_PATHS.templates.update(templateId), data);
}
export async function deleteTemplate(templateId: string) {
  return del<void>(API_PATHS.templates.delete(templateId));
}

// === Favorites ===
export async function getFavorites(
  limit = 20,
  offset = 0,
): Promise<FavoritesResponse> {
  return get(API_PATHS.favorites.list(limit, offset));
}
export async function addFavorite(jobId: string) {
  return post<{ status: string }>(API_PATHS.favorites.add(jobId));
}
export async function removeFavorite(jobId: string) {
  return del<void>(API_PATHS.favorites.remove(jobId));
}

// === Webhooks ===
export async function createWebhook(url: string, events: string[]) {
  return post<Webhook>(API_PATHS.webhooks.create, { url, events });
}
export async function getWebhooks() {
  return get<{ webhooks: Webhook[] }>(API_PATHS.webhooks.list);
}
export async function updateWebhook(
  webhookId: string,
  data: { url?: string; events?: string[]; active?: boolean },
) {
  return put<Webhook>(API_PATHS.webhooks.update(webhookId), data);
}
export async function deleteWebhook(webhookId: string) {
  return del<void>(API_PATHS.webhooks.delete(webhookId));
}

// === Billing ===
export async function getBillingInfo(): Promise<BillingInfo> {
  return get(API_PATHS.billing.info);
}

// === Upload ===
export async function getPresignedUploadURL(
  filename: string,
  contentType: string,
) {
  return post<PresignedUpload>(API_PATHS.upload.presign, {
    filename,
    contentType,
  });
}

// === Analytics ===
export async function getAnalytics(): Promise<Analytics> {
  return get(API_PATHS.users.analytics);
}

// === Account ===
export async function deleteAccount() {
  return del<void>(API_PATHS.users.deleteMe);
}

// === Batch ===
export async function createBatchJobs(
  prompts: { prompt: string; styleModelId?: string }[],
) {
  return post<{ jobs: { jobId: string; status: string }[] }>(
    API_PATHS.generate.batch,
    { prompts },
  );
}

// === Admin ===
export async function getAdminHealth(): Promise<AdminHealthResponse> {
  return get(API_PATHS.admin.health);
}

export async function getAdminStats(): Promise<AdminStatsResponse> {
  return get(API_PATHS.admin.stats);
}

export async function toggleMaintenance(
  enabled: boolean,
  message: string,
): Promise<MaintenanceStatus> {
  return post(API_PATHS.admin.maintenance, { enabled, message });
}
