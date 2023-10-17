export const SETUP_FROM_FILE_VALUE = 'from::file'
export const SETUP_FROM_URL_VALUE = 'from::url'

export const $sidebarContainer = document.getElementById('sidebar')!
export const $sidebar = $sidebarContainer.querySelector('.dynamic-content-container')!
export const $setupDropdown = document.getElementById('setup-dropdown')!
export const $setupFileSelector = document.getElementById('setup-file-selector')!

export const $setupFromURLOption = $setupDropdown.querySelector<HTMLInputElement>(
  `option[value='${SETUP_FROM_URL_VALUE}']`
)!

const $sidebarShowButton = document.querySelector('.show-button')!
$sidebarShowButton.addEventListener('click', () => {
  $sidebarContainer.classList.remove('hidden')
  $sidebarShowButton.classList.remove('sidebar-hidden')
})

const $sidebarHideButton = $sidebarContainer.querySelector('.hide-button')!
$sidebarHideButton.addEventListener('click', () => {
  $sidebarContainer.classList.add('hidden')
  $sidebarShowButton.classList.add('sidebar-hidden')
})
