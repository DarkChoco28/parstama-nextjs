"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const w = root.clientWidth
    const h = root.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(w, h)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    root.appendChild(renderer.domElement)

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200)
    camera.position.set(0, 0, 6)

    // ── Lighting ──
    const ambient = new THREE.AmbientLight(0xffffff, 0.25)
    scene.add(ambient)

    const dirRed = new THREE.DirectionalLight(0xdc2626, 1.2)
    dirRed.position.set(4, 3, 2)
    scene.add(dirRed)

    const dirBlue = new THREE.DirectionalLight(0x3b82f6, 0.3)
    dirBlue.position.set(-4, 2, -1)
    scene.add(dirBlue)

    const pointCenter = new THREE.PointLight(0xdc2626, 1.5, 10, 2)
    pointCenter.position.set(0, 0, 2)
    scene.add(pointCenter)

    // ── Materials ──
    const redMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, metalness: 0.7, roughness: 0.2,
      emissive: 0xdc2626, emissiveIntensity: 0.4,
      transparent: true, opacity: 0.6,
    })

    const darkRedMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b, metalness: 0.6, roughness: 0.25,
      emissive: 0x991b1b, emissiveIntensity: 0.2,
      transparent: true, opacity: 0.5,
    })

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xf3f4f6, metalness: 0.1, roughness: 0.1,
      transparent: true, opacity: 0.1,
    })

    const holoMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, metalness: 0.85, roughness: 0.08,
      transparent: true, opacity: 0.15,
      emissive: 0xdc2626, emissiveIntensity: 0.1,
    })

    // ── Group ──
    const group = new THREE.Group()
    scene.add(group)

    // ── Cards (small, pushed to edges) ──
    const cardGeo = new THREE.BoxGeometry(0.7, 0.4, 0.03)
    const cardConfigs = [
      { pos: [-2.8, 0.8, -1], rot: [0.15, -0.4, 0.05], mat: redMat },
      { pos: [2.8, 0.6, -1.2], rot: [-0.08, 0.5, -0.03], mat: holoMat },
      { pos: [-2.2, -0.9, -0.5], rot: [0.1, 0.3, 0.08], mat: glassMat },
      { pos: [2.4, -0.7, -0.8], rot: [-0.12, -0.2, -0.05], mat: darkRedMat },
    ]

    const cards: THREE.Mesh[] = cardConfigs.map((c) => {
      const m = new THREE.Mesh(cardGeo, c.mat)
      m.position.set(c.pos[0], c.pos[1], c.pos[2])
      m.rotation.set(c.rot[0], c.rot[1], c.rot[2])
      group.add(m)
      return m
    })

    // ── Torus Rings (thin, background) ──
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, metalness: 0.5, roughness: 0.15,
      emissive: 0xdc2626, emissiveIntensity: 0.3,
      transparent: true, opacity: 0.25,
    })

    const rings: THREE.Mesh[] = []
    const ringCount = 6
    for (let i = 0; i < ringCount; i++) {
      const r = 1.2 + i * 0.15
      const geo = new THREE.TorusGeometry(r, 0.008 + i * 0.002, 12, 100)
      const mat = ringMat.clone()
      mat.emissiveIntensity = 0.2 + (ringCount - i) * 0.05
      mat.opacity = 0.12 + (ringCount - i) * 0.03
      const ring = new THREE.Mesh(geo, mat)
      ring.rotation.x = Math.PI / 4.5 + i * 0.03
      ring.rotation.y = i * 0.12
      ring.position.set(0, 0, -2 + i * 0.3)
      group.add(ring)
      rings.push(ring)
    }

    // ── Floating Geometries (small, scattered far) ──
    const geoGroup = new THREE.Group()
    scene.add(geoGroup)

    const shapes: { mesh: THREE.Mesh; orbit: number; speed: number; phase: number }[] = []

    const shapeGeoList = [
      new THREE.OctahedronGeometry(0.06, 0),
      new THREE.IcosahedronGeometry(0.05, 0),
      new THREE.TetrahedronGeometry(0.055, 0),
      new THREE.DodecahedronGeometry(0.045, 0),
      new THREE.OctahedronGeometry(0.04, 0),
      new THREE.IcosahedronGeometry(0.035, 0),
    ]

    const shapeMatList = [
      new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.8, roughness: 0.15, emissive: 0xdc2626, emissiveIntensity: 0.3, transparent: true, opacity: 0.5 }),
      new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.75, roughness: 0.18, emissive: 0xef4444, emissiveIntensity: 0.2, transparent: true, opacity: 0.4 }),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.7, roughness: 0.2, emissive: 0x3b82f6, emissiveIntensity: 0.15, transparent: true, opacity: 0.35 }),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.65, roughness: 0.22, emissive: 0xf59e0b, emissiveIntensity: 0.15, transparent: true, opacity: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0xf3f4f6, metalness: 0.85, roughness: 0.08, emissive: 0xffffff, emissiveIntensity: 0.1, transparent: true, opacity: 0.25 }),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.7, roughness: 0.2, emissive: 0xdc2626, emissiveIntensity: 0.2, transparent: true, opacity: 0.35 }),
    ]

    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(shapeGeoList[i], shapeMatList[i])
      const orbit = 3.0 + i * 0.5
      const speed = 0.2 + i * 0.08
      const phase = (i / 6) * Math.PI * 2
      mesh.position.set(orbit * Math.cos(phase), orbit * Math.sin(phase) * 0.5, -2 + i * 0.2)
      geoGroup.add(mesh)
      shapes.push({ mesh, orbit, speed, phase })
    }

    // ── Particles (subtle) ──
    const sparkCount = 120
    const sparkGeo = new THREE.BufferGeometry()
    const sparkPos = new Float32Array(sparkCount * 3)
    const sparkPhases = new Float32Array(sparkCount)
    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3] = (Math.random() - 0.5) * 16
      sparkPos[i * 3 + 1] = (Math.random() - 0.5) * 10
      sparkPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 3
      sparkPhases[i] = Math.random() * Math.PI * 2
    }
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3))

    const sparkMat = new THREE.PointsMaterial({
      color: 0xdc2626, size: 0.012, transparent: true, opacity: 0.3,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const sparks = new THREE.Points(sparkGeo, sparkMat)
    scene.add(sparks)

    // ── Mouse / Scroll ──
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    const onPointerMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect()
      pointer.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      pointer.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    }
    root.addEventListener("pointermove", onPointerMove, { passive: true })

    let targetScroll = 0
    const onScroll = () => { targetScroll = window.scrollY || 0 }
    window.addEventListener("scroll", onScroll, { passive: true })

    // ── Animation ──
    let last = performance.now()
    let t = 0
    let rafId = 0

    const resize = () => {
      const rw = root.clientWidth
      const rh = root.clientHeight
      renderer.setSize(rw, rh)
      camera.aspect = rw / rh
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(() => resize())
    ro.observe(root)

    const animate = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      t += dt

      // Smooth pointer
      pointer.x += (pointer.tx - pointer.x) * 0.06
      pointer.y += (pointer.ty - pointer.y) * 0.06

      const px = pointer.x
      const py = pointer.y

      // Camera subtle sway
      camera.position.x = px * 0.15
      camera.position.y = py * 0.1
      camera.lookAt(0, 0, -1)

      // Dynamic lights (subtle)
      dirRed.position.x = 4 + Math.sin(t * 0.5) * 0.8
      dirRed.intensity = 1.0 + Math.abs(px) * 0.3

      pointCenter.position.x = Math.sin(t * 0.3) * 0.3
      pointCenter.intensity = 1.2 + Math.sin(t * 1.5) * 0.3

      const si = reduced ? 0 : Math.max(0, Math.min(1, targetScroll / 800))

      if (!reduced) {
        // Cards float gently
        for (let i = 0; i < cards.length; i++) {
          const c = cards[i]
          const a = t * (0.3 + i * 0.1) + i * Math.PI * 0.5
          c.position.x = cardConfigs[i].pos[0] + Math.cos(a * 0.5) * 0.05
          c.position.y = cardConfigs[i].pos[1] + Math.sin(a * 0.4) * 0.08
          c.rotation.x = cardConfigs[i].rot[0] + Math.sin(a * 0.3) * 0.04
          c.rotation.y = cardConfigs[i].rot[1] + Math.cos(a * 0.25) * 0.06
        }

        // Rings spin slowly
        for (let i = 0; i < rings.length; i++) {
          const ring = rings[i]
          ring.rotation.z += dt * (0.15 + i * 0.03)
          ring.rotation.y = Math.sin(t * 0.2 + i * 0.3) * 0.1
          ring.position.z = (-2 + i * 0.3) + Math.sin(t * 0.5 + i) * 0.02
        }

        // Shapes orbit slowly
        for (let i = 0; i < shapes.length; i++) {
          const s = shapes[i]
          const a = t * s.speed + s.phase
          s.mesh.position.x = s.orbit * Math.cos(a) * 0.4
          s.mesh.position.y = s.orbit * Math.sin(a * 0.7) * 0.3
          s.mesh.position.z = -2 + Math.sin(a * 0.3) * 0.5
          s.mesh.rotation.x += dt * 0.4
          s.mesh.rotation.y += dt * 0.3
        }

        // Particles drift
        const sPos = sparks.geometry.attributes.position.array as Float32Array
        for (let i = 0; i < sparkCount; i++) {
          const phase = sparkPhases[i]
          sPos[i * 3] += Math.sin(t * 0.2 + phase) * 0.0005
          sPos[i * 3 + 1] += Math.cos(t * 0.3 + phase * 2) * 0.0004
          if (sPos[i * 3] > 8) sPos[i * 3] = -8
          if (sPos[i * 3] < -8) sPos[i * 3] = 8
          if (sPos[i * 3 + 1] > 5) sPos[i * 3 + 1] = -5
          if (sPos[i * 3 + 1] < -5) sPos[i * 3 + 1] = 5
        }
        sparks.geometry.attributes.position.needsUpdate = true
        sparkMat.opacity = 0.2 + Math.sin(t * 1.5) * 0.08
      }

      // Group tilt follows mouse (very subtle)
      group.rotation.x = (-py * 0.08) * (reduced ? 0.3 : 1)
      group.rotation.y = (px * 0.1) * (reduced ? 0.3 : 1)

      // Scroll parallax
      camera.position.z = 6 - si * 0.3
      group.position.y = si * 0.05

      renderer.render(scene, camera)
      rafId = requestAnimationFrame(animate)
    }

    if (!reduced) {
      rafId = requestAnimationFrame(animate)
    } else {
      renderer.render(scene, camera)
    }

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(rafId)
      else { last = performance.now(); rafId = requestAnimationFrame(animate) }
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      root.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("visibilitychange", onVisibility)
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden"
      style={{ pointerEvents: "auto" }}
    />
  )
}