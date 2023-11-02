import { ShareableSetup } from '../setups'

function tryParseSetupFromURL() {
  try {
    const urlDataMatch = window.location.search.match(/data=(.+)/)
    const urlData = urlDataMatch && urlDataMatch[1]
    const urlDataContent = urlData && Buffer.from(urlData, 'base64').toString()
    if (!urlDataContent) return
    return JSON.parse(urlDataContent) as ShareableSetup
  } catch (error) {
    console.error('Error parsing setup from URL.', error)
  }
}

export const setupFromURL = tryParseSetupFromURL()
