import { injectStyles } from "./styles.js"
import {
  DIFFICULTY,
  STEP_INTERVAL_MS,
  CANVAS_MAX_WIDTH,
  CANVAS_ASPECT,
  AGENT_COLORS,
  AGENT_NAMES,
} from "./config.js"
import { generateWorld, findNearestState } from "./world.js"
import { distance } from "./utils.js"
import { createAgent } from "./agent.js"
import {
  SimplyRemovedManager,
  CompressedOnceManager,
  RAGBasedManager,
  RecursivelyCompressedManager,
} from "./tokenManager.js"
import { createSimulation } from "./simulation.js"
import { createRenderer } from "./renderer.js"
import { createUI } from "./ui.js"
import { seededRandom } from "./utils.js"

// boot styles
injectStyles()

let currentDifficulty = "easy"
let seed = Date.now()
let world, agents, simulation, renderer, tickInterval, startDistance

// create UI first (it creates the canvas element)
const ui = createUI({
  onDifficultyChange(level) {
    currentDifficulty = level
    seed = Date.now()
    init()
  },
  onToggleAgent(id) {
    if (!agents || !agents[id]) return
    const a = agents[id]
    a.enabled = !a.enabled
    if (a.enabled) {
      // reset this agent to starting position
      a.tokenManager.reset()
      a.trail = []
      a.finished = false
      a.stepsCount = 0
      a.angle = 0
      const start = findNearestState(canvas.width / 2, canvas.height / 2, world.states)
      if (start) { a.x = start.x; a.y = start.y }
    }
  },
  onRestart() {
    seed = Date.now()
    init()
  },
})

ui.setActiveDifficulty(currentDifficulty)

// setup canvas sizing
const canvas = ui.canvas

function sizeCanvas() {
  const maxW = Math.min(CANVAS_MAX_WIDTH, window.innerWidth - 32)
  const w = maxW
  const h = Math.round(w / CANVAS_ASPECT)
  canvas.width = w
  canvas.height = h
  return { w, h }
}

let canvasSize = sizeCanvas()
renderer = createRenderer(canvas)

window.addEventListener("resize", () => {
  canvasSize = sizeCanvas()
  // regenerate world for new size
  seed = Date.now()
  init()
})

function createAgents(rng) {
  return [
    createAgent(0, AGENT_NAMES[0], AGENT_COLORS[0], new SimplyRemovedManager()),
    createAgent(1, AGENT_NAMES[1], AGENT_COLORS[1], new CompressedOnceManager()),
    createAgent(2, AGENT_NAMES[2], AGENT_COLORS[2], new RAGBasedManager(seededRandom(seed + 999))),
    createAgent(3, AGENT_NAMES[3], AGENT_COLORS[3], new RecursivelyCompressedManager()),
  ]
}

function init() {
  clearInterval(tickInterval)

  canvasSize = sizeCanvas()
  const { w, h } = canvasSize
  const preset = DIFFICULTY[currentDifficulty]

  world = generateWorld(preset, seed, w, h)

  const rng = seededRandom(seed)
  agents = createAgents(rng)

  // restore toggle states from UI
  for (const a of agents) {
    a.enabled = ui.isAgentEnabled(a.id)
  }

  // start all agents at center
  const start = findNearestState(w / 2, h / 2, world.states)
  if (start) {
    for (const a of agents) {
      a.x = start.x
      a.y = start.y
    }
    startDistance = world.objective ? distance(start, world.objective) : 1
  }

  simulation = createSimulation(world, agents, seed)

  tickInterval = setInterval(() => {
    simulation.tick()
    updateUI()
  }, STEP_INTERVAL_MS)

  updateUI()
}

function updateUI() {
  if (!agents || !world) return
  for (const a of agents) {
    let progress = 0
    if (a.finished) {
      progress = 1
    } else if (world.objective && startDistance > 0) {
      const curr = distance(a, world.objective)
      progress = Math.max(0, 1 - curr / startDistance)
    }
    ui.updateBadge(a.id, {
      usedTokens: a.tokenManager.usedTokens,
      steps: a.stepsCount,
      finished: a.finished,
      progress,
    })
  }
}

// render loop
function renderLoop() {
  if (world && agents) {
    renderer.render(world, agents)
  }
  requestAnimationFrame(renderLoop)
}

requestAnimationFrame(renderLoop)
init()
