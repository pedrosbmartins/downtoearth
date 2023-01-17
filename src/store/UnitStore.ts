import { AnyObservable, AnyStoreEvent, eventField, matchEvent, Observable, Store, StoreData } from './core'
import { RootData, RootStore } from './RootStore'

export interface UnitData extends StoreData<'unit'> {
  ratio: number
}

export class UnitStore extends Store<UnitData> {
  private rootStoreId: string

  constructor(rootStore: RootStore | undefined) {
    let ratio = 1
    const observable: AnyObservable[] = []
    if (rootStore) {
      const { real: rootReal, rendered: rootRendered } = rootStore.get('size')
      ratio = rootRendered / rootReal
      observable.push(new Observable(rootStore, ['size']))
    }
    const data: UnitData = { type: 'unit', ratio }
    super('unit', data, observable)
    this.rootStoreId = rootStore?.id || ''
  }

  onUpdate(event: AnyStoreEvent) {
    if (matchEvent<RootData>(this.rootStoreId, 'root', event)) {
      if (eventField(event) === 'size') {
        const { real: rootReal, rendered: rootRendered } = event.data.size
        this.set({ ratio: rootRendered / rootReal })
      }
    }
  }
}
