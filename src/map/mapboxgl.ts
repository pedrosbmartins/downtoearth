import mapboxgl, { AnyLayer, FillLayer, GeoJSONSourceRaw, LineLayer, SymbolLayer } from 'mapbox-gl'

import { BaseMap, ClickEventHandler, EventHandler, Feature } from '.'
import { Layer } from '../setups'
import { BoundingBox, LngLat } from '../types'
import { toLngLat } from '../utils'

interface Props {
  accessToken: string
}

type ShapeProps = Layer & { visible?: boolean }

export class Map extends BaseMap {
  public instance: mapboxgl.Map

  private features: Record<string, { sourceIds: string[]; layerIds: string[] }> = {}

  constructor(protected center: LngLat, props: Props) {
    super(center)
    this.instance = new mapboxgl.Map({
      accessToken: props.accessToken,
      center: this.center,
      style: 'mapbox://styles/pedrosbmartins/ckxorrc2q6hzp15p9b9kojnvj',
      container: 'map',
      projection: { name: 'globe' },
      zoom: 10
    })
  }

  public addFeature(feature: Feature, options?: { visible?: boolean }) {
    const featureId = feature.layerDefinition.id
    this.features[featureId] = { sourceIds: [], layerIds: [] }
    const { sources, layers } = Shape.build(featureId, feature)
    sources.forEach(source => {
      this.instance.addSource(source.id, source.content)
      this.features[featureId].sourceIds.push(source.id)
    })
    layers.forEach(layer => {
      this.instance.addLayer(layer)
      this.features[featureId].layerIds.push(layer.id)
    })
  }

  public updateFeature(id: string, data: GeoJSON.Feature) {
    this.features[id].sourceIds.forEach(sourceId => {
      const source = this.instance.getSource(sourceId)
      if (source.type !== 'geojson') return
      source.setData(data)
    })
  }

  public removeFeature(id: string) {}

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

  public onLoad(handler: EventHandler) {
    this.instance.on('load', handler)
  }

  public onClick(handler: ClickEventHandler) {
    this.instance.on('click', event => {
      const lngLat = toLngLat(event.lngLat.toArray())
      handler({ lngLat })
    })
  }
}

class Shape {
  public static build(
    id: string,
    feature: Feature,
    options?: { visible?: boolean }
  ): {
    sources: { id: string; content: GeoJSONSourceRaw }[]
    layers: Array<AnyLayer & { id: string }>
  } {
    const sourceId = `${id}-main`
    return {
      sources: [{ id: sourceId, content: { type: 'geojson', data: feature.data() } }],
      layers: Shape.layers(sourceId, { ...feature.layerDefinition, ...options })
    }
  }

  private static layers(sourceId: string, props: ShapeProps): AnyLayer[] {
    return [
      ...this.fillLayer(sourceId, props),
      ...this.outlineLayer(sourceId, props),
      ...this.labelLayer(sourceId, props)
    ]
  }

  private static fillLayer(sourceId: string, props: ShapeProps): FillLayer[] {
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

  private static outlineLayer(sourceId: string, props: ShapeProps): LineLayer[] {
    if (!props.outline) return []
    return [
      {
        id: `${sourceId}-outline`,
        type: 'line',
        source: sourceId,
        layout: {},
        paint: {
          'line-color': props.outline.color,
          'line-width': props.outline.width ?? 1
        }
      }
    ]
  }

  private static labelLayer(sourceId: string, props: ShapeProps): SymbolLayer[] {
    if (!props.label || props.label.position !== 'center') return []
    return [
      {
        id: `${sourceId}-label`,
        type: 'symbol',
        source: sourceId,
        layout: {
          'symbol-placement': 'point',
          'text-font': ['Open Sans Regular'],
          'text-field': props.label.value,
          'text-size': 14
        }
      }
    ]
  }
}
