import { RootData, RootStore } from '../../store'
import { matchEvent } from '../../store/core'
import { SizePreset } from '../../types'
import { ComponentProps, DOMComponent } from './DOMComponent'
import { SizePresetSelector } from './SizePresetSelector'

export function SizePresets(props: Props, store: RootStore) {
  return new SizePresetsComponent(store, { ...props, events: ['size'] })
}

interface Props extends ComponentProps<HTMLDivElement, RootData> {
  presets?: SizePreset[]
}

class SizePresetsComponent extends DOMComponent<RootStore, HTMLDivElement, Props, RootData> {
  render() {
    const {
      store,
      props: { presets: sizePresets }
    } = this
    const $wrapper = document.createElement('div')
    $wrapper.className = 'control'
    const $label = document.createElement('span')
    $label.className = 'label'
    $label.innerText = 'Diameter'
    $wrapper.append($label)
    if (!sizePresets) return $wrapper
    const $container = document.createElement('div')
    $container.className = 'container'
    sizePresets.forEach(preset => {
      const PresetButton = SizePresetSelector<RootData>(store, {
        label: preset.label,
        selected: preset.default,
        events: ['size'],
        onUpdate: ($, event) => {
          if (matchEvent<RootData>(this.storeId, 'root', event)) {
            const isCurrent = event.data.size?.rendered === preset.km / 2
            const $selectorItem = $.querySelector('.selector-item')!
            if (isCurrent) {
              $selectorItem.classList.add('selected')
            } else {
              $selectorItem.classList.remove('selected')
            }
          }
        },
        onClick: () => store.set({ size: { ...store.get('size')!, rendered: preset.km / 2 } })
      })
      $container.append(PresetButton.dom())
    })
    $wrapper.append($container)
    return $wrapper
  }
}
