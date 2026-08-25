/**
 * api.ts — Typed client for the Mautoulouse FastAPI backend
 *
 * All calls go through apiFetch() which:
 *  - Adds the Authorization header when a token is in localStorage
 *  - Throws ApiError on non-2xx responses with the detail message from FastAPI
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// ── Colour helpers (no data in DB, generated client-side) ────
const EVENT_GRADIENTS = [
  'linear-gradient(135deg,#FF6B6B,#FFE66D)',
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#11998e,#38ef7d)',
  'linear-gradient(135deg,#fc4a1a,#f7b733)',
  'linear-gradient(135deg,#f953c6,#b91d73)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
]
const ALBUM_COLORS = [
  ['#FF6B6B','#FFE66D','#FF8E53','#FFC17A','#E84545','#FFCB77'],
  ['#667eea','#764ba2','#9B5DE5','#7B2FBE','#5E2D79','#C77DFF'],
  ['#11998e','#38ef7d','#0DCB8A','#48FF84','#2DC85A','#7BF1A8'],
  ['#fc4a1a','#f7b733','#FF6B35','#FFBA08','#FA7921','#FFD166'],
]

export function eventGradient(id: string) {
  const n = id.charCodeAt(0) % EVENT_GRADIENTS.length
  return EVENT_GRADIENTS[n]
}
export function albumColors(id: string) {
  return ALBUM_COLORS[id.charCodeAt(0) % ALBUM_COLORS.length]
}

// ── Error class ──────────────────────────────────────────────
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// ── Token helpers (browser only) ─────────────────────────────
export const TOKEN_KEY = 'mautoulouse_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// ── Core fetch wrapper ───────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  authRequired = false,
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (!res.ok) {
  let detail = `HTTP ${res.status}`
  try {
    const body = await res.json()
    // Show full validation errors from FastAPI
    if (Array.isArray(body.detail)) {
      detail = body.detail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join(' | ')
    } else {
      detail = body.detail ?? detail
    }
  } catch {}
  throw new ApiError(res.status, detail)
}

  if (res.status === 204) return undefined as T
  return res.json()
}

// helper for multipart (photos upload)
async function apiFetchFormData<T>(path: string, form: FormData): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: form,
  })

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try { const body = await res.json(); detail = body.detail ?? detail } catch {}
    throw new ApiError(res.status, detail)
  }
  return res.json()
}

// ══════════════════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════════════════
import type { AuthResponse, User } from './types'

export const authApi = {
  signup: (data: {
    email: string; password: string
    first_name: string; last_name: string; origin_city?: string
  }) =>
    apiFetch<AuthResponse>('/auth/signup', {
      method: 'POST', body: JSON.stringify(data),
    }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),

  me: () => apiFetch<User>('/auth/me'),

  updateMe: (data: Partial<Pick<User, 'first_name'|'last_name'|'origin_city'|'bio'>>) =>
    apiFetch<User>('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),

  deleteMe: () => apiFetch<void>('/auth/me', { method: 'DELETE' }),
}

// ══════════════════════════════════════════════════════════════
//  EVENTS
// ══════════════════════════════════════════════════════════════
import type { Event, EventAttendee } from './types'

export const eventsApi = {
  list: (params?: { status?: string; category?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString()
    return apiFetch<Event[]>(`/events${q ? '?' + q : ''}`)
  },

  get: (id: string) => apiFetch<Event>(`/events/${id}`),

  create: (data: Omit<Event, 'id'|'created_at'|'going_count'|'interested_count'>) =>
    apiFetch<Event>('/events', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Event>) =>
    apiFetch<Event>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch<void>(`/events/${id}`, { method: 'DELETE' }),

  uploadCover: (id: string, file: File) => {
    const form = new FormData(); form.append('file', file)
    return apiFetchFormData<{ message: string }>(`/events/${id}/cover`, form)
  },

  getCover: (id: string) =>
    apiFetch<{ data: string; mime_type: string }>(`/events/${id}/cover`),

  attend: (id: string, status: 'going' | 'interested' = 'going') =>
    apiFetch<EventAttendee>(`/events/${id}/attend`, {
      method: 'POST', body: JSON.stringify({ status }),
    }),

  cancelAttend: (id: string) =>
    apiFetch<void>(`/events/${id}/attend`, { method: 'DELETE' }),

  myEvents: () => apiFetch<Event[]>('/events/my-events'),

  attendees: (id: string) => apiFetch<EventAttendee[]>(`/events/${id}/attendees`),
}

// ══════════════════════════════════════════════════════════════
//  QUESTIONS
// ══════════════════════════════════════════════════════════════
import type { Question } from './types'

export const questionsApi = {
  list: (params?: { tag?: string; search?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString()
    return apiFetch<Question[]>(`/questions${q ? '?' + q : ''}`)
  },

  get: (id: string) => apiFetch<Question>(`/questions/${id}`),

  create: (data: { title: string; body: string; tags: string[] }) =>
    apiFetch<Question>('/questions', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: { title?: string; body?: string; tags?: string[] }) =>
    apiFetch<Question>(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch<void>(`/questions/${id}`, { method: 'DELETE' }),

  vote: (id: string, value: 1 | -1) =>
    apiFetch<{ vote_score: number }>(`/questions/${id}/vote`, {
      method: 'POST', body: JSON.stringify({ value }),
    }),
}

// ══════════════════════════════════════════════════════════════
//  ANSWERS
// ══════════════════════════════════════════════════════════════
import type { Answer } from './types'

export const answersApi = {
  list: (questionId: string) =>
    apiFetch<Answer[]>(`/answers/question/${questionId}`),

  create: (data: { question_id: string; body: string; parent_id?: string }) =>
    apiFetch<Answer>('/answers', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, body: string) =>
    apiFetch<Answer>(`/answers/${id}`, { method: 'PUT', body: JSON.stringify({ body }) }),

  delete: (id: string) => apiFetch<void>(`/answers/${id}`, { method: 'DELETE' }),

  accept: (id: string) =>
    apiFetch<{ message: string }>(`/answers/${id}/accept`, { method: 'POST' }),

  vote: (id: string, value: 1 | -1) =>
    apiFetch<{ vote_score: number }>(`/answers/${id}/vote`, {
      method: 'POST', body: JSON.stringify({ value }),
    }),
}

// ══════════════════════════════════════════════════════════════
//  PHOTOS / ALBUMS
// ══════════════════════════════════════════════════════════════
import type { PhotoAlbum, Photo } from './types'

export const photosApi = {
  listAlbums: () => apiFetch<PhotoAlbum[]>('/albums'),

  createAlbum: (data: { event_id?: string; title: string; description?: string }) =>
    apiFetch<PhotoAlbum>('/albums', { method: 'POST', body: JSON.stringify(data) }),

  deleteAlbum: (id: string) => apiFetch<void>(`/albums/${id}`, { method: 'DELETE' }),

  listPhotos: (albumId: string) =>
    apiFetch<Photo[]>(`/albums/${albumId}/photos`),

  getPhoto: (albumId: string, photoId: string) =>
    apiFetch<Photo>(`/albums/${albumId}/photos/${photoId}`),

  upload: (albumId: string, file: File, caption?: string) => {
    const form = new FormData()
    form.append('file', file)
    if (caption) form.append('caption', caption)
    return apiFetchFormData<Photo>(`/albums/${albumId}/photos`, form)
  },

  deletePhoto: (albumId: string, photoId: string) =>
    apiFetch<void>(`/albums/${albumId}/photos/${photoId}`, { method: 'DELETE' }),
}

// ══════════════════════════════════════════════════════════════
//  FAQS
// ══════════════════════════════════════════════════════════════
import type { FAQ } from './types'

export const faqsApi = {
  list: () => apiFetch<FAQ[]>('/faqs'),
  listAll: () => apiFetch<FAQ[]>('/faqs/all'),

  create: (data: Omit<FAQ, 'id'|'created_at'>) =>
    apiFetch<FAQ>('/faqs', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<FAQ>) =>
    apiFetch<FAQ>(`/faqs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch<void>(`/faqs/${id}`, { method: 'DELETE' }),
}

// ══════════════════════════════════════════════════════════════
//  ADMIN
// ══════════════════════════════════════════════════════════════
import type { Analytics } from './types'

export const adminApi = {
  analytics: () => apiFetch<Analytics>('/admin/analytics'),
  users: () => apiFetch<User[]>('/admin/users'),
  getUser: (id: string) => apiFetch<User>(`/admin/users/${id}`),
  updateRole: (id: string, role: string) =>
    apiFetch<User>(`/admin/users/${id}/role`, {
      method: 'PATCH', body: JSON.stringify({ role }),
    }),
  deleteUser: (id: string) => apiFetch<void>(`/admin/users/${id}`, { method: 'DELETE' }),
}
