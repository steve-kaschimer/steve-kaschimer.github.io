// Deterministic tiny SVG blur placeholder generator based on image path
// Produces a data:image/svg+xml;utf8,<svg ...> string using a hashed color
function djb2(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i)
    h = h & h
  }
  return Math.abs(h)
}

function hslToHex(h, s, l) {
  // h: 0-360, s/l: 0-100
  s /= 100
  l /= 100
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n => {
    const color = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

export function blurDataURLForPath(path) {
  if (!path) path = ''
  const hash = djb2(path)
  const hue = hash % 360
  // pick a pleasant pastel saturation/lightness
  const sat = 40 + (hash % 20) // 40-59
  const light = 60 + (hash % 10) // 60-69
  const hex = hslToHex(hue, sat, light)
  // create a small 16x10 SVG rectangle with the computed color
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='10'><rect width='100%' height='100%' fill='${hex}'/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export default blurDataURLForPath
