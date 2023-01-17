import { AnyStore, StoreData } from '../../store/core'
import { ComponentProps, DOMComponent } from './DOMComponent'

export function Button<D extends StoreData<any>>(store: AnyStore, props: Props<D>) {
  return new ButtonComponent(store, props)
}

interface Props<D extends StoreData<any>> extends ComponentProps<HTMLButtonElement, D> {
  title: string
  onClick: () => void
}

class ButtonComponent<D extends StoreData<any>> extends DOMComponent<
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
