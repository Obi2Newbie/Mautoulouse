'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { Textarea } from '@/components/ui/Input'
import { questionsApi, answersApi, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import type { Question, Answer } from '@/lib/types'

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000); if (m < 60) return `il y a ${m}min`
  const h = Math.floor(m / 60);       if (h < 24)  return `il y a ${h}h`
  return `il y a ${Math.floor(h / 24)}j`
}

// ── Vote column ───────────────────────────────────────────────
function VoteCol({ score, myVote, onUp, onDown, disabled }: {
  score: number
  myVote: 1 | -1 | 0
  onUp:   () => void
  onDown: () => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[40px]">
      <button
        onClick={onUp}
        disabled={disabled}
        className={`text-[20px] bg-transparent border-none cursor-pointer transition-all ${
          myVote === 1 ? 'text-coral scale-110' : 'text-[#C4C4C4] hover:text-navy'
        } disabled:cursor-default`}>
        ▲
      </button>
      <span className={`font-extrabold text-xl leading-none ${
        score > 0 ? 'text-navy' : score < 0 ? 'text-red-400' : 'text-[#A1A1AA]'
      }`}>{score}</span>
      <button
        onClick={onDown}
        disabled={disabled}
        className={`text-[20px] bg-transparent border-none cursor-pointer transition-all ${
          myVote === -1 ? 'text-red-400 scale-110' : 'text-[#C4C4C4] hover:text-red-400'
        } disabled:cursor-default`}>
        ▼
      </button>
    </div>
  )
}

