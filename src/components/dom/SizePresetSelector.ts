import { AnyStore } from '../../store/core'
import { AnyStoreData } from '../../store/core/StoreData'
import { ComponentProps, DOMComponent } from './DOMComponent'

export function SizePresetSelector<D extends AnyStoreData>(store: AnyStore, props: Props<D>) {
  return new SizePresetSelectorComponent(store, props)
}

interface Props<D extends AnyStoreData> extends ComponentProps<HTMLDivElement, D> {
  label: string
  selected?: boolean
  onClick: () => void
}

class SizePresetSelectorComponent<D extends AnyStoreData> extends DOMComponent<
  AnyStore,
  HTMLDivElement,
  Props<D>,
  D
> {
  render() {
    const $div = document.createElement('div')
    $div.className = 'selector'
    $div.innerHTML = `<div class="selector-item${this.props.selected ? ' selected' : ''}"><span>${
      this.props.label
    }</span></div>`
    $div.addEventListener('click', this.props.onClick)
    return $div
  }
}
