import { SidebarItem, SizePresets } from '../components/dom'
import { RootMapComponent } from '../components/map'
import { INITIAL_CITY } from '../constants'
import { reverseGeocoding } from '../geocoding'
import map, { fitBounds } from '../mapConfig'
import { Root } from '../setups'
import { RootStore } from '../store'
import { LngLat } from '../types'
import { $sidebar } from '../ui'

export class RootFactory extends EventTarget {
  public store: RootStore
  public mapComponent: RootMapComponent | undefined

  private $ui: HTMLElement
  private $geocoderInput: HTMLInputElement | undefined

  constructor(private definition: Root, private currentLngLat?: LngLat) {
    super()

    this.store = new RootStore(this.definition, this.currentLngLat)
    this.$ui = this.buildUI()

    this.buildMapComponent()
    this.buildGeocoder(currentLngLat)

    this.store.register(this, 'center', async () => {
      if (this.$geocoderInput) {
        const locality = await reverseGeocoding(this.store.get('center'))
        if (locality) {
          this.$geocoderInput.value = locality
        }
      }
    })

    map.onClick(({ lngLat }) => {
      this.store.set({ center: lngLat })
    })

    map.onGeolocate(({ lngLat }) => {
      this.store.set({ center: lngLat })
    })
  }

  public destroy() {
    this.store.destroy()
    this.mapComponent?.destroy()
  }

  private buildMapComponent() {
    this.mapComponent = new RootMapComponent('root', this.store, this.definition)
  }

  private buildUI() {
    const { label, sizePresets, icon, info } = this.definition

    const $container = document.createElement('div')
    $container.className = 'root'
    $container.innerHTML = this.template()
    $sidebar.append($container)

    const onCenter = () => this.mapComponent && fitBounds(this.mapComponent.boundingBox())
    const $items = $container.querySelector('.items')
    const itemComponent = SidebarItem({ label, icon, info, onCenter }, this.store)
    $items?.append(itemComponent.dom())

    const $sizePresetContainer = $container.querySelector('div[data-role="size-presets"]')
    const sizePresetsComponent = SizePresets({ presets: sizePresets }, this.store)
    $sizePresetContainer!.append(sizePresetsComponent.dom())

    return $container
  }

  private async buildGeocoder(currentLngLat: LngLat | undefined) {
    const $geocoderInput = map.buildGeocoder(this.$ui, center => {
      map.setCenter(center)
      this.store.set({ center })
    })
    this.$geocoderInput = $geocoderInput
    let locationText = `${INITIAL_CITY.name}, ${INITIAL_CITY.country}`
    if (currentLngLat) {
      locationText = (await reverseGeocoding(currentLngLat)) ?? ''
    }
    $geocoderInput.value = locationText
  }

  private template() {
    return `
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
    `
  }
}
