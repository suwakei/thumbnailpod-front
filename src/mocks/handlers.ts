import { http, HttpResponse } from 'msw';
import { env } from '@/envs';
import { API_PATHS, HTTP_STATUS } from '@/consts';
import {
  mockUser,
  mockPlanInfo,
  mockJobs,
  mockJobDetail,
  mockStyleModels,
  mockYouTubeVideos,
  mockLayers,
  mockTemplates,
  mockFavorites,
  mockWebhooks,
  mockBillingInfo,
  mockAnalytics,
} from './data';

const BASE = env.apiBaseUrl;

export const handlers = [
  // Auth
  http.get(`${BASE}${API_PATHS.auth.oauthUrl}`, () => {
    return HttpResponse.json({ url: '/login?mock=true' });
  }),

  http.post(`${BASE}${API_PATHS.auth.oauthCallback}`, () => {
    return HttpResponse.json({
      user_id: mockUser.id,
      channel_name: mockUser.channel_name,
      plan: mockUser.plan,
    });
  }),

  http.post(`${BASE}${API_PATHS.auth.refresh}`, () => {
    return HttpResponse.json({ access_token: 'mock-token' });
  }),

  http.delete(`${BASE}${API_PATHS.auth.logout}`, () => {
    return new HttpResponse(null, { status: HTTP_STATUS.noContent });
  }),

  // Users
  http.get(`${BASE}${API_PATHS.users.me}`, () => {
    return HttpResponse.json(mockUser);
  }),

  http.get(`${BASE}${API_PATHS.users.myPlan}`, () => {
    return HttpResponse.json(mockPlanInfo);
  }),

  // Generate
  http.post(`${BASE}${API_PATHS.generate.create}`, () => {
    return HttpResponse.json(
      { job_id: `job-${Date.now()}`, status: 'pending' },
      { status: HTTP_STATUS.created },
    );
  }),

  http.get(`${BASE}/generate/history`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') || 20);
    const offset = Number(url.searchParams.get('offset') || 0);
    const sliced = mockJobs.slice(offset, offset + limit);
    return HttpResponse.json({
      jobs: sliced,
      total_count: mockJobs.length,
      limit,
      offset,
    });
  }),

  http.get(`${BASE}/generate/:jobId`, ({ params }) => {
    const job = mockJobs.find((j) => j.id === params.jobId);
    if (!job) {
      return HttpResponse.json(
        { ...mockJobDetail, job_id: params.jobId },
      );
    }
    return HttpResponse.json({
      job_id: job.id,
      status: job.status,
      prompt: job.prompt,
      created_at: job.created_at,
      image_url: null,
      thumbnail_id: job.status === 'completed' ? `thumb-${job.id}` : null,
      error: job.error_message,
    });
  }),

  // Segment / Layers
  http.post(`${BASE}/generate/:jobId/segment`, ({ params }) => {
    return HttpResponse.json({
      job_id: params.jobId,
      layers: mockLayers.map((l) => ({ label: l.label, s3_key: `s3/${l.label}.png` })),
    });
  }),

  http.get(`${BASE}/generate/:jobId/layers`, ({ params }) => {
    return HttpResponse.json({
      job_id: params.jobId,
      layers: mockLayers,
      psd_url: null,
    });
  }),

  // Edit
  http.post(`${BASE}/generate/:jobId/edit`, ({ params }) => {
    return HttpResponse.json({
      job_id: params.jobId,
      layers: {},
      unchanged_layers: [],
    });
  }),

  http.get(`${BASE}/generate/:jobId/edits`, () => {
    return HttpResponse.json({ edits: [] });
  }),

  // Download
  http.get(`${BASE}/thumbnails/:id/download`, () => {
    return HttpResponse.json({ download_url: '#mock-download' });
  }),

  // Style
  http.post(`${BASE}${API_PATHS.style.learn}`, () => {
    return HttpResponse.json(
      { model_id: `model-${Date.now()}`, status: 'pending' },
      { status: HTTP_STATUS.created },
    );
  }),

  http.get(`${BASE}${API_PATHS.style.models}`, () => {
    return HttpResponse.json({ models: mockStyleModels });
  }),

  http.get(`${BASE}/style/models/:modelId`, ({ params }) => {
    const model = mockStyleModels.find((m) => m.id === params.modelId);
    return HttpResponse.json(model || mockStyleModels[0]);
  }),

  http.delete(`${BASE}/style/models/:modelId`, () => {
    return new HttpResponse(null, { status: HTTP_STATUS.noContent });
  }),

  // YouTube
  http.get(`${BASE}${API_PATHS.youtube.videos}`, () => {
    return HttpResponse.json({ videos: mockYouTubeVideos });
  }),

  http.put(`${BASE}/youtube/videos/:videoId/thumbnail`, () => {
    return HttpResponse.json({ status: 'ok' });
  }),

  // Templates
  http.get(`${BASE}/templates`, () => {
    return HttpResponse.json({ templates: mockTemplates });
  }),

  http.get(`${BASE}/templates/:templateId`, ({ params }) => {
    const tpl = mockTemplates.find((t) => t.id === params.templateId);
    return HttpResponse.json(tpl || mockTemplates[0]);
  }),

  http.post(`${BASE}/templates`, () => {
    return HttpResponse.json(
      { id: `tpl-${Date.now()}`, user_id: 'user-001', name: 'New Template', prompt: 'test', style_model_id: null, source_job_id: null, preview_s3_key: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { status: HTTP_STATUS.created },
    );
  }),

  http.put(`${BASE}/templates/:templateId`, ({ params }) => {
    const tpl = mockTemplates.find((t) => t.id === params.templateId);
    return HttpResponse.json(tpl || mockTemplates[0]);
  }),

  http.delete(`${BASE}/templates/:templateId`, () => {
    return new HttpResponse(null, { status: HTTP_STATUS.noContent });
  }),

  // Favorites
  http.get(`${BASE}/favorites`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') || 20);
    const offset = Number(url.searchParams.get('offset') || 0);
    const sliced = mockFavorites.slice(offset, offset + limit);
    return HttpResponse.json({
      favorites: sliced.map((f) => ({
        ...f,
        job: mockJobs.find((j) => j.id === f.job_id) || null,
      })),
      total_count: mockFavorites.length,
      limit,
      offset,
    });
  }),

  http.post(`${BASE}/generate/:jobId/favorite`, () => {
    return HttpResponse.json({ status: 'ok' });
  }),

  http.delete(`${BASE}/generate/:jobId/favorite`, () => {
    return new HttpResponse(null, { status: HTTP_STATUS.noContent });
  }),

  // Webhooks
  http.get(`${BASE}/webhooks`, () => {
    return HttpResponse.json({ webhooks: mockWebhooks });
  }),

  http.post(`${BASE}/webhooks`, () => {
    return HttpResponse.json(
      { id: `wh-${Date.now()}`, user_id: 'user-001', url: 'https://example.com/new', events: ['job.completed'], secret: 'whsec_new', active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { status: HTTP_STATUS.created },
    );
  }),

  http.put(`${BASE}/webhooks/:webhookId`, ({ params }) => {
    const wh = mockWebhooks.find((w) => w.id === params.webhookId);
    return HttpResponse.json(wh || mockWebhooks[0]);
  }),

  http.delete(`${BASE}/webhooks/:webhookId`, () => {
    return new HttpResponse(null, { status: HTTP_STATUS.noContent });
  }),

  // Billing
  http.get(`${BASE}/billing`, () => {
    return HttpResponse.json(mockBillingInfo);
  }),

  // Upload presign
  http.post(`${BASE}/upload/presign`, () => {
    return HttpResponse.json({
      upload_url: 'https://s3.example.com/presigned-upload',
      s3_key: `uploads/${Date.now()}/file.png`,
    });
  }),

  // Analytics
  http.get(`${BASE}/users/me/analytics`, () => {
    return HttpResponse.json(mockAnalytics);
  }),

  // Delete account
  http.delete(`${BASE}/users/me`, () => {
    return new HttpResponse(null, { status: HTTP_STATUS.noContent });
  }),

  // Batch generate
  http.post(`${BASE}/generate/batch`, () => {
    return HttpResponse.json({
      jobs: [
        { job_id: `job-${Date.now()}`, status: 'pending' },
        { job_id: `job-${Date.now() + 1}`, status: 'pending' },
      ],
    });
  }),

  // SSE stream
  http.get(`${BASE}/generate/:jobId/stream`, () => {
    return HttpResponse.json({ status: 'stream_not_available_in_mock' });
  }),
];
