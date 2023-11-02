import { BaseModelData, GroupStore, RootData, RootStore } from '.'
import { INITIAL_CENTER } from '../constants'
import { SingleModel } from '../setups'
import { AnyObservable, AnyStoreEvent, eventField, matchEvent, Observable, Store } from './core'
import { GroupData } from './GroupStore'

export interface ModelData extends BaseModelData<'model'> {
  sizeRatio: number
}

export class ModelStore extends Store<ModelData> {
  private rootStore: RootStore
  private groupStore: GroupStore | undefined

  constructor(model: SingleModel, rootStore: RootStore, groupStore: GroupStore | undefined) {
    const observables: AnyObservable[] = []
    const rootObservables: Array<keyof RootData> = ['size']
    if (groupStore) {
      observables.push(new Observable(groupStore, ['visible', 'center', 'bearing']))
    } else {
      rootObservables.push('center')
    }
    observables.push(new Observable(rootStore, rootObservables))
    const data: ModelData = {
      type: 'model',
      visible: model.visible ?? true,
      sizeRatio: rootStore?.sizeRatio() ?? 1.0,
      center: groupStore?.get('center') ?? rootStore?.get('center') ?? INITIAL_CENTER
    }
    super(`model-${model.id}`, data, observables)
    this.rootStore = rootStore
    this.groupStore = groupStore
  }

  onUpdate(event: AnyStoreEvent): void {
    this.matchRootEvent(event)
    this.matchGroupEvent(event)
  }

  private matchRootEvent(event: AnyStoreEvent) {
    if (!matchEvent<RootData>(this.rootStore.id, 'root', event)) return
    switch (eventField(event)) {
      case 'size':
        this.set({ sizeRatio: this.rootStore.sizeRatio() })
        break
      case 'center':
        this.set({ center: event.data.center })
        break
    }
  }

  private matchGroupEvent(event: AnyStoreEvent) {
    if (!this.groupStore) return
    if (!matchEvent<GroupData>(this.groupStore.id, 'group', event)) return
    switch (eventField(event)) {
      case 'visible':
        this.set({ visible: event.data.visible })
        break
      case 'center':
        this.set({ center: event.data.center })
        break
      case 'bearing':
        this.set({ bearing: event.data.bearing })
        break
    }
  }

  public rootCenter() {
    return this.rootStore.get('center')
  }

  public groupBearing() {
    return this.groupStore?.get('bearing')
  }
}
