import axios from 'axios'
import { create } from 'zustand'

import { DEMFile, DemsApiFp } from '../api/api'
import { Configuration } from '../api/configuration'

// Define the state interface for DEM layers
export interface Layer {
  id: number
  name: string
  visible: boolean
  url: string
  type: string
  geoserver_url: string
}

interface DemsState {
  layers: Layer[]
  fetchDems: () => void
  addLayer: (layer: Layer) => void
  removeLayer: (id: number) => void
  toggleLayerVisibility: (id: number) => void
  clearLayers: () => void
}

// Create the Zustand store for DEM layers and fetching DEMs
export const useDemsStore = create<DemsState>((set) => ({
  layers: [],
  fetchDems: async () => {
    try {
      const configuration = new Configuration({
        basePath: import.meta.env.VITE_APP_API_BASE_PATH
      })
      const api = DemsApiFp(configuration)
      const requestFunction = await api.demsList()
      const response = await requestFunction(axios, configuration.basePath || '')

      if (response && response.data) {
        const dems = response.data.map((dem: DEMFile) => ({
          id: dem.id ?? 1,
          name: dem.name,
          visible: false,
          url: dem.tile_url ?? '',
          type: 'DEM',
          geoserver_url: import.meta.env.VITE_APP_API_GEOSERVER + dem.geoserver_url || ''
        }))
        set({ layers: dems })
      } else {
        console.error('No data returned from API')
      }
    } catch (error) {
      console.error('Failed to fetch dems', error)
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
