import { Button, Square } from './components/dom'
import { Circle } from './components/map'
import map from './map'
import { ProofOfConceptStore } from './store/poc'
import { $sidebar } from './ui'

function createComponent(namespace: string, color: string, center: number[]) {
  const store = new ProofOfConceptStore(namespace)

  const $button = Button({
    title: 'Hide',
    onClick: () => {
      store.set({ visible: !store.get('visible') })
    }
  })
  store.register($button, 'visible', function (this, event) {
    this.innerText = event.detail?.visible ? 'Hide' : 'Show'
  })

  const $square = Square({ color })
  store.register($square, 'visible', function (this, event) {
    this.style.display = event.detail?.visible ? 'block' : 'none'
  })

  const $wrapper = document.createElement('div')
  $wrapper.append($button, $square)

  $sidebar.append($wrapper)

  new Circle(namespace, store, { color, center })
}

map.on('load', () => {
  createComponent('test1', '#0080ff', [-43.2209, -22.9619])
  createComponent('test2', '#ff0033', [-43.2009, -22.9419])
})
