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
    renderer.toneMappingExposure = 1.2
    root.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0a0a0b, 0.12)

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200)
    camera.position.set(0, 0.5, 4)

    // ── Lighting ──
    const ambient = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambient)

    const dirRed = new THREE.DirectionalLight(0xdc2626, 2.0)
    dirRed.position.set(3, 3, 2)
    scene.add(dirRed)

    const dirBlue = new THREE.DirectionalLight(0x3b82f6, 0.6)
    dirBlue.position.set(-3, 2, -1)
    scene.add(dirBlue)

    const pointCenter = new THREE.PointLight(0xdc2626, 3, 8, 2)
    pointCenter.position.set(0, 0, 1)
    scene.add(pointCenter)

    const rimLight = new THREE.SpotLight(0xef4444, 1.5, 12, Math.PI / 4, 0.5)
    rimLight.position.set(-4, 3, -2)
    scene.add(rimLight)

    // ── Materials ──
    const redMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, metalness: 0.8, roughness: 0.15,
      emissive: 0xdc2626, emissiveIntensity: 0.6,
    })

    const darkRedMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b, metalness: 0.7, roughness: 0.2,
      emissive: 0x991b1b, emissiveIntensity: 0.3,
    })

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xf3f4f6, metalness: 0.1, roughness: 0.1,
      transparent: true, opacity: 0.15,
      emissive: 0xffffff, emissiveIntensity: 0.1,
    })

    const holoMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, metalness: 0.9, roughness: 0.05,
      transparent: true, opacity: 0.3,
      emissive: 0xdc2626, emissiveIntensity: 0.15,
      envMapIntensity: 2,
    })

    // ── Cards (ID card shapes) ──
    const group = new THREE.Group()
    scene.add(group)

    const cardGeo = new THREE.BoxGeometry(1.1, 0.62, 0.05)
    const cardConfigs = [
      { pos: [-1.1, 0.3, 0], rot: [0.1, -0.3, 0.05], mat: redMat },
      { pos: [1.1, 0.15, -0.1], rot: [-0.05, 0.4, -0.03], mat: holoMat },
      { pos: [-0.5, -0.2, 0.25], rot: [0.15, 0.2, 0.08], mat: glassMat },
      { pos: [0.5, -0.4, 0.15], rot: [-0.1, -0.15, -0.05], mat: darkRedMat },
    ]

    const cards: THREE.Mesh[] = cardConfigs.map((c) => {
      const m = new THREE.Mesh(cardGeo, c.mat)
      m.position.set(c.pos[0], c.pos[1], c.pos[2])
      m.rotation.set(c.rot[0], c.rot[1], c.rot[2])
      group.add(m)
      return m
    })

    // ── Torus Rings (neon glow) ──
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, metalness: 0.6, roughness: 0.1,
      emissive: 0xdc2626, emissiveIntensity: 0.8,
      transparent: true, opacity: 0.6,
    })

    const rings: THREE.Mesh[] = []
    const ringCount = 8
    for (let i = 0; i < ringCount; i++) {
      const r = 0.6 + i * 0.08
      const geo = new THREE.TorusGeometry(r, 0.015 + i * 0.003, 16, 100)
      const mat = ringMat.clone()
      mat.emissiveIntensity = 0.5 + (ringCount - i) * 0.1
      mat.opacity = 0.3 + (ringCount - i) * 0.08
      const ring = new THREE.Mesh(geo, mat)
      ring.rotation.x = Math.PI / 5 + i * 0.04
      ring.rotation.y = i * 0.15
      ring.position.set(0, -0.1, -0.5 + i * 0.15)
      group.add(ring)
      rings.push(ring)
    }

    // ── Floating Geometries ──
    const geoGroup = new THREE.Group()
    scene.add(geoGroup)

    const shapes: { mesh: THREE.Mesh; orbit: number; speed: number; axis: THREE.Vector3; phase: number }[] = []

    const shapeGeoList = [
      new THREE.OctahedronGeometry(0.12, 0),
      new THREE.IcosahedronGeometry(0.1, 0),
      new THREE.TetrahedronGeometry(0.11, 0),
      new THREE.DodecahedronGeometry(0.09, 0),
      new THREE.OctahedronGeometry(0.08, 0),
    ]

    const shapeMatList = [
      new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.9, roughness: 0.1, emissive: 0xdc2626, emissiveIntensity: 0.4 }),
      new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.85, roughness: 0.12, emissive: 0xef4444, emissiveIntensity: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.8, roughness: 0.15, emissive: 0x3b82f6, emissiveIntensity: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.2, emissive: 0xf59e0b, emissiveIntensity: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0xf3f4f6, metalness: 0.9, roughness: 0.05, emissive: 0xffffff, emissiveIntensity: 0.15 }),
    ]

    for (let i = 0; i < 5; i++) {
      const mesh = new THREE.Mesh(shapeGeoList[i], shapeMatList[i])
      const orbit = 1.8 + i * 0.4
      const speed = 0.3 + i * 0.12
      const phase = (i / 5) * Math.PI * 2
      const axis = new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      ).normalize()
      mesh.position.set(orbit * Math.cos(phase), 0, orbit * Math.sin(phase))
      geoGroup.add(mesh)
      shapes.push({ mesh, orbit, speed, axis, phase })
    }

    // ── Energy Lines (connecting shapes) ──
    const lineMat = new THREE.LineBasicMaterial({ color: 0xdc2626, transparent: true, opacity: 0.15 })
    const lineGeo = new THREE.BufferGeometry()
    const linePositions = new Float32Array(20 * 3)
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3))
    const energyLines = new THREE.LineSegments(lineGeo, lineMat)
    scene.add(energyLines)

    // ── Particle System (dual layer) ──
    // Background sparkles
    const sparkCount = 200
    const sparkGeo = new THREE.BufferGeometry()
    const sparkPos = new Float32Array(sparkCount * 3)
    const sparkSizes = new Float32Array(sparkCount)
    const sparkPhases = new Float32Array(sparkCount)
    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3] = (Math.random() - 0.5) * 12
      sparkPos[i * 3 + 1] = (Math.random() - 0.5) * 8
      sparkPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2
      sparkSizes[i] = 1 + Math.random() * 3
      sparkPhases[i] = Math.random() * Math.PI * 2
    }
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3))
    sparkGeo.setAttribute("aSize", new THREE.BufferAttribute(sparkSizes, 1))
    sparkGeo.setAttribute("aPhase", new THREE.BufferAttribute(sparkPhases, 1))

    const sparkMat = new THREE.PointsMaterial({
      color: 0xdc2626, size: 0.02, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const sparks = new THREE.Points(sparkGeo, sparkMat)
    scene.add(sparks)

    // Foreground floating orbs
    const orbCount = 30
    const orbGeo = new THREE.BufferGeometry()
    const orbPos = new Float32Array(orbCount * 3)
    const orbPhases2 = new Float32Array(orbCount)
    for (let i = 0; i < orbCount; i++) {
      orbPos[i * 3] = (Math.random() - 0.5) * 8
      orbPos[i * 3 + 1] = (Math.random() - 0.5) * 5
      orbPos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1
      orbPhases2[i] = Math.random() * Math.PI * 2
    }
    orbGeo.setAttribute("position", new THREE.BufferAttribute(orbPos, 3))

    const orbMat = new THREE.PointsMaterial({
      color: 0xef4444, size: 0.04, transparent: true, opacity: 0.3,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const orbs = new THREE.Points(orbGeo, orbMat)
    scene.add(orbs)

    // ── Light Beams ──
    const beamGroup = new THREE.Group()
    scene.add(beamGroup)

    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xdc2626, transparent: true, opacity: 0.04,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    })

    for (let i = 0; i < 6; i++) {
      const beamGeo = new THREE.PlaneGeometry(0.02, 8)
      const beam = new THREE.Mesh(beamGeo, beamMat)
      beam.position.set((i - 2.5) * 0.8, 0, -2)
      beam.rotation.z = (Math.random() - 0.5) * 0.3
      beamGroup.add(beam)
    }

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

      const speed = reduced ? 0.2 : 1.0

      // Smooth pointer
      pointer.x += (pointer.tx - pointer.x) * 0.08
      pointer.y += (pointer.ty - pointer.y) * 0.08

      const px = pointer.x
      const py = pointer.y

      // Camera subtle sway
      camera.position.x = px * 0.3
      camera.position.y = 0.5 - py * 0.2
      camera.lookAt(0, 0, 0)

      // Dynamic lights
      dirRed.position.x = 3 + Math.sin(t * 0.7) * 1.5
      dirRed.position.y = 3 + Math.cos(t * 0.5) * 1.0
      dirRed.intensity = 1.5 + Math.abs(px) * 0.8

      pointCenter.position.x = Math.sin(t * 0.4) * 0.5
      pointCenter.position.y = Math.cos(t * 0.3) * 0.3
      pointCenter.intensity = 2.5 + Math.sin(t * 2) * 0.8

      const si = reduced ? 0 : Math.max(0, Math.min(1, targetScroll / 800))

      if (!reduced) {
        // ── Cards float & orbit ──
        for (let i = 0; i < cards.length; i++) {
          const c = cards[i]
          const a = t * (0.5 + i * 0.15) + i * Math.PI * 0.5
          const floatY = Math.sin(a * 0.8) * 0.15
          const floatX = Math.cos(a * 0.6) * 0.08
          c.position.x = cardConfigs[i].pos[0] + floatX
          c.position.y = cardConfigs[i].pos[1] + floatY
          c.rotation.x = cardConfigs[i].rot[0] + Math.sin(a * 0.7) * 0.08
          c.rotation.y = cardConfigs[i].rot[1] + Math.cos(a * 0.5) * 0.12
          c.rotation.z = cardConfigs[i].rot[2] + Math.sin(a * 0.3) * 0.03
        }

        // ── Rings spin & breathe ──
        for (let i = 0; i < rings.length; i++) {
          const r = rings[i]
          const phase = t * (0.3 + i * 0.06) * speed
          r.rotation.z += dt * (0.4 + i * 0.07)
          r.rotation.y = Math.sin(phase * 0.3) * 0.2
          r.position.z = (-0.5 + i * 0.15) + Math.sin(t * 0.8 + i) * 0.04
          const scale = 1 + Math.sin(t * 1.5 + i * 0.5) * 0.03
          r.scale.set(scale, scale, 1)
        }

        // ── Floating shapes orbit ──
        for (let i = 0; i < shapes.length; i++) {
          const s = shapes[i]
          const a = t * s.speed + s.phase
          s.mesh.position.x = s.orbit * Math.cos(a) * 0.6
          s.mesh.position.y = Math.sin(a * 0.7 + s.phase) * 0.5
          s.mesh.position.z = s.orbit * Math.sin(a) * 0.4 - 1
          s.mesh.rotation.x += dt * (0.8 + i * 0.2)
          s.mesh.rotation.y += dt * (0.5 + i * 0.15)
        }

        // ── Energy lines between shapes ──
        const linePosAttr = energyLines.geometry.attributes.position as THREE.BufferAttribute
        let lineIdx = 0
        for (let i = 0; i < shapes.length && lineIdx < 20; i++) {
          for (let j = i + 1; j < shapes.length && lineIdx < 20; j++) {
            const dist = shapes[i].mesh.position.distanceTo(shapes[j].mesh.position)
            if (dist < 4) {
              linePosAttr.array[lineIdx * 3] = shapes[i].mesh.position.x
              linePosAttr.array[lineIdx * 3 + 1] = shapes[i].mesh.position.y
              linePosAttr.array[lineIdx * 3 + 2] = shapes[i].mesh.position.z
              linePosAttr.array[(lineIdx + 1) * 3] = shapes[j].mesh.position.x
              linePosAttr.array[(lineIdx + 1) * 3 + 1] = shapes[j].mesh.position.y
              linePosAttr.array[(lineIdx + 1) * 3 + 2] = shapes[j].mesh.position.z
              lineIdx += 2
            }
          }
        }
        linePosAttr.needsUpdate = true
        energyLines.geometry.setDrawRange(0, lineIdx)
        lineMat.opacity = 0.08 + Math.sin(t * 1.5) * 0.05

        // ── Particles drift ──
        const sPos = sparks.geometry.attributes.position.array as Float32Array
        for (let i = 0; i < sparkCount; i++) {
          const phase = sparkPhases[i]
          sPos[i * 3] += Math.sin(t * 0.3 + phase) * 0.001
          sPos[i * 3 + 1] += Math.cos(t * 0.5 + phase * 2) * 0.0008
          sPos[i * 3 + 2] += Math.sin(t * 0.2 + phase * 0.5) * 0.0005
          // Wrap
          if (sPos[i * 3] > 6) sPos[i * 3] = -6
          if (sPos[i * 3] < -6) sPos[i * 3] = 6
          if (sPos[i * 3 + 1] > 4) sPos[i * 3 + 1] = -4
          if (sPos[i * 3 + 1] < -4) sPos[i * 3 + 1] = 4
        }
        sparks.geometry.attributes.position.needsUpdate = true

        // Orbs pulse
        const oPos = orbs.geometry.attributes.position.array as Float32Array
        for (let i = 0; i < orbCount; i++) {
          oPos[i * 3 + 1] += Math.sin(t * 0.8 + orbPhases2[i]) * 0.002
          oPos[i * 3] += Math.cos(t * 0.4 + orbPhases2[i] * 1.3) * 0.001
        }
        orbs.geometry.attributes.position.needsUpdate = true
        sparkMat.opacity = 0.4 + Math.sin(t * 2) * 0.15

        // Beam sway
        beamGroup.rotation.z = Math.sin(t * 0.3) * 0.05
        beamMat.opacity = 0.03 + Math.sin(t * 0.8) * 0.02
      }

      // Group tilt follows mouse
      group.rotation.x = (-py * 0.2) * (reduced ? 0.3 : 1)
      group.rotation.y = (px * 0.3) * (reduced ? 0.3 : 1)
      group.position.y = Math.sin(t * 0.5) * 0.05 * speed

      // Parallax with scroll
      camera.position.z = 4 - si * 0.3
      group.rotation.x += si * 0.1

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