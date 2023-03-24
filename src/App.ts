import { SizePresets } from './components/dom'
import { SidebarItem } from './components/dom/SidebarItem'
import * as mapComponents from './components/map'
import map from './map'
import { GroupStore, ModelData, ModelStore, RootStore, UnitStore } from './store'
import { matchEvent } from './store/core'
import { Config, Group, Model, Root } from './types'
import { $sidebar } from './ui'

export default class App {
  private unitStore: UnitStore
  private rootStore: RootStore | undefined

  constructor() {
    this.unitStore = new UnitStore(undefined)
  }

  public initialize(config: Config) {
    const { root, groups } = config
    let rootMapComponent: mapComponents.Root | undefined
    if (root) {
      const { store, mapComponent } = this.buildRoot(root)
      this.rootStore = store
      rootMapComponent = mapComponent
      map.on('click', event => {
        this.rootStore?.set({ center: event.lngLat.toArray() })
      })
    }
    this.unitStore = new UnitStore(this.rootStore)
    const builtGroups = groups?.map(group => this.buildGroup(group))
    return () => {
      $sidebar.innerHTML = ''
      this.rootStore?.destroy()
      this.rootStore = undefined
      rootMapComponent?.destroy()
      builtGroups?.forEach(group => {
        group.store.destroy()
        group.builtModels.forEach(model => {
          model.store.destroy()
          model.mapComponent.destroy()
        })
      })
    }
  }

  private buildRoot(root: Root) {
    const { label, sizePresets, layer } = root
    const store = new RootStore(root)
    const sizePresetsComponent = SizePresets({ presets: sizePresets }, store)
    const itemComponent = SidebarItem({ label, children: [sizePresetsComponent] }, store)
    $sidebar.append(itemComponent.dom())
    let mapComponent: mapComponents.Root | undefined
    if (layer) {
      mapComponent = new mapComponents.Root('root', store, {
        size: sizePresets.find(sp => sp.default)!.value,
        layerDefinitions: [layer]
      })
    }
    return { store, mapComponent }
  }

  private buildGroup(group: Group) {
    const store = new GroupStore(group, this.rootStore)
    const item = SidebarItem({ label: group.label }, store)
    $sidebar.append(item.dom())
    const builtModels = group.models.map(model => this.buildModel(model, store))
    const boundingBoxModel = builtModels.find(m => m.layers.some(l => l.actAsGroupBounds))
    if (boundingBoxModel) {
      store.set({ boundingBox: boundingBoxModel.mapComponent.boundingBox() })
      boundingBoxModel.store.register(store, 'boundingBox', event => {
        if (matchEvent<ModelData>(boundingBoxModel.store.id, 'model', event)) {
          store.set({ boundingBox: event.data.boundingBox })
        }
      })
    }
    return { store, builtModels }
  }

  private buildModel(model: Model, groupStore?: GroupStore) {
    const store = new ModelStore(model, this.unitStore, groupStore)
    const item = SidebarItem({ label: model.label }, store)
    $sidebar.append(item.dom())
    const mapComponent = new mapComponents.Regular(model.id, store, {
      layerDefinitions: model.layers
    })
    return { store, mapComponent, layers: model.layers }
  }
}
