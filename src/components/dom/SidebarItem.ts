import { fitBounds } from '../../map'
import { BoundingBox } from '../../store'
import { AnyStoreEvent, matchEvent, Store, StoreData, StoreEvent } from '../../store/core'
import { Button } from './Button'
import { ComponentProps, DOMComponent } from './DOMComponent'

type SidebarItemStore = Store<SidebarItemData<any>>

export interface SidebarItemData<T extends string> extends StoreData<T> {
  visible: boolean
  center: number[]
  boundingBox?: BoundingBox
}

export function SidebarItem<S extends SidebarItemStore>(props: Props, store: S) {
  return new SidebarItemComponent(store, { ...props, events: ['visible'] })
}

interface Props extends ComponentProps<HTMLDivElement, SidebarItemData<any>> {
  label: string
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
    $wrapper.append($label)
    this.props.children?.forEach(child => $wrapper.append(child.dom()))
    $wrapper.append(VisibilityButton.dom(), CenterButton.dom())

    return $wrapper
  }
}
