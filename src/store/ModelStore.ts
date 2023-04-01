import { GroupStore, RootData, RootStore } from '.'
import { SidebarItemData } from '../components/dom/SidebarItem'
import { Model } from '../types'
import { AnyObservable, AnyStoreEvent, eventField, matchEvent, Observable, Store, StoreData } from './core'
import { GroupData } from './GroupStore'

export interface ModelData extends StoreData<'model'>, SidebarItemData<'model'> {
  sizeRatio: number
}

export class ModelStore extends Store<ModelData> {
  private rootStore: RootStore | undefined
  private groupStore: GroupStore | undefined

  constructor(model: Model, rootStore: RootStore | undefined, groupStore: GroupStore | undefined) {
    const observables: AnyObservable[] = []
    if (rootStore) observables.push(new Observable(rootStore, ['size']))
    if (groupStore) observables.push(new Observable(groupStore, ['visible', 'center']))
    const data: ModelData = {
      type: 'model',
      visible: model.visible,
      sizeRatio: rootStore?.sizeRatio() ?? 1.0,
      center: groupStore?.get('center') ?? []
    }
    super(`model-${model.id}`, data, observables)
    this.rootStore = rootStore
    this.groupStore = groupStore
  }

  onUpdate(event: AnyStoreEvent): void {
    if (this.rootStore && matchEvent<RootData>(this.rootStore.id, 'root', event)) {
      if (eventField(event) === 'size') {
        this.set({ sizeRatio: this.rootStore.sizeRatio() })
      }
    }
    if (this.groupStore && matchEvent<GroupData>(this.groupStore.id, 'group', event)) {
      switch (eventField(event)) {
        case 'visible':
          this.set({ visible: event.data.visible })
          break
        case 'center':
          this.set({ center: event.data.center })
          break
      }
    }
  }
}
