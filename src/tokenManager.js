import {
  TOKEN_BUDGET,
  MAX_TOKENS_PER_STEP,
  CONTEXT_WINDOW,
  RAG_RETRIEVAL_COUNT,
  RAG_CONTEXT_THRESHOLD,
} from "./config.js"

// Step: { stateId, tokens, isRag? }

// --- 1. Simply removed ---
export class SimplyRemovedManager {
  constructor() {
    this.steps = []
    this.budget = TOKEN_BUDGET
  }

  get usedTokens() {
    let t = 0
    for (const s of this.steps) t += s.tokens
    return t
  }

  knowsState(stateId) {
    for (const s of this.steps) {
      if (s.stateId === stateId && s.tokens > 0) return true
    }
    return false
  }

  addStep(stateId) {
    this.steps.push({ stateId, tokens: MAX_TOKENS_PER_STEP })
    while (this.steps.length > CONTEXT_WINDOW) {
      const evicted = this.steps.shift()
      evicted.tokens = 0 // zero out so trail refs see it as forgotten
    }
  }

  reset() {
    this.steps = []
  }
}

// --- 2. Compressed once ---
export class CompressedOnceManager {
  constructor() {
    this.steps = []
    this.budget = TOKEN_BUDGET
  }

  get usedTokens() {
    let t = 0
    for (const s of this.steps) t += s.tokens
    return t
  }

  knowsState(stateId) {
    for (const s of this.steps) {
      if (s.stateId === stateId && s.tokens > 0) return true
    }
    return false
  }

  addStep(stateId) {
    this.steps.push({ stateId, tokens: MAX_TOKENS_PER_STEP })

    if (this.usedTokens > this.budget) {
      // compress all existing steps equally
      const total = this.usedTokens
      const ratio = this.budget / total
      for (const s of this.steps) {
        s.tokens = Math.max(0, Math.floor(s.tokens * ratio))
      }
      // remove forgotten steps (tokens already 0 on the object, trail refs will see it)
      this.steps = this.steps.filter((s) => s.tokens > 0)
    }
  }

  reset() {
    this.steps = []
  }
}

// --- 3. RAG-based ---
const RAG_CONTEXT_HALF = Math.floor(CONTEXT_WINDOW / 2) // 5 dense steps

export class RAGBasedManager {
  constructor(rng) {
    this.context = [] // active context steps — capped at half window
    this.vectorDB = [] // all stateIds ever visited
    this.ragEntries = [] // currently active RAG retrievals (1 token each)
    this.budget = TOKEN_BUDGET
    this.rng = rng
  }

  get steps() {
    return [...this.context, ...this.ragEntries]
  }

  get usedTokens() {
    let t = 0
    for (const s of this.context) t += s.tokens
    t += this.ragEntries.length
    return t
  }

  knowsState(stateId) {
    for (const s of this.context) {
      if (s.stateId === stateId && s.tokens > 0) return true
    }
    for (const s of this.ragEntries) {
      if (s.stateId === stateId) return true
    }
    return false
  }

  addStep(stateId) {
    // always store in vector DB
    this.vectorDB.push(stateId)

    // add to active context
    this.context.push({ stateId, tokens: MAX_TOKENS_PER_STEP })

    // evict oldest — keep only half the window for dense context
    while (this.context.length > RAG_CONTEXT_HALF) {
      const evicted = this.context.shift()
      evicted.tokens = 0
    }

    // refresh RAG retrieval each step (random sample from full history)
    if (this.vectorDB.length > RAG_CONTEXT_HALF) {
      this.ragEntries = []
      const pool = [...new Set(this.vectorDB)]
      // exclude states already in dense context
      const contextIds = new Set(this.context.map((s) => s.stateId))
      const available = pool.filter((id) => !contextIds.has(id))
      const count = Math.min(RAG_RETRIEVAL_COUNT, available.length)
      const shuffled = available.slice()
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(this.rng() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      for (let i = 0; i < count; i++) {
        this.ragEntries.push({ stateId: shuffled[i], tokens: 1, isRag: true })
      }
    }
  }

  reset() {
    this.context = []
    this.vectorDB = []
    this.ragEntries = []
  }
}

// --- 4. Recursively compressed ---
export class RecursivelyCompressedManager {
  constructor() {
    this.steps = []
    this.budget = TOKEN_BUDGET
  }

  get usedTokens() {
    let t = 0
    for (const s of this.steps) t += s.tokens
    return t
  }

  knowsState(stateId) {
    for (const s of this.steps) {
      if (s.stateId === stateId && s.tokens > 0) return true
    }
    return false
  }

  addStep(stateId) {
    // take 1 token from each existing step — always compress
    for (const s of this.steps) {
      s.tokens = Math.max(0, s.tokens - 1)
    }
    this.steps = this.steps.filter((s) => s.tokens > 0)

    this.steps.push({ stateId, tokens: MAX_TOKENS_PER_STEP })
  }

  reset() {
    this.steps = []
  }
}
