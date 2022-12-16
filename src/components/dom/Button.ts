export function Button({ title, onClick }: { title: string; onClick: () => void }) {
  const $button = document.createElement('button') as HTMLButtonElement
  $button.innerText = title
  $button.addEventListener('click', onClick)
  return $button
}
