import { Feature } from '../components/map/features'
import { BoundingBox, LngLat } from '../types'

export type EventHandler<T = void> = (a: T) => void
export type ClickEventHandler = EventHandler<{ lngLat: LngLat }>
export type GeolocateEventHandler = EventHandler<{ lngLat: LngLat }>

export abstract class BaseMap {
  constructor(protected center: LngLat) {}

  public abstract addFeature(id: string, feature: Feature, options?: { visible?: boolean }): void
  public abstract updateFeature(id: string, data: GeoJSON.Feature): void
  public abstract removeFeature(id: string): void

  public abstract showFeature(id: string): void
  public abstract hideFeature(id: string): void

  public abstract addPopup(id: string, content: string, center: LngLat): void
  public abstract updatePopup(id: string, content: string, center: LngLat): void
  public abstract removePopup(id: string): void

  public abstract buildGeocoder(
    $container: HTMLElement,
    handler: (center: LngLat) => void
  ): HTMLInputElement

  public abstract setCenter(center: LngLat): void
  public abstract flyTo(bbox: BoundingBox): void

  public abstract onLoad(handler: EventHandler): void
  public abstract onClick(handler: ClickEventHandler): void
  public abstract onGeolocate(handler: GeolocateEventHandler): void
}
