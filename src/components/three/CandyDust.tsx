import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { flavours } from '../../data/flavours'
import { useExperienceStore } from '../../hooks/useExperienceStore'

const COUNT = 140

function createCircleTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.55)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

export function CandyDust() {
  const points = useRef<THREE.Points>(null)
  const material = useRef<THREE.PointsMaterial>(null)
  const flavourIndex = useExperienceStore((s) => s.flavourIndex)
  const reducedMotion = useExperienceStore((s) => s.reducedMotion)
  const circleMap = useMemo(() => createCircleTexture(), [])

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const speeds = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1
      speeds[i] = 0.12 + Math.random() * 0.5
    }
    return { positions, speeds }
  }, [])

  const color = useMemo(() => new THREE.Color(flavours[0].accent), [])
  const target = useMemo(() => new THREE.Color(), [])

  useFrame((state, delta) => {
    if (!points.current || !material.current) return
    const pos = points.current.geometry.attributes.position
      .array as Float32Array

    if (!reducedMotion) {
      for (let i = 0; i < COUNT; i++) {
        pos[i * 3 + 1] += speeds[i] * delta * 0.4
        pos[i * 3] += Math.sin(state.clock.elapsedTime * speeds[i] + i) * 0.0025
        if (pos[i * 3 + 1] > 3.5) pos[i * 3 + 1] = -3.5
      }
      points.current.geometry.attributes.position.needsUpdate = true
    }

    target.set(flavours[flavourIndex].accent)
    color.lerp(target, 1 - Math.exp(-delta * 5))
    material.current.color.copy(color)
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={material}
        map={circleMap}
        size={0.07}
        transparent
        opacity={0.72}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}
