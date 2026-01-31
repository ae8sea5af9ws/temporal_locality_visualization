import { createNoise2D } from "./noise.js"
import { seededRandom, distance } from "./utils.js"
import { AGENT_SIGHT_RADIUS } from "./config.js"

export function generateWorld(difficultyPreset, seed, width, height) {
  const rng = seededRandom(seed)
  const noise = createNoise2D(seed)
  const margin = 30

  const { noiseScale, gapExponent, dotCount, minDotDist } = difficultyPreset
  const minDistSq = minDotDist * minDotDist

  // generate states via rejection sampling + min distance filtering
  const states = []
  let attempts = 0
  const maxAttempts = dotCount * 40

  while (states.length < dotCount && attempts < maxAttempts) {
    attempts++
    const x = margin + rng() * (width - margin * 2)
    const y = margin + rng() * (height - margin * 2)
    const n = noise(x * noiseScale, y * noiseScale)

    // map noise [-1,1] to [0,1], then raise to exponent
    // low exponent = uniform, high exponent = only noise peaks get dots
    const density = Math.pow((n + 1) / 2, gapExponent)
    if (rng() > density) continue

    let tooClose = false
    for (let i = states.length - 1; i >= Math.max(0, states.length - 80); i--) {
      const dx = states[i].x - x
      const dy = states[i].y - y
      if (dx * dx + dy * dy < minDistSq) {
        tooClose = true
        break
      }
    }
    if (tooClose) continue

    states.push({ x, y, id: states.length })
  }

  // spatial index
  const spatialIndex = buildSpatialIndex(states, AGENT_SIGHT_RADIUS)

  // single objective — pick a state far from center
  let objective = null
  if (states.length > 0) {
    const cx = width / 2
    const cy = height / 2
    const sorted = states.slice().sort(
      (a, b) => distance(b, { x: cx, y: cy }) - distance(a, { x: cx, y: cy })
    )
    const pick = sorted[Math.floor(rng() * Math.min(10, sorted.length))]
    objective = { x: pick.x, y: pick.y }
  }

  return { states, objective, spatialIndex, width, height }
}

export function buildSpatialIndex(states, cellSize) {
  const grid = new Map()

  function key(cx, cy) {
    return cx + "," + cy
  }

  for (const state of states) {
    const cx = Math.floor(state.x / cellSize)
    const cy = Math.floor(state.y / cellSize)
    const k = key(cx, cy)
    if (!grid.has(k)) grid.set(k, [])
    grid.get(k).push(state)
  }

  return {
    query(x, y, radius) {
      const results = []
      const r2 = radius * radius
      const cx = Math.floor(x / cellSize)
      const cy = Math.floor(y / cellSize)
      const span = Math.ceil(radius / cellSize)
      for (let dx = -span; dx <= span; dx++) {
        for (let dy = -span; dy <= span; dy++) {
          const bucket = grid.get(key(cx + dx, cy + dy))
          if (!bucket) continue
          for (const s of bucket) {
            const ddx = s.x - x
            const ddy = s.y - y
            if (ddx * ddx + ddy * ddy <= r2) {
              results.push(s)
            }
          }
        }
      }
      return results
    },
  }
}

export function findNearestState(x, y, states) {
  let best = null
  let bestD = Infinity
  for (const s of states) {
    const dx = s.x - x
    const dy = s.y - y
    const d = dx * dx + dy * dy
    if (d < bestD) {
      bestD = d
      best = s
    }
  }
  return best
}
