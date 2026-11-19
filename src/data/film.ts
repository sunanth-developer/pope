import { flavours, type Flavour } from './flavours'

export type ChapterId =
  | 'opening'
  | 'title'
  | 'thesis'
  | 'world'
  | 'ritual'
  | 'finale'

export type FilmChapter = {
  id: ChapterId
  /** Inclusive start on master timeline 0-1 */
  start: number
  /** Exclusive end on master timeline 0-1 */
  end: number
  /** Scroll height in viewport multiples */
  heightVh: number
  eyebrow?: string
  title?: string
  body?: string
  flavour?: Flavour
  cta?: boolean
}

/** Continuous CGI film chapters driven by one scroll timeline. */
export const chapters: FilmChapter[] = [
  {
    id: 'opening',
    start: 0,
    end: 0.12,
    heightVh: 160,
    eyebrow: 'POPÉ PICTURES',
    title: 'Sweet, but make it cinematic.',
    body: 'Scroll to enter the reel.',
  },
  {
    id: 'title',
    start: 0.12,
    end: 0.22,
    heightVh: 120,
    eyebrow: 'NOW PLAYING',
    title: 'Candy with main-character plot.',
    body: 'Four worlds. One stick. Zero beige energy.',
  },
  {
    id: 'thesis',
    start: 0.22,
    end: 0.32,
    heightVh: 130,
    eyebrow: 'THE THESIS',
    title: 'Not a snack.\nA scene change.',
    body: 'Hard candy that feels like walking through a door into another colour.',
  },
  {
    id: 'world',
    start: 0.32,
    end: 0.46,
    heightVh: 180,
    flavour: flavours[0],
    eyebrow: 'WORLD 01',
    title: flavours[0].name,
    body: flavours[0].tagline,
  },
  {
    id: 'world',
    start: 0.46,
    end: 0.6,
    heightVh: 180,
    flavour: flavours[1],
    eyebrow: 'WORLD 02',
    title: flavours[1].name,
    body: flavours[1].tagline,
  },
  {
    id: 'world',
    start: 0.6,
    end: 0.74,
    heightVh: 180,
    flavour: flavours[2],
    eyebrow: 'WORLD 03',
    title: flavours[2].name,
    body: flavours[2].tagline,
  },
  {
    id: 'world',
    start: 0.74,
    end: 0.86,
    heightVh: 180,
    flavour: flavours[3],
    eyebrow: 'WORLD 04',
    title: flavours[3].name,
    body: flavours[3].tagline,
  },
  {
    id: 'ritual',
    start: 0.86,
    end: 0.93,
    heightVh: 140,
    eyebrow: 'HOW TO WATCH',
    title: 'Rip. Spin. Encore.',
    body: 'Foil first. Drama second. Stay for the aftertaste.',
  },
  {
    id: 'finale',
    start: 0.93,
    end: 1,
    heightVh: 150,
    eyebrow: 'END CREDITS START HERE',
    title: 'Be early.\nBe annoying about it.',
    body: 'Lock your seat before the first drop hits.',
    cta: true,
  },
]

export function chapterAt(progress: number): {
  chapter: FilmChapter
  index: number
  local: number
} {
  const p = Math.min(0.9999, Math.max(0, progress))
  for (let i = 0; i < chapters.length; i++) {
    const c = chapters[i]
    if (p >= c.start && p < c.end) {
      return {
        chapter: c,
        index: i,
        local: (p - c.start) / Math.max(c.end - c.start, 0.0001),
      }
    }
  }
  const last = chapters[chapters.length - 1]
  return { chapter: last, index: chapters.length - 1, local: 1 }
}
