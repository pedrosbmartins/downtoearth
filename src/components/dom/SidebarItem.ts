import map, { fitBounds } from '../../map'
import { ModelData, ModelStore } from '../../store'
import { SizePreset } from '../../types'
import { Button } from './Button'
import { ComponentProps, DOMComponent } from './DOMComponent'

export function SidebarItem(props: Props, store: ModelStore) {
  return new SidebarItemComponent(store, { ...props, events: ['visible'] })
}

interface Props extends ComponentProps<HTMLDivElement, ModelData> {
  label: string
  sizePresets?: SizePreset[]
}

class SidebarItemComponent extends DOMComponent<HTMLDivElement, Props, ModelData> {
  render() {
    const $label = document.createElement('h3')
    $label.innerText = this.props.label

    const $sizePresets = this.buildSizePresets()

    const VisibilityButton = Button(this.store, {
      title: 'Hide',
      events: ['visible'],
      onUpdate: ($, event) => {
        $.innerText = event.detail?.visible ? 'Hide' : 'Show'
      },
      onClick: () => {
        this.store.set({ visible: !this.store.get('visible') })
      }
    })

    const CenterButton = Button(this.store, {
      title: 'Center',
      events: ['visible'],
      onClick: () => {
        const boundingBox = this.store.get('boundingBox')
        if (!boundingBox) {
          console.warn(`store ${this.store.id()} has no bounding box defined`)
          return
        }
        fitBounds(boundingBox)
      }
    })

    const $wrapper = document.createElement('div')
    $wrapper.append($label, $sizePresets, VisibilityButton.dom(), CenterButton.dom())

    return $wrapper
  }

  private buildSizePresets() {
    const {
      store,
      props: { sizePresets }
    } = this
    const $wrapper = document.createElement('div')
    if (!sizePresets) return $wrapper
    sizePresets.forEach(preset => {
      const PresetButton = Button(store, {
        title: `${preset.default ? '*' : ''}${preset.label}`,
        events: ['size'],
        onUpdate: ($, event) => {
          const isCurrent = event.detail?.size === preset.value
          $.innerHTML = `${isCurrent ? '*' : ''}${preset.label}`
        },
        onClick: () => store.set({ size: preset.value })
      })
      $wrapper.append(PresetButton.dom())
    })
    return $wrapper
  }
}
