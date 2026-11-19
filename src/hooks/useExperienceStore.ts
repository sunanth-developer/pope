import { useSyncExternalStore } from 'react'
import { chapters, chapterAt, type ChapterId, type FilmChapter } from '../data/film'
import type { FlavourId } from '../data/flavours'
import { flavours } from '../data/flavours'

export type ExperienceState = {
  scrollY: number
  /** Master film timeline 0-1 */
  progress: number
  chapterIndex: number
  chapterId: ChapterId
  chapterLocal: number
  chapter: FilmChapter
  flavourIndex: number
  flavourId: FlavourId
  mouseX: number
  mouseY: number
  reducedMotion: boolean
}

type Listener = () => void
const listeners = new Set<Listener>()

const first = chapterAt(0)

let state: ExperienceState = {
  scrollY: 0,
  progress: 0,
  chapterIndex: first.index,
  chapterId: first.chapter.id,
  chapterLocal: 0,
  chapter: first.chapter,
  flavourIndex: 0,
  flavourId: flavours[0].id,
  mouseX: 0,
  mouseY: 0,
  reducedMotion: false,
}

function emit() {
  listeners.forEach((l) => l())
}

export function setExperience(partial: Partial<ExperienceState>) {
  state = { ...state, ...partial }
  emit()
}

export function getExperience() {
  return state
}

export function subscribeExperience(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useExperienceStore<T>(
  selector: (s: ExperienceState) => T,
): T {
  return useSyncExternalStore(
    subscribeExperience,
    () => selector(state),
    () => selector(state),
  )
}

export function totalScrollVh() {
  return chapters.reduce((sum, c) => sum + c.heightVh, 0)
}
