import { App } from './app'
import { initialCenter } from './initializers/center'
import { Setup } from './setups'
import { LngLat } from './types'
import { $setupFromURLOption, showDialog } from './ui'

export interface ShareableData {
  setup?: Setup
  location?: LngLat
}

export function activateUIForSetupFromURL(title: string) {
  $setupFromURLOption.style.display = 'block'
  $setupFromURLOption.setAttribute('selected', 'true')
  $setupFromURLOption.innerText = title
}

export function generateShareableLink(app: App) {
  const { setup, currentLngLat } = app
  if (!setup) return
  const location = toLngLatText(currentLngLat ?? initialCenter)
  const encodedSetup = toURLSafeBase64(setup)
  const { origin, pathname } = window.location
  return `${origin}${pathname}?setup=${encodedSetup}&location=${location}`
}

function toLngLatText(lngLat: LngLat) {
  return lngLat.join(',')
}

function toURLSafeBase64(setup: Setup) {
  const encoded = Buffer.from(JSON.stringify(setup)).toString('base64')
  return encoded.replace('/', '_').replace('+', '-').replace('=', '')
}

export async function displaySharingDialog(link: string) {
  let dialogContent = `This is a <a href="${link}">shareable link</a> to your current visualization.`
  try {
    await window.navigator.clipboard.writeText(link)
    dialogContent += '<br /><br />It has been automatically copied to your clipboard.'
  } catch (e) {
    console.error('Could not write shareable link to clipboard.', e)
  }
  showDialog('Sharing', { type: 'html', value: dialogContent })
}

export function tryParseURLData(): ShareableData | undefined {
  try {
    const params = new URLSearchParams(window.location.search)
    const locationContent = params.get('location')
    const setupContentEncoded = params.get('setup')
    if (!locationContent && !setupContentEncoded) return
    const setup = tryParseSetup(setupContentEncoded)
    const location = tryParseLocation(locationContent)
    return { location, setup }
  } catch (error) {
    console.error('Error parsing data from URL.', error)
  }
}

function tryParseSetup(encodedContent: string | null) {
  try {
    if (!encodedContent) return
    const content = Buffer.from(encodedContent, 'base64').toString()
    return JSON.parse(content) as Setup
  } catch (error) {
    console.error('Error parsing setup from URL.', error)
  }
}

function tryParseLocation(locationContent: string | null): LngLat | undefined {
  try {
    if (!locationContent) return
    const [lng, lat] = locationContent.split(',')
    return [Number(lng), Number(lat)]
  } catch (error) {
    console.error('Error parsing setup from URL.', error)
  }
}
