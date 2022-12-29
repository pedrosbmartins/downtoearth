import { AnyLayer, GeoJSONSourceRaw } from 'mapbox-gl'

import map from '../../../../map'

export abstract class Source {
  constructor(
    public id: string,
    private type: 'geojson',
    public data: () => any,
    public layers: AnyLayer[]
  ) {}

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
    return map.getSource(this.id)
  }
}
