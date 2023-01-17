import { GroupStore, UnitStore } from '.'
import { SidebarItemData } from '../components/dom/SidebarItem'
import { Model } from '../types'
import { AnyObservable, AnyStoreEvent, eventField, matchEvent, Observable, Store, StoreData } from './core'
import { GroupData } from './GroupStore'
import { UnitData } from './UnitStore'

export interface ModelData extends StoreData<'model'>, SidebarItemData<'model'> {
  sizeRatio: number
  offset?: number
}

export class ModelStore extends Store<ModelData> {
  private unitStoreId: string
  private groupStoreId: string

  constructor(model: Model, unitStore: UnitStore, groupStore: GroupStore | undefined) {
    const observables: AnyObservable[] = [new Observable(unitStore, ['ratio'])]
    if (groupStore) observables.push(new Observable(groupStore, ['visible', 'center']))
    const data: ModelData = {
      type: 'model',
      visible: model.visible,
      sizeRatio: unitStore.get('ratio'),
      center: [],
      size: { real: 0, rendered: 0 }
    }
    super(`model-${model.id}`, data, observables)
    this.unitStoreId = unitStore.id
    this.groupStoreId = groupStore?.id ?? ''
  }

  onUpdate(event: AnyStoreEvent): void {
    if (matchEvent<UnitData>(this.unitStoreId, 'unit', event)) {
      this.set({ sizeRatio: event.data.ratio })
    }
    if (matchEvent<GroupData>(this.groupStoreId, 'group', event)) {
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
