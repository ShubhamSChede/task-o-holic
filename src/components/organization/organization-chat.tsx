"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { OrganizationMessage } from '@/types/supabase'
import { ChevronDown, ChevronRight, Send } from 'lucide-react'

type MessageWithProfile = OrganizationMessage & {
  profiles?: { full_name: string | null } | null
}

export default function OrganizationChat({
  organizationId,
  currentUserId,
  initialMessages,
}: {
  organizationId: string
  currentUserId: string
  initialMessages: MessageWithProfile[]
}) {
  const supabase = useMemo(() => createClient(), [])
  const [messages, setMessages] = useState<MessageWithProfile[]>(initialMessages)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (collapsed) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, collapsed])

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  useEffect(() => {
    const channel = supabase
      .channel(`org-chat:${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'organization_messages',
          filter: `organization_id=eq.${organizationId}`,
        },
        async (payload) => {
          const inserted = payload.new as OrganizationMessage

          // Fetch the inserted row with profile info for display.
          const { data } = await supabase
            .from('organization_messages')
            .select('*, profiles(full_name)')
            .eq('id', inserted.id)
            .maybeSingle()

          if (!data) return
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.id)) return prev
            return [...prev, data as unknown as MessageWithProfile]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [organizationId, supabase])

  const onSend = async () => {
    const trimmed = content.trim()
    if (!trimmed || sending) return

    setSending(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('organization_messages')
        .insert({
          organization_id: organizationId,
          user_id: currentUserId,
          content: trimmed,
        })

      if (insertError) throw new Error(insertError.message)
      setContent('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 sm:px-6 sm:py-4">
        <div>
          <h2 className="text-base font-medium text-slate-50 sm:text-lg">
            Organization chat
          </h2>
          <p className="text-xs text-slate-400 sm:text-sm">
            Realtime group chat for members.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/30 px-3 py-1 text-xs text-slate-200 hover:border-cyan-400/50"
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {collapsed ? 'Expand' : 'Minimize'}
        </button>
      </div>

      {!collapsed ? (
        <>
          <div className="max-h-[420px] overflow-y-auto px-4 py-4 sm:px-6">
            {messages.length === 0 ? (
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-4 text-sm text-slate-400">
                No messages yet. Say hi.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => {
                  const mine = m.user_id === currentUserId
                  const name = mine
                    ? 'You'
                    : m.profiles?.full_name?.trim() || 'Member'

                  return (
                    <div
                      key={m.id}
                      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed sm:max-w-[75%] ${
                          mine
                            ? 'bg-cyan-400 text-slate-950'
                            : 'bg-slate-900/60 text-slate-100 ring-1 ring-slate-800'
                        }`}
                      >
                        <div
                          className={`mb-1 text-[11px] ${
                            mine ? 'text-slate-900/80' : 'text-slate-400'
                          }`}
                        >
                          {name}
                        </div>
                        <div className="whitespace-pre-wrap break-words">
                          {m.content}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 px-4 py-3 sm:px-6 sm:py-4">
        {error ? (
          <div className="mb-3 rounded-lg border border-red-500/40 bg-red-950/40 p-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="flex items-end gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Message the organization…"
            className="min-h-[44px] w-full resize-none rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/60"
            maxLength={4000}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSend()
              }
            }}
          />
          <button
            onClick={onSend}
            disabled={sending || !content.trim()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>

            <div className="mt-2 text-xs text-slate-500">
              Enter to send, Shift+Enter for a new line.
            </div>
          </div>
        </>
      ) : (
        <div className="px-4 py-4 text-sm text-slate-400 sm:px-6">
          Minimized.
        </div>
      )}
    </div>
  )
}

