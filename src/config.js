export const TOKEN_BUDGET = 100
export const MAX_TOKENS_PER_STEP = 10
export const MIN_TOKENS_PER_STEP = 1
export const CONTEXT_WINDOW = 10
export const STEP_INTERVAL_MS = 300
export const AGENT_SIGHT_RADIUS = 40
export const RAG_RETRIEVAL_COUNT = 10
export const RAG_CONTEXT_THRESHOLD = 90
export const RAG_LINE_THICKNESS = 0.5

export const STATE_DOT_RADIUS = 2.5
export const OBJECTIVE_RADIUS = 8
export const AGENT_TRIANGLE_SIZE = 10
export const BG_COLOR = "#0a0a0a"
export const CANVAS_ASPECT = 16 / 8
export const CANVAS_MAX_WIDTH = 1200

export const AGENT_COLORS = ["#e8628c", "#b07cd8", "#6a9ff6", "#30d5e8"]

export const AGENT_NAMES = [
  "Simply removed",
  "Compressed once",
  "RAG-based",
  "Recursively compressed",
]

export const AGENT_DESCRIPTIONS = [
  "Fixed window of 10 steps. Oldest step is dropped when full. Forgets completely — gets stuck in loops.",
  "When token budget fills, all steps compressed equally. Steps reaching 0 tokens are forgotten.",
  "Fixed 10-step window plus vector database of all past states. Randomly retrieves old states when context fills.",
  "Each new step borrows 1 token from every prior step. Tail fades gradually but everything is preserved.",
]

// exponent controls gap severity: 0.1 = uniform, higher = bigger voids
export const DIFFICULTY = {
  easy: {
    label: "Easy",
    noiseScale: 0.006,
    gapExponent: 0.1,
    dotCount: 600,
    minDotDist: 12,
  },
  hard: {
    label: "Hard",
    noiseScale: 0.005,
    gapExponent: 2,
    dotCount: 600,
    minDotDist: 12,
  },
}

export const OBJECTIVE_COLLECT_RADIUS = 20
