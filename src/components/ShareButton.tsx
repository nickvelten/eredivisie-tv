'use client'

import { useState } from 'react'
import { track } from '@/lib/analytics'

/** Native share sheet on phones, copy-link elsewhere, plus a direct WhatsApp link. */
export function ShareButton({ url, text, label = 'Deel' }: { url: string; text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    track('share', { method: 'native', url })
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ text, url })
        return
      } catch {
        // Cancelled or blocked: fall back to copying the link
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard not available
    }
  }

  const base = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-border bg-card text-foreground hover:ring-accent/40'
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={share} className={base}>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" />
        </svg>
        {copied ? 'Link gekopieerd' : label}
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('share', { method: 'whatsapp', url })}
        className={base}
      >
        WhatsApp
      </a>
    </div>
  )
}
