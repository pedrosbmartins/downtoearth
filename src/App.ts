import * as turf from '@turf/turf'
import { SidebarItem, SizePresets } from './components/dom'
import { RegularMapComponent, RootMapComponent } from './components/map'
import map, { fitBounds } from './map'
import { BoundingBox, GroupStore, ModelStore, RootStore } from './store'
import { Config, Group, Model, Root } from './types'
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
    const { label, sizePresets, layer, icon } = root
    const store = new RootStore(root)
    let mapComponent: RootMapComponent | undefined
    let onCenter = () => {}
    if (layer) {
      mapComponent = new RootMapComponent('root', store, {
        size: sizePresets.find(sp => sp.default)!.value,
        layerDefinitions: [layer]
      })
      onCenter = () => fitBounds(mapComponent!.boundingBox())
    }
    const template = `
      <div class="root">
        <div class="items"></div>
        <div class="controls">
          <!-- <div class="control">
            <span class="label">Position</span>
            <div class="container">
              <div id="geocoder" class="geocoder"></div>
            </div>
          </div> -->
          <div data-role="size-presets"></div>
        </div>
      </div>
    `
    const $component = document.createElement('div')
    $component.innerHTML = template
    $sidebar.append($component)

    const $items = $component.querySelector('.items')
    const itemComponent = SidebarItem({ label, icon, onCenter }, store)
    $items?.append(itemComponent.dom())

    const $sizePresetContainer = $component.querySelector('div[data-role="size-presets"]')
    const sizePresetsComponent = SizePresets({ presets: sizePresets }, store)
    $sizePresetContainer!.append(sizePresetsComponent.dom())

    return { store, mapComponent }
  }

  private buildGroup(group: Group) {
    const store = new GroupStore(group, this.rootStore)

    const template = `
      <div class="group">
        <div class="items" data-role="group"></div>
        <div class="items" data-role="models"></div>
      </div>
    `
    const $container = document.createElement('div')
    $container.innerHTML = template
    $sidebar.append($container)

    const $groupContainer = $container.querySelector('.items[data-role="group"]')
    const onCenter = () => {
      const componentsBbox = builtModels.map(model => model.mapComponent.boundingBox())
      const boundingBox = turf.bbox(
        turf.featureCollection(componentsBbox.map(bbox => turf.bboxPolygon(bbox)))
      ) as BoundingBox
      fitBounds(boundingBox)
    }
    const itemComponent = SidebarItem(
      { label: group.label, alternative: true, bearingControl: group.bearingControl, onCenter },
      store
    )
    $groupContainer!.append(itemComponent.dom())

    const $modelsContainer = $container.querySelector('.items[data-role="models"]')
    const builtModels = group.models.map(model => this.buildModel(model, store, $modelsContainer!))
    return { store, builtModels }
  }

  private buildModel(
    model: Model,
    groupStore: GroupStore | undefined,
    $container: Element = $sidebar
  ) {
    const store = new ModelStore(model, this.rootStore, groupStore)
    const mapComponent = new RegularMapComponent(model.id, store, {
      layerDefinitions: model.layers
    })
    const item = SidebarItem(
      {
        label: model.label,
        icon: model.icon,
        onCenter: () => fitBounds(mapComponent.boundingBox())
      },
      store
    )
    $container.append(item.dom())
    return { store, mapComponent, layers: model.layers }
  }
}
