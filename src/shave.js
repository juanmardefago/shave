export default function shave (target, maxHeight, opts = {}) {
  if (!maxHeight) throw Error('maxHeight is required')
  let els = (typeof target === 'string') ? document.querySelectorAll(target) : target
  if (!els) return

  const maxHeightPercetange = (typeof maxHeight !== 'string')
    ? 1
    : maxHeight[maxHeight.length - 1] === '%'
      ? (parseInt(maxHeight.slice(0, maxHeight.length - 1)) / 100)
      : 1

  const trim = typeof opts.trim === 'boolean' ? opts.trim : true
  const character = opts.character || '…'
  const classname = opts.classname || 'js-shave'
  const spaces = typeof opts.spaces === 'boolean' ? opts.spaces : true
  const charHtml = `<span class="js-shave-char" style="padding: 0;">${character}</span>`

  if (!('length' in els)) els = [els]
  for (let i = 0; i < els.length; i += 1) {
    const el = els[i]
    const styles = el.style
    const span = el.querySelector(`.${classname}`)
    const textProp = el.textContent === undefined ? 'innerText' : 'textContent'
    const parsedMaxHeight = (typeof maxHeight === 'number')
      ? maxHeight
      : maxHeight[maxHeight.length - 1] === '%'
        ? (maxHeightPercetange * el.offsetHeight)
        : maxHeight

    // If element text has already been shaved
    if (span) {
      // Remove the ellipsis to recapture the original text
      el.removeChild(el.querySelector('.js-shave-char'))
      el[textProp] = el[textProp] // eslint-disable-line
      // nuke span, recombine text
    }

    if (trim) el[textProp] = el[textProp].trim()

    const fullText = el[textProp]
    const words = spaces ? fullText.split(' ') : fullText
    // If 0 or 1 words, we're done
    if (words.length < 2) continue

    // Temporarily remove any CSS height for text height calculation
    const heightStyle = styles.height
    styles.height = 'auto'
    const maxHeightStyle = styles.maxHeight
    styles.maxHeight = 'none'

    // If already short enough, we're done
    if (el.offsetHeight <= parsedMaxHeight) {
      styles.height = heightStyle
      styles.maxHeight = maxHeightStyle
      continue
    }

    // Binary search for number of words which can fit in allotted height
    let max = words.length - 1
    let min = 0
    let pivot
    while (min < max) {
      pivot = (min + max + 1) >> 1 // eslint-disable-line no-bitwise
      el[textProp] = spaces ? words.slice(0, pivot).join(' ') : words.slice(0, pivot)
      el.insertAdjacentHTML('beforeend', charHtml)
      if (el.offsetHeight > parsedMaxHeight) max = pivot - 1
      else min = pivot
    }

    el[textProp] = spaces ? words.slice(0, max).join(' ') : words.slice(0, max)
    el.insertAdjacentHTML('beforeend', charHtml)
    el.getElementsByClassName('js-shave-char')[0].setAttribute('style', 'float: none;')
    const diff = spaces ? ` ${words.slice(max).join(' ')}` : words.slice(max)

    const shavedText = document.createTextNode(diff)
    const elWithShavedText = document.createElement('span')
    elWithShavedText.classList.add(classname)
    elWithShavedText.style.display = 'none'
    elWithShavedText.appendChild(shavedText)
    el.insertAdjacentElement('beforeend', elWithShavedText)

    styles.height = heightStyle
    styles.maxHeight = maxHeightStyle
  }
}
