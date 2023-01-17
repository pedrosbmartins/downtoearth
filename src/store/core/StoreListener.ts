import { Store } from './Store'
import { StoreData } from './StoreData'
import { AnyStoreEvent } from './StoreEvent'

export class Observable<D extends StoreData<any>> {
  constructor(public store: Store<D>, public events: Array<keyof D>) {}
}

export type AnyObservable = Observable<any>

export abstract class StoreListener extends EventTarget {
  constructor(observables: AnyObservable[]) {
    super()
    observables.forEach(observable => {
      observable.events.forEach(event => {
        observable.store.register(this, event, (e: AnyStoreEvent) => this.onUpdate(e))
      })
    })
  }

  abstract onUpdate(event: AnyStoreEvent): void
}
