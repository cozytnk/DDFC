

const effects = {

  overlayCanvas: () => {
    const canvas = document.querySelector('#canvas-overlay')
    const ctx = canvas.getContext('2d')
    return { canvas, ctx }
  },

  horrorfont: () => document.body.classList.add('horror-font'),

  negaposi: () => document.body.classList.add('negaposi'),

  rotation: () => document.body.classList.add('rotation'),

  white: () => {
    effects.reset()
    effects.stop()
    document.body.classList.add('white')
    effects.mask()
  },

  landmarks: () => { // for debug
    const detections = app.detections
    const { canvas, ctx } = effects.overlayCanvas()
    setTimeout(() => {
      counters.start++
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      detections.forEach(detection => {
        ctx.beginPath()
        detection.landmarks.positions.forEach(pos => ctx.rect(pos.x, pos.y, 4, 4))
        ctx.fillStyle = 'black'
        ctx.fill()
      })
    })
  },

  mask: () => {
    const detections = app.detections
    const { canvas, ctx } = effects.overlayCanvas()
    setTimeout(() => {
      const rate = app.rate
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      detections.forEach(detection => {
        const positions = detection.landmarks.positions
        const mask = (i1, i2) => {
          ctx.beginPath()
          ctx.moveTo(positions[i1-1].x * rate, positions[i1-1].y * rate)
          for (let i = i1+1; i < i2+1; i++) ctx.lineTo(positions[i-1].x * rate, positions[i-1].y * rate)
          ctx.lineTo(positions[i1-1].x * rate, positions[i1-1].y * rate)
          ctx.fillStyle = 'black'
          ctx.fill()
          ctx.lineWidth = 10
          ctx.stroke()
        }
        // left eye
        mask(37, 42)
        // right eye
        mask(43, 48)
        // mouth
        mask(49, 60)
      })
    })
  },

  timer: null,
  bbb: () => {
    const detections = app.detections
    const { canvas, ctx } = effects.overlayCanvas()
    effects.stop()

    const rand = () => (Math.random() - 0.5) * 16
    const lerp = (p1, p2, n) => {
      const step = { x: (p2.x - p1.x) / n, y: (p2.y - p1.y) / n }
      return Array.from({ length: n }, (_, i) => {
        return { x: p1.x + i * step.x, y: p1.y + i * step.y }
      })
    }

    effects.timer = setInterval(() => {
      const rate = app.rate // NOTE: resizeを反映させるため、ここでappから参照してくること。
      counters.frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      detections.forEach(detection => {
        const positions = detection.landmarks.positions
        const _draw = (indices, n, size) => {
          console.assert(indices.length >= 2)
          size = Math.max(size, 20) * rate
          for (let i = 0; i < indices.length - 1; i++) {
            const idx1 = indices[i]
            const idx2 = indices[i + 1]
            ctx.beginPath()
            // lerp(positions[idx1-1], positions[idx2-1], n).forEach(pos => ctx.rect(pos.x - size/2 + rand(), pos.y - size/2 + rand(), size, size))
            lerp(positions[idx1-1], positions[idx2-1], n).forEach(pos => ctx.rect((pos.x - size/2 + rand())*rate, (pos.y - size/2 + rand())*rate, size, size))
            ctx.fillStyle = 'black'
            ctx.fill()
          }
        }
        // left eye
        _draw([37, 38, 39, 40, 41, 42, 37], 2, (positions[40-1].x - positions[30-1].x) / 2)
        // right eye
        _draw([43, 44, 45, 46, 47, 48, 43], 2, (positions[46-1].x - positions[43-1].x) / 2)
        // mouth
        _draw([49, 52, 55, 58, 49, 55], 2, (positions[55-1].x - positions[49-1].x) / 5)
      })
    }, 20)
  },
  bbbing: () => Boolean(effects.timer),

  stop: () => {
    const { canvas, ctx } = effects.overlayCanvas()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    clearInterval(effects.timer)
    effects.timer = null
  },

  reset: () => {
    counters.start = 0
    document.body.classList.remove(...document.body.classList)
  },

}

const counters = {
  frame: 0,
  select: 0,
  start: 0,
  stop: 0,
}