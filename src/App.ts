import * as turf from '@turf/turf'
import { SizePresets } from './components/dom'
import { SidebarItem } from './components/dom/SidebarItem'
import { RegularMapComponent, RootMapComponent } from './components/map'
import map from './map'
import { BoundingBox, GroupStore, ModelData, ModelStore, RootStore } from './store'
import { matchEvent } from './store/core'
import { Config, Group, Layer, Model, Root } from './types'
import { $sidebar } from './ui'

export default class App {
  private rootStore: RootStore | undefined

  public initialize(config: Config) {
    const { root, groups } = config
    let rootMapComponent: RootMapComponent | undefined
    if (root) {
      const { store, mapComponent } = this.buildRoot(root)
      this.rootStore = store
      rootMapComponent = mapComponent
      map.on('click', event => {
        this.rootStore?.set({ center: event.lngLat.toArray() })
      })
    }
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
    let mapComponent: RootMapComponent | undefined
    if (layer) {
      mapComponent = new RootMapComponent('root', store, {
        size: sizePresets.find(sp => sp.default)!.value,
        layerDefinitions: [layer]
      })
      store.set({ mapComponent })
    }
    return { store, mapComponent }
  }

  private buildGroup(group: Group) {
    const store = new GroupStore(group, this.rootStore)
    const item = SidebarItem({ label: group.label }, store)
    $sidebar.append(item.dom())
    const builtModels = group.models.map(model => this.buildModel(model, store))
    store.set({ mapComponents: builtModels.map(model => model.mapComponent) })
    return { store, builtModels }
  }

  private buildModel(model: Model, groupStore?: GroupStore) {
    const store = new ModelStore(model, this.rootStore, groupStore)
    const item = SidebarItem({ label: model.label }, store)
    $sidebar.append(item.dom())
    const mapComponent = new RegularMapComponent(model.id, store, {
      layerDefinitions: model.layers
    })
    store.set({ mapComponent })
    return { store, mapComponent, layers: model.layers }
  }
}
