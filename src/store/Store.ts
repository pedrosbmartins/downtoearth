import { ModelData } from '.'
import { BaseStore, StoreEvent } from './BaseStore'

export class Store extends BaseStore<ModelData> {
  onUpdate(_: string, __: StoreEvent<ModelData>) {}
}
