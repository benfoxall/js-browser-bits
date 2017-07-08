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
          .to({ dec: 99999999}, 10000)
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
          .to({ bin: 0b1111111111111111}, 10000)
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
