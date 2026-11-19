import Lenis from 'lenis'
import { useEffect } from 'react'
import { chapterAt } from '../data/film'
import { flavours } from '../data/flavours'
import { setExperience, totalScrollVh } from './useExperienceStore'

export function useScrollDriver() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setExperience({ reducedMotion: reduced })

    const track = document.getElementById('film-track')
    if (track) {
      track.style.height = `${totalScrollVh()}vh`
    }

    const lenis = reduced
      ? null
      : new Lenis({
          duration: 1.35,
          smoothWheel: true,
          touchMultiplier: 1.4,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        })

    let raf = 0
    const tick = (time: number) => {
      lenis?.raf(time)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onMouse = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      setExperience({ mouseX: x, mouseY: -y })
    }

    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset
      const doc = document.documentElement.scrollHeight - window.innerHeight
      const progress = doc > 0 ? Math.min(1, Math.max(0, scrollY / doc)) : 0
      const { chapter, index, local } = chapterAt(progress)

      let flavourIndex = 0
      if (chapter.flavour) {
        flavourIndex = flavours.findIndex((f) => f.id === chapter.flavour!.id)
        if (flavourIndex < 0) flavourIndex = 0
      } else if (progress >= 0.74) {
        flavourIndex = 3
      } else if (progress >= 0.6) {
        flavourIndex = 2
      } else if (progress >= 0.46) {
        flavourIndex = 1
      }

      setExperience({
        scrollY,
        progress,
        chapterIndex: index,
        chapterId: chapter.id,
        chapterLocal: local,
        chapter,
        flavourIndex,
        flavourId: flavours[flavourIndex].id,
      })
    }

    window.addEventListener('mousemove', onMouse, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      cancelAnimationFrame(raf)
      lenis?.destroy()
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
}
