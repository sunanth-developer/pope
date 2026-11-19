import { Environment, Float, useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { flavours } from '../../data/flavours'
import { useExperienceStore } from '../../hooks/useExperienceStore'
import { asset } from '../../lib/asset'
import { CandyDust } from './CandyDust'
import { SwirlLollipop } from './SwirlLollipop'

const WORLD_MAPS = [
  asset('generated/worlds/world-blush-env.jpg'),
  asset('generated/worlds/world-sunburst-env.jpg'),
  asset('generated/worlds/world-purple-env.jpg'),
  asset('generated/worlds/world-afterglow-env.jpg'),
]

const OPENING_MAP = asset('generated/worlds/opening-cosmos.jpg')
const FINALE_MAP = asset('generated/worlds/finale-party.jpg')

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Scroll-driven cinematic camera path through POPÉ worlds. */
function CameraDirector() {
  const { camera } = useThree()
  const progress = useExperienceStore((s) => s.progress)
  const mouseX = useExperienceStore((s) => s.mouseX)
  const mouseY = useExperienceStore((s) => s.mouseY)
  const reducedMotion = useExperienceStore((s) => s.reducedMotion)

  const look = useMemo(() => new THREE.Vector3(), [])
  const desired = useMemo(() => new THREE.Vector3(), [])
  const desiredLook = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, delta) => {
    const p = progress

    // Film beats mapped to camera blocking
    if (p < 0.12) {
      // Opening: centered beauty frame with gentle push-in
      const t = smoothstep(0, 0.12, p)
      desired.set(0, THREE.MathUtils.lerp(0.05, 0.12, t), THREE.MathUtils.lerp(5.6, 4.8, t))
      desiredLook.set(0, 0.05, 0)
      ;(camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp(34, 36, t)
    } else if (p < 0.22) {
      // Title: hold a wide shot with candy on the right third
      const t = smoothstep(0.12, 0.22, p)
      desired.set(THREE.MathUtils.lerp(0, -0.35, t), 0.1, THREE.MathUtils.lerp(5.2, 5.0, t))
      desiredLook.set(THREE.MathUtils.lerp(0, 1.7, t), 0.05, 0)
      ;(camera as THREE.PerspectiveCamera).fov = 32
    } else if (p < 0.32) {
      // Thesis: still wide enough that left copy lane stays clear
      const t = smoothstep(0.22, 0.32, p)
      desired.set(-0.55, 0.1, THREE.MathUtils.lerp(5.1, 4.9, t))
      desiredLook.set(1.85, 0.05, 0)
      ;(camera as THREE.PerspectiveCamera).fov = 32
    } else if (p < 0.86) {
      // Worlds: slow drift around candy while keeping left third free for type
      const worldT = smoothstep(0.32, 0.86, p)
      const angle = -0.2 + worldT * Math.PI * 0.75
      const radius = 5.35
      const elev = Math.sin(worldT * Math.PI * 2) * 0.18
      desired.set(Math.sin(angle) * radius - 0.35, 0.12 + elev, Math.cos(angle) * radius)
      desiredLook.set(1.95, 0.05, -0.25)
      ;(camera as THREE.PerspectiveCamera).fov = 32
    } else if (p < 0.93) {
      // Ritual: candy right, copy left
      const t = smoothstep(0.86, 0.93, p)
      desired.set(-0.45, 0.16, THREE.MathUtils.lerp(5.0, 4.6, t))
      desiredLook.set(1.7, 0.08, 0)
      ;(camera as THREE.PerspectiveCamera).fov = 32
    } else {
      // Finale: intimate but copy-safe
      const t = smoothstep(0.93, 1, p)
      desired.set(THREE.MathUtils.lerp(-0.45, -0.15, t), 0.1, THREE.MathUtils.lerp(4.6, 3.9, t))
      desiredLook.set(THREE.MathUtils.lerp(1.7, 0.55, t), 0.05, 0)
      ;(camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp(32, 34, t)
    }

    if (!reducedMotion) {
      desired.x += mouseX * 0.22
      desired.y += mouseY * 0.12
    }

    camera.position.lerp(desired, 1 - Math.exp(-delta * 2.4))
    look.lerp(desiredLook, 1 - Math.exp(-delta * 2.4))
    camera.lookAt(look)
    ;(camera as THREE.PerspectiveCamera).updateProjectionMatrix()
  })

  return null
}

function OpeningSparks() {
  const points = useRef<THREE.Points>(null)
  const progress = useExperienceStore((s) => s.progress)

  const { positions, speeds } = useMemo(() => {
    const count = 140
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2
      speeds[i] = 0.15 + Math.random() * 0.55
    }
    return { positions, speeds }
  }, [])

  useFrame((state, delta) => {
    if (!points.current) return
    const live = progress < 0.28
    const mat = points.current.material as THREE.PointsMaterial
    mat.opacity = THREE.MathUtils.damp(
      mat.opacity,
      live ? 0.85 * (1 - smoothstep(0.14, 0.28, progress)) : 0,
      2.5,
      delta,
    )
    const arr = points.current.geometry.attributes.position.array as Float32Array
    const t = state.clock.elapsedTime
    for (let i = 0; i < speeds.length; i++) {
      arr[i * 3 + 1] += Math.sin(t * speeds[i] + i) * delta * 0.12
      arr[i * 3] += Math.cos(t * speeds[i] * 0.7 + i) * delta * 0.08
    }
    points.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={points} position={[0, 0, -7.2]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffd6f0"
        size={0.045}
        transparent
        opacity={0.85}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

function OpeningBackdrop() {
  const map = useTexture(OPENING_MAP)
  map.colorSpace = THREE.SRGBColorSpace
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const group = useRef<THREE.Group>(null)
  const orbs = useRef<THREE.Group>(null)
  const progress = useExperienceStore((s) => s.progress)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const live = progress < 0.28
    const target = live ? 0.92 * (1 - smoothstep(0.14, 0.28, progress)) : 0
    if (mat.current) {
      mat.current.opacity = THREE.MathUtils.damp(mat.current.opacity, target, 2.5, delta)
    }
    if (group.current) {
      group.current.rotation.z = Math.sin(t * 0.08) * 0.05
      const pulse = 1.06 + Math.sin(t * 0.18) * 0.04
      group.current.scale.setScalar(pulse)
    }
    if (orbs.current) {
      const homes: [number, number, number][] = [
        [-3.2, 1.4, 0.4],
        [3.5, -1.1, 0.2],
        [0.6, 2.2, 0.1],
        [-1.2, -2.0, 0.3],
      ]
      orbs.current.children.forEach((child, i) => {
        const [hx, hy, hz] = homes[i]
        child.position.set(
          hx + Math.sin(t * (0.35 + i * 0.08) + i) * 0.55,
          hy + Math.cos(t * (0.28 + i * 0.06) + i * 1.3) * 0.4,
          hz,
        )
      })
    }
  })

  return (
    <group ref={group} position={[0, 0, -8]}>
      <mesh scale={[18, 10, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={mat}
          map={map}
          transparent
          opacity={0.92}
          depthWrite={false}
        />
      </mesh>
      <group ref={orbs}>
        <mesh position={[-3.2, 1.4, 0.4]}>
          <sphereGeometry args={[1.45, 32, 32]} />
          <meshBasicMaterial color="#ff2e9b" transparent opacity={0.28} depthWrite={false} />
        </mesh>
        <mesh position={[3.5, -1.1, 0.2]}>
          <sphereGeometry args={[1.75, 32, 32]} />
          <meshBasicMaterial color="#4a00a8" transparent opacity={0.3} depthWrite={false} />
        </mesh>
        <mesh position={[0.6, 2.2, 0.1]}>
          <sphereGeometry args={[1.05, 32, 32]} />
          <meshBasicMaterial color="#ff9a00" transparent opacity={0.18} depthWrite={false} />
        </mesh>
        <mesh position={[-1.2, -2.0, 0.3]}>
          <sphereGeometry args={[1.1, 32, 32]} />
          <meshBasicMaterial color="#b4ff00" transparent opacity={0.1} depthWrite={false} />
        </mesh>
      </group>
      <OpeningSparks />
    </group>
  )
}

function WorldBackdrop() {
  const textures = useTexture(WORLD_MAPS)
  textures.forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace
  })

  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([])
  const flavourIndex = useExperienceStore((s) => s.flavourIndex)
  const progress = useExperienceStore((s) => s.progress)
  const chapterId = useExperienceStore((s) => s.chapterId)

  useFrame((_, delta) => {
    const inWorlds = progress >= 0.28 && progress <= 0.92
    mats.current.forEach((mat, i) => {
      if (!mat) return
      const target =
        inWorlds && i === flavourIndex
          ? chapterId === 'world'
            ? 0.82
            : 0.45
          : 0
      mat.opacity = THREE.MathUtils.damp(mat.opacity, target, 3, delta)
    })
  })

  return (
    <group position={[0, 0, -6.5]}>
      {textures.map((map, i) => (
        <mesh key={WORLD_MAPS[i]} scale={[18, 10, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            ref={(el) => {
              mats.current[i] = el
            }}
            map={map}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function OrbitFruit() {
  const group = useRef<THREE.Group>(null)
  const flavourIndex = useExperienceStore((s) => s.flavourIndex)
  const progress = useExperienceStore((s) => s.progress)
  const chapterLocal = useExperienceStore((s) => s.chapterLocal)
  const chapterId = useExperienceStore((s) => s.chapterId)

  const pieceTextures = useTexture(
    flavours.flatMap((f) => f.pieces.slice(0, 4)),
  ) as THREE.Texture[]

  pieceTextures.forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace
  })

  useFrame((state) => {
    if (!group.current) return
    const show = chapterId === 'world' ? 1 : progress > 0.3 && progress < 0.9 ? 0.35 : 0
    group.current.visible = show > 0.05
    const t = state.clock.elapsedTime
    // Orbit fruits stay on the candy's right hemisphere so left copy stays clean
    const radius = 1.85 + Math.sin(chapterLocal * Math.PI) * 0.28
    group.current.children.forEach((child, i) => {
      const a = t * 0.4 + (i / 4) * Math.PI * 0.5
      child.position.set(
        1.35 + Math.abs(Math.cos(a)) * radius * 0.55,
        Math.sin(a * 1.25) * 0.7,
        Math.sin(a) * radius * 0.45,
      )
      child.quaternion.copy(state.camera.quaternion)
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
      if (mat) mat.opacity = show * 0.98
    })
  })

  const base = flavourIndex * 4

  return (
    <group ref={group} position={[0.4, 0, 0]}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} scale={[1.15, 1.15, 1]}>
          <planeGeometry args={[1.05, 1.05]} />
          <meshBasicMaterial
            map={pieceTextures[base + i]}
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

function FinaleBackdrop() {
  const map = useTexture(FINALE_MAP)
  map.colorSpace = THREE.SRGBColorSpace
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const group = useRef<THREE.Group>(null)
  const confetti = useRef<THREE.Points>(null)
  const progress = useExperienceStore((s) => s.progress)

  const positions = useMemo(() => {
    const count = 180
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8
      arr[i * 3 + 2] = (Math.random() - 0.5) * 2
    }
    return arr
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const live = progress > 0.88
    const strength = live ? smoothstep(0.88, 0.96, progress) : 0
    if (mat.current) {
      mat.current.opacity = THREE.MathUtils.damp(mat.current.opacity, 0.85 * strength, 2.2, delta)
    }
    if (group.current) {
      group.current.rotation.z = Math.sin(t * 0.12) * 0.03
      group.current.scale.setScalar(1.04 + Math.sin(t * 0.2) * 0.025)
    }
    if (confetti.current) {
      const pm = confetti.current.material as THREE.PointsMaterial
      pm.opacity = THREE.MathUtils.damp(pm.opacity, 0.9 * strength, 2.2, delta)
      confetti.current.rotation.z = t * 0.04
      const arr = confetti.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < arr.length / 3; i++) {
        arr[i * 3 + 1] += Math.sin(t * 0.8 + i) * delta * 0.15
        if (arr[i * 3 + 1] > 4.5) arr[i * 3 + 1] = -4.5
      }
      confetti.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group ref={group} position={[0, 0, -7]}>
      <mesh scale={[18, 10, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial ref={mat} map={map} transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh position={[-2.8, 1.2, 0.3]}>
        <sphereGeometry args={[1.4, 24, 24]} />
        <meshBasicMaterial color="#ff2e9b" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <mesh position={[3.2, -0.8, 0.2]}>
        <sphereGeometry args={[1.7, 24, 24]} />
        <meshBasicMaterial color="#b4ff00" transparent opacity={0.14} depthWrite={false} />
      </mesh>
      <mesh position={[1.2, 2.0, 0.1]}>
        <sphereGeometry args={[1.0, 24, 24]} />
        <meshBasicMaterial color="#ff9a00" transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <points ref={confetti} position={[0, 0, 0.5]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#ffe6f5"
          size={0.06}
          transparent
          opacity={0}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  )
}

function StageLights() {
  const key = useRef<THREE.PointLight>(null)
  const fogCol = useRef<THREE.Fog>(null)
  const flavourIndex = useExperienceStore((s) => s.flavourIndex)
  const progress = useExperienceStore((s) => s.progress)
  const { scene } = useThree()
  const color = useMemo(() => new THREE.Color(flavours[0].glow), [])
  const bg = useMemo(() => new THREE.Color('#1a0730'), [])

  useFrame((_, delta) => {
    color.lerp(new THREE.Color(flavours[flavourIndex].glow), 1 - Math.exp(-delta * 4))
    if (key.current) {
      key.current.color.copy(color)
      key.current.intensity = 2.4
    }
    const opening = progress < 0.22
    const finale = progress > 0.88
    bg.lerp(
      new THREE.Color(opening ? '#1a0730' : finale ? '#1a0528' : '#05030c'),
      1 - Math.exp(-delta * 2),
    )
    // Let CSS aura / finale party plane read through on bookend beats
    scene.background = opening || finale ? null : bg
    if (fogCol.current) {
      fogCol.current.color.copy(bg)
      fogCol.current.near = opening || finale ? 12 : 8
      fogCol.current.far = opening || finale ? 28 : 20
    }
  })

  return (
    <>
      <fog ref={fogCol} attach="fog" args={['#1a0730', 12, 28]} />
      <ambientLight intensity={0.32} />
      <directionalLight position={[4, 6, 2]} intensity={1.1} />
      <pointLight ref={key} position={[-2, 2.5, 3]} intensity={2.4} distance={14} />
      <pointLight position={[3, -1, -2]} intensity={1.0} color="#fff0ff" />
      <Environment preset="city" environmentIntensity={0.5} />
    </>
  )
}

function HeroCandy() {
  const group = useRef<THREE.Group>(null)
  const progress = useExperienceStore((s) => s.progress)
  const reducedMotion = useExperienceStore((s) => s.reducedMotion)

  useFrame((_, delta) => {
    if (!group.current) return
    // Keep candy as right-side hero so the left copy lane stays empty
    let s = 1.0
    if (progress < 0.12) s = THREE.MathUtils.lerp(1.0, 1.02, smoothstep(0, 0.12, progress))
    else if (progress < 0.32) s = THREE.MathUtils.lerp(1.02, 0.68, smoothstep(0.12, 0.32, progress))
    else if (progress < 0.86) s = 0.64
    else if (progress < 0.93) s = THREE.MathUtils.lerp(0.64, 0.74, smoothstep(0.86, 0.93, progress))
    else s = THREE.MathUtils.lerp(0.74, 0.62, smoothstep(0.93, 1, progress))

    const cur = group.current.scale.x
    const next = THREE.MathUtils.damp(cur, s, 4, delta)
    group.current.scale.setScalar(next)

    let tx = 0
    let tz = 0
    if (progress >= 0.12 && progress < 0.93) {
      tx = THREE.MathUtils.lerp(1.55, 2.15, smoothstep(0.12, 0.34, progress))
      tz = -0.55
    } else if (progress >= 0.93) {
      tx = THREE.MathUtils.lerp(1.9, 2.35, smoothstep(0.93, 1, progress))
      tz = THREE.MathUtils.lerp(-0.45, -0.7, smoothstep(0.93, 1, progress))
    }
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, tx, 4, delta)
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, tz, 4, delta)
  })

  const candy = <SwirlLollipop scale={1} />

  return (
    <group ref={group} scale={1}>
      {reducedMotion ? (
        candy
      ) : (
        <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.25}>
          {candy}
        </Float>
      )}
      <CandyDust />
    </group>
  )
}

function Scene() {
  return (
    <>
      <StageLights />
      <CameraDirector />
      <Suspense fallback={null}>
        <OpeningBackdrop />
        <WorldBackdrop />
        <FinaleBackdrop />
        <OrbitFruit />
      </Suspense>
      <HeroCandy />
    </>
  )
}

export function FilmCanvas() {
  return (
    <div className="canvas-root" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
        camera={{ position: [0, 0.05, 5.6], fov: 34, near: 0.1, far: 40 }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
