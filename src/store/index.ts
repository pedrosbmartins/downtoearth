export interface ModelData {
  center?: number[]
  size?: number
  visible?: boolean
  boundingBox?: BoundingBox
}

export type BoundingBox = [number, number, number, number]

export { StoreListener } from './listener'
export { Store, StoreEvent } from './base'
