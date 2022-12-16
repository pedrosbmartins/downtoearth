import { Button, Square } from './components/dom'
import { Circle } from './components/map'
import map from './map'
import { ProofOfConceptStore } from './store/poc'
import { $sidebar } from './ui'

function createComponent(namespace: string, color: string, center: number[]) {
  const store = new ProofOfConceptStore(namespace)

  const $button = Button(store, {
    title: 'Hide',
    onClick: () => {
      store.set({ visible: !store.get('visible') })
    },
    events: ['visible'],
    onUpdate: ($, event) => {
      $.innerText = event.detail?.visible ? 'Hide' : 'Show'
    }
  })

  const $square = Square(store, {
    color,
    events: ['visible'],
    onUpdate: ($, event) => ($.style.display = event.detail?.visible ? 'block' : 'none')
  })

  const $wrapper = document.createElement('div')
  $wrapper.append($button.dom(), $square.dom())

  $sidebar.append($wrapper)

  new Circle(namespace, store, { color, center })
}

map.on('load', () => {
  createComponent('test1', '#0080ff', [-43.2209, -22.9619])
  createComponent('test2', '#ff0033', [-43.2009, -22.9419])
})
