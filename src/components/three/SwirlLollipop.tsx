import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { flavours } from '../../data/flavours'
import { useExperienceStore } from '../../hooks/useExperienceStore'

type Props = {
  scale?: number
}

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uPrimary;
  uniform vec3 uSecondary;
  uniform vec3 uGlow;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p);
    float a = atan(p.y, p.x);
    float swirl = a + r * 14.0 - uTime * 0.2;
    float bands = sin(swirl * 6.0);
    float mask = smoothstep(-0.15, 0.15, bands);

    vec3 candy = mix(uSecondary, uPrimary, mask);
    candy = mix(candy, uPrimary * 0.85 + uSecondary * 0.15, smoothstep(0.42, 0.0, r));
    candy += vec3(0.08) * smoothstep(0.15, 0.0, abs(bands));

    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 L = normalize(vec3(0.45, 0.85, 0.55));
    float diff = clamp(dot(N, L), 0.0, 1.0);
    float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.4);
    float spec = pow(clamp(dot(reflect(-L, N), V), 0.0, 1.0), 56.0);

    vec3 col = candy * (0.32 + diff * 0.78);
    col += vec3(1.0) * spec * 0.9;
    col += uGlow * fres * 0.4;
    col += uGlow * 0.05;

    float fleck = fract(sin(dot(vUv * 180.0, vec2(12.9898, 78.233))) * 43758.5453);
    col += vec3(fleck > 0.97 ? 0.12 : 0.0);

    gl_FragColor = vec4(col, 1.0);
  }
`

export function SwirlLollipop({ scale = 1 }: Props) {
  const group = useRef<THREE.Group>(null)
  const candy = useRef<THREE.Mesh>(null)

  const flavourIndex = useExperienceStore((s) => s.flavourIndex)
  const progress = useExperienceStore((s) => s.progress)
  const reducedMotion = useExperienceStore((s) => s.reducedMotion)

  const uniforms = useMemo(
    () => ({
      uPrimary: { value: new THREE.Color(flavours[0].primary) },
      uSecondary: { value: new THREE.Color(flavours[0].secondary) },
      uGlow: { value: new THREE.Color(flavours[0].glow) },
      uTime: { value: 0 },
    }),
    [],
  )

  const targetP = useMemo(() => new THREE.Color(), [])
  const targetS = useMemo(() => new THREE.Color(), [])
  const targetG = useMemo(() => new THREE.Color(), [])

  useFrame((state, delta) => {
    if (!group.current || !candy.current) return
    const t = state.clock.elapsedTime
    const idx = flavourIndex

    targetP.set(flavours[idx].primary)
    targetS.set(flavours[idx].secondary)
    targetG.set(flavours[idx].glow)
    uniforms.uPrimary.value.lerp(targetP, 1 - Math.exp(-delta * 6))
    uniforms.uSecondary.value.lerp(targetS, 1 - Math.exp(-delta * 6))
    uniforms.uGlow.value.lerp(targetG, 1 - Math.exp(-delta * 6))
    uniforms.uTime.value = t

    const spin = reducedMotion ? 0 : t * 0.35 + progress * Math.PI * 3.2
    candy.current.rotation.z = spin
    group.current.rotation.y = reducedMotion
      ? 0
      : Math.sin(t * 0.4) * 0.15 + progress * 0.8
    group.current.scale.setScalar(scale)
  })

  return (
    <group ref={group} scale={scale}>
      <mesh ref={candy} castShadow scale={[1, 1, 0.52]}>
        <sphereGeometry args={[1.15, 96, 96]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
      <mesh scale={[1.03, 1.03, 0.54]}>
        <sphereGeometry args={[1.15, 48, 48]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, -1.95, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.075, 1.8, 24]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.65} metalness={0.05} />
      </mesh>
    </group>
  )
}
