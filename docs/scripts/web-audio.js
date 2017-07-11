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





    const spectrographColorSlide = document.querySelector('#audio-spectrograph-color')
    const spectrographCanvasColor = spectrographColorSlide.querySelector('canvas')

    // let imageData, idx
    // let fdc

    createAudioSlide(
      spectrographColorSlide,
      (analyser, audio_element) => {
        freqData = new Uint8Array(analyser.frequencyBinCount)
        fdc = new Uint8ClampedArray(freqData.buffer)

        ctx = spectrographCanvasColor.getContext('2d')

        imageData = ctx.createImageData(
          freqData.length/4,
          spectrographCanvasColor.height
        )

        idx = 0

        ctx.strokeStyle = '#fff'

      },
      (analyser, audio_element) => {
        if(audio_element.paused) return

        analyser.getByteFrequencyData(freqData)

        for (var i = 0; i < fdc.length; i += 4) {
          fdc[i]   = -Math.sin((fdc[i  ]/255) * Math.PI * 1.75) * 255
          fdc[i+1] =  Math.sin((fdc[i+1]/255) * Math.PI * 1.75) * 255
          fdc[i+2] = -Math.cos((fdc[i+2]/255) * Math.PI * 1.75) * 255
        }

        imageData.data.set(
          freqData,
          idx * freqData.length
        )

        idx = (idx + 1) % spectrographCanvasColor.height

        ctx.putImageData(imageData,0,0)

      }
    )



})(window.Reveal, window.SlideBuilder)
