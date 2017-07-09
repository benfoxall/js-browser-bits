window.BitShift = (function(Reveal, SlideBuilder) {
  if(!(Reveal && SlideBuilder)) throw "Reveal and Slide Builder required"

  function create(selector) {

    const root = document.querySelector(selector)

    const n = 0b0000000011111111

    const operatorElement = root.querySelector('._operator')
    // operatorElement.textContent = '0'

    const valueElement = root.querySelector('._value')
    // valueElement.textContent = '0'

    const builder = new SlideBuilder(root)

    const show = (a, b, c) => {
        operatorElement.childNodes[0].textContent = a.padEnd(3, ' ')
        operatorElement.childNodes[1].textContent = b
        valueElement.childNodes[0].textContent = c.toString(2).padStart(16, '0')
    }

    builder
    .fragments([

      () => { show('>>', 3, n >> 3) },
      () => { show('>>', 2, n >> 2) },
      () => { show('>>', 1, n >> 1) },

      () => { show('>>', 0, n >> 0) },

      () => { show('<<', 1, n << 1) },
      () => { show('<<', 2, n << 2) },
      () => { show('<<', 3, n << 3) },
      () => { show('<<', 4, n << 4) },

    ])


  }

  return create

})(window.Reveal, window.SlideBuilder)
