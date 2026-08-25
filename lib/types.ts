// ── Enums ────────────────────────────────────────────────────
export type UserRole      = 'user' | 'moderator' | 'admin'
export type EventStatus   = 'draft' | 'published' | 'past'
export type AttendeeStatus= 'going' | 'interested'

// ── User ─────────────────────────────────────────────────────
export interface User {
  id:          string
  email?:      string
  first_name:  string
  last_name:   string
  origin_city?: string
  bio?:        string
  role:        UserRole
  created_at?: string
}

// ── Auth ─────────────────────────────────────────────────────
export interface AuthResponse {
  access_token: string
  token_type:   string
  user:         User
}

// ── Event ────────────────────────────────────────────────────
// The API stores price in cents (price_cents), we expose helpers
export interface Event {
  id:               string
  title:            string
  description:      string
  date:             string
  time:             string
  location:         string
  price_cents:      number       // 0 = free
  capacity:         number
  category:         string
  status:           EventStatus
  youtube_url?:     string
  created_by:       string
  created_at?:      string
  // from events_summary view
  going_count?:     number
  interested_count?: number
  tags?:            string[]
  // frontend-only helper (gradient generated client-side)
  gradient?:        string
}

export interface EventAttendee {
  event_id:   string
  user_id:    string
  status:     AttendeeStatus
  created_at?: string
  profiles?:  { id: string; first_name: string; last_name: string }
}

// ── Question ─────────────────────────────────────────────────
export interface Question {
  id:            string
  title:         string
  body:          string
  author_id:     string
  views:         number
  created_at:    string
  updated_at?:   string
  // from questions_summary view
  first_name?:   string
  last_name?:    string
  vote_score?:   number
  answers_count?: number
  tags?:         string[]
}

// ── Answer ───────────────────────────────────────────────────
export interface Answer {
  id:          string
  question_id: string
  parent_id?:  string | null
  body:        string
  author_id:   string
  is_accepted: boolean
  created_at:  string
  updated_at?: string
  // from answers_summary view
  first_name?: string
  last_name?:  string
  vote_score?: number
  replies?:    Answer[]
}

// ── Photo ────────────────────────────────────────────────────
export interface PhotoAlbum {
  id:           string
  event_id?:    string
  event_title?: string
  title:        string
  description?: string
  created_by:   string
  created_at?:  string
  photos_count?: number
  // frontend helpers (generated)
  gradient?:    string
  colors?:      string[]
}

export interface Photo {
  id:              string
  album_id:        string
  mime_type:       string
  file_name:       string
  file_size_bytes: number
  caption?:        string
  uploaded_by:     string
  created_at?:     string
  data?:           string   // base64, only from GET /albums/{id}/photos/{pid}
}

// ── FAQ ──────────────────────────────────────────────────────
export interface FAQ {
  id:            string
  question:      string
  answer:        string
  category:      string
  published:     boolean
  display_order?: number
  created_at?:   string
}

// ── Analytics ────────────────────────────────────────────────
export interface Analytics {
  total_users:     number
  total_events:    number
  total_questions: number
  total_attendees: number
  users_by_month:  { month: string; count: number }[]
}
