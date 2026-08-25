'use client'
import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement>{label?:string;hint?:string;error?:string}
export const Input = forwardRef<HTMLInputElement,InputProps>(({label,hint,error,className,...props},ref)=>(
  <div className="flex flex-col gap-1.5">
    {label&&<label className="text-[13px] font-bold text-[#18181B]">{label}</label>}
    <input ref={ref} className={cn('w-full px-4 py-[11px] text-sm border border-[#EAE7E2] rounded-[10px] bg-white text-[#18181B] outline-none transition-colors focus:border-navy placeholder:text-[#A1A1AA]',error&&'border-red-400',className)} {...props}/>
    {hint&&<p className="text-xs text-[#A1A1AA]">{hint}</p>}
    {error&&<p className="text-xs text-red-500">{error}</p>}
  </div>
))
Input.displayName='Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>{label?:string;hint?:string}
export const Textarea = forwardRef<HTMLTextAreaElement,TextareaProps>(({label,hint,className,...props},ref)=>(
  <div className="flex flex-col gap-1.5">
    {label&&<label className="text-[13px] font-bold text-[#18181B]">{label}</label>}
    <textarea ref={ref} className={cn('w-full px-4 py-[11px] text-sm border border-[#EAE7E2] rounded-[10px] bg-white text-[#18181B] outline-none transition-colors focus:border-navy placeholder:text-[#A1A1AA] resize-y min-h-[120px] leading-relaxed',className)} {...props}/>
    {hint&&<p className="text-xs text-[#A1A1AA]">{hint}</p>}
  </div>
))
Textarea.displayName='Textarea'
export default Input
