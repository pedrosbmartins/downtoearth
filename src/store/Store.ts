import { ModelData } from '.'
import { BaseStore, StoreEvent } from './BaseStore'

export class Store extends BaseStore<ModelData> {
  onUpdate(_: string, __: StoreEvent<ModelData>) {}
}

export class UnitStore extends Store {
  onUpdate(_: string, event: StoreEvent<ModelData>) {
    if (event.detail?.name === 'size') {
      const { rendered: rootRenderedSize } = event.detail.size!
      const { real } = this.data.size!
      this.set({ size: { real, rendered: rootRenderedSize / real } })
    }
  }
}
