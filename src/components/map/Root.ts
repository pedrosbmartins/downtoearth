import { INITIAL_CENTER } from '../../map'
import { ModelData, Store, StoreEvent } from '../../store'
import { Layer } from '../../types'
import { Circle } from '../map/primitives'
import { Model, ModelLayer, ModelProps } from './Model'

export class Root extends Model {
  private layer: ModelLayer

  constructor(namespace: string, store: Store, props: ModelProps) {
    super(namespace, store, props)
    this.layers = this.buildLayers()
    this.layer = this.layers[0]
  }

  onUpdate(_: string, event: StoreEvent<ModelData>) {
    switch (event.detail!.name) {
      case 'visible':
        if (event.detail?.visible) {
          this.show()
        } else {
          this.hide()
        }
        break
      case 'size':
        this.resize(event.detail!.size!)
        break
      case 'center':
        this.setCenter(event.detail!.center!)
        break
      default:
        console.error(`no handler for event ${event.detail!.name} in root model`)
        break
    }
  }

  protected buildLayer(layer: Layer) {
    const circle = new Circle(`${this.namespace}-${layer.id}`, {
      size: layer.size.value,
      definition: layer,
      center: this.store.get('center') ?? INITIAL_CENTER
    })
    this.store.set({ boundingBox: circle.boundingBox() })
    return circle
  }

  protected setBoundingBox() {
    this.store.set({ boundingBox: this.layer.rendered.boundingBox() })
  }
}
