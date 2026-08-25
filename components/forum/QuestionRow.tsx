'use client'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { getAvatarColor } from '@/lib/utils'
import type { Question } from '@/lib/types'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `il y a ${mins}min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `il y a ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `il y a ${days}j`
}

export default function QuestionRow({ question, showDivider=true }: { question: Question; showDivider?: boolean }) {
  const router    = useRouter()
  const firstName = question.first_name ?? '?'
  const lastName  = question.last_name  ?? '?'
  const score     = question.vote_score ?? 0
  const answers   = question.answers_count ?? 0

  return (
    <div className={`flex gap-5 px-6 py-[22px] cursor-pointer hover:bg-gray-50 transition-colors ${showDivider?'border-b border-[#EAE7E2]':''}`}
      onClick={()=>router.push(`/forum/${question.id}`)}>
      {/* Votes / Answers */}
      <div className="flex flex-col items-center gap-2 min-w-[44px]">
        <div className="text-center">
          <div className="font-extrabold text-xl text-navy leading-none">{score}</div>
          <div className="text-[11px] text-[#A1A1AA] mt-0.5">votes</div>
        </div>
        <div className="text-center">
          <div className={`font-bold text-base leading-none ${answers>0?'text-teal':'text-[#71717A]'}`}>{answers}</div>
          <div className="text-[11px] text-[#A1A1AA] mt-0.5">rép.</div>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Avatar firstName={firstName} lastName={lastName} id={question.author_id} size={26}/>
          <span className="text-[13px] font-semibold text-[#71717A]">{firstName} {lastName[0]}.</span>
          {question.created_at && <span className="text-xs text-[#A1A1AA]">· {timeAgo(question.created_at)}</span>}
        </div>
        <h3 className="font-display font-bold text-base mb-2 leading-snug">{question.title}</h3>
        <p className="text-[13px] text-[#71717A] mb-3 line-clamp-2 leading-[1.55]">{question.body}</p>
        <div className="flex gap-1.5 flex-wrap">
          {(question.tags??[]).map(t=><Badge key={t} color="navy">{t}</Badge>)}
        </div>
      </div>
      <div className="text-xs text-[#A1A1AA] min-w-[60px] text-right pt-1">{question.views} vues</div>
    </div>
  )
}
