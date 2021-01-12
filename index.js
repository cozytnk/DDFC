
/**
 * utils
 */
const loadImg = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = (err) => reject(err)
    img.src = src
  })
}
const readDataURL = (file) => {
  console.assert(file.type.match('image.*'))
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}


// REF: https://note.com/npaka/n/nc9c244b11089
const loadModel = async () => {
  console.log(`loading models...`)
  await faceapi.nets.tinyFaceDetector.load('./models/')
  await faceapi.nets.faceLandmark68Net.load('./models/')
  console.log(`loaded.`)
}
const detect = async (img) => {
  // create a canvas with original image size
  const canvas = document.createElement('canvas')
  canvas.width  = img.width
  canvas.height = img.height
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height)

  console.log(`detecting...`)
  const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()

  console.log(`detected. `)
  console.log(detections[0]?.detection?.score)
  console.log(detections)
  return detections
}


Vue.component('canvases', {
  template: `
  <div class="canvases">
    <canvas id="canvas-img"     ref="img"      />
    <canvas id="canvas-overlay" ref="overlay" />
  </div>`,
  props: [ 'img' ],
  computed: {
    root () { return document.querySelector('.canvases') },
  },
  watch: {
    img () { this.update() },
  },
  mounted () {
    this.update()
    new ResizeObserver(() => this.update()).observe(document.querySelector('.canvases'))
  },
  methods: {
    update () {
      const img = this.img
      if (!img) return
      let rateX = this.root.clientWidth  / img.width
      let rateY = this.root.clientHeight / img.height
      let rate = Math.min(rateX, rateY)
      let targetWidth  = img.width  * rate
      let targetHeight = img.height * rate;

      const canvases = [ this.$refs.img, this.$refs.overlay ]
      canvases.forEach(canvas => {
        canvas.width  = targetWidth
        canvas.height = targetHeight
        canvas.getContext('2d').drawImage(img, 0, 0, img.width * rate, img.height * rate)
      })

      this.$emit('update:rate', rate)
    },

  },
})

const app = new Vue({
  el: '#app',
  data: {
    loading: false,
    srces: [
      './img/lena.gif',
      './img/Mona_Lisa_face.jpg',
      './img/jitaku_taiki__relax_woman.png',
      './img/pose_pien_uruuru_woman.png',
    ],
    img: null,
    detections: null,
    rate: 1,
  },
  async mounted () {
    this.loading = true
    await loadModel()
    // this.loading = false
    this.selectSrc(this.srces[0])
  },
  methods: {
    async selectSrc (src) {
      this.img = null
      this.detections = null

      this.loading = true
      counters.select++
      console.log(`counters.select: ${counters.select}`)

      effects.reset()
      effects.stop()

      this.img = await loadImg(src)
      this.detections = await detect(this.img)

      this.loading = false
      if (counters.select % 5 === 0) effects.rotation()

    },
    async addSrc (e) {
      const [file] = e.target.files
      const dataURL = await readDataURL(file)
      this.srces.splice(0, 0, dataURL)
      this.selectSrc(this.srces[0])
      e.target.value = null
    }
  },
})