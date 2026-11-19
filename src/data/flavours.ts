import { asset } from '../lib/asset'

export type FlavourId = 'blush' | 'sunburst' | 'purple-haze' | 'afterglow'

export interface Flavour {
  id: FlavourId
  name: string
  pairing: string
  tagline: string
  description: string
  primary: string
  secondary: string
  glow: string
  orbit: string
  fruits: string
  pieces: string[]
  accent: string
}

export const flavours: Flavour[] = [
  {
    id: 'blush',
    name: 'Blush',
    pairing: 'Strawberry × Watermelon',
    tagline: 'Flirty. Juicy. A little messy.',
    description:
      'Strawberry walks in hot. Watermelon keeps it chill. Together they taste like texting your crush at 1am and somehow getting a reply.',
    primary: '#FF2E6B',
    secondary: '#FFB7C5',
    glow: '#FF4D8D',
    orbit: asset('generated/flavour-blush-orbit.jpg'),
    fruits: asset('generated/fruits/fruits-blush.jpg'),
    pieces: [
      asset('generated/fruits/real/strawberry-whole.png'),
      asset('generated/fruits/real/strawberry-half.png'),
      asset('generated/fruits/real/watermelon-wedge.png'),
      asset('generated/fruits/real/strawberry-half.png'),
    ],
    accent: '#FF2E9B',
  },
  {
    id: 'sunburst',
    name: 'Sunburst',
    pairing: 'Mango × Orange',
    tagline: 'Main-character energy in citrus form.',
    description:
      'Mango does the sweet talk. Orange hits the high notes. One spin and your brain goes full summer playlist — no skip button, no chill mode.',
    primary: '#FF7A00',
    secondary: '#FFE0A3',
    glow: '#FF9A00',
    orbit: asset('generated/flavour-sunburst-orbit.jpg'),
    fruits: asset('generated/fruits/fruits-sunburst.jpg'),
    pieces: [
      asset('generated/fruits/real/mango.png'),
      asset('generated/fruits/real/orange-wedge.png'),
      asset('generated/fruits/real/mango.png'),
      asset('generated/fruits/real/orange-wedge.png'),
    ],
    accent: '#FF9A00',
  },
  {
    id: 'purple-haze',
    name: 'Purple Haze',
    pairing: 'Blueberry × Grape',
    tagline: 'For after-dark taste buds only.',
    description:
      'Blueberry brings the mystery. Grape brings the velvet. It’s that late-night neon walk home flavour — low lights, big feelings, zero boring.',
    primary: '#6B2DFF',
    secondary: '#D4B8FF',
    glow: '#8B5CFF',
    orbit: asset('generated/flavour-purple-haze-orbit.jpg'),
    fruits: asset('generated/fruits/fruits-purple-haze.jpg'),
    pieces: [
      asset('generated/fruits/real/blueberries.png'),
      asset('generated/fruits/real/grapes.png'),
      asset('generated/fruits/real/blueberries.png'),
      asset('generated/fruits/real/grapes.png'),
    ],
    accent: '#A855F7',
  },
  {
    id: 'afterglow',
    name: 'Afterglow',
    pairing: 'Lime × Mint',
    tagline: 'Cool kid. Louder finish.',
    description:
      'Lime snaps first. Mint hangs around like it owns the place. Fresh, sharp, and suspiciously addictive — the clean hit that still leaves a plot twist.',
    primary: '#7CFF2E',
    secondary: '#E8FFB8',
    glow: '#B4FF00',
    orbit: asset('generated/flavour-afterglow-orbit.jpg'),
    fruits: asset('generated/fruits/fruits-afterglow.jpg'),
    pieces: [
      asset('generated/fruits/real/lime-wedge.png'),
      asset('generated/fruits/real/mint.png'),
      asset('generated/fruits/real/lime-wedge.png'),
      asset('generated/fruits/real/mint.png'),
    ],
    accent: '#B4FF00',
  },
]

export const brand = {
  name: 'POPÉ',
  plum: '#4A00A8',
  pink: '#FF2E9B',
  lime: '#B4FF00',
  orange: '#FF9A00',
  ink: '#07040F',
  mist: '#F4F0FF',
}
