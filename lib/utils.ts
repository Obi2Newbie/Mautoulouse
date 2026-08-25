import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(priceCents: number) {
  return priceCents === 0 ? 'Gratuit' : `${priceCents / 100}€`
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

export const AVATAR_COLORS = [
  '#7C3AED','#059669','#DC2626','#D97706','#0891B2',
  '#BE185D','#065F46','#1D4ED8','#9A3412','#6D28D9',
]

export function getAvatarColor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
