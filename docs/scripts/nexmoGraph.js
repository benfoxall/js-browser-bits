window.nexmoGraph = ({audioCtx, origin, connect} = {}) => {

  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)

  // Interface nodes (just happen to be gain)
  const In = audioCtx.createGain()
  const Out = audioCtx.createGain()

  if(connect === false) {
    console.log("not connecting")

    In.connect(Out)
    return {In, Out, audioCtx}
  }

  origin = origin || location.origin.replace(/^http/, 'ws')

  // create connection to server
  const ws = new WebSocket(origin + '/outbound')
  ws.binaryType = 'arraybuffer'
  ws.onclose = () => console.log(`WebSocket ${origin} CLOSED`)

  let active

  // play incoming messages to `Out` node
  let time = 0
  ws.onmessage = (event) => {
    active = true

    time = Math.max(audioCtx.currentTime, time)

    var input = new Int16Array(event.data)

    if(input.length) {

      var buffer = audioCtx.createBuffer(1, input.length, 16000)
      var data = buffer.getChannelData(0)
      for (var i = 0; i < data.length; i++) {
        data[i] = input[i] / 32767
      }

      var source = audioCtx.createBufferSource()
      source.buffer = buffer
      source.connect(Out)
      source.start(time += buffer.duration)
    }
  }


  // Push data from `In` node to WebSocket
  const processor = audioCtx.createScriptProcessor(1024, 1, 1)

  const downsampled = new Int16Array(2048)
  let downsample_offset = 0

  // go through samples sending off in 320 chunks
  const process_samples = () => {
    while(downsample_offset > 320) {
      var output = downsampled.slice(0, 320)

      downsampled.copyWithin(0, 320)
      downsample_offset -= 320

      if(ws.readyState == ws.OPEN)
        ws.send(output.buffer)
    }
  }

  const sampleRatio = audioCtx.sampleRate / 16000

  processor.onaudioprocess = (event) => {
    if(!active) return

    // if we haven't heard anything in a couple of seconds, don't bother
    if(audioCtx.currentTime - time > 2) return

    const inputBuffer = event.inputBuffer
    const outputBuffer = event.outputBuffer

    const inputData = inputBuffer.getChannelData(0)
    const outputData = outputBuffer.getChannelData(0)

    for (var i = 0; i < inputData.length; i += sampleRatio) {
      var sidx = Math.floor(i)
      var tidx = Math.floor(i/sampleRatio)
      downsampled[downsample_offset + tidx] = inputData[sidx] * 32767
    }

    downsample_offset += (inputData.length/sampleRatio)|0

    process_samples()

    // silence output
    outputData.fill(0)
  }

  In.connect(processor)

  // connect to output to allow graph to be active
  processor.connect(audioCtx.destination)

  const dial = (name, token) =>
    ws.send(JSON.stringify({ name, token }))


  return { audioCtx, In, Out, dial, ws}
}