// ── Answer card ───────────────────────────────────────────────
function AnswerCard({ answer, questionAuthorId, onAccept, onVote }: {
  answer:            Answer
  questionAuthorId:  string
  onAccept:          (id: string) => void
  onVote:            (id: string, v: 1 | -1) => void
}) {
  const { user }    = useAuth()
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [posting,   setPosting]   = useState(false)
  const [myVote,    setMyVote]    = useState<1 | -1 | 0>(0)
  const [score,     setScore]     = useState(answer.vote_score ?? 0)

  async function handleVote(value: 1 | -1) {
    if (!user) return
    const newVote = myVote === value ? 0 : value
    const delta   = newVote - myVote
    setMyVote(newVote as 1 | -1 | 0)
    setScore(s => s + delta)
    onVote(answer.id, value)
  }

  async function submitReply() {
    if (!replyBody.trim()) return
    setPosting(true)
    try {
      await answersApi.create({ question_id: answer.question_id, body: replyBody, parent_id: answer.id })
      setReplyBody(''); setReplyOpen(false)
      window.location.reload()
    } catch (e) { if (e instanceof ApiError) alert(e.message) }
    finally { setPosting(false) }
  }

  const isQuestionAuthor = user?.id === questionAuthorId

  return (
    <div className={`bg-white rounded-card border shadow-card mb-3 ${
      answer.is_accepted ? 'border-teal border-l-[3px]' : 'border-[#EAE7E2]'
    }`}>
      <div className="p-6 flex gap-5">
        <VoteCol
          score={score}
          myVote={myVote}
          onUp={()   => handleVote(1)}
          onDown={()  => handleVote(-1)}
          disabled={!user || user.id === answer.author_id}
        />
        <div className="flex-1">
          {answer.is_accepted && (
            <div className="inline-flex items-center gap-1.5 bg-teal/10 text-teal px-3 py-1 rounded-full text-xs font-bold mb-3">
              ✓ Réponse acceptée
            </div>
          )}
          <p className="text-sm text-[#71717A] leading-[1.8] mb-4">{answer.body}</p>
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <button
                onClick={() => setReplyOpen(r => !r)}
                className="text-[13px] text-[#71717A] font-semibold bg-transparent border-none cursor-pointer hover:text-navy">
                💬 Répondre
              </button>
              {isQuestionAuthor && !answer.is_accepted && !answer.parent_id && (
                <button
                  onClick={() => onAccept(answer.id)}
                  className="text-[13px] text-teal font-semibold bg-transparent border-none cursor-pointer hover:opacity-80">
                  ✓ Accepter cette réponse
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-[13px] text-[#71717A]">
              <Avatar firstName={answer.first_name ?? '?'} lastName={answer.last_name ?? '?'} id={answer.author_id} size={24}/>
              <span>
                <strong className="text-[#18181B]">{answer.first_name}</strong>
                {answer.created_at && ` · ${timeAgo(answer.created_at)}`}
              </span>
            </div>
          </div>

          {replyOpen && (
            <div className="mt-4 pl-4 border-l-2 border-[#EAE7E2]">
              <Textarea
                placeholder="Votre réponse…"
                className="min-h-[80px]"
                value={replyBody}
                onChange={e => setReplyBody(e.target.value)}/>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={submitReply}
                  disabled={posting || !replyBody.trim()}
                  className="px-4 py-2 text-sm font-bold rounded-lg bg-coral text-white hover:opacity-90 disabled:opacity-50">
                  Envoyer
                </button>
                <button
                  onClick={() => setReplyOpen(false)}
                  className="px-4 py-2 text-sm font-bold rounded-lg border border-[#EAE7E2] text-[#71717A] hover:bg-gray-50">
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {(answer.replies ?? []).map(r => (
        <div key={r.id} className="ml-12 mb-3 mr-4">
          <div className="bg-[#FAFAFA] rounded-card border border-[#EAE7E2] p-4 flex gap-3.5">
            <div className="min-w-[28px] font-bold text-[13px] text-[#A1A1AA] text-center pt-0.5">
              {r.vote_score ?? 0}
            </div>
            <div className="flex-1">
              <p className="text-[13px] text-[#71717A] leading-[1.65] mb-2.5">{r.body}</p>
              <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                <Avatar firstName={r.first_name ?? '?'} lastName={r.last_name ?? '?'} id={r.author_id} size={20}/>
                <span>{r.first_name}{r.created_at && ` · ${timeAgo(r.created_at)}`}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function QuestionDetailPage({ params }: { params: { id: string } }) {
  const router   = useRouter()
  const { user } = useAuth()

  const [question, setQuestion] = useState<Question | null>(null)
  const [answers,  setAnswers]  = useState<Answer[]>([])
  const [loading,  setLoading]  = useState(true)
  const [body,     setBody]     = useState('')
  const [posting,  setPosting]  = useState(false)
  const [qScore,   setQScore]   = useState(0)
  const [qMyVote,  setQMyVote]  = useState<1 | -1 | 0>(0)

  useEffect(() => {
    Promise.all([questionsApi.get(params.id), answersApi.list(params.id)])
      .then(([q, a]) => {
        setQuestion(q)
        setQScore(q.vote_score ?? 0)
        setAnswers(a)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  async function submitAnswer() {
    if (!user) { router.push('/login'); return }
    if (!body.trim()) return
    setPosting(true)
    try {
      await answersApi.create({ question_id: params.id, body })
      setBody('')
      const a = await answersApi.list(params.id); setAnswers(a)
    } catch (e) { if (e instanceof ApiError) alert(e.message) }
    finally { setPosting(false) }
  }

  async function handleQVote(value: 1 | -1) {
    if (!user) { router.push('/login'); return }
    const newVote = qMyVote === value ? 0 : value
    const delta   = newVote - qMyVote
    setQMyVote(newVote as 1 | -1 | 0)
    setQScore(s => s + delta)
    try { await questionsApi.vote(params.id, value) }
    catch (e) { if (e instanceof ApiError) alert(e.message) }
  }

  async function handleAVote(answerId: string, value: 1 | -1) {
    if (!user) { router.push('/login'); return }
    try { await answersApi.vote(answerId, value) }
    catch (e) { if (e instanceof ApiError) alert(e.message) }
  }

  async function handleAccept(answerId: string) {
    try {
      await answersApi.accept(answerId)
      const a = await answersApi.list(params.id); setAnswers(a)
    } catch (e) { if (e instanceof ApiError) alert(e.message) }
  }

  async function handleDelete() {
    if (!confirm('Supprimer cette question ?')) return
    try { await questionsApi.delete(params.id); router.push('/forum') }
    catch (e) { if (e instanceof ApiError) alert(e.message) }
  }

  if (loading) return <div><Navbar/><div className="flex items-center justify-center h-64 text-[#A1A1AA]">Chargement…</div></div>
  if (!question) return <div><Navbar/><div className="text-center py-20">Question introuvable.</div></div>

  const isAuthor  = user?.id === question.author_id
  const topLevel  = answers.filter(a => !a.parent_id)

  return (
    <div>
      <Navbar/>
      <div className="max-w-[920px] mx-auto px-6 py-10">
        <button
          className="mb-6 px-4 py-2 text-sm font-bold rounded-lg border border-[#EAE7E2] text-[#71717A] hover:bg-gray-50"
          onClick={() => router.back()}>
          ← Forum Q&amp;R
        </button>

        {/* Question */}
        <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card mb-4">
          <div className="p-8 flex gap-5">
            <VoteCol
              score={qScore}
              myVote={qMyVote}
              onUp={()  => handleQVote(1)}
              onDown={() => handleQVote(-1)}
              disabled={!user || user.id === question.author_id}
            />
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold mb-4 leading-snug">{question.title}</h1>
              <p className="text-[15px] text-[#71717A] leading-[1.8] mb-5">{question.body}</p>
              <div className="flex gap-1.5 flex-wrap mb-6">
                {(question.tags ?? []).map(t => <Badge key={t} color="navy">{t}</Badge>)}
              </div>
              <div className="flex justify-between items-center">
                {isAuthor && (
                  <button
                    onClick={handleDelete}
                    className="text-[13px] text-red-500 font-semibold bg-transparent border-none cursor-pointer hover:text-red-700">
                    🗑️ Supprimer
                  </button>
                )}
                <div className="flex items-center gap-2 text-[13px] text-[#71717A] ml-auto">
                  <Avatar firstName={question.first_name ?? '?'} lastName={question.last_name ?? '?'} id={question.author_id} size={28}/>
                  <span>
                    <strong className="text-[#18181B]">{question.first_name}</strong>
                    {question.created_at && ` · ${timeAgo(question.created_at)}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-lg font-bold mb-7">
          {topLevel.length} réponse{topLevel.length !== 1 ? 's' : ''}
        </p>

        {topLevel.map(a => (
          <AnswerCard
            key={a.id}
            answer={a}
            questionAuthorId={question.author_id}
            onAccept={handleAccept}
            onVote={handleAVote}
          />
        ))}

        {/* Answer composer */}
        <div className="bg-white rounded-card border border-[#EAE7E2] shadow-card p-7 mt-4">
          <h3 className="font-display text-xl font-bold mb-4">Votre réponse</h3>
          {!user && (
            <p className="text-sm text-[#71717A] mb-4">
              <button className="text-coral font-bold bg-transparent border-none cursor-pointer" onClick={() => router.push('/login')}>
                Connectez-vous
              </button>{' '}pour répondre.
            </p>
          )}
          <Textarea
            placeholder="Partagez votre expérience ou vos conseils…"
            className="min-h-[140px]"
            value={body}
            onChange={e => setBody(e.target.value)}
            disabled={!user}
          />
          <div className="flex justify-end mt-3.5">
            <button
              onClick={submitAnswer}
              disabled={posting || !body.trim() || !user}
              className="px-5 py-2.5 text-sm font-bold rounded-[10px] bg-coral text-white hover:opacity-90 disabled:opacity-50">
              {posting ? 'Publication…' : 'Publier la réponse'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}