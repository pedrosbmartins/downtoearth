import { AnyStoreEvent, matchEvent, Store, StoreData, StoreEvent } from '../../store/core'
import { Button } from './Button'
import { ComponentProps, DOMComponent } from './DOMComponent'

type SidebarItemStore = Store<SidebarItemData<string>>

export interface SidebarItemData<T extends string> extends StoreData<T> {
  visible: boolean
  center: number[]
  bearing?: number
}

export function SidebarItem<S extends SidebarItemStore>(props: Props, store: S) {
  return new SidebarItemComponent(store, { ...props, events: ['visible'] })
}

interface Props extends ComponentProps<HTMLDivElement, SidebarItemData<any>> {
  label: string
  bearingControl?: boolean
  onCenter?: () => void
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
      onClick: this.props.onCenter ?? (() => {})
    })

    const $wrapper = document.createElement('div')
    $wrapper.append($label)

    if (this.props.bearingControl) {
      const $bearingControl = document.createElement<'input'>('input')
      $bearingControl.setAttribute('type', 'range')
      $bearingControl.setAttribute('min', '0')
      $bearingControl.setAttribute('max', '360')
      $bearingControl.setAttribute('value', '270')
      $bearingControl.setAttribute('step', '1')
      $bearingControl.addEventListener('input', event =>
        this.store.set({ bearing: (event.target as any).value })
      )
      $wrapper.append($bearingControl)
    }

    this.props.children?.forEach(child => $wrapper.append(child.dom()))
    $wrapper.append(VisibilityButton.dom(), CenterButton.dom())

    return $wrapper
  }
}
