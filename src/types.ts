export interface Config {
  root?: Root
  groups?: Group[]
}

export interface Model {
  id: string
  label: string
  layers: Layer[]
  visible: boolean
  icon?: string
  bearingControl?: boolean
  bearing?: number
}

export interface Root extends Omit<Model, 'layers'> {
  id: 'root'
  sizePresets: DiameterPreset[]
  layer: Layer
}

export interface DiameterPreset {
  label: string
  value: number
  default?: boolean
}

export interface Group {
  id: string
  label: string
  models: Model[]
  visible: boolean
  layers?: Layer[]
  bearingControl?: boolean
  bearing?: number
}

export interface CircleLayer {
  id: string
  shape: 'circle'
  visible: boolean
  size: { unit: 'km' | 'root'; value: number }
  fill?: Fill
  outline?: Outline
  offset?: { unit: 'AU'; value: number; bearingFrom: 'group' | 'object' }
  label?: { value: string; position: 'center' | 'outline' }
  popup?: { content: string }
  actsAsInitialBounds?: boolean
  actAsGroupBounds?: boolean
  drawLineToRoot?: boolean
}

export type Layer = CircleLayer

export interface Fill {
  color: string
  opacity?: number
}
export interface Outline {
  color: string
  width?: number
}
