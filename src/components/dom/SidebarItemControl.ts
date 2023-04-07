import { AnyStore } from '../../store/core'
import { AnyStoreData } from '../../store/core/StoreData'
import { ComponentProps, DOMComponent } from './DOMComponent'

export function SidebarItemControl<D extends AnyStoreData>(store: AnyStore, props: Props<D>) {
  return new SidebarItemControlComponent(store, props)
}

interface Props<D extends AnyStoreData> extends ComponentProps<HTMLDivElement, D> {
  icon: string
  onClick: (event: Event) => void
}

class SidebarItemControlComponent<D extends AnyStoreData> extends DOMComponent<
  AnyStore,
  HTMLDivElement,
  Props<D>,
  D
> {
  render() {
    const $div = document.createElement('div')
    $div.className = 'center'
    $div.innerHTML = `<img alt="center" src="../assets/icons/ui/${this.props.icon}.png" />`
    $div.addEventListener('click', this.props.onClick)
    if (this.props.children) $div.append(...this.props.children)
    return $div
  }
}
