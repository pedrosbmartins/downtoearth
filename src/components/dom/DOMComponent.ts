import { AnyStore, AnyStoreEvent, StoreData, StoreListener } from '../../store/core'

export interface ComponentProps<E extends HTMLElement, D extends StoreData<any>> {
  events?: Array<keyof D>
  onUpdate?: ($: E, event: AnyStoreEvent) => void
}

export abstract class DOMComponent<
  S extends AnyStore,
  E extends HTMLElement,
  P extends ComponentProps<E, D>,
  D extends StoreData<any>
> extends StoreListener {
  protected storeId: string
  private $: E

  constructor(protected store: S, protected props: P) {
    super([{ store, events: props.events ?? [] }])
    this.storeId = store.id
    this.$ = this.render()
  }

  dom() {
    return this.$
  }

  abstract render(): E

  onUpdate(event: AnyStoreEvent): void {
    if (this.props.onUpdate) this.props.onUpdate(this.$, event)
  }
}
