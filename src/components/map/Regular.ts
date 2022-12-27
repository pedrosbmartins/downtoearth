import { INITIAL_CENTER } from '../../map'
import { ModelData, ModelStore, StoreEvent } from '../../store'
import { Layer } from '../../types'
import { Circle } from '../map/primitives'
import { Model, ModelProps } from './Model'

export class Regular extends Model {
  constructor(namespace: string, store: ModelStore, props: ModelProps) {
    super(namespace, store, props)
    this.layers = this.buildLayers()
    this.setBoundingBox()
  }

  onUpdate(_: string, event: StoreEvent<ModelData>) {
    switch (event.detail!.name) {
      case 'visible':
        event.detail!.visible ? this.show() : this.hide()
        break
      case 'size':
        this.onRootResize(event.detail!.size!)
        break
      case 'center':
        this.setCenter(event.detail!.center!)
        break
    }
  }

  protected onRootResize(size: number) {
    this.layers.forEach(({ definition, rendered }) => {
      if (definition.size.unit === 'root') {
        rendered.resize(definition.size.value * size)
      }
    })
    this.setBoundingBox()
  }

  protected buildLayer(layer: Layer) {
    return new Circle(`${this.namespace}-${layer.id}`, {
      size: this.layerSize(layer),
      definition: layer,
      center: INITIAL_CENTER as number[]
    })
  }

  protected setBoundingBox() {
    this.store.set({ boundingBox: this.boundingBox() })
  }

  public boundingBox() {
    return this.layers[0].rendered.boundingBox() // @todo: handle bounding box config
  }

  private layerSize({ size: { unit, value } }: Layer): number {
    switch (unit) {
      case 'km':
        return value
      case 'root':
        const size = this.store.get('size')
        if (!size) {
          throw new Error(`no size set for model ${this.namespace} store`)
        }
        return size * value
      default:
        throw new Error(`no handler for size unit ${unit} in model ${this.namespace}`)
    }
  }
}
