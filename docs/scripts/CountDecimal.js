window.CountDecimal = (function(Reveal, SlideBuilder) {
  if(!(Reveal && SlideBuilder)) throw "Reveal and Slide Builder required"

  function create(selector) {

    const root = document.querySelector(selector)

    const numberElement = root.querySelector('.count-value')
    numberElement.textContent = '0'

    const builder = new SlideBuilder(root)

    let rAF
    builder.shown(() => {
      const data = {number: 0}
      var tween = new TWEEN.Tween(data)
      	.to({ number: 1023.99}, 10000)
      	.onUpdate(function() {
          numberElement.innerText = data.number|0
          // numberElement.innerText = (data.number|0).toString(2)
      	})
        .repeat(Infinity)
        .yoyo(true)
        .easing(TWEEN.Easing.Quartic.InOut)
        .delay(1000)
      	.start()

      function animate(t) {
        rAF = requestAnimationFrame(animate)
        TWEEN.update(t)
      }

      rAF = requestAnimationFrame(animate)

    })
    .hidden(() => {
      cancelAnimationFrame(rAF)
    })


  }

  return create

})(window.Reveal, window.SlideBuilder)
