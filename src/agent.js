export function createAgent(id, name, color, tokenManager) {
  return {
    id,
    name,
    color,
    tokenManager,
    x: 0,
    y: 0,
    angle: 0,
    trail: [],
    enabled: true,
    finished: false,
    stepsCount: 0,
  }
}
