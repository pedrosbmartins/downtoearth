import { LngLat } from '../types'

export interface ShareableSetup {
  setup: Setup
  center: LngLat
}

export interface Setup {
  title: string
  unit?: Unit
  root: Root
  models?: Model[]
  $schema?: string
}

export interface BaseModel {
  label: string
  visible?: boolean
  bearingControl?: boolean
  info?: string
  popup?: Popup
}

export interface GroupModel extends BaseModel {
  models: SingleModel[]
  bearing?: number
  offset?: number
}

export interface SingleModel extends BaseModel {
  size: number
  features: Feature[]
  icon?: string
}

export type Model = GroupModel | SingleModel

export interface Root extends SingleModel {
  sizePresets: SizePreset[]
}

export interface SizePreset {
  label: string
  km: number
  default?: boolean
}

export interface FeatureBase {
  fill?: Fill
  outline?: Outline
  offset?: number
  bearing?: number
  label?: Label
  drawLineToRoot?: boolean
}

export interface ShapeFeature extends FeatureBase {
  shape: 'circle' | 'ellipse'
}

export interface CircleFeature extends ShapeFeature {
  shape: 'circle'
  radiusRatio?: number
}

export interface EllipseFeature extends ShapeFeature {
  shape: 'ellipse'
  axesRatios?: { semiMajor: number; semiMinor: number }
}

export type Feature = CircleFeature | EllipseFeature

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

export interface Popup {
  content: string
}

export interface Unit {
  name: string
  km: number
}

export function isGroup(object: any): object is GroupModel {
  return object !== undefined && object.models !== undefined
}
