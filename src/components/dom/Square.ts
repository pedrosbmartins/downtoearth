import { Store } from '../../store'
import { ComponentProps, DOMComponent } from './base'

export function Square<D extends {}>(store: Store<D>, props: Props<D>) {
  return new SquareComponent(store, props)
}

interface Props<D extends {}> extends ComponentProps<HTMLDivElement, D> {
  color: string
}

class SquareComponent<D extends {}> extends DOMComponent<HTMLDivElement, Props<D>, D> {
  render() {
    const $square = document.createElement('div')
    $square.setAttribute('style', `width:100px;height:100px;background:${this.props.color}`)
    return $square
  }
}
