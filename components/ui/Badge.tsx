import { cn } from '@/lib/utils'
type Color='navy'|'coral'|'teal'|'gold'|'purple'
const colors:Record<Color,string>={navy:'bg-navy/10 text-navy',coral:'bg-coral-light text-coral',teal:'bg-teal-light text-teal',gold:'bg-gold-light text-gold',purple:'bg-purple-50 text-purple-700'}
export default function Badge({children,color='navy',className}:{children:React.ReactNode;color?:Color;className?:string}){
  return <span className={cn('inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold',colors[color],className)}>{children}</span>
}
