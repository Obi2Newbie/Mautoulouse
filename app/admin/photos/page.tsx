'use client'
import { useEffect, useState, useRef } from 'react'
import { photosApi, eventsApi, albumColors, ApiError } from '@/lib/api'
import type { PhotoAlbum, Photo, Event } from '@/lib/types'

interface AlbumEntry {
  album: PhotoAlbum | null
  event: Event | null
  albumId: string
  title: string
  colors: string[]
}

export default function AdminPhotosPage() {
  const [entries, setEntries] = useState<AlbumEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<{ albumId: string; photo: Photo; colors: string[]; idx: number; total: number } | null>(null)
  const [lbLoading, setLbLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [uploading, setUploading] = useState<string | null>(null) // albumId being uploaded
  const fileRef = useRef<HTMLInputElement>(null)
  const uploadAlbum = useRef<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [albums, events] = await Promise.all([
          photosApi.listAlbums(),
          eventsApi.list({ status: '' }), // all events, // all events
        ])

        const pastEvents = events.filter(e => e.status === 'past' || new Date(e.date) < new Date())
        const albumsByEvent: Record<string, PhotoAlbum> = {}
        const standaloneAlbums: PhotoAlbum[] = []

        for (const a of albums) {
          if (a.event_id) albumsByEvent[a.event_id] = a
          else standaloneAlbums.push(a)
        }

        const result: AlbumEntry[] = []

        // Past events with or without album
        for (const ev of pastEvents) {
          const album = albumsByEvent[ev.id] ?? null
          if (album) {
            result.push({
              album, event: ev,
              albumId: album.id,
              title: ev.title,
              colors: albumColors(album.id),
            })
          } else {
            // No album yet — we'll create one on first upload
            result.push({
              album: null, event: ev,
              albumId: `pending-${ev.id}`,
              title: ev.title,
              colors: albumColors(ev.id),
            })
          }
        }

        // Standalone albums (no event linked)
        for (const a of standaloneAlbums) {
          result.push({ album: a, event: null, albumId: a.id, title: a.title, colors: albumColors(a.id) })
        }

        setEntries(result)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [refreshKey])

  async function openLightbox(albumId: string, photoId: string, colors: string[], idx: number, total: number) {
    setLbLoading(true)
    setLightbox({ albumId, photo: { id: photoId, album_id: albumId, mime_type: '', file_name: '', file_size_bytes: 0 }, colors, idx, total })
    try {
      const p = await photosApi.getPhoto(albumId, photoId)
      setLightbox(l => l ? { ...l, photo: p } : null)
    } catch (e) { console.error(e) }
    finally { setLbLoading(false) }
  }

  async function handleUpload(entry: AlbumEntry, files: File[]) {
    setUploading(entry.albumId)
    try {
      let albumId = entry.album?.id

      // Create album if it doesn't exist yet
      if (!albumId && entry.event) {
        const newAlbum = await photosApi.createAlbum({
          event_id: entry.event.id,
          title: entry.event.title,
        })
        albumId = newAlbum.id
      }

      if (!albumId) return

      // Upload all selected files sequentially
      for (let i = 0; i < files.length; i++) {
        await photosApi.upload(albumId, files[i])
      }

      setRefreshKey(k => k + 1)
    } catch (e) {
      if (e instanceof ApiError) alert(e.message)
    } finally {
      setUploading(null)
    }
  }

  async function handleDeletePhoto(albumId: string, photoId: string) {
    if (!confirm('Supprimer cette photo ?')) return
    try {
      await photosApi.deletePhoto(albumId, photoId)
      setLightbox(null)
      setRefreshKey(k => k + 1)
    } catch (e) {
      if (e instanceof ApiError) alert(e.message)
    }
  }

  return (
    <div className="p-10">
      <div className="mb-8">
        <h1 className="font-display text-[28px] font-bold">Galerie Photos</h1>
        <p className="text-[#71717A] mt-1.5">Photos des événements passés</p>
      </div>

      {/* Hidden multi-file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => {
          const entry = entries.find(en => en.albumId === uploadAlbum.current)
          if (e.target.files && e.target.files.length > 0 && entry) {
            const fileArray = Array.from(e.target.files)  // ← copy BEFORE clearing
            e.target.value = ''
            handleUpload(entry, fileArray)
          }
        }}
      />

      {loading ? (
        <div className="space-y-8">{[1, 2, 3].map(i => <div key={i} className="h-[160px] rounded-card bg-[#EAE7E2] animate-pulse" />)}</div>
      ) : entries.length === 0 ? (
        <div className="py-20 text-center text-[#A1A1AA]">Aucun événement passé trouvé.</div>
      ) : entries.map(entry => {
        const isUploading = uploading === entry.albumId
        return (
          <div key={entry.albumId} className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-display text-lg font-bold">{entry.title}</h3>
                <p className="text-[13px] text-[#71717A] mt-0.5">
                  {entry.album ? `${entry.album.photos_count ?? 0} photos` : 'Aucun album — cliquez Ajouter pour créer'}
                </p>
              </div>
              <button
                disabled={isUploading}
                onClick={() => { uploadAlbum.current = entry.albumId; fileRef.current?.click() }}
                className="px-3.5 py-1.5 text-[13px] font-bold rounded-lg border border-[#EAE7E2] text-[#71717A] hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2">
                {isUploading ? (
                  <><span className="animate-spin">⏳</span> Upload en cours…</>
                ) : (
                  '📤 Ajouter'
                )}
              </button>
            </div>

            {entry.album ? (
              <AlbumGrid
                albumId={entry.album.id}
                colors={entry.colors}
                refreshKey={refreshKey}
                onOpen={(photoId, idx, total) => openLightbox(entry.album!.id, photoId, entry.colors, idx, total)}
              />
            ) : (
              <div className="border-2 border-dashed border-[#EAE7E2] rounded-[10px] py-8 text-center text-[#A1A1AA] text-sm">
                Aucune photo — cliquez sur "Ajouter" pour uploader les photos de cet événement.
              </div>
            )}
          </div>
        )
      })}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setLightbox(null)}>
          <div className="bg-white rounded-[20px] p-6 max-w-[640px] w-[92%] shadow-[0_40px_80px_rgba(0,0,0,.5)]"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="font-display font-bold text-lg">{lightbox.photo.file_name || 'Photo'}</div>
                <div className="text-[13px] text-[#71717A] mt-0.5">Photo {lightbox.idx + 1} sur {lightbox.total}</div>
              </div>
              <button onClick={() => setLightbox(null)}
                className="text-[22px] text-[#71717A] hover:text-[#18181B] bg-transparent border-none cursor-pointer">✕</button>
            </div>
            <div className="h-[380px] rounded-[14px] overflow-hidden mb-4 flex items-center justify-center"
              style={{ background: lbLoading || !lightbox.photo.data ? lightbox.colors[lightbox.idx % lightbox.colors.length] : 'transparent' }}>
              {lbLoading ? (
                <span className="text-white text-4xl animate-pulse">⏳</span>
              ) : lightbox.photo.data ? (
                <img
                  src={`data:${lightbox.photo.mime_type};base64,${lightbox.photo.data}`}
                  alt={lightbox.photo.caption ?? lightbox.photo.file_name}
                  className="w-full h-full object-contain rounded-[14px]"
                />
              ) : (
                <span className="text-white text-4xl">📸</span>
              )}
            </div>
            {lightbox.photo.caption && (
              <p className="text-sm text-[#71717A] mb-4 text-center italic">{lightbox.photo.caption}</p>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#A1A1AA]">
                {lightbox.photo.file_size_bytes > 0 ? `${Math.round(lightbox.photo.file_size_bytes / 1024)} KB` : ''}
              </span>
              <button onClick={() => handleDeletePhoto(lightbox.albumId, lightbox.photo.id)}
                className="px-4 py-2 text-sm font-bold rounded-lg border border-red-200 text-red-500 bg-red-50 hover:bg-red-100">
                🗑️ Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PhotoThumbnail({ albumId, photo, color, index, total, onOpen }: {
  albumId: string; photo: Photo; color: string; index: number; total: number
  onOpen: (id: string, idx: number, total: number) => void
}) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    photosApi.getPhoto(albumId, photo.id)
      .then(p => { if (p.data) setSrc(`data:${p.mime_type};base64,${p.data}`) })
      .catch(console.error)
  }, [albumId, photo.id])

  return (
    <div
      className="aspect-square rounded-[10px] cursor-pointer hover:scale-[1.04] hover:shadow-md transition-all overflow-hidden flex items-center justify-center"
      style={{ background: src ? '#f0f0f0' : color }}
      onClick={() => onOpen(photo.id, index, total)}>
      {src
        ? <img src={src} alt={photo.file_name} className="w-full h-full object-cover" />
        : <span className="text-2xl animate-pulse">⏳</span>
      }
    </div>
  )
}

function AlbumGrid({ albumId, colors, refreshKey, onOpen }: {
  albumId: string; colors: string[]; refreshKey: number
  onOpen: (id: string, idx: number, total: number) => void
}) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    photosApi.listPhotos(albumId)
      .then(setPhotos).catch(console.error).finally(() => setLoading(false))
  }, [albumId, refreshKey])

  if (loading) return <div className="h-[80px] bg-[#EAE7E2] rounded-[10px] animate-pulse" />

  if (photos.length === 0) return (
    <div className="border-2 border-dashed border-[#EAE7E2] rounded-[10px] py-8 text-center text-[#A1A1AA] text-sm">
      Aucune photo. Cliquez sur "Ajouter" pour uploader.
    </div>
  )

  const visible = photos.slice(0, 5)
  const extra = photos.length - 5

  return (
    <div className="grid grid-cols-6 gap-2">
      {visible.map((p, j) => (
        <PhotoThumbnail
          key={p.id} albumId={albumId} photo={p}
          color={colors[j % colors.length]} index={j} total={photos.length}
          onOpen={onOpen}
        />
      ))}
      {extra > 0 && (
        <div
          className="aspect-square rounded-[10px] cursor-pointer hover:scale-[1.04] transition-all flex items-center justify-center font-extrabold text-white text-lg bg-black/45"
          onClick={() => onOpen(photos[5].id, 5, photos.length)}>
          +{extra}
        </div>
      )}
    </div>
  )
}