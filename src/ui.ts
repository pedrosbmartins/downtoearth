export const SETUP_FROM_FILE_VALUE = 'from::file'
export const SETUP_FROM_URL_VALUE = 'from::url'

export const $sidebarContainer = document.getElementById('sidebar')!
export const $sidebar = $sidebarContainer.querySelector<HTMLDivElement>(
  '.dynamic-content-container'
)!
export const $setupDropdown = document.getElementById('setup-dropdown')! as HTMLSelectElement
export const $setupFileSelector = document.getElementById('setup-file-selector')!

export const $setupFromURLOption = $setupDropdown.querySelector<HTMLInputElement>(
  `option[value='${SETUP_FROM_URL_VALUE}']`
)!

const $sidebarShowButton = document.getElementById('show-button')!
$sidebarShowButton.addEventListener('click', () => {
  $sidebarContainer.classList.remove('hidden')
  $sidebarShowButton.classList.remove('sidebar-hidden')
})

const $sidebarHideButton = document.getElementById('hide-button')!
$sidebarHideButton.addEventListener('click', () => {
  $sidebarContainer.classList.add('hidden')
  $sidebarShowButton.classList.add('sidebar-hidden')
})

export const $dialogModal = document.getElementById('dialog-modal')!
$dialogModal.addEventListener('click', () => {
  $dialogModal.classList.add('hidden')
})

const $dialogModalTitle = $dialogModal.querySelector<HTMLHeadElement>('.content h2')!
const $dialogModalContent = $dialogModal.querySelector<HTMLParagraphElement>('.content p')!

interface DialogContent {
  type: 'text' | 'html'
  value: string
}

export function showDialog(title: string, content: DialogContent) {
  $dialogModal.classList.remove('hidden')
  $dialogModalTitle.innerText = title
  if (content.type === 'html') {
    $dialogModalContent.innerHTML = content.value
  } else {
    $dialogModalContent.innerText = content.value
  }
}

export const $shareButton = document.getElementById('share-button')!
