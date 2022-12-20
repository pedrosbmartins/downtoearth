import { Store } from '../../store'
import { ComponentProps, DOMComponent } from './base'

export function Button<D extends {}>(store: Store<D>, props: Props<D>) {
  return new ButtonComponent(store, props)
}

interface Props<D extends {}> extends ComponentProps<HTMLButtonElement, D> {
  title: string
  onClick: () => void
}

class ButtonComponent<D extends {}> extends DOMComponent<HTMLButtonElement, Props<D>, D> {
  render() {
    const $button = document.createElement('button') as HTMLButtonElement
    $button.innerText = this.props.title
    $button.addEventListener('click', this.props.onClick)
    return $button
  }
}