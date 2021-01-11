
const loadImg = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.querySelector('#canvas-img')
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      canvas.width = document.querySelector('.main').clientWidth
      canvas.height = document.querySelector('.main').clientHeight
      const rate = canvas.clientHeight / Math.max(img.width, img.height)
      // ctx.drawImage(img, 0, 0, img.width * rate, img.height * rate)
      ctx.drawImage(img, canvas.clientWidth/2 - img.width * rate / 2, 0, img.width * rate, img.height * rate)
      resolve()
    }
    img.onerror = (err) => reject(err)
    img.src = src
  })
}


// REF: https://note.com/npaka/n/nc9c244b11089
const loadModel = async () => {
  console.log(`loading models...`)
  await faceapi.nets.tinyFaceDetector.load('./models/')
  await faceapi.nets.faceLandmark68Net.load('./models/')
  console.log(`loaded.`)
}
const detect = async () => {
  console.log(`detecting...`)
  // const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
  // const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
  const detections = await faceapi.detectAllFaces('canvas-img', new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
  // detections = [
  //   {
  //     detection: {
  //       box: { x, y, ... },
  //       score: 0.8,
  //       ...
  //     },
  //     landmarks: {
  //       positions: [],
  //       ...
  //     },
  //   }
  // ]

  console.log(`detected.`)
  console.log(detections[0]?.detection?.score)
  console.log(detections)
  return detections
}


const app = new Vue({
  el: '#app',
  data: {
    loading: false,
    imgs: [
      './img/lena.gif',
      './img/Mona_Lisa_face.jpg',
      './img/jitaku_taiki__relax_woman.png',
      './img/pose_pien_uruuru_woman.png',
    ],
    detections: null,
  },
  async mounted () {
    this.loading = true
    await loadModel()
    this.selectImg(this.imgs[0])
    // this.loading = false
  },
  methods: {
    selectImg (img) {
      this.loading = true
      counters.select++
      console.log(`counters.select: ${counters.select}`)
      effects.reset()
      effects.stop()
      loadImg(img).then(async () => {
        this.detections = await detect()
        this.loading = false
      })
      if (counters.select % 4 === 0) effects.rotation()

      window.onresize = () => {
        loadImg(img)
        const canvas = document.querySelector('#canvas-overlay')
        const ctx = canvas.getContext('2d')
        // ctx.clearRect(0, 0, canvas.width, canvas.height)
        // canvas.width = document.querySelector('#canvas-img').clientWidth
        // canvas.height = document.querySelector('#canvas-img').clientHeight
      }
    },
    addImg (e) {
      const [file] = e.target.files
      console.assert(file.type.match('image.*'))
      const reader = new FileReader()
      reader.onload = () => {
        this.imgs.splice(0, 0, reader.result)
        this.selectImg(this.imgs[0])
      }
      reader.readAsDataURL(file)

      e.target.value = null
    }
  },
})