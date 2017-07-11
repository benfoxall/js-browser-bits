window.AudioDataCode = (function(Reveal, SlideBuilder) {
  if(!(Reveal && SlideBuilder)) throw "Reveal and Slide Builder required"

  function create(slide_element) {

    const builder = new SlideBuilder(slide_element)

    const button = slide_element.querySelector('button')
    const code  = slide_element.querySelector('[contenteditable]')

    let audioCtx
    let channel_data
    let audio_buffer

    button.addEventListener('click', () => {
      try {
        const fn = new Function('channel_data', code.innerText)

        // call it
        console.log('running')
        fn(channel_data)

        console.log(channel_data)

        const source = audioCtx.createBufferSource()
        source.buffer = audio_buffer
        source.connect(audioCtx.destination)
        source.start()

      } catch (e) {
        console.warn(e)
      }
    }, false)

    builder.shown(() => {
      console.log("audio code")

      audioCtx = new AudioContext()

      audio_buffer = audioCtx.createBuffer(
        1, audioCtx.sampleRate, audioCtx.sampleRate
      )

      channel_data = audio_buffer.getChannelData(0) // Float32Array!

    })
    .hidden(() => {

      audioCtx.close()

      channel_data = null

    })

  }

  return create

})(window.Reveal, window.SlideBuilder)
