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
  sizePresets: SizePreset[]
  layer?: Layer
}

export interface SizePreset {
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
  size: Size
  fill?: Fill
  outline?: Outline
  offset?: { unit: string; value: number; bearing?: number; bearingFrom?: 'group' | 'object' }
  label?: Label
  popup?: { content: string }
  actsAsInitialBounds?: boolean
  actAsGroupBounds?: boolean
  drawLineToRoot?: boolean
}

export type Layer = CircleLayer

export type Size = AbsoluteSize | RelativeSize

export interface AbsoluteSize {
  type: 'absolute'
  unit: string
  value: number
}

export interface RelativeSize {
  type: 'relative'
  to?: 'root' | 'group'
  real: AbsoluteSize
}

export interface Fill {
  color: string
  opacity?: number
}
export interface Outline {
  color: string
  width?: number
}

export interface Label {
  value: string
  position: 'center' | 'outline'
}
