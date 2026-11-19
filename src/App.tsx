import { lazy, Suspense, type CSSProperties } from 'react'
import { FilmOverlay } from './components/FilmOverlay'
import { chapters } from './data/film'
import { flavours } from './data/flavours'
import { useExperienceStore } from './hooks/useExperienceStore'
import { useScrollDriver } from './hooks/useScrollDriver'

const FilmCanvas = lazy(() =>
  import('./components/three/FilmScene').then((m) => ({
    default: m.FilmCanvas,
  })),
)

export default function App() {
  useScrollDriver()
  const flavourIndex = useExperienceStore((s) => s.flavourIndex)
  const active = flavours[flavourIndex]

  return (
    <div
      className="app film-app"
      id="top"
      style={
        {
          '--flavour-glow': active.glow,
          '--flavour-primary': active.primary,
        } as CSSProperties
      }
    >
      <div className="opening-aura" aria-hidden="true" />

      <Suspense fallback={<div className="film-boot">Loading the reel...</div>}>
        <FilmCanvas />
      </Suspense>

      <FilmOverlay />

      <div id="film-track" className="film-track" aria-hidden="true">
        {chapters.map((c, i) => (
          <section
            key={`${c.id}-${i}`}
            id={
              c.cta
                ? 'finale'
                : c.eyebrow === 'WORLD 01'
                  ? 'worlds'
                  : undefined
            }
            className="film-chapter-spacer"
            style={{ height: `${c.heightVh}vh` }}
          />
        ))}
      </div>

      <footer className="film-footer">
        <p>POPÉ · Sweet tooth. Louder personality.</p>
        <p>Flavour worlds are creative vibes - not lab claims.</p>
      </footer>
    </div>
  )
}
