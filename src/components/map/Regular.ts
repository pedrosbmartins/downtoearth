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
    private rootStore?: Store<ModelData>,
    private groupStore?: Store<ModelData>
  ) {
    const stores = [store]
    if (rootStore) stores.push(rootStore)
    if (groupStore) stores.push(groupStore)
    super(namespace, stores, props)
    this.layers = this.buildLayers()
    this.setBoundingBox()
  }

  onUpdate(storeId: string, event: StoreEvent<ModelData>) {
    if (this.rootStore && storeId === this.rootStore.id()) {
      this.onRootUpdate(event)
    }
    if (this.groupStore && storeId === this.groupStore.id()) {
      this.onGroupUpdate(event)
    }
    if (storeId === this.store.id()) {
      this.onStoreUpdate(event)
    }
  }

  onStoreUpdate(event: StoreEvent<ModelData>) {
    switch (event.detail!.name) {
      case 'visible':
        event.detail!.visible ? this.show() : this.hide()
        break
    }
  }

  onGroupUpdate(event: StoreEvent<ModelData>) {
    switch (event.detail!.name) {
      case 'visible':
        event.detail!.visible ? this.show() : this.hide()
        break
    }
  }

  onRootUpdate(event: StoreEvent<ModelData>) {
    switch (event.detail!.name) {
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
