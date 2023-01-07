export interface ModelData {
  center?: number[]
  size?: { real: number; rendered: number }
  visible?: boolean
  boundingBox?: BoundingBox
}

export type BoundingBox = [number, number, number, number]

export { StoreListener, StoreListenerConfig } from './StoreListener'
export { Store } from './Store'
export { ModelStore } from './ModelStore'
export { BaseStore, StoreEvent } from './BaseStore'
