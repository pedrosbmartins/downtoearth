import map from '../../map'
import { ModelData, Store } from '../../store'
import { SizePreset } from '../../types'
import { ComponentProps, DOMComponent } from './base'
import { Button } from './Button'

export function SidebarItem(props: Props, store: Store<ModelData>, groupStore?: Store<ModelData>) {
  return new SidebarItemComponent(store, props)
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
      onClick: () => {
        this.store.set({ visible: !this.store.get('visible') })
      },
      events: ['visible'],
      onUpdate: ($, event) => {
        $.innerText = event.detail?.visible ? 'Hide' : 'Show'
      }
    })

    const CenterButton = Button(this.store, {
      title: 'Center',
      onClick: () => {
        const boundingBox = this.store.get('boundingBox')
        if (!boundingBox) {
          console.warn(`store ${this.store.id()} has no bounding box defined`)
          return
        }
        map.fitBounds(boundingBox, { padding: 20 })
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
        onClick: () => store.set({ size: preset.value }),
        events: ['size'],
        onUpdate: ($, event) => {
          const isCurrent = event.detail?.size === preset.value
          $.innerHTML = `${isCurrent ? '*' : ''}${preset.label}`
        }
      })
      $wrapper.append(PresetButton.dom())
    })
    return $wrapper
  }
}
