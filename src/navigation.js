import { distance, normalize2, dot2 } from "./utils.js"
import { AGENT_SIGHT_RADIUS, OBJECTIVE_COLLECT_RADIUS } from "./config.js"

export function chooseNextState(agent, world, rng) {
  if (agent.finished) return null
  if (!world.objective) return null

  const objective = world.objective
  const candidates = world.spatialIndex.query(agent.x, agent.y, AGENT_SIGHT_RADIUS)
  if (candidates.length === 0) return null

  const dirToObj = normalize2(objective.x - agent.x, objective.y - agent.y)

  let best = null
  let bestScore = -Infinity
  let fallback = null
  let fallbackScore = -Infinity

  for (const c of candidates) {
    if (c.x === agent.x && c.y === agent.y) continue

    const dirToCand = normalize2(c.x - agent.x, c.y - agent.y)
    const alignment = dot2(dirToObj.x, dirToObj.y, dirToCand.x, dirToCand.y)

    const distToObj = distance(c, objective)
    const maxDist = AGENT_SIGHT_RADIUS * 4
    const proximity = 1 - Math.min(distToObj / maxDist, 1)

    const score = alignment * 0.4 + proximity * 0.6 + rng() * 0.15

    if (agent.tokenManager.knowsState(c.id)) {
      // known state — only use as fallback
      if (score > fallbackScore) {
        fallbackScore = score
        fallback = c
      }
    } else {
      if (score > bestScore) {
        bestScore = score
        best = c
      }
    }
  }

  return best || fallback
}

export function checkObjectiveCollection(agent, world) {
  if (agent.finished) return false
  if (!world.objective) return false

  if (distance(agent, world.objective) <= OBJECTIVE_COLLECT_RADIUS) {
    agent.finished = true
    return true
  }
  return false
}
