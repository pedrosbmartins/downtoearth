import mapboxgl, { AnyLayer, AnySourceData, FillLayer, LineLayer, SymbolLayer } from 'mapbox-gl'

import { BaseMap, ClickEventHandler, EventHandler } from '.'
import { Feature, LineFeature } from '../components/map/features'
import { ShapeFeature } from '../components/map/features/shapes'
import { ShapeLayer } from '../setups'
import { BoundingBox, LngLat } from '../types'
import { toLngLat } from '../utils'

interface Props {
  accessToken: string
}

export class Map extends BaseMap {
  public instance: mapboxgl.Map

  private features: Record<string, { sourceIds: string[]; layerIds: string[] }> = {}
  private popups: Record<string, mapboxgl.Popup> = {}

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
    } else if (feature instanceof ShapeFeature) {
      return Shape.build(id, feature, options)
    } else {
      throw new Error(`Feature ${feature.id} not supported.`)
    }
  }

  public updateFeature(id: string, data: GeoJSON.Feature) {
    this.features[id].sourceIds.forEach(sourceId => {
      const source = this.instance.getSource(sourceId)
      if (source.type !== 'geojson') return
      source.setData(data)
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

  public onLoad(handler: EventHandler) {
    this.instance.on('load', handler)
  }

  public onClick(handler: ClickEventHandler) {
    this.instance.on('click', event => {
      const lngLat = toLngLat(event.lngLat.toArray())
      handler({ lngLat })
    })
  }

  public addPopup(id: string, content: string, center: LngLat): void {
    this.popups[id] = new mapboxgl.Popup({ closeButton: false })
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
}

interface FeatureSource {
  id: string
  content: AnySourceData
}

type FeatureLayer = AnyLayer & { id: string }

interface MapResources {
  source: FeatureSource
  layers: FeatureLayer[]
}

type ShapeProps = ShapeLayer & { visible?: boolean }

class Shape {
  public static build(
    id: string,
    feature: ShapeFeature<ShapeLayer>,
    options?: { visible?: boolean }
  ): MapResources {
    const props: ShapeProps = { ...feature.layerDefinition, ...options }
    const sourceId = `${id}-main`
    return {
      source: { id: sourceId, content: { type: 'geojson' as const, data: feature.data() } },
      layers: Shape.layers(sourceId, props)
    }
  }

  private static layers(sourceId: string, props: ShapeProps): AnyLayer[] {
    return [
      ...this.fillLayer(sourceId, props),
      ...this.outlineLayer(sourceId, props),
      ...this.labelLayer(sourceId, props),
      ...this.outlineLabelLayer(sourceId, props)
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

  private static labelLayer(sourceId: string, props: ShapeProps): SymbolLayer[] {
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

  private static outlineLabelLayer(sourceId: string, props: ShapeProps): SymbolLayer[] {
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
      layers: [LineToRoot.layer(sourceId)]
    }
  }

  public static layer(sourceId: string): LineLayer {
    return {
      id: sourceId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#555',
        'line-width': 2
      }
    }
  }
}
