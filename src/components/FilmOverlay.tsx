import { useState, type FormEvent } from 'react'
import { useExperienceStore } from '../hooks/useExperienceStore'

function WaitlistCard() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!valid) {
      setStatus('error')
      return
    }
    try {
      const existing = JSON.parse(
        localStorage.getItem('pope-waitlist') || '[]',
      ) as string[]
      if (!existing.includes(email.trim().toLowerCase())) {
        existing.push(email.trim().toLowerCase())
        localStorage.setItem('pope-waitlist', JSON.stringify(existing))
      }
      setStatus('ok')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className="film-form" onSubmit={onSubmit} noValidate>
      <label className="sr-only" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        placeholder="you@stayready.email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          if (status !== 'idle') setStatus('idle')
        }}
        required
      />
      <button type="submit" className="btn btn-primary">
        Lock my spot
      </button>
      <p className={`film-form-status ${status !== 'idle' ? 'is-on' : ''}`} role="status">
        {status === 'ok' && "You're in. We'll tap you when POPÉ goes live."}
        {status === 'error' && 'That email looks a little sus. Try again?'}
      </p>
    </form>
  )
}

/** Cinematic title cards that dissolve in/out with the film timeline. */
export function FilmOverlay() {
  const chapter = useExperienceStore((s) => s.chapter)
  const chapterLocal = useExperienceStore((s) => s.chapterLocal)
  const progress = useExperienceStore((s) => s.progress)
  const isOpening = chapter.id === 'opening'

  // Opening stays fully readable on first paint; later chapters ease in/out
  const enter = isOpening ? 1 : Math.min(1, chapterLocal / 0.08)
  const exit = isOpening
    ? Math.min(1, (1 - chapterLocal) / 0.18)
    : Math.min(1, (1 - chapterLocal) / 0.12)
  const opacity = Math.min(1, Math.max(isOpening ? 0.85 : 0.2, Math.min(enter, exit)))
  const y = isOpening ? 0 : (1 - Math.min(1, chapterLocal / 0.14)) * 14

  const veil =
    progress < 0.1
      ? 0.45
      : progress < 0.32
        ? 0.88
        : progress < 0.9
          ? 0.92
          : 0.78

  const pairing = chapter.flavour?.pairing
  const desc = chapter.flavour?.description
  const layout = isOpening ? 'film-overlay--opening' : 'film-overlay--copy'

  return (
    <div className={`film-overlay ${layout}`} aria-live="polite">
      <div className="film-veil" style={{ opacity: veil }} aria-hidden="true" />
      <div
        className="film-card"
        style={{
          opacity,
          transform: `translate3d(0, ${y}px, 0)`,
        }}
      >
        {chapter.eyebrow && <p className="film-eyebrow">{chapter.eyebrow}</p>}
        {chapter.title && (
          <h1 className="film-title">
            {chapter.title.split('\n').map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </h1>
        )}
        {pairing && <p className="film-pairing">{pairing}</p>}
        {chapter.body && <p className="film-body">{chapter.body}</p>}
        {desc && chapter.id === 'world' && chapterLocal > 0.28 && (
          <p className="film-desc">{desc}</p>
        )}
        {chapter.cta && <WaitlistCard />}
      </div>

      {progress < 0.11 && (
        <p className="film-scroll-cue" aria-hidden="true">
          Scroll to enter
        </p>
      )}
    </div>
  )
}
