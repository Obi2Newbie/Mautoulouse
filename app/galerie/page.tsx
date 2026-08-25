'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { photosApi, albumColors } from '@/lib/api'
import type { PhotoAlbum, Photo } from '@/lib/types'

export default function GaleriePage() {
  const [albums,  setAlbums]  = useState<PhotoAlbum[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    photosApi.listAlbums()
      .then(a => setAlbums(a.map(al => ({ ...al, colors: albumColors(al.id) }))))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <Navbar/>
      <div className="max-w-[1100px] mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-[30px] font-bold">Galerie Photos</h1>
          <p className="text-[#71717A] mt-1.5">Retrouvez les souvenirs de nos événements passés</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-8">
            {[1,2,3,4].map(i => <div key={i} className="h-[300px] rounded-card bg-[#EAE7E2] animate-pulse"/>)}
          </div>
        ) : albums.length === 0 ? (
          <div className="py-20 text-center text-[#A1A1AA]">Aucun album disponible pour le moment.</div>
        ) : (
          <div className="space-y-12">
            {albums.map(album => (
              <AlbumSection key={album.id} album={album}/>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AlbumSection({ album }: { album: PhotoAlbum }) {
  const [photos,   setPhotos]   = useState<Photo[]>([])
  const [loading,  setLoading]  = useState(true)
  const [lightbox, setLightbox] = useState<{ photo: Photo; idx: number } | null>(null)
  const [lbLoading,setLbLoading]= useState(false)
  const colors = album.colors ?? albumColors(album.id)

  useEffect(() => {
    photosApi.listPhotos(album.id)
      .then(setPhotos).catch(console.error).finally(() => setLoading(false))
  }, [album.id])

  async function openLightbox(photo: Photo, idx: number) {
    setLbLoading(true)
    setLightbox({ photo: { ...photo }, idx })
    try {
      const full = await photosApi.getPhoto(album.id, photo.id)
      setLightbox(l => l ? { ...l, photo: full } : null)
    } catch (e) { console.error(e) }
    finally { setLbLoading(false) }
  }

  if (!loading && photos.length === 0) return null

  return (
    <div>
      {/* Album header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="font-display text-2xl font-bold">{album.event_title ?? album.title}</h2>
          {album.description && <p className="text-[#71717A] text-sm mt-1">{album.description}</p>}
          <p className="text-[13px] text-[#A1A1AA] mt-1">{album.photos_count ?? photos.length} photos</p>
        </div>
      </div>

      {/* Photo grid */}
      {loading ? (
        <div className="grid grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="aspect-square rounded-[10px] bg-[#EAE7E2] animate-pulse"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {photos.slice(0, 7).map((p, j) => (
            <PhotoThumb key={p.id} albumId={album.id} photo={p} color={colors[j % colors.length]}
              onClick={() => openLightbox(p, j)}
              large={j === 0}  // first photo is larger
            />
          ))}
          {photos.length > 7 && (
            <div
              className="aspect-square rounded-[10px] cursor-pointer flex items-center justify-center font-extrabold text-white text-xl bg-black/40 hover:bg-black/55 transition-colors"
              onClick={() => openLightbox(photos[7], 7)}>
              +{photos.length - 7}
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/92 flex items-center justify-center z-50 p-6"
          onClick={() => setLightbox(null)}>
          <div className="bg-white rounded-[20px] max-w-[680px] w-full shadow-[0_40px_80px_rgba(0,0,0,.6)]"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-[#EAE7E2]">
              <div>
                <div className="font-display font-bold">{album.event_title ?? album.title}</div>
                <div className="text-[13px] text-[#71717A]">
                  {lightbox.photo.file_name} · Photo {lightbox.idx + 1} sur {photos.length}
                </div>
              </div>
              <button onClick={() => setLightbox(null)}
                className="text-[22px] text-[#71717A] hover:text-[#18181B] bg-transparent border-none cursor-pointer">✕</button>
            </div>
            <div className="h-[420px] flex items-center justify-center overflow-hidden rounded-b-[20px]"
              style={{ background: lbLoading || !lightbox.photo.data ? colors[lightbox.idx % colors.length] : '#f0f0f0' }}>
              {lbLoading ? (
                <span className="text-white text-5xl animate-pulse">⏳</span>
              ) : lightbox.photo.data ? (
                <img
                  src={`data:${lightbox.photo.mime_type};base64,${lightbox.photo.data}`}
                  alt={lightbox.photo.caption ?? lightbox.photo.file_name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-white text-5xl">📸</span>
              )}
            </div>
            {lightbox.photo.caption && (
              <p className="text-center text-sm text-[#71717A] italic py-3">{lightbox.photo.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PhotoThumb({ albumId, photo, color, onClick, large }: {
  albumId: string; photo: Photo; color: string
  onClick: () => void; large?: boolean
}) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    photosApi.getPhoto(albumId, photo.id)
      .then(p => { if (p.data) setSrc(`data:${p.mime_type};base64,${p.data}`) })
      .catch(console.error)
  }, [albumId, photo.id])

  return (
    <div
      className={`rounded-[10px] cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all overflow-hidden flex items-center justify-center ${
        large ? 'row-span-2 col-span-2' : 'aspect-square'
      }`}
      style={{ background: src ? '#f0f0f0' : color, aspectRatio: large ? undefined : '1' }}
      onClick={onClick}>
      {src
        ? <img src={src} alt={photo.file_name} className="w-full h-full object-cover"/>
        : <span className="text-3xl animate-pulse">⏳</span>
      }
    </div>
  )
}