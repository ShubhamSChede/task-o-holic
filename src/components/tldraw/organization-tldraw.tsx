"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Tldraw, type TLAssetStore, getSnapshot, useEditor } from 'tldraw'
import type { TLEditorSnapshot } from 'tldraw'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, UploadCloud } from 'lucide-react'

import 'tldraw/tldraw.css'

type OrganizationTldrawProps = {
  orgId: string
  initialSnapshot: TLEditorSnapshot | null
}

// Auto-save latest snapshot (save/load only; no multiplayer sync).
function AutoSavePanel({
  orgId,
  onSavingChange,
}: {
  orgId: string
  onSavingChange: (saving: boolean) => void
}) {
  const editor = useEditor()
  const [error, setError] = useState<string | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) return

    saveTimerRef.current = setTimeout(async () => {
      saveTimerRef.current = null
      try {
        const snapshot = getSnapshot(editor.store)
        onSavingChange(true)

        const res = await fetch(`/api/tldraw/orgs/${orgId}/snapshot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ snapshot }),
        })

        if (!res.ok) {
          const json = await res.json().catch(() => null)
          throw new Error(json?.error ?? 'Failed to save snapshot')
        }

        setError(null)
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to save snapshot'
        setError(message)
      } finally {
        onSavingChange(false)
      }
    }, 900)
  }, [editor.store, onSavingChange, orgId])

  useEffect(() => {
    // Listen for document changes from the local user, then persist the latest snapshot.
    const cleanup = editor.store.listen(
      () => {
        scheduleSave()
      },
      { source: 'user', scope: 'document' } as unknown as {
        source: 'user'
        scope: 'document'
      }
    )

    return cleanup
  }, [editor.store, scheduleSave])

  if (!error) return null

  return (
    <div className="absolute bottom-3 left-3 right-3 z-20 rounded-lg border border-red-500/40 bg-red-950/50 p-3 text-sm text-red-200">
      {error}
    </div>
  )
}

export default function OrganizationTldraw({
  orgId,
  initialSnapshot,
}: OrganizationTldrawProps) {
  const [isSaving, setIsSaving] = useState(false)

  const assetStore = useMemo<TLAssetStore>(() => {
    return {
      async upload(_asset, file) {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch(`/api/tldraw/orgs/${orgId}/assets/upload`, {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const json = await res.json().catch(() => null)
          throw new Error(json?.error ?? 'Failed to upload asset')
        }

        const json = await res.json()
        // tldraw expects { src: string }
        return { src: json.src }
      },

      async resolve(_asset) {
        // Tldraw expects us to return a usable URL for the asset.
        // Our DB stores a `src` that points to `/assets/resolve?assetKey=...`.
        // On reload, we must "resolve" it to the final signed URL by calling the API.
        const props = _asset.props as
          | { src?: string; assetKey?: string }
          | undefined

        const src = props?.src
        const assetKey = props?.assetKey

        // If `src` looks like our resolve endpoint, fetch it to follow redirect to signed URL.
        if (typeof src === 'string' && src.length) {
          try {
            const url = new URL(src, window.location.origin)
            const assetKeyFromSrc = url.searchParams.get('assetKey')

            if (assetKeyFromSrc) {
              const res = await fetch(src, { method: 'GET' })
              // When the API redirects, `res.url` becomes the final signed URL.
              if (res.url) return res.url
            }
          } catch {
            // If parsing fails, fall back to returning src directly.
          }

          return src
        }

        // Fallback if assetKey exists directly in props.
        if (assetKey) {
          const resolveUrl = `/api/tldraw/orgs/${orgId}/assets/resolve?assetKey=${encodeURIComponent(
            assetKey
          )}`
          const res = await fetch(resolveUrl, { method: 'GET' })
          if (res.url) return res.url
        }

        return null
      },
    }
  }, [orgId])

  return (
    <div className="mx-auto w-full max-w-6xl px-2 sm:px-0">
      <Card className="border-slate-800/80 bg-slate-950/80 shadow-[0_20px_60px_rgba(15,23,42,0.95)]">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-50">Organization canvas</h1>
              <p className="text-sm text-slate-400">Draw, upload media, and save to this organization.</p>
            </div>
            {isSaving ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/30 px-4 py-2 text-sm text-slate-200">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/30 px-4 py-2 text-sm text-slate-200">
                <UploadCloud className="h-4 w-4 text-cyan-300" />
                Media ready
              </div>
            )}
          </div>

          <div className="relative h-[70vh] min-h-[560px]">
            <Tldraw
              snapshot={initialSnapshot ?? undefined}
              assets={assetStore}
              components={{
                SharePanel: () => (
                  <AutoSavePanel orgId={orgId} onSavingChange={setIsSaving} />
                ),
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

