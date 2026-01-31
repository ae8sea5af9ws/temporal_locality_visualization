import { DIFFICULTY, AGENT_COLORS, AGENT_NAMES, AGENT_DESCRIPTIONS, TOKEN_BUDGET } from "./config.js"

export function createUI(callbacks) {
  const container = document.createElement("div")
  container.id = "app"
  document.body.appendChild(container)

  // --- difficulty bar ---
  const diffBar = document.createElement("div")
  diffBar.className = "difficulty-bar"
  const diffButtons = {}

  for (const key of Object.keys(DIFFICULTY)) {
    const btn = document.createElement("button")
    btn.className = "diff-btn"
    btn.textContent = DIFFICULTY[key].label
    btn.addEventListener("click", () => {
      callbacks.onDifficultyChange(key)
      setActiveDifficulty(key)
    })
    diffBar.appendChild(btn)
    diffButtons[key] = btn
  }
  // --- restart button (in same row) ---
  const restartBtn = document.createElement("button")
  restartBtn.className = "restart-btn"
  restartBtn.textContent = "Restart"
  restartBtn.addEventListener("click", callbacks.onRestart)
  diffBar.appendChild(restartBtn)

  container.appendChild(diffBar)

  // --- canvas ---
  const canvas = document.createElement("canvas")
  canvas.id = "viz-canvas"
  container.appendChild(canvas)

  // --- badges row ---
  const badgesRow = document.createElement("div")
  badgesRow.className = "badges-row"
  const badges = []

  for (let i = 0; i < 4; i++) {
    const badge = document.createElement("div")
    badge.className = "agent-badge"
    badge.style.borderColor = AGENT_COLORS[i]

    // --- top half: title + description ---
    const top = document.createElement("div")
    top.className = "badge-top"

    const header = document.createElement("div")
    header.className = "badge-header"

    const dot = document.createElement("span")
    dot.className = "color-dot"
    dot.style.background = AGENT_COLORS[i]

    const name = document.createElement("span")
    name.className = "agent-name"
    name.textContent = AGENT_NAMES[i]

    header.appendChild(dot)
    header.appendChild(name)
    top.appendChild(header)

    const desc = document.createElement("p")
    desc.className = "agent-desc"
    desc.textContent = AGENT_DESCRIPTIONS[i]
    top.appendChild(desc)

    badge.appendChild(top)

    // --- bottom half: token bar, stats + toggle ---
    const bottom = document.createElement("div")
    bottom.className = "badge-bottom"

    const barGroup = document.createElement("div")
    barGroup.className = "bar-group"

    // context bar (grey)
    const contextRow = document.createElement("div")
    contextRow.className = "bar-row"
    const contextLabel = document.createElement("span")
    contextLabel.className = "bar-label"
    contextLabel.textContent = "Context"
    const contextTrack = document.createElement("div")
    contextTrack.className = "bar-track"
    const tokenFill = document.createElement("div")
    tokenFill.className = "bar-fill"
    tokenFill.style.background = "#666"
    tokenFill.style.width = "0%"
    contextTrack.appendChild(tokenFill)
    contextRow.appendChild(contextLabel)
    contextRow.appendChild(contextTrack)
    barGroup.appendChild(contextRow)

    // progress bar (colored)
    const progressRow = document.createElement("div")
    progressRow.className = "bar-row"
    const progressLabel = document.createElement("span")
    progressLabel.className = "bar-label"
    progressLabel.textContent = "Progress"
    const progressTrack = document.createElement("div")
    progressTrack.className = "bar-track"
    const progressFill = document.createElement("div")
    progressFill.className = "bar-fill"
    progressFill.style.background = AGENT_COLORS[i]
    progressFill.style.width = "0%"
    progressTrack.appendChild(progressFill)
    progressRow.appendChild(progressLabel)
    progressRow.appendChild(progressTrack)
    barGroup.appendChild(progressRow)

    bottom.appendChild(barGroup)

    const bottomRow = document.createElement("div")
    bottomRow.className = "badge-bottom-row"

    const stats = document.createElement("div")
    stats.className = "badge-stats"
    const stepsSpan = document.createElement("span")
    stepsSpan.textContent = "Steps: 0"
    const statusSpan = document.createElement("span")
    statusSpan.textContent = ""
    stats.appendChild(stepsSpan)
    stats.appendChild(statusSpan)
    bottomRow.appendChild(stats)

    const toggle = document.createElement("button")
    toggle.className = "toggle-btn on"
    toggle.addEventListener("click", () => {
      callbacks.onToggleAgent(i)
      const isOn = toggle.classList.toggle("on")
      badge.classList.toggle("disabled", !isOn)
    })
    bottomRow.appendChild(toggle)

    bottom.appendChild(bottomRow)
    badge.appendChild(bottom)

    badgesRow.appendChild(badge)
    badges.push({ badge, tokenFill, progressFill, stepsSpan, statusSpan, toggle })
  }
  container.appendChild(badgesRow)

  // --- API ---
  function setActiveDifficulty(key) {
    for (const [k, btn] of Object.entries(diffButtons)) {
      btn.classList.toggle("active", k === key)
    }
  }

  function updateBadge(agentId, data) {
    const b = badges[agentId]
    if (!b) return
    b.tokenFill.style.width = ((data.usedTokens / TOKEN_BUDGET) * 100) + "%"
    if (data.progress != null) {
      b.progressFill.style.width = (data.progress * 100) + "%"
    }
    b.stepsSpan.textContent = "Steps: " + data.steps
    b.statusSpan.textContent = data.finished ? "Reached" : ""
  }

  function setAgentEnabled(agentId, enabled) {
    const b = badges[agentId]
    if (!b) return
    b.toggle.classList.toggle("on", enabled)
    b.badge.classList.toggle("disabled", !enabled)
  }

  function isAgentEnabled(agentId) {
    const b = badges[agentId]
    if (!b) return true
    return b.toggle.classList.contains("on")
  }

  return { canvas, setActiveDifficulty, updateBadge, setAgentEnabled, isAgentEnabled }
}
