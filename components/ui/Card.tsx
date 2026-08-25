import { cn } from '@/lib/utils'
export default function Card({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return <div className={cn('bg-white rounded-card border border-[#EAE7E2] shadow-card', onClick && 'cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg', className)} onClick={onClick}>{children}</div>
}
