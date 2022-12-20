import { INITIAL_CENTER } from '../../map'
import { ModelData, Store, StoreEvent } from '../../store'
import { Layer } from '../../types'
import { Circle } from '../map/primitives'
import { Model, ModelProps } from './Model'

export class Regular extends Model {
  constructor(
    namespace: string,
    private store: Store<ModelData>,
    props: ModelProps,
    private rootStore?: Store<ModelData>
  ) {
    super(namespace, [store, ...(rootStore ? [rootStore] : [])], props)
    this.rootStore = rootStore
    this.layers = this.buildLayers()
    this.setBoundingBox()
  }

  onUpdate(storeId: string, event: StoreEvent<ModelData>) {
    if (storeId === 'root' && this.rootStore) {
      this.onRootUpdate(event)
    } else {
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
      }
    }
  }

  onRootUpdate(rootEvent: StoreEvent<ModelData>) {
    const { name } = rootEvent.detail!
    if (name === 'size') {
      this.resize(rootEvent.detail!.size!, true)
      this.setBoundingBox()
    } else if (name === 'center') {
      this.setCenter(rootEvent.detail!.center!)
    }
  }

  protected buildLayer(layer: Layer) {
    return new Circle(`${this.namespace}-${layer.id}`, {
      size: this.layerSize(layer),
      fill: layer.fill,
      outline: layer.outline,
      center: INITIAL_CENTER as number[]
    })
  }

  protected setBoundingBox() {
    this.store.set({ boundingBox: this.layers[0].rendered.boundingBox() }) // @todo: handle bounding box config
  }

  private layerSize({ size: { unit, value } }: Layer): number {
    switch (unit) {
      case 'km':
        return value
      case 'root':
        const size = this.rootStore?.get('size')
        if (!size) {
          throw new Error(`no root store or no size set for root store in model ${this.namespace}`)
        }
        return size * value
      default:
        throw new Error(`no handler for size unit ${unit} in model ${this.namespace}`)
    }
  }
}
