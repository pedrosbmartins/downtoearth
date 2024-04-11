import maplibregl, {
  FillLayerSpecification,
  GeoJSONSource,
  ImageSource,
  ImageSourceSpecification,
  LayerSpecification,
  LineLayerSpecification,
  RasterLayerSpecification,
  SourceSpecification,
  SymbolLayerSpecification
} from 'maplibre-gl'

import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder'
import { BaseMap, ClickEventHandler, EventHandler, GeolocateEventHandler } from '.'
import { Feature, ImageFeature, LineFeature } from '../components/map/features'
import { ShapeFeature } from '../components/map/features/shapes'
import * as Setup from '../setups'
import { BoundingBox, LngLat } from '../types'
import { toLngLat } from '../utils'

const MAPTILER_TILES_URL =
  'https://api.maptiler.com/maps/e9306780-349b-4a26-aea6-04e753c60595/style.json?key=ueYtYJJTYP1Dn4zN9eXr'

export class Map extends BaseMap {
  public instance: maplibregl.Map
  public geolocateControl: maplibregl.GeolocateControl

  public features: Record<string, { sourceIds: string[]; layerIds: string[] }> = {}
  private popups: Record<string, maplibregl.Popup> = {}

  constructor(protected center: LngLat) {
    super(center)
    this.instance = new maplibregl.Map({
      center: this.center,
      style: MAPTILER_TILES_URL,
      container: 'map',
      zoom: 10
    })
    this.geolocateControl = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      showUserLocation: false
    })
    this.instance.addControl(this.geolocateControl)
  }

  public addFeature(id: string, feature: Feature, options?: { visible?: boolean }) {
    this.features[id] = { sourceIds: [], layerIds: [] }
    const { source, layers } = this.buildResources(id, feature, options)
    this.instance.addSource(source.id, source.content)
    this.features[id].sourceIds.push(source.id)
    layers.forEach(layer => {
      this.instance.addLayer(layer)
      this.features[id].layerIds.push(layer.id)
    })
  }

  public buildResources(
    id: string,
    feature: Feature,
    options?: { visible?: boolean }
  ): MapResources {
    if (feature instanceof LineFeature) {
      return LineToRoot.build(id, feature, options)
    } else if (feature instanceof ImageFeature) {
      return Image.build(id, feature, options)
    } else if (feature instanceof ShapeFeature) {
      return Shape.build(id, feature, options)
    } else {
      throw new Error(`Feature ${feature.id} not supported.`)
    }
  }

  public updateFeature(id: string, data: GeoJSON.Feature) {
    this.features[id].sourceIds.forEach(sourceId => {
      const source = this.instance.getSource(sourceId)
      if (source === undefined) return
      switch (source.type) {
        case 'geojson':
          ;(source as GeoJSONSource).setData(data)
          break
        case 'image':
          ;(source as ImageSource).setCoordinates((data.geometry as any).coordinates[0])
          this.instance.setPaintProperty(this.features[id].layerIds[0], 'raster-opacity', 0.1)
          break
      }
    })
  }

  public removeFeature(id: string) {
    this.features[id].layerIds.forEach(layerId => {
      this.instance.removeLayer(layerId)
    })
    this.features[id].sourceIds.forEach(sourceId => {
      this.instance.removeSource(sourceId)
    })
  }

  public showFeature(id: string) {
    this.features[id].layerIds.forEach(layerId => {
      this.instance.setLayoutProperty(layerId, 'visibility', 'visible')
    })
  }

  public hideFeature(id: string) {
    this.features[id].layerIds.forEach(layerId => {
      this.instance.setLayoutProperty(layerId, 'visibility', 'none')
    })
  }

  public setCenter(center: LngLat) {
    this.instance.setCenter(center)
  }

  public flyTo(bbox: BoundingBox) {
    this.instance.fitBounds(bbox, { padding: 20 })
  }

  public addPopup(id: string, content: string, center: LngLat): void {
    this.popups[id] = new maplibregl.Popup({ closeButton: false })
      .setLngLat(center)
      .setText(content)
      .addTo(this.instance)
  }

  public updatePopup(id: string, content: string, center: LngLat): void {
    if (this.removePopup(id)) {
      this.addPopup(id, content, center)
    }
  }

  public removePopup(id: string): boolean {
    const popup = this.popups[id]
    if (!popup) return false
    popup.remove()
    return true
  }

  public buildGeocoder($container: HTMLElement, handler: (center: LngLat) => void) {
    const geocoderApi = {
      forwardGeocode: async (config: any) => {
        const features = []
        try {
          const request = `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geojson=1&addressdetails=1`
          const response = await fetch(request)
          const geojson = await response.json()
          for (const feature of geojson.features) {
            const center = [
              feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
              feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2
            ]
            const point = {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: center
              },
              place_name: feature.properties.display_name,
              properties: feature.properties,
              text: feature.properties.display_name,
              place_type: ['place'],
              center
            }
            features.push(point)
          }
        } catch (e) {
          console.error(`Failed to forwardGeocode with error: ${e}`)
        }

        return {
          features
        }
      }
    }
    const geocoder = new MaplibreGeocoder(geocoderApi, {
      marker: false,
      flyTo: false,
      trackProximity: false
    })
    geocoder.on('result', (event: { result: { center: LngLat } }) => {
      handler(event.result.center)
    })
    const $geocoderElement = $container.querySelector<HTMLElement>('#geocoder')!
    $geocoderElement.appendChild(geocoder.onAdd(this.instance))
    const $geocoderInput = $geocoderElement.querySelector<HTMLInputElement>(
      '.maplibregl-ctrl-geocoder--input'
    )!
    return $geocoderInput
  }

  public onLoad(handler: EventHandler) {
    this.instance.on('load', handler)
  }

  public onClick(handler: ClickEventHandler) {
    this.instance.on('click', event => {
      const lngLat = toLngLat(event.lngLat.toArray())
      handler({ lngLat })
    })
  }

  public onGeolocate(handler: GeolocateEventHandler): void {
    this.geolocateControl.on('geolocate', (event: any) => {
      if (isGeolocateResultEvent(event)) {
        const { longitude, latitude } = event.coords
        handler({ lngLat: [longitude, latitude] })
      }
    })
  }
}

