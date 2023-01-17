import map, { fitBounds } from '../../map'
import { BoundingBox, ModelData, RootData } from '../../store'
import { AnyStoreEvent, matchEvent, Store, StoreEvent } from '../../store/core'
import { GroupData } from '../../store/GroupStore'
import { SizePreset } from '../../types'
import { Button } from './Button'
import { ComponentProps, DOMComponent } from './DOMComponent'

type SidebarItemStore = Store<SidebarItemData<any>>

export interface SidebarItemData<T extends string> {
  type: T
  visible: boolean
  center: number[]
  size: { real: number; rendered: number }
  boundingBox?: BoundingBox
}

export function SidebarItem<S extends SidebarItemStore>(props: Props, store: S) {
  return new SidebarItemComponent(store, { ...props, events: ['visible'] })
}

type Data = RootData | GroupData | ModelData

interface Props extends ComponentProps<HTMLDivElement, SidebarItemData<any>> {
  label: string
  sizePresets?: SizePreset[]
}

function matchDataEvent(
  storeId: string,
  event: AnyStoreEvent
): event is StoreEvent<SidebarItemData<any>> {
  return (
    matchEvent<SidebarItemData<'root'>>(storeId, 'root', event) ||
    matchEvent<SidebarItemData<'group'>>(storeId, 'group', event) ||
    matchEvent<SidebarItemData<'model'>>(storeId, 'model', event)
  )
}

class SidebarItemComponent<S extends SidebarItemStore> extends DOMComponent<
  S,
  HTMLDivElement,
  Props,
  SidebarItemData<any>
> {
  render() {
    const $label = document.createElement('h3')
    $label.innerText = this.props.label

    const $sizePresets = this.buildSizePresets()

    const VisibilityButton = Button<SidebarItemData<any>>(this.store, {
      title: 'Hide',
      events: ['visible'],
      onUpdate: ($, event) => {
        if (matchDataEvent(this.storeId, event)) {
          $.innerText = event.data.visible ? 'Hide' : 'Show'
        }
      },
      onClick: () => {
        this.store.set({ visible: !this.store.get('visible') })
      }
    })

    const CenterButton = Button<SidebarItemData<any>>(this.store, {
      title: 'Center',
      events: ['visible'],
      onClick: () => {
        const boundingBox = this.store.get('boundingBox')
        if (!boundingBox) {
          console.warn(`store ${this.store.id} has no bounding box defined`)
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
