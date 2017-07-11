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

      navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then(stream => {
          audioCtx.createMediaStreamSource(stream).connect(In)
        })

      Out.connect(audioCtx.destination)

      console.log("OK")

      //
      //
      //
      //
      // const source = audioCtx.createMediaElementSource(audio_element)
      // const analyser = audioCtx.createAnalyser()
      //
      // source.connect(analyser)
      // analyser.connect(audioCtx.destination)

      function animate(t) {
        rAF = requestAnimationFrame(animate)

        // animate image data

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
