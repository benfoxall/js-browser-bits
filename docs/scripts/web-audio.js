(function(Reveal, SlideBuilder) {
  if(!(Reveal && SlideBuilder)) throw "Reveal and Slide Builder required"


  const root = document.querySelector('#audio-freq-data')
  const output_element = root.querySelector('.output')
  let audio_element = root.querySelector('audio')

  const builder = new SlideBuilder(root)

  let rAF, audioCtx
  builder.shown(() => {

    console.log("creating context")
    audioCtx = new AudioContext()

    const source = audioCtx.createMediaElementSource(audio_element)
    const analyser = audioCtx.createAnalyser()

    source.connect(analyser)
    analyser.connect(audioCtx.destination)

    var freqData = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(freqData)

    var subFreq = freqData.subarray(0, 64)

    const more = `, …(${freqData.length - subFreq.length} more)`

    function animate(t) {
      rAF = requestAnimationFrame(animate)

      analyser.getByteFrequencyData(freqData)

      output_element.innerText =
        [].map.call(subFreq,(n)=>n.toString().padStart(3,'\xa0')).join(', ')
       + more

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



})(window.Reveal, window.SlideBuilder)
