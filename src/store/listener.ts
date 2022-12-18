import { Store, StoreEvent } from '.'

export abstract class StoreListener<D extends {}> extends EventTarget {
  constructor(config: Array<{ store: Store<D>; events: Array<keyof D> }>) {
    super()
    config.forEach(({ store, events }) => {
      events.forEach(event => {
        store.register(this, event, e => this.onUpdate(store.id(), e))
      })
    })
  }

  abstract onUpdate(storeId: string, event: StoreEvent<D>): void
}
