import { LngLat } from '../types'
import { StoreData } from './core'

export { GroupStore } from './GroupStore'
export { ModelData, ModelStore } from './ModelStore'
export { RootData, RootStore } from './RootStore'

export interface BaseModelData<T extends string> extends StoreData<T> {
  visible: boolean
  center: LngLat
  bearing?: number
}
