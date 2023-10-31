import mapboxgl from 'mapbox-gl'

import { BaseMap, CircleFeature, ClickEventHandler, EventHandler, Feature } from '.'
import { BoundingBox, LngLat } from '../types'
import { toLngLat } from '../utils'

interface Props {
  accessToken: string
}

export namespace MapBoxGL {
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
      const { layerDefinition } = feature
      const featureId = layerDefinition.id
      this.features[featureId] = { sourceIds: [], layerIds: [] }
      if (feature instanceof CircleFeature) {
        const sourceId = `${featureId}-circle`
        this.instance.addSource(sourceId, { type: 'geojson', data: feature.data() })
        this.features[featureId].sourceIds.push(sourceId)
        if (layerDefinition.fill) {
          const id = `${sourceId}-fill`
          this.features[featureId].layerIds.push(id)
          this.instance.addLayer({
            id,
            type: 'fill',
            source: sourceId,
            layout: {
              visibility: options?.visible ?? true ? 'visible' : 'none'
            },
            paint: {
              'fill-color': layerDefinition.fill.color,
              'fill-opacity': layerDefinition.fill.opacity ?? 0.5
            }
          })
        }
        if (layerDefinition.outline) {
          const id = `${sourceId}-outline`
          this.features[featureId].layerIds.push(id)
          this.instance.addLayer({
            id,
            type: 'line',
            source: sourceId,
            layout: {},
            paint: {
              'line-color': layerDefinition.outline.color,
              'line-width': layerDefinition.outline.width ?? 1
            }
          })
        }
        if (layerDefinition.label && layerDefinition.label.position !== 'center') {
          const id = `${sourceId}-label`
          this.features[featureId].layerIds.push(id)
          this.instance.addLayer({
            id,
            type: 'symbol',
            source: sourceId,
            layout: {
              'symbol-placement': 'point',
              'text-font': ['Open Sans Regular'],
              'text-field': layerDefinition.label.value,
              'text-size': 14
            }
          })
        }
      }
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
}
