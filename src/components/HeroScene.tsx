import { useRef, useContext, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { MouseContext } from '../contexts/MouseContext'

const AUTO_ROTATE_SPEED = 0.15
const STAR_COUNT = 3500
const STAR_RADIUS = 18
const PARTICLE_COUNT = 12000
const SPHERE_RADIUS = 1.2
const REPEL_STRENGTH = 0.95
const REPEL_RADIUS = 1.6
const SMOOTH_MOUSE = 0.18
const CORE_COUNT = Math.floor(PARTICLE_COUNT * 0.28)
const CORE_RADIUS_MAX = SPHERE_RADIUS * 0.6
const SHELL_COUNT = PARTICLE_COUNT - CORE_COUNT
const NOISE_STRENGTH = 0.12
const NOISE_SCALE = 2.4
const NOISE_SPEED = 0.4

function smoothstep(t: number) {
  return t * t * (3 - 2 * t)
}
function hash(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123
  return (s - Math.floor(s)) * 2 - 1
}
function valueNoise3(x: number, y: number, z: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const zi = Math.floor(z)
  const xf = x - xi
  const yf = y - yi
  const zf = z - zi
  const u = smoothstep(xf)
  const v = smoothstep(yf)
  const w = smoothstep(zf)
  const n000 = hash(xi, yi, zi)
  const n100 = hash(xi + 1, yi, zi)
  const n010 = hash(xi, yi + 1, zi)
  const n110 = hash(xi + 1, yi + 1, zi)
  const n001 = hash(xi, yi, zi + 1)
  const n101 = hash(xi + 1, yi, zi + 1)
  const n011 = hash(xi, yi + 1, zi + 1)
  const n111 = hash(xi + 1, yi + 1, zi + 1)
  const x00 = n000 + (n100 - n000) * u
  const x10 = n010 + (n110 - n010) * u
  const x01 = n001 + (n101 - n001) * u
  const x11 = n011 + (n111 - n011) * u
  const y0 = x00 + (x10 - x00) * v
  const y1 = x01 + (x11 - x01) * v
  return y0 + (y1 - y0) * w
}

function ParticleSphere() {
  const groupRef = useRef<THREE.Group>(null)
  const shellPointsRef = useRef<THREE.Points>(null)
  const mouseRef = useContext(MouseContext)
  const timeRef = useRef(0)
  const smoothTarget = useRef(new THREE.Vector3(0, 0, 0))

  const { corePositions, coreColors, shellPositions, shellColors, shellOriginalPositions, shellSeeds } = useMemo(() => {
    const corePositions = new Float32Array(CORE_COUNT * 3)
    const coreColors = new Float32Array(CORE_COUNT * 3)
    const shellPositions = new Float32Array(SHELL_COUNT * 3)
    const shellColors = new Float32Array(SHELL_COUNT * 3)
    const shellOriginalPositions = new Float32Array(SHELL_COUNT * 3)
    const shellSeeds = new Float32Array(SHELL_COUNT)

    // Core: bright orange glow (inner shine)
    const coreOrangeBright = new THREE.Color(1, 0.55, 0.2)
    const coreOrangeMid = new THREE.Color(1, 0.45, 0.12)
    const coreOrangeSoft = new THREE.Color(0.95, 0.35, 0.08)
    const orangeMid = new THREE.Color(0.9, 0.25, 0.05)
    const orangeDim = new THREE.Color(0.4, 0.1, 0.02)
    const dark = new THREE.Color(0.15, 0.04, 0)
    const shellOrangeReflect = new THREE.Color(0.95, 0.4, 0.1)

    let i = 0
    for (let k = 0; k < CORE_COUNT; k++) {
      const r = SPHERE_RADIUS * (0.15 + 0.45 * Math.cbrt(Math.random()))
      const theta = Math.acos(2 * Math.random() - 1)
      const phi = Math.random() * Math.PI * 2
      corePositions[i * 3] = r * Math.sin(theta) * Math.cos(phi)
      corePositions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi)
      corePositions[i * 3 + 2] = r * Math.cos(theta)
      const t = r / CORE_RADIUS_MAX
      const c = coreOrangeBright.clone().lerp(coreOrangeMid, t * 0.5).lerp(coreOrangeSoft, Math.max(0, t - 0.2))
      coreColors[i * 3] = c.r
      coreColors[i * 3 + 1] = c.g
      coreColors[i * 3 + 2] = c.b
      i++
    }

    const phi = Math.PI * (3 - Math.sqrt(5))
    for (let k = 0; k < SHELL_COUNT; k++) {
      const yUnit = 1 - (k / Math.max(1, SHELL_COUNT - 1)) * 2
      const radiusCircle = SPHERE_RADIUS * Math.sqrt(Math.max(0, 1 - yUnit * yUnit))
      const theta = phi * k
      const x = Math.cos(theta) * radiusCircle
      const z = Math.sin(theta) * radiusCircle
      const y = SPHERE_RADIUS * yUnit
      shellPositions[k * 3] = x
      shellPositions[k * 3 + 1] = y
      shellPositions[k * 3 + 2] = z
      shellOriginalPositions[k * 3] = x
      shellOriginalPositions[k * 3 + 1] = y
      shellOriginalPositions[k * 3 + 2] = z
      shellSeeds[k] = (k * 0.12345) % 1
      const base = orangeMid.clone().lerp(orangeDim, Math.random()).lerp(dark, 0.35)
      const c = base.clone().lerp(shellOrangeReflect, 0.42)
      shellColors[k * 3] = c.r
      shellColors[k * 3 + 1] = c.g
      shellColors[k * 3 + 2] = c.b
    }

    return { corePositions, coreColors, shellPositions, shellColors, shellOriginalPositions, shellSeeds }
  }, [])

  useFrame((state, delta) => {
    const group = groupRef.current
    const shellPoints = shellPointsRef.current
    const shellGeom = shellPoints?.geometry
    if (!group || !shellPoints || !shellGeom) return

    timeRef.current += delta * NOISE_SPEED
    const t = timeRef.current

    group.rotation.y += delta * AUTO_ROTATE_SPEED

    const posAttr = shellGeom.getAttribute('position') as THREE.BufferAttribute
    if (!posAttr) return

    const posArray = posAttr.array as Float32Array
    const mx = mouseRef?.current?.x ?? 0
    const my = mouseRef?.current?.y ?? 0

    const camera = state.camera
    const v = new THREE.Vector3(mx, my, 0.5)
    v.unproject(camera)
    const dir = v.sub(camera.position).normalize()
    const dist = 2.2
    const worldTarget = new THREE.Vector3(
      camera.position.x + dir.x * dist,
      camera.position.y + dir.y * dist,
      camera.position.z + dir.z * dist
    )
    shellPoints.worldToLocal(worldTarget)
    smoothTarget.current.x += (worldTarget.x - smoothTarget.current.x) * SMOOTH_MOUSE
    smoothTarget.current.y += (worldTarget.y - smoothTarget.current.y) * SMOOTH_MOUSE
    smoothTarget.current.z += (worldTarget.z - smoothTarget.current.z) * SMOOTH_MOUSE
    const tx = smoothTarget.current.x
    const ty = smoothTarget.current.y
    const tz = smoothTarget.current.z

    for (let i = 0; i < SHELL_COUNT; i++) {
      const ix = i * 3
      const ox = shellOriginalPositions[ix]
      const oy = shellOriginalPositions[ix + 1]
      const oz = shellOriginalPositions[ix + 2]
      const seed = shellSeeds[i]
      const nx = valueNoise3(ox * NOISE_SCALE + t + seed * 10, oy * NOISE_SCALE + t, oz * NOISE_SCALE + t - seed * 10)
      const disp = 1 + nx * NOISE_STRENGTH
      let px = ox * disp
      let py = oy * disp
      let pz = oz * disp
      const dx = px - tx
      const dy = py - ty
      const dz = pz - tz
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-5
      const tRepel = d / REPEL_RADIUS
      const influence = Math.max(0, 1 - tRepel * tRepel)
      const push = (REPEL_STRENGTH * influence) / d
      posArray[ix] = px + dx * push
      posArray[ix + 1] = py + dy * push
      posArray[ix + 2] = pz + dz * push
    }
    posAttr.needsUpdate = true
  })

  const coreGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(corePositions, 3))
    g.setAttribute('color', new THREE.BufferAttribute(coreColors, 3))
    return g
  }, [corePositions, coreColors])

  const shellGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(shellPositions, 3))
    g.setAttribute('color', new THREE.BufferAttribute(shellColors, 3))
    return g
  }, [shellPositions, shellColors])

  const circleTexture = useMemo(() => {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.95)')
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.4)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [])

  const glowTexture = useMemo(() => {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.15, 'rgba(255,255,255,0.98)')
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.7)')
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.25)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [])

  return (
    <group ref={groupRef}>
      <points>
        <primitive object={coreGeometry} attach="geometry" />
        <pointsMaterial
          size={0.058}
          map={glowTexture}
          vertexColors
          transparent
          opacity={0.88}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <points ref={shellPointsRef}>
        <primitive object={shellGeometry} attach="geometry" />
        <pointsMaterial
          size={0.028}
          map={circleTexture}
          vertexColors
          transparent
          opacity={0.82}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

function Starfield() {
  const { positions, colors } = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []
    const white = new THREE.Color(1, 1, 1)
    const blue = new THREE.Color(0.7, 0.8, 1)
    let placed = 0
    while (placed < STAR_COUNT) {
      const theta = Math.acos(2 * Math.random() - 1)
      const phi = Math.random() * Math.PI * 2
      const r = STAR_RADIUS * Math.cbrt(Math.random())
      const z = r * Math.cos(theta)
      if (z > 0) continue
      const x = r * Math.sin(theta) * Math.cos(phi)
      const y = r * Math.sin(theta) * Math.sin(phi)
      positions.push(x, y, z)
      const c = white.clone().lerp(blue, Math.random() * 0.4)
      colors.push(c.r, c.g, c.b)
      placed++
    }
    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
    }
  }, [])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return g
  }, [positions, colors])

  const starTexture = useMemo(() => {
    const size = 32
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0, 'rgba(255,255,255,0.92)')
    g.addColorStop(0.35, 'rgba(255,255,255,0.35)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    return new THREE.CanvasTexture(canvas)
  }, [])

  return (
    <points renderOrder={0}>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial
        size={0.055}
        map={starTexture}
        vertexColors
        transparent
        opacity={0.78}
        sizeAttenuation
        depthWrite={true}
        depthTest={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function CosmicFog() {
  const { scene } = useThree()
  useEffect(() => {
    const fog = new THREE.FogExp2(0x0a0a12, 0.028)
    scene.fog = fog
    return () => {
      scene.fog = null
    }
  }, [scene])
  return null
}

export function HeroScene() {
  return (
    <>
      <CosmicFog />
      <ambientLight intensity={0.22} />
      <directionalLight position={[2, 4, 5]} intensity={1} />
      <pointLight position={[0, 0, 0]} color="#FF4D00" intensity={8} distance={5} />
      <pointLight position={[0, 0, 0]} color="#ff6b35" intensity={4} distance={4} />
      <pointLight position={[-2, 1, 2]} color="#FF4D00" intensity={1.2} />
      <pointLight position={[2, -0.5, 2]} color="#ff8c42" intensity={0.8} />
      <Starfield />
      <ParticleSphere />
      <EffectComposer>
        <Bloom luminanceThreshold={0.18} luminanceSmoothing={0.5} intensity={0.65} mipmapBlur />
      </EffectComposer>
    </>
  )
}
