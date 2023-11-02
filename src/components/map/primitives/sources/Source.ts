import { AnyLayer, GeoJSONSourceRaw } from 'mapbox-gl'

import map from '../../../../mapConfig'

export abstract class Source<D extends {} = {}> {
  constructor(
    public id: string,
    private type: 'geojson',
    protected dataGetter: () => D,
    public layers: AnyLayer[]
  ) {
    map.instance.addSource(id, this.content())
    layers.forEach(layer => {
      map.instance.addLayer(layer)
    })
  }

  public abstract data(): GeoJSON.Feature

  public update() {
    const source = this.mapSource()
    if (source.type === 'geojson') {
      source.setData(this.data())
    } else {
      console.warn(`could not update source ${this.id}, unknown type ${source.type}`)
    }
  }

  public content(): GeoJSONSourceRaw {
    return { type: this.type, data: this.data() }
  }

  private mapSource() {
    return map.instance.getSource(this.id)
  }
}
