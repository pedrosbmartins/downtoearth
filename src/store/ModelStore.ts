import { ModelData } from '.'
import { BaseStore, StoreEvent } from './BaseStore'

export class ModelStore extends BaseStore<ModelData> {
  onUpdate(_: string, event: StoreEvent<ModelData>): void {
    const { detail } = event
    if (!detail) return
    switch (detail.name) {
      case 'visible':
        this.set({ visible: detail.visible })
        break
      case 'size':
        this.set({ size: detail.size })
        break
      case 'center':
        this.set({ center: detail.center })
        break
    }
  }
}
