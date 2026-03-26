"use client"

import { useEffect, useRef } from 'react'
import { TldrawImage } from 'tldraw'
import type { TLEditorSnapshot } from 'tldraw'

export default function OrganizationTldrawMiniPreview({
  snapshot,
}: {
  snapshot: TLEditorSnapshot | null
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Ensure the exported SVG fills our container.
    const el = wrapRef.current
    if (!el) return
    const svg = el.querySelector('svg')
    if (!svg) return
    ;(svg as SVGElement).style.width = '100%'
    ;(svg as SVGElement).style.height = '100%'
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  }, [snapshot])

  if (!snapshot) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl border border-slate-800/80 bg-slate-900/30 p-4 text-center text-sm text-slate-400">
        No canvas saved yet. Open the full canvas to start drawing.
      </div>
    )
  }

  return (
    <div
      ref={wrapRef}
      className="relative h-56 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/30 sm:h-64 lg:h-72"
    >
      <TldrawImage
        snapshot={snapshot as Partial<TLEditorSnapshot>}
        format="svg"
        darkMode={true}
      />
    </div>
  )
}

