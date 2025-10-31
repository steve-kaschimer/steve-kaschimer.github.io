const tinycolor = require('tinycolor2')

function luminance(rgb) {
  const a = rgb.map((v) => {
    v = v / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
}

function contrast(hexA, hexB) {
  const a = tinycolor(hexA).toRgb()
  const b = tinycolor(hexB).toRgb()
  const lumA = luminance([a.r, a.g, a.b])
  const lumB = luminance([b.r, b.g, b.b])
  const brightest = Math.max(lumA, lumB)
  const darkest = Math.min(lumA, lumB)
  return (brightest + 0.05) / (darkest + 0.05)
}

const pairs = [
  { a: '#0F1724', b: '#FFFFFF', name: 'Light text on white (bad)'} ,
  { a: '#0F1724', b: '#F5F8FA', name: 'Light primary on page bg'},
  { a: '#E6EDF3', b: '#071021', name: 'Dark primary on dark bg'},
  { a: '#4FB3FF', b: '#071021', name: 'Primary on dark bg'},
  { a: '#0078D4', b: '#FFFFFF', name: 'Primary on white'},
  { a: '#FF9F3A', b: '#071021', name: 'Accent on dark'},
]

pairs.forEach((p) => {
  console.log(`${p.name}: ${contrast(p.a, p.b).toFixed(2)}:1`)
})
