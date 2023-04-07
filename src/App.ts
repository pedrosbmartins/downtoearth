import MapboxGeocoder, { Result } from '@mapbox/mapbox-gl-geocoder'
import * as turf from '@turf/turf'
import mapboxgl, { LngLatLike } from 'mapbox-gl'
import { SidebarItem, SizePresets } from './components/dom'
import { RegularMapComponent, RootMapComponent } from './components/map'
import { INITIAL_CITY, MAPBOXGL_ACCESS_TOKEN } from './constants'
import map, { fitBounds } from './map'
import { BoundingBox, GroupStore, ModelStore, RootStore } from './store'
import { Config, Group, Model, Root } from './types'
import { $sidebar } from './ui'

export default class App {
  private rootStore: RootStore | undefined
  private currentLngLat: number[] | undefined
  private $geocoderInput: HTMLInputElement | undefined
  private destroy: () => void = () => {}

  public initialize(config: Config) {
    this.destroy()
    const { root, groups } = config
    let rootMapComponent: RootMapComponent | undefined
    if (root) {
      const { store, mapComponent } = this.buildRoot(root)
      this.rootStore = store
      rootMapComponent = mapComponent
      map.on('click', event => {
        const center = event.lngLat.toArray()
        this.setRootCenter(center)
      })
    }
    const builtGroups = groups?.map(group => this.buildGroup(group))
    this.destroy = () => {
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
    const store = new RootStore(root, this.currentLngLat)
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
          <div class="control">
            <span class="label">Position</span>
            <div class="container">
              <div id="geocoder" class="geocoder"></div>
            </div>
          </div>
          <div data-role="size-presets"></div>
        </div>
      </div>
    `
    const $component = document.createElement('div')
    $component.innerHTML = template
    $sidebar.append($component)

    const $geocoderElement = $component.querySelector('#geocoder')!
    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOXGL_ACCESS_TOKEN,
      mapboxgl: mapboxgl,
      marker: false,
      flyTo: false,
      trackProximity: false
    })
    geocoder.on('result', async (event: { result: Result }) => {
      const { center } = event.result
      map.setCenter(center as LngLatLike)
      this.setRootCenter(center)
    })
    $geocoderElement.appendChild(geocoder.onAdd(map))
    this.$geocoderInput = $geocoderElement.querySelector<HTMLInputElement>(
      '.mapboxgl-ctrl-geocoder--input'
    )!
    this.$geocoderInput.value = `${INITIAL_CITY.name}, ${INITIAL_CITY.country}`

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

  private async setRootCenter(center: number[]) {
    this.rootStore?.set({ center })
    this.currentLngLat = center
    if (this.$geocoderInput) {
      const locality = await reverseGeocoding(center)
      if (locality) {
        this.$geocoderInput.value = locality
      }
    }
  }
}

async function reverseGeocoding(lngLat: number[]) {
  try {
    const [lng, lat] = lngLat
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOXGL_ACCESS_TOKEN}`
    )
    const json = await response.json()

    const query = json.query.toString() as string
    if (json.features.length === 0) {
      return query
    }

    const mainFeature = json.features[0]
    const context = mainFeature.context as Array<{ id: string; text: string }>
    const locality = context.find(c => c.id.startsWith('locality'))?.text
    const place = context.find(c => c.id.startsWith('place'))?.text
    const region = context.find(c => c.id.startsWith('region'))?.text
    const country = context.find(c => c.id.startsWith('country'))?.text

    if (region && country) {
      return `${region}, ${country}`
    }
    if (locality && place) {
      return `${locality}, ${place}`
    }
    if (mainFeature.place_name) {
      return mainFeature.place_name as string
    }
  } catch (e) {
    console.error(e)
    return undefined
  }
}
