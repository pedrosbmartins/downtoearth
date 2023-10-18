import { AnyStoreEvent, matchEvent, Store, StoreData, StoreEvent } from '../../store/core'
import { showModelInfoPanel } from '../../ui'
import { ComponentProps, DOMComponent } from './DOMComponent'
import { SidebarItemControl } from './SidebarItemControl'

type SidebarItemStore = Store<SidebarItemData<string>>

export interface SidebarItemData<T extends string> extends StoreData<T> {
  visible: boolean
  center: number[]
  bearing?: number
}

export function SidebarItem<S extends SidebarItemStore>(props: Props, store: S) {
  return new SidebarItemComponent(store, { ...props, events: ['visible'] })
}

interface Props extends ComponentProps<HTMLDivElement, SidebarItemData<any>> {
  label: string
  icon?: string
  alternative?: boolean
  bearingControl?: boolean
  info?: string
  onCenter?: () => void
}

function matchDataEvent(
  storeId: string,
  event: AnyStoreEvent
): event is StoreEvent<SidebarItemData<any>> {
  return (
    matchEvent<SidebarItemData<'root'>>(storeId, 'root', event) ||
    matchEvent<SidebarItemData<'group'>>(storeId, 'group', event) ||
    matchEvent<SidebarItemData<'model'>>(storeId, 'model', event)
  )
}

class SidebarItemComponent<S extends SidebarItemStore> extends DOMComponent<
  S,
  HTMLDivElement,
  Props,
  SidebarItemData<any>
> {
  render() {
    const $container = document.createElement('div')
    $container.className = 'item'
    if (this.props.alternative) $container.classList.add('alternative')
    $container.innerHTML = SidebarItemTemplate(this.props)

    const $controls = $container.querySelector('.controls')!

    if (this.props.info) {
      const InfoControl = SidebarItemControl<SidebarItemData<any>>(this.store, {
        icon: 'info',
        onClick: () => {
          showModelInfoPanel(this.props.label, this.props.info!)
        }
      })
      $controls.append(InfoControl.dom())
    }

    if (this.props.bearingControl) {
      const $bearingSlider = document.createElement<'input'>('input')
      $bearingSlider.className = 'bearing-slider'
      $bearingSlider.setAttribute('type', 'range')
      $bearingSlider.setAttribute('min', '0')
      $bearingSlider.setAttribute('max', '720')
      $bearingSlider.setAttribute('value', '270')
      $bearingSlider.setAttribute('step', '1')
      $bearingSlider.addEventListener('input', event =>
        this.store.set({ bearing: (event.target as any).value })
      )

      const BearingControl = SidebarItemControl<SidebarItemData<any>>(this.store, {
        icon: 'bearing',
        children: [$bearingSlider],
        onClick: event => {
          if ((event.target as HTMLElement).tagName !== 'IMG') return
          if ($bearingSlider.classList.contains('show')) {
            $bearingSlider.classList.remove('show')
          } else {
            $bearingSlider.classList.add('show')
          }
        }
      })

      $controls.append(BearingControl.dom())
    }

    const VisibilityControl = SidebarItemControl<SidebarItemData<any>>(this.store, {
      icon: this.store.get('visible') ? 'hide' : 'show',
      events: ['visible'],
      onUpdate: ($, event) => {
        if (matchDataEvent(this.storeId, event)) {
          $.innerHTML = `<img alt="center" src="../assets/icons/ui/${
            event.data.visible ? 'hide' : 'show'
          }.png" />`
        }
      },
      onClick: () => {
        this.store.set({ visible: !this.store.get('visible') })
      }
    })

    const CenterControl = SidebarItemControl<SidebarItemData<any>>(this.store, {
      icon: 'center',
      onClick: this.props.onCenter ?? (() => {})
    })

    $controls.append(CenterControl.dom(), VisibilityControl.dom())

    return $container
  }
}

interface SidebarItemTemplateProps {
  label: string
  icon?: string
  alternative?: boolean
}

function SidebarItemTemplate({ label, icon, alternative }: SidebarItemTemplateProps) {
  return `
    ${icon ? SidebarItemIconTemplate({ label, icon }) : ''}
    ${SidebarItemLabel(label)}
    <div class="controls"></div>
  `
}

function SidebarItemLabel(text: string) {
  const $div = document.createElement('div')
  $div.className = 'label'
  const $span = document.createElement('span')
  $span.textContent = text
  $div.append($span)
  return $div.outerHTML
}

function SidebarItemIconTemplate({ label, icon }: SidebarItemTemplateProps) {
  const $div = document.createElement('div')
  $div.className = 'icon'
  const $img = document.createElement('img')
  $img.setAttribute('alt', label)
  $img.setAttribute('src', `../assets/icons/models/${icon}.png`)
  $div.append($img)
  return $div.outerHTML
}
