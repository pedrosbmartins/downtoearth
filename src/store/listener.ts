import { Store, StoreEvent } from '.'

export abstract class StoreListener<D extends {}> extends EventTarget {
  constructor(store: Store<D>, events: Array<keyof D>) {
    super()
    events.forEach(event => {
      store.register(this, event, this.onUpdate)
    })
  }

  abstract onUpdate(event: StoreEvent<D>): void
}
