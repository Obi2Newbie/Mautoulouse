import { getInitials, getAvatarColor } from '@/lib/utils'
import { cn } from '@/lib/utils'
interface AvatarProps{firstName:string;lastName:string;id?:string;size?:number;className?:string}
export default function Avatar({firstName,lastName,id='0',size=36,className}:AvatarProps){
  return <div className={cn('rounded-full flex items-center justify-center font-bold text-white flex-shrink-0',className)} style={{width:size,height:size,background:getAvatarColor(id),fontSize:Math.floor(size*0.38)}}>{getInitials(firstName,lastName)}</div>
}
