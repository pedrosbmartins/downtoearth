import mapboxgl from 'mapbox-gl'

import { ClickEventHandler, EventHandler, Map } from '.'
import { Layer } from '../setups'
import { BoundingBox, LngLat } from '../types'
import { toLngLat } from '../utils'

interface Props {
  accessToken: string
}

export class MapBoxGL extends Map {
  public instance: mapboxgl.Map

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

  public addLayer(layer: Layer) {}

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

export abstract class MapLayer {
  public abstract show(): void
  public abstract hide(): void
}
