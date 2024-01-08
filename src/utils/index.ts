import { BoundingBox, LngLat } from '../types'

export function toLngLat(value: number[]): LngLat {
  return [value[0], value[1]]
}

export function mergeBoundingBoxes(boundingBoxes: BoundingBox[]): BoundingBox {
  let minLeft: number = 180
  let minBottom: number = 90
  let maxRight: number = -180
  let maxTop: number = -90

  boundingBoxes.forEach(([left, bottom, right, top]) => {
    if (left < minLeft) minLeft = left
    if (bottom < minBottom) minBottom = bottom
    if (right > maxRight) maxRight = right
    if (top > maxTop) maxTop = top
  })

  return [minLeft, minBottom, maxRight, maxTop]
}
