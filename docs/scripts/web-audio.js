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

      setup(analyser)

      function animate(t) {
        rAF = requestAnimationFrame(animate)
        render(analyser)
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


  const freqSlide = document.querySelector('#audio-freq-data')
  const output_element = freqSlide.querySelector('.output')

  let freqData, subFreq, more

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



})(window.Reveal, window.SlideBuilder)
