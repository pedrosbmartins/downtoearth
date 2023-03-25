import * as turf from '@turf/turf'
import { SizePresets } from './components/dom'
import { SidebarItem } from './components/dom/SidebarItem'
import { RegularMapComponent, RootMapComponent } from './components/map'
import map, { fitBounds } from './map'
import { BoundingBox, GroupStore, ModelStore, RootStore } from './store'
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
    let mapComponent: RootMapComponent | undefined
    let onCenter = () => { }
    if (layer) {
      mapComponent = new RootMapComponent('root', store, {
        size: sizePresets.find(sp => sp.default)!.value,
        layerDefinitions: [layer]
      })
      onCenter = () => fitBounds(mapComponent!.boundingBox())
    }
    const itemComponent = SidebarItem({ label, onCenter, children: [sizePresetsComponent] }, store)
    $sidebar.append(itemComponent.dom())
    return { store, mapComponent }
  }

  private buildGroup(group: Group) {
    const store = new GroupStore(group, this.rootStore)
    const $container = document.createElement('div')
    $sidebar.append($container)
    const builtModels = group.models.map(model => this.buildModel(model, store, $container))
    const onCenter = () => {
      const componentsBbox = builtModels.map(model => model.mapComponent.boundingBox())
      const boundingBox = turf.bbox(turf.featureCollection(componentsBbox.map(bbox => turf.bboxPolygon(bbox)))) as BoundingBox
      fitBounds(boundingBox)
    }
    const item = SidebarItem({ label: group.label, onCenter }, store)
    $container.prepend(item.dom())
    return { store, builtModels }
  }

  private buildModel(model: Model, groupStore: GroupStore | undefined, $container: Element = $sidebar) {
    const store = new ModelStore(model, this.rootStore, groupStore)
    const mapComponent = new RegularMapComponent(model.id, store, {
      layerDefinitions: model.layers
    })
    const item = SidebarItem({ label: model.label, onCenter: () => fitBounds(mapComponent.boundingBox()) }, store)
    $container.append(item.dom())
    return { store, mapComponent, layers: model.layers }
  }
}
