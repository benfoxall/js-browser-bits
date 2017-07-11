(function(Reveal, SlideBuilder) {
  if(!(Reveal && SlideBuilder)) throw "Reveal and Slide Builder required"


  const createAudioSlide = (root, setup, render) => {

    let audio_element = root.querySelector('audio')

    const builder = new SlideBuilder(root)

    let rAF, audioCtx
    builder.shown(() => {
      console.log("creating audio context")

      audioCtx = new AudioContext()

      const source = audioCtx.createMediaElementSource(audio_element)
      const analyser = audioCtx.createAnalyser()

      source.connect(analyser)
      analyser.connect(audioCtx.destination)

      setup(analyser, audio_element)

      function animate(t) {
        rAF = requestAnimationFrame(animate)
        render(analyser, audio_element)
      }
      rAF = requestAnimationFrame(animate)
    })
    .hidden(() => {
      cancelAnimationFrame(rAF)
      audioCtx.close()
        .then(() => console.log("audio context closed"))

      // replace the audio element with a fresh replacement
      audio_element.replaceWith(audio_element = audio_element.cloneNode())
    })

  }


  let timeData, subFreq, more


  const timeSlide = document.querySelector('#audio-time-data')
  const time_output_element = timeSlide.querySelector('.output')


  createAudioSlide(
    timeSlide,
    (analyser) => {
      timeData = new Uint8Array(analyser.fftSize)
      subFreq = timeData.subarray(0, 64)
      more = `, …(${timeData.length - subFreq.length} more)`
    },
    (analyser) => {
      analyser.getByteTimeDomainData(timeData)

      time_output_element.innerText =
        [].map.call(subFreq,(n)=>n.toString().padStart(3,'\xa0')).join(', ')
       + more
    }
  )




  const freqSlide = document.querySelector('#audio-freq-data')
  const output_element = freqSlide.querySelector('.output')


  createAudioSlide(
    freqSlide,
    (analyser) => {
      freqData = new Uint8Array(analyser.frequencyBinCount)
      subFreq = freqData.subarray(0, 64)
      more = `, …(${freqData.length - subFreq.length} more)`
    },
    (analyser) => {
      analyser.getByteFrequencyData(freqData)

      output_element.innerText =
        [].map.call(subFreq,(n)=>n.toString().padStart(3,'\xa0')).join(', ')
       + more
    }
  )


  const freqSlideGraph = document.querySelector('#audio-freq-graph')
  const canvasElement = freqSlideGraph.querySelector('canvas')

  let ctx

  createAudioSlide(
    freqSlideGraph,
    (analyser) => {
      freqData = new Uint8Array(analyser.frequencyBinCount)

      ctx = canvasElement.getContext('2d')
      ctx.resetTransform()
      ctx.scale(canvasElement.width / freqData.length, canvasElement.height / 255)
      ctx.strokeStyle = '#fff'
    },
    (analyser) => {
      analyser.getByteFrequencyData(freqData)

      ctx.clearRect(0,0,freqData.length,255)

      ctx.beginPath()
      freqData.forEach((value, i) => {
        ctx.lineTo(i, 255-value)
      })
      ctx.stroke()

    }
  )




  const timeSlideGraph = document.querySelector('#audio-time-graph')
  const timeCanvasElement = timeSlideGraph.querySelector('canvas')

  createAudioSlide(
    timeSlideGraph,
    (analyser) => {
      timeData = new Uint8Array(analyser.fftSize)

      ctx = timeCanvasElement.getContext('2d')
      ctx.resetTransform()
      ctx.scale(timeCanvasElement.width / timeData.length, timeCanvasElement.height / 255)
      ctx.strokeStyle = '#fff'
    },
    (analyser) => {
      analyser.getByteTimeDomainData(timeData)

      ctx.clearRect(0,0,timeData.length,255)
      window.t = timeData

      ctx.beginPath()
      timeData.forEach((value, i) => {
        ctx.lineTo(i, 255-value)
      })
      ctx.stroke()

    }
  )






    const spectrographSlide = document.querySelector('#audio-spectrograph')
    const spectrographCanvas = spectrographSlide.querySelector('canvas')

    let imageData, idx
    let fdc

    createAudioSlide(
      spectrographSlide,
      (analyser, audio_element) => {
        freqData = new Uint8Array(analyser.frequencyBinCount)
        fdc = new Uint8ClampedArray(freqData.buffer)

        ctx = spectrographCanvas.getContext('2d')

        imageData = ctx.createImageData(
          freqData.length/4,
          spectrographCanvas.height
        )

        idx = 0

        ctx.strokeStyle = '#fff'

      },
      (analyser, audio_element) => {
        if(audio_element.paused) return

        analyser.getByteFrequencyData(freqData)

        // for (var i = 0; i < fdc.length; i += 4) {
        //   fdc[i]   = -Math.sin((fdc[i  ]/255) * Math.PI * 1.75) * 255
        //   fdc[i+1] =  Math.sin((fdc[i+1]/255) * Math.PI * 1.75) * 255
        //   fdc[i+2] = -Math.cos((fdc[i+2]/255) * Math.PI * 1.75) * 255
        // }

        imageData.data.set(
          freqData,
          idx * freqData.length
        )

        idx = (idx + 1) % spectrographCanvas.height

        ctx.putImageData(imageData,0,0)

      }
    )




    // const to_color = (v) => {
    //   let r = -Math.sin(v * PI74)
    //   let g =  Math.sin(v * PI74)
    //   let b = -Math.cos(v * PI74)
    //
    //   if(r < 0) r = 0
    //   if(g < 0) g = 0
    //   if(b < 0) b = 0
    //
    //   r = r * 255 & 255
    //   g = g * 255 & 255
    //   b = b * 255 & 255
    //
    //   return r  | (g << 8) | (b << 16) | 0xff000000
    // }


    const spectrographColorSlide = document.querySelector('#audio-spectrograph-color')
    const spectrographCanvasColor = spectrographColorSlide.querySelector('canvas')

    // let imageData, idx
    // let fdc
    let color_32

    const to_color = (v) => {
      const PI74 = Math.PI * (7 / 4)

      let r = -Math.sin(v * PI74)
      let g =  Math.sin(v * PI74)
      let b = -Math.cos(v * PI74)

      if(r < 0) r = 0
      if(g < 0) g = 0
      if(b < 0) b = 0

      r = (r * 255) & 255
      g = (g * 255) & 255
      b = (b * 255) & 255

      // r = 0
      // g = 255
      // b = 150

      r = 255-r
      g = 255-g
      b = 255-b

      // return 0xffff00ff

      return r  | (g << 8) | (b << 16) | 0xff000000
    }

    createAudioSlide(
      spectrographColorSlide,
      (analyser, audio_element) => {
        freqData = new Uint8Array(analyser.frequencyBinCount)
        fdc = new Uint8ClampedArray(freqData.buffer)

        ctx = spectrographCanvasColor.getContext('2d')

        imageData = ctx.createImageData(
          freqData.length,
          spectrographCanvasColor.height
        )

        color_32 = new Uint32Array(imageData.data.buffer)

        idx = 0

      },
      (analyser, audio_element) => {
        if(audio_element.paused) return

        analyser.getByteFrequencyData(freqData)

        freqData.forEach((f, i) => {
          color_32[(idx * freqData.length) + i] = to_color(f/255)
        })

        idx = (idx + 1) % spectrographCanvasColor.height

        ctx.putImageData(imageData,0,0)

      }
    )



})(window.Reveal, window.SlideBuilder)
