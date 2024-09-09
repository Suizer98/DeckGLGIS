import axios from 'axios'
import { create } from 'zustand'

import { GeoTIFFFile, GeotiffsApiFp } from '../api/api'
import { Configuration } from '../api/configuration'

// Define the state interface for layers
export interface Layer {
  id: number
  name: string
  visible: boolean
  url: string
  type: string
  geoserver_url: string
}

interface GeotiffsState {
  layers: Layer[]
  fetchGeotiffs: () => void
  addLayer: (layer: Layer) => void
  removeLayer: (id: number) => void
  toggleLayerVisibility: (id: number) => void
  clearLayers: () => void
}

// Create the Zustand store for layers and fetching GeoTIFFs
export const useGeotiffsStore = create<GeotiffsState>((set) => ({
  layers: [],
  fetchGeotiffs: async () => {
    try {
      const configuration = new Configuration({
        basePath: import.meta.env.VITE_APP_API_BASE_PATH
      })
      const api = GeotiffsApiFp(configuration)
      const requestFunction = await api.geotiffsList()
      const response = await requestFunction(axios, configuration.basePath || '')

      if (response && response.data) {
        const geotiffs = response.data.map((geotiff: GeoTIFFFile) => ({
          id: geotiff.id ?? 1,
          name: geotiff.name,
          visible: false,
          url: geotiff.tile_url ?? '',
          type: 'GeoTIFF',
          geoserver_url: import.meta.env.VITE_APP_API_GEOSERVER + geotiff.geoserver_url || ''
        }))
        set({ layers: geotiffs })
      } else {
        console.error('No data returned from API')
      }
    } catch (error) {
      console.error('Failed to fetch geotiffs', error)
    }
  },
  addLayer: (layer) =>
    set((state) => ({ layers: [...state.layers, { ...layer, visible: false }] })),
  removeLayer: (id) => set((state) => ({ layers: state.layers.filter((l) => l.id !== id) })),
  toggleLayerVisibility: (id) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    })),
  clearLayers: () => set({ layers: [] })
}))
