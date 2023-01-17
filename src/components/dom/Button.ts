import { AnyStore } from '../../store/core'
import { AnyStoreData } from '../../store/core/StoreData'
import { ComponentProps, DOMComponent } from './DOMComponent'

export function Button<D extends AnyStoreData>(store: AnyStore, props: Props<D>) {
  return new ButtonComponent(store, props)
}

interface Props<D extends AnyStoreData> extends ComponentProps<HTMLButtonElement, D> {
  title: string
  onClick: () => void
}

class ButtonComponent<D extends AnyStoreData> extends DOMComponent<
  AnyStore,
  HTMLButtonElement,
  Props<D>,
  D
> {
  render() {
    const $button = document.createElement('button') as HTMLButtonElement
    $button.innerText = this.props.title
    $button.addEventListener('click', this.props.onClick)
    return $button
  }
}
