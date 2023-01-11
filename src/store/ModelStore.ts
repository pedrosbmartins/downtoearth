import { ModelData } from '.'
import { BaseStore, StoreEvent } from './BaseStore'

export class ModelStore extends BaseStore<ModelData> {
  onUpdate(_: string, event: StoreEvent<ModelData>): void {
    const { origin, data } = event
    if (!data) return
    switch (origin) {
      case 'visible':
        this.set({ visible: data.visible })
        break
      case 'size':
        this.set({ size: data.size })
        break
      case 'center':
        this.set({ center: data.center })
        break
    }
  }
}
