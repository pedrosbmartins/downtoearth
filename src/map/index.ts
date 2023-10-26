import { Layer } from '../setups'
import { BoundingBox, LngLat } from '../types'

export type EventHandler<T = void> = (a: T) => void
export type ClickEventHandler = EventHandler<{ lngLat: LngLat }>

export abstract class BaseMap {
  protected layers: BaseMapLayer[] = []

  constructor(protected center: LngLat) {}

  public abstract addLayer(layer: Layer): void
  public abstract setCenter(center: LngLat): void
  public abstract flyTo(bbox: BoundingBox): void
  public abstract onLoad(handler: EventHandler): void
  public abstract onClick(handler: ClickEventHandler): void
}

export abstract class BaseMapLayer {
  public abstract show(): void
  public abstract hide(): void
}
