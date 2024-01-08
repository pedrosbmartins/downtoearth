import { Feature as GeoJSONFeature, GeoJsonProperties, Geometry } from 'geojson'
import { Feature } from '../../components/map/features'
import { BaseMap, ClickEventHandler, EventHandler, GeolocateEventHandler } from '../../map'
import { BoundingBox, LngLat } from '../../types'

export class MockMap extends BaseMap {
  public addFeature(
    id: string,
    feature: Feature,
    options?: { visible?: boolean | undefined } | undefined
  ): void {
    throw new Error('Method not implemented.')
  }
  public updateFeature(id: string, data: GeoJSONFeature<Geometry, GeoJsonProperties>): void {
    throw new Error('Method not implemented.')
  }
  public removeFeature(id: string): void {
    throw new Error('Method not implemented.')
  }
  public showFeature(id: string): void {
    throw new Error('Method not implemented.')
  }
  public hideFeature(id: string): void {
    throw new Error('Method not implemented.')
  }
  public addPopup(id: string, content: string, center: LngLat): void {
    throw new Error('Method not implemented.')
  }
  public updatePopup(id: string, content: string, center: LngLat): void {
    throw new Error('Method not implemented.')
  }
  public removePopup(id: string): void {
    throw new Error('Method not implemented.')
  }
  public buildGeocoder(
    $container: HTMLElement,
    handler: (center: LngLat) => void
  ): HTMLInputElement {
    throw new Error('Method not implemented.')
  }
  public setCenter(center: LngLat): void {
    throw new Error('Method not implemented.')
  }
  public flyTo(bbox: BoundingBox): void {
    throw new Error('Method not implemented.')
  }
  public onLoad(handler: EventHandler<void>): void {
    throw new Error('Method not implemented.')
  }
  public onClick(handler: ClickEventHandler): void {
    throw new Error('Method not implemented.')
  }
  public onGeolocate(handler: GeolocateEventHandler): void {
    throw new Error('Method not implemented.')
  }
}
