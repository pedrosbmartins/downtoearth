import { BaseStore, StoreEvent } from './BaseStore'

export type StoreListenerConfig<D extends {}> = { store: BaseStore<D>; events: Array<keyof D> }

export abstract class StoreListener<D extends {}> extends EventTarget {
  constructor(config: StoreListenerConfig<D>[]) {
    super()
    config.forEach(({ store, events }) => {
      events.forEach(event => {
        store.register(this, event, e => this.onUpdate(store.id(), e))
      })
    })
  }

  abstract onUpdate(storeId: string, event: StoreEvent<D>): void
}
