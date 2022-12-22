import { BaseStore, StoreEvent, StoreListener } from '../../store'

export interface ComponentProps<E extends HTMLElement, D extends {}> {
  events?: Array<keyof D>
  onUpdate?: ($: E, event: StoreEvent<D>) => void
}

export abstract class DOMComponent<
  E extends HTMLElement,
  P extends ComponentProps<E, D>,
  D extends {}
> extends StoreListener<D> {
  private $: E

  constructor(protected store: BaseStore<D>, protected props: P) {
    super([{ store, events: props.events ?? [] }])
    this.$ = this.render()
  }

  dom() {
    return this.$
  }

  abstract render(): E

  onUpdate(_: string, event: StoreEvent<D>): void {
    if (this.props.onUpdate) this.props.onUpdate(this.$, event)
  }
}
