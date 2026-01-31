import { chooseNextState, checkObjectiveCollection } from "./navigation.js"
import { angleBetween, seededRandom } from "./utils.js"

export function createSimulation(world, agents, seed) {
  const rngs = agents.map((_, i) => seededRandom(seed + i * 7919))

  function tick() {
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i]
      if (!agent.enabled || agent.finished) continue

      const next = chooseNextState(agent, world, rngs[i])
      if (!next) continue

      agent.angle = angleBetween(agent, next)
      agent.x = next.x
      agent.y = next.y

      agent.tokenManager.addStep(next.id)
      agent.stepsCount++

      // store trail entry with reference to the step object
      const steps = agent.tokenManager.steps
      const stepRef = steps[steps.length - 1]
      agent.trail.push({ stateId: next.id, x: next.x, y: next.y, step: stepRef })

      checkObjectiveCollection(agent, world)
    }
  }

  return { tick }
}
