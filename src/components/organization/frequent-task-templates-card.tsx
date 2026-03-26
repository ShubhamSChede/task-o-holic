"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { FrequentTask } from '@/types/supabase'

export default function FrequentTaskTemplatesCard({
  organizationId,
  frequentTasks,
  isCreator,
}: {
  organizationId: string
  frequentTasks: FrequentTask[]
  isCreator: boolean
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 sm:px-6 sm:py-4">
        <h2 className="text-base font-medium text-slate-50 sm:text-lg">
          Frequent task templates
        </h2>

        <div className="flex items-center gap-2">
          {isCreator ? (
            <Link
              href={`/frequent-tasks/create?org=${organizationId}`}
              className="text-xs font-medium text-cyan-300 hover:text-cyan-200 sm:text-sm"
            >
              Add template
            </Link>
          ) : null}

          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/30 px-3 py-1 text-xs text-slate-200 hover:border-cyan-400/50"
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {collapsed ? 'Expand' : 'Minimize'}
          </button>
        </div>
      </div>

      {!collapsed ? (
        frequentTasks.length > 0 ? (
          <ul className="divide-y divide-slate-800/80">
            {frequentTasks.map((task) => (
              <li key={task.id} className="px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="font-medium text-slate-50">{task.title}</p>
                    {task.description ? (
                      <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                        {task.description}
                      </p>
                    ) : null}

                    <div className="mt-2 flex flex-wrap gap-1 sm:gap-2">
                      {task.priority ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            task.priority === 'high'
                              ? 'bg-red-500/15 text-red-300 border border-red-500/40'
                              : task.priority === 'medium'
                              ? 'bg-amber-400/10 text-amber-200 border border-amber-300/40'
                              : 'bg-emerald-400/10 text-emerald-200 border border-emerald-300/40'
                          }`}
                        >
                          {task.priority}
                        </span>
                      ) : null}

                      {task.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-slate-200 ring-1 ring-slate-700/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/todo/create?template=${task.id}`}
                    className="inline-flex w-fit items-center rounded-md border border-slate-700 px-2 py-1 text-xs text-cyan-300 hover:bg-slate-900 hover:text-cyan-200 sm:text-sm"
                  >
                    Use template
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-4 text-center text-sm text-slate-400 sm:px-6">
            No frequent task templates yet.
          </div>
        )
      ) : (
        <div className="px-4 py-4 text-sm text-slate-400 sm:px-6">
          Minimized.
        </div>
      )}
    </div>
  )
}

