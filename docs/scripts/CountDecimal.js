window.CountDecimal = (function(Reveal, SlideBuilder) {
  if(!(Reveal && SlideBuilder)) throw "Reveal and Slide Builder required"

  function create(selector) {

    const root = document.querySelector(selector)

    const decElement = root.querySelector('.output-dec')
    decElement.textContent = '0'

    const binElement = root.querySelector('.output-bin')
    binElement.textContent = '0'

    const builder = new SlideBuilder(root)

    const value = {
      dec: 0,
      bin: 0
    }

    let rAF
    builder.shown(() => {

      function animate(t) {
        rAF = requestAnimationFrame(animate)
        TWEEN.update(t)
      }

      rAF = requestAnimationFrame(animate)

    })
    .fragments([
      () => {
        new TWEEN.Tween(value)
          .to({ dec: 9}, 1000)
          .onUpdate(function() {
            decElement.innerText = value.dec|0
          })
          .easing(TWEEN.Easing.Linear.None)
          .start()
      },
      () => {
        new TWEEN.Tween(value)
          .to({ dec: 1234567890}, 10000)
          .onUpdate(function() {
            decElement.innerText = value.dec|0
          })
          .easing((k) => Math.pow(k, 10))
          .start()
      },
      () => {
        new TWEEN.Tween(value)
          .to({ bin: 1}, 1000)
          .onUpdate(function() {
            binElement.innerText = value.bin|0
          })
          .easing((k) => Math.pow(k, 10))
          .start()
      },
      () => {
        new TWEEN.Tween(value)
          .to({ bin: 0b1111100000}, 10000)
          .onUpdate(function() {
            binElement.innerText = (value.bin|0).toString(2)
          })
          .easing((k) => Math.pow(k, 2))
          .start()
      }
    ])
    .hidden(() => {
      cancelAnimationFrame(rAF)
    })


  }

  return create

})(window.Reveal, window.SlideBuilder)


// const {width, height} = image
//
// const canvas = document.createElement('canvas')
// canvas.width = width
// canvas.height = height
//
// const ctx = canvas.getContext('2d')
// ctx.drawImage(image, 0, 0, width, height)
//
// const imageData = ctx.getImageData(0, 0, width, height)
