export function distance(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function distanceSq(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

export function angleBetween(from, to) {
  return Math.atan2(to.y - from.y, to.x - from.x)
}

export function lerp(a, b, t) {
  return a + (b - a) * t
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

export function seededRandom(seed) {
  let s = seed | 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffle(arr, rng) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function dot2(ax, ay, bx, by) {
  return ax * bx + ay * by
}

export function normalize2(x, y) {
  const len = Math.sqrt(x * x + y * y)
  if (len === 0) return { x: 0, y: 0 }
  return { x: x / len, y: y / len }
}
