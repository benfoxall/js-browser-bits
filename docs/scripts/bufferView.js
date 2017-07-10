(() => {

  const buffers = document.querySelectorAll('[data-buffer-view]')

  for(let buffer of buffers) {

    const bufferName = buffer.dataset.bufferView

    const slide_element = buffer.parentElement

    const builder = new SlideBuilder(slide_element)

    let data = null
    let data_sub = null

    let drawn = new Uint8Array(48)

    const byte_elements = Array.from({length:48}, (_, i) => {
      const span = document.createElement('span')
      buffer.appendChild(span)
      return span
    })




    let rAF
    builder.shown(() => {
      function animate(t) {
        rAF = requestAnimationFrame(animate)
        // check changes
        // render
        // console.log(window[bufferName])


        const target = window[bufferName] && window[bufferName]

        if(target && target instanceof ArrayBuffer) {

          if(data !== target) {
            // fresh, create/update
            data = target
            data_sub = new Uint8Array(target)

            byte_elements.forEach((b, i) => {
              if(i >= data_sub.length) {
                b.textContent = '.'
              } else {
                b.textContent = (drawn[i]).toString(2).padStart(8,'0')
              }
            })

            Reveal.layout()

          }

          const to = Math.min(
            drawn.length, data_sub.length
          )

          for (var i = 0; i < to; i++) {
            if(drawn[i] !== data_sub[i]) {
              drawn[i] = data_sub[i]

              byte_elements[i]
                .innerText = (drawn[i]).toString(2).padStart(8,'0')
            }
          }



        }
      }
      rAF = requestAnimationFrame(animate)
    })
    .hidden(() => {
      cancelAnimationFrame(rAF)
    })


  }


})()
