window.ImageDataCode = (function(Reveal, SlideBuilder) {
  if(!(Reveal && SlideBuilder)) throw "Reveal and Slide Builder required"

  function create(slide_element) {

    const builder = new SlideBuilder(slide_element)

    const image = slide_element.querySelector('img')
    const code  = slide_element.querySelector('[contenteditable]')

    let ctx = null
    let imageData = null
    let stash = null

    const init = () => {
      const {width, height} = image

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      ctx = canvas.getContext('2d')

      ctx.drawImage(image, 0, 0, width, height)

      imageData = ctx.getImageData(0, 0, width, height)

      stash = imageData.data.slice(0)

      image.replaceWith(canvas)
    }

    let last = ''

    const change = () => {
      code.classList.add('active')

      const compare = code.innerText.replace(/\s/g,'')
      if(compare == last) return console.log('skipping')
      else last = compare

      // create a function
      try {
        const fn = new Function('imageData', 'ctx', code.innerText)

        // reset the image data
        imageData.data.set(stash)

        // call it
        console.log('running')
        fn(imageData, ctx)

      } catch (e) {
        console.warn(e)
      }
    }

    builder.shown(() => {
      console.log("YAY")

      if(!ctx) init()

      code.addEventListener('keyup', change)



    })
    .hidden(() => {
    })


  }

  return create

})(window.Reveal, window.SlideBuilder)
