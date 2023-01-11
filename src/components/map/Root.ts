import { INITIAL_CENTER } from '../../map'
import { ModelData, Store, StoreEvent } from '../../store'
import { Layer } from '../../types'
import { Circle } from '../map/primitives'
import { Model, ModelLayer, ModelProps } from './Model'

export class Root extends Model {
  private layer: ModelLayer
  private size: number

  constructor(id: string, store: Store, props: ModelProps & { size: number }) {
    super(id, store, props)
    this.size = props.size
    this.layers = this.buildLayers()
    this.layer = this.layers[0]
  }

  onUpdate(_: string, event: StoreEvent<ModelData>) {
    const { origin, data } = event
    switch (origin) {
      case 'visible':
        if (data.visible) {
          this.show()
        } else {
          this.hide()
        }
        break
      case 'size':
        this.resize(data.size!.rendered)
        break
      case 'center':
        this.setCenter(data.center!)
        break
      default:
        console.error(`no handler for event ${origin} in root model`)
        break
    }
  }

  protected buildLayer(layer: Layer) {
    const circle = new Circle(`${this.id}-${layer.id}`, {
      size: this.size,
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
