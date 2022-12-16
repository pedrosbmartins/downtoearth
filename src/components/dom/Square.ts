export function Square({ color }: { color: string }) {
  const $square = document.createElement('div')
  $square.setAttribute('style', `width:100px;height:100px;background:${color}`)
  return $square
}
