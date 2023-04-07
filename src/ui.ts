export const $sidebarContainer = document.getElementById('sidebar')!
export const $sidebar = $sidebarContainer.querySelector('.dynamic-content')!
export const $configDropdown = document.getElementById('config-dropdown')!
export const $configFileSelector = document.getElementById('config-file-selector')!

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
