type ParticleMode = 'convergence' | 'burst' | 'fall'
type Particle = { angle: number; speed: number; depth: number; color: number }

/** Canvas has no clock of its own: the owning GSAP timeline draws and stops it. */
export function createFinaleParticles(canvas: HTMLCanvasElement | null, colors: () => [string, string]) {
  let context: CanvasRenderingContext2D | null = null, width = 0, height = 0, ratio = 1
  try { context = canvas?.getContext('2d', { alpha: true }) ?? null } catch { /* Static seal remains usable. */ }
  const particles: Particle[] = Array.from({ length: 156 }, (_, index) => ({
    angle: index * 2.3999632297, speed: 85 + index * 43 % 230,
    depth: .5 + index * 17 % 100 / 100, color: index % 3,
  }))
  function clear() { if (context) context.clearRect(0, 0, width, height) }
  function resize() {
    if (!canvas || !context) return
    const bounds = canvas.getBoundingClientRect()
    width = Math.max(1, bounds.width); height = Math.max(1, bounds.height)
    ratio = Math.min(window.devicePixelRatio || 1, 1.5)
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio)
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
  }
  function draw(elapsed: number, mode: ParticleMode, clan = 0) {
    if (!context || !width || !height) return
    clear()
    const palette = [...colors(), '#ffe5a0'], centerX = width / 2, centerY = height * .49
    context.save(); context.globalCompositeOperation = 'lighter'
    if (mode === 'convergence') {
      const progress = Math.min(1, Math.max(0, elapsed / 4.5))
      for (let clan = 0; clan < 2; clan++) {
        const direction = clan ? 1 : -1
        for (let trail = 0; trail < 46; trail++) {
          const p = ((elapsed * .27 + trail / 46) % 1), radius = (1 - p) * width * .44 * (1 - progress * .45)
          const angle = p * Math.PI * 2.2 + elapsed * .7 + clan * Math.PI
          const x = centerX + direction * radius, y = centerY + Math.sin(angle) * height * .15 * (1 - p)
          context.globalAlpha = Math.sin(p * Math.PI) * .65
          context.strokeStyle = palette[clan]!; context.lineWidth = 1 + p * 2
          context.beginPath(); context.moveTo(x, y)
          context.lineTo(x + direction * (8 + p * 12), y + Math.cos(angle) * 5); context.stroke()
        }
      }
    } else if (mode === 'fall') {
      const age = Math.max(0, elapsed), fade = Math.max(0, 1 - age / 3.5), side = clan ? 1 : -1
      for (let index = 0; index < 64; index++) {
        const particle = particles[index]!
        const x = centerX + side * width * (.05 + particle.depth * .13) + Math.cos(particle.angle) * age * 18
        const y = centerY - height * .1 + Math.sin(particle.angle) * height * .09 + age * age * (20 + particle.speed * .04)
        context.globalAlpha = fade * Math.min(1, age * 3) * .65
        context.strokeStyle = palette[clan]!; context.lineWidth = particle.depth * 1.7
        context.beginPath(); context.moveTo(x, y); context.lineTo(x - side * 2, y - 5 * particle.depth); context.stroke()
      }
    } else {
      const age = Math.max(0, elapsed), fade = Math.max(0, 1 - age / 3.3)
      for (let index = 0; index < particles.length; index++) {
        const particle = particles[index]!
        const distance = particle.speed * age * particle.depth * (1.25 / (1 + age * .15))
        const x = centerX + Math.cos(particle.angle) * distance, y = centerY + Math.sin(particle.angle) * distance * .62 + age * age * 12
        context.globalAlpha = fade * Math.min(1, age * 4)
        // Warm near-plane shards and cooler distant streaks create depth without a larger particle budget.
        context.strokeStyle = index % 4 === 0 ? '#89e6e1' : palette[particle.color]!; context.lineWidth = particle.depth * (index % 5 === 0 ? 3 : 1.6)
        context.beginPath(); context.moveTo(x, y)
        if (index % 5 === 0) {
          const edge = (3 + age * 2) * particle.depth
          context.lineTo(x + edge, y - edge * .4); context.lineTo(x + edge * .6, y + edge)
          context.lineTo(x, y)
        } else {
          context.lineTo(x - Math.cos(particle.angle) * (22 + age * 8) * particle.depth, y - Math.sin(particle.angle) * 14 * particle.depth)
        }
        context.stroke()
      }
    }
    context.restore()
  }
  return { available: !!context, resize, clear, draw, dispose() { clear(); context = null } }
}
