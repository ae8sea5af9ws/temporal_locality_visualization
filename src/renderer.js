import { withAlpha } from "./colors.js"
import {
  STATE_DOT_RADIUS,
  OBJECTIVE_RADIUS,
  AGENT_TRIANGLE_SIZE,
  BG_COLOR,
  MAX_TOKENS_PER_STEP,
  RAG_LINE_THICKNESS,
} from "./config.js"

const TAU = Math.PI * 2

export function createRenderer(canvas) {
  const ctx = canvas.getContext("2d")

  function render(world, agents) {
    const w = canvas.width
    const h = canvas.height

    // 1. clear
    ctx.fillStyle = BG_COLOR
    ctx.fillRect(0, 0, w, h)

    // 2. state dots
    ctx.fillStyle = "rgba(255,255,255,0.22)"
    for (const s of world.states) {
      ctx.beginPath()
      ctx.arc(s.x, s.y, STATE_DOT_RADIUS, 0, TAU)
      ctx.fill()
    }

    // 3. trails
    ctx.lineCap = "round"
    for (const agent of agents) {
      if (!agent.enabled) continue
      const trail = agent.trail
      if (trail.length < 2) continue

      for (let i = 1; i < trail.length; i++) {
        const prev = trail[i - 1]
        const curr = trail[i]
        const tokens = curr.step ? curr.step.tokens : 0
        if (tokens <= 0) continue

        const isRag = curr.step && curr.step.isRag
        const thickness = isRag ? RAG_LINE_THICKNESS : tokens
        const alpha = isRag ? 0.3 : tokens / MAX_TOKENS_PER_STEP

        ctx.beginPath()
        ctx.moveTo(prev.x, prev.y)
        ctx.lineTo(curr.x, curr.y)
        ctx.strokeStyle = withAlpha(agent.color, alpha * 0.7)
        ctx.lineWidth = thickness
        ctx.stroke()
      }
    }

    // 4. visited state rings
    for (const agent of agents) {
      if (!agent.enabled) continue
      const steps = agent.tokenManager.steps
      if (!steps) continue

      ctx.lineWidth = 1.2
      for (const s of steps) {
        if (s.tokens <= 0) continue
        const state = world.states[s.stateId]
        if (!state) continue

        const alpha = s.isRag ? 0.15 : (s.tokens / MAX_TOKENS_PER_STEP) * 0.5
        ctx.beginPath()
        ctx.arc(state.x, state.y, STATE_DOT_RADIUS + 3, 0, TAU)
        ctx.strokeStyle = withAlpha(agent.color, alpha)
        ctx.stroke()
      }
    }

    // 5. objective — simple pulsing ring
    if (world.objective) {
      const obj = world.objective
      ctx.beginPath()
      ctx.arc(obj.x, obj.y, OBJECTIVE_RADIUS, 0, TAU)
      ctx.strokeStyle = "rgba(255,255,255,0.6)"
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(obj.x, obj.y, 3, 0, TAU)
      ctx.fillStyle = "rgba(255,255,255,0.4)"
      ctx.fill()
    }

    // 6. agent triangles
    const size = AGENT_TRIANGLE_SIZE
    for (const agent of agents) {
      if (!agent.enabled || agent.finished) continue

      ctx.save()
      ctx.translate(agent.x, agent.y)
      ctx.rotate(agent.angle)
      ctx.beginPath()
      ctx.moveTo(size, 0)
      ctx.lineTo(-size * 0.5, -size * 0.6)
      ctx.lineTo(-size * 0.5, size * 0.6)
      ctx.closePath()
      ctx.fillStyle = agent.color
      ctx.fill()
      ctx.restore()
    }
  }

  return { render }
}
