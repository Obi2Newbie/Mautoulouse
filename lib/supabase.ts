import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Events ──────────────────────────────────────────────────
export const eventsApi = {
  getAll:    ()           => supabase.from('events').select('*').eq('status','published').order('date'),
  getById:   (id:string)  => supabase.from('events').select('*').eq('id',id).single(),
  create:    (data:any)   => supabase.from('events').insert(data).select().single(),
  update:    (id:string, data:any) => supabase.from('events').update(data).eq('id',id),
  delete:    (id:string)  => supabase.from('events').delete().eq('id',id),
  join:      (eventId:string, userId:string, status:'going'|'interested') =>
    supabase.from('event_attendees').upsert({event_id:eventId, user_id:userId, status}),
}

// ── Questions ────────────────────────────────────────────────
export const questionsApi = {
  getAll:    ()           => supabase.from('questions').select('*, author:users(*)').order('created_at',{ascending:false}),
  getById:   (id:string)  => supabase.from('questions').select('*, author:users(*)').eq('id',id).single(),
  create:    (data:any)   => supabase.from('questions').insert(data).select().single(),
  update:    (id:string, data:any) => supabase.from('questions').update(data).eq('id',id),
  delete:    (id:string)  => supabase.from('questions').delete().eq('id',id),
  vote:      (id:string, delta:1|-1) =>
    supabase.rpc('vote_question', {question_id:id, delta}),
}

// ── Answers ──────────────────────────────────────────────────
export const answersApi = {
  getByQuestion: (questionId:string) =>
    supabase.from('answers').select('*, author:users(*)').eq('question_id',questionId).order('votes',{ascending:false}),
  create:  (data:any)  => supabase.from('answers').insert(data).select().single(),
  accept:  (id:string) => supabase.from('answers').update({is_accepted:true}).eq('id',id),
  vote:    (id:string, delta:1|-1) => supabase.rpc('vote_answer', {answer_id:id, delta}),
  delete:  (id:string) => supabase.from('answers').delete().eq('id',id),
}

// ── Users ────────────────────────────────────────────────────
export const usersApi = {
  getAll:    ()           => supabase.from('users').select('*').order('created_at',{ascending:false}),
  getById:   (id:string)  => supabase.from('users').select('*').eq('id',id).single(),
  update:    (id:string, data:any) => supabase.from('users').update(data).eq('id',id),
  updateRole:(id:string, role:string) => supabase.from('users').update({role}).eq('id',id),
  delete:    (id:string)  => supabase.from('users').delete().eq('id',id),
}

// ── FAQs ─────────────────────────────────────────────────────
export const faqsApi = {
  getAll:    ()           => supabase.from('faqs').select('*').order('order'),
  getPublished: ()        => supabase.from('faqs').select('*').eq('published',true).order('order'),
  create:    (data:any)   => supabase.from('faqs').insert(data).select().single(),
  update:    (id:string, data:any) => supabase.from('faqs').update(data).eq('id',id),
  delete:    (id:string)  => supabase.from('faqs').delete().eq('id',id),
}

// ── Photos ───────────────────────────────────────────────────
export const photosApi = {
  getAlbums: ()           => supabase.from('photo_albums').select('*, photos(*)').order('created_at',{ascending:false}),
  uploadPhoto:(file:File, albumId:string) => {
    const path = `albums/${albumId}/${Date.now()}-${file.name}`
    return supabase.storage.from('photos').upload(path, file)
  },
  deletePhoto:(id:string, path:string) => Promise.all([
    supabase.from('photos').delete().eq('id',id),
    supabase.storage.from('photos').remove([path]),
  ]),
}
