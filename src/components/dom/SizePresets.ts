import { RootData, RootStore } from '../../store'
import { matchEvent } from '../../store/core'
import { SizePreset } from '../../types'
import { Button } from './Button'
import { ComponentProps, DOMComponent } from './DOMComponent'

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
    if (!sizePresets) return $wrapper
    sizePresets.forEach(preset => {
      const PresetButton = Button<RootData>(store, {
        title: `${preset.default ? '*' : ''}${preset.label}`,
        events: ['size'],
        onUpdate: ($, event) => {
          if (matchEvent<RootData>(this.storeId, 'root', event)) {
            const isCurrent = event.data.size?.rendered === preset.value
            $.innerHTML = `${isCurrent ? '*' : ''}${preset.label}`
          }
        },
        onClick: () => store.set({ size: { ...store.get('size')!, rendered: preset.value } })
      })
      $wrapper.append(PresetButton.dom())
    })
    return $wrapper
  }
}