interface FeatureSource {
  id: string
  content: SourceSpecification
}

type FeatureLayer = LayerSpecification & { id: string }

interface MapResources {
  source: FeatureSource
  layers: FeatureLayer[]
}

type ShapeProps = Setup.ShapeFeature & { visible?: boolean }

class Shape {
  public static build(
    id: string,
    feature: ShapeFeature<Setup.ShapeFeature>,
    options?: { visible?: boolean }
  ): MapResources {
    const props: ShapeProps = { ...feature.definition, ...options }
    const sourceId = `${id}-main`
    return {
      source: { id: sourceId, content: { type: 'geojson' as const, data: feature.data() } },
      layers: Shape.layers(sourceId, props)
    }
  }

  private static layers(sourceId: string, props: ShapeProps): LayerSpecification[] {
    return [
      ...this.fillLayer(sourceId, props),
      ...this.outlineLayer(sourceId, props),
      ...this.labelLayer(sourceId, props),
      ...this.outlineLabelLayer(sourceId, props)
    ]
  }

  private static fillLayer(sourceId: string, props: ShapeProps): FillLayerSpecification[] {
    if (!props.fill) return []
    return [
      {
        id: `${sourceId}-fill`,
        type: 'fill',
        source: sourceId,
        layout: {
          visibility: props.visible ?? true ? 'visible' : 'none'
        },
        paint: {
          'fill-color': props.fill.color,
          'fill-opacity': props.fill.opacity ?? 0.5
        }
      }
    ]
  }

  private static outlineLayer(sourceId: string, props: ShapeProps): LineLayerSpecification[] {
    if (!props.outline) return []
    return [
      {
        id: `${sourceId}-outline`,
        type: 'line',
        source: sourceId,
        layout: {
          visibility: props.visible ?? true ? 'visible' : 'none'
        },
        paint: {
          'line-color': props.outline.color,
          'line-width': props.outline.width ?? 1
        }
      }
    ]
  }

  private static labelLayer(sourceId: string, props: ShapeProps): SymbolLayerSpecification[] {
    if (!props.label || props.label.position !== 'center') return []
    return [
      {
        id: `${sourceId}-label`,
        type: 'symbol',
        source: sourceId,
        layout: {
          visibility: props.visible ?? true ? 'visible' : 'none',
          'symbol-placement': 'point',
          'text-font': ['Open Sans Regular'],
          'text-field': props.label.value,
          'text-size': 14
        }
      }
    ]
  }

  private static outlineLabelLayer(
    sourceId: string,
    props: ShapeProps
  ): SymbolLayerSpecification[] {
    if (!props.label || props.label.position !== 'outline') return []
    return [
      {
        id: `${sourceId}-outline-label`,
        type: 'symbol',
        source: sourceId,
        layout: {
          visibility: props.visible ?? true ? 'visible' : 'none',
          'symbol-placement': 'line',
          'symbol-spacing': 500,
          'text-font': ['Open Sans Regular'],
          'text-field': props.label.value,
          'text-size': 14,
          'text-pitch-alignment': 'viewport',
          'text-anchor': 'bottom'
        }
      }
    ]
  }
}

class LineToRoot {
  public static build(id: string, feature: Feature, options?: { visible?: boolean }): MapResources {
    const sourceId = `${id}-rootline`
    return {
      source: { id: sourceId, content: { type: 'geojson' as const, data: feature.data() } },
      layers: [LineToRoot.layer(sourceId, options?.visible)]
    }
  }

  public static layer(sourceId: string, visible: boolean = true): LineLayerSpecification {
    return {
      id: sourceId,
      type: 'line',
      source: sourceId,
      layout: {
        visibility: visible ? 'visible' : 'none'
      },
      paint: {
        'line-color': '#555',
        'line-width': 2
      }
    }
  }
}

class Image {
  public static build(
    id: string,
    feature: ImageFeature,
    options?: { visible?: boolean }
  ): MapResources {
    const sourceId = `${id}-rootline`
    return {
      source: { id: sourceId, content: Image.source(feature) },
      layers: [Image.layer(sourceId, options?.visible)]
    }
  }

  static source(feature: ImageFeature): ImageSourceSpecification {
    console.log(feature.data().geometry.coordinates[0])
    return {
      type: 'image',
      url: feature.definition.url,
      coordinates: feature.data().geometry.coordinates[0] as any
    }
  }

  public static layer(sourceId: string, visible: boolean = true): RasterLayerSpecification {
    return {
      id: sourceId,
      type: 'raster',
      source: sourceId,
      paint: {
        'raster-fade-duration': 0,
        'raster-opacity': 0.75
      }
    }
  }
}

function isGeolocateResultEvent(event: any): event is GeolocateResultEvent {
  return event.type && event.type === 'geolocate'
}

interface GeolocateResultEvent {
  type: 'geolocate'
  coords: GeolocationCoordinates
}
