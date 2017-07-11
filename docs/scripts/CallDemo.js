window.CallDemo = (function(Reveal, SlideBuilder) {
  if(!(Reveal && SlideBuilder)) throw "Reveal and Slide Builder required"

  let connection = null

  function create(selector) {

    const root = document.querySelector(selector)

    const canvas = root.querySelector('canvas')

    const builder = new SlideBuilder(root)

    let rAF
    let audioCtx

    builder.shown(() => {
      console.log("creating audio context")

      if(audioCtx) {
        return console.error("Call Demo can't be reloaded")
      } else {
        audioCtx = new AudioContext()
      }

      const nexmo = window.nexmo = nexmoGraph({audioCtx, origin: 'wss://ws-phone.herokuapp.com'})

      const {In, Out} = nexmo



      const analyserIn = audioCtx.createAnalyser()
      const analyserOut = audioCtx.createAnalyser()

      analyserIn.connect(In)
      Out.connect(analyserOut)
      analyserOut.connect(audioCtx.destination)

      navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then(stream => {
          audioCtx.createMediaStreamSource(stream)
          .connect(analyserIn)
        })




      const freqData = new Uint8Array(analyserIn.frequencyBinCount)

      // create the canvas and image data
      canvas.width = freqData.length*2
      canvas.height = window.innerHeight * 1.5

      canvas.style.width = Reveal.getConfig().width + 'px'
      canvas.style.height = Reveal.getConfig().height + 'px'




      const ctx = canvas.getContext('2d')
      const image_data = ctx.createImageData(freqData.length*2, canvas.height)

      // access image data at same stride as fft
      const image_data_32 = new Uint32Array(image_data.data.buffer)


      //
      //
      //
      //
      // const source = audioCtx.createMediaElementSource(audio_element)
      // const analyser = audioCtx.createAnalyser()
      //
      // source.connect(analyser)
      // analyser.connect(audioCtx.destination)

      let idx = 0

      function animate(t) {
        rAF = requestAnimationFrame(animate)

        ;[analyserIn, analyserOut].forEach((analyser, i) => {
          analyser.getByteFrequencyData(freqData)

          const PI74 = Math.PI * 1.75

          const offset = freqData.length * idx
          for (var i = 0; i < freqData.length; i++) {

            const v = freqData[i]/255

            let r = (-Math.sin(v * PI74) * 255)
            let g = ( Math.sin(v * PI74) * 255)
            let b = (-Math.cos(v * PI74) * 255)

            if(r < 0) r = 0
            if(g < 0) g = 0
            if(b < 0) b = 0

            r &= 255
            g &= 255
            b &= 255

            r = 255-r
            g = 255-g
            b = 255-b

            image_data_32[i + offset] = r  | (g << 8) | (b << 16) | 0xff000000
          }

          idx = (idx + 1) % (canvas.height * 2)

        })

        ctx.putImageData(image_data, 0, 0)


      }
      rAF = requestAnimationFrame(animate)
    })
    .hidden(() => {
      cancelAnimationFrame(rAF)


      // audioCtx.close()
        // .then(() => console.log("audio context closed"))

      // replace the audio element with a fresh replacement
      // audio_element.replaceWith(audio_element = audio_element.cloneNode())
    })


  }

  return create






})(window.Reveal, window.SlideBuilder)
