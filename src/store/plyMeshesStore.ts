import axios from 'axios'
import { create } from 'zustand'

import { PLYMesh, PlymeshesApiFp } from '../api/api'
import { Configuration } from '../api/configuration'

// Define the state interface for PLY meshes
interface PLYMeshLayer {
  id: number
  name: string
  visible: boolean
  url?: string
  type: string
  data_url?: string
}

interface PLYMeshesState {
  layers: PLYMeshLayer[]
  fetchPLYMeshes: () => void
  addLayer: (layer: PLYMeshLayer) => void
  removeLayer: (id: number) => void
  toggleLayerVisibility: (id: number) => void
  clearLayers: () => void
}

// Create the Zustand store for PLY meshes
export const usePLYMeshesStore = create<PLYMeshesState>((set) => ({
  layers: [],
  fetchPLYMeshes: async () => {
    try {
      const configuration = new Configuration({
        basePath: import.meta.env.VITE_APP_API_BASE_PATH
      })
      const api = PlymeshesApiFp(configuration)
      const requestFunction = await api.plymeshesList()
      const response = await requestFunction(axios, configuration.basePath || '')

      if (response && response.data) {
        const plyMeshes = response.data.map((plyMesh: PLYMesh) => ({
          id: plyMesh.id!,
          name: plyMesh.name || 'Unnamed Layer',
          visible: false,
          url: plyMesh.file_url || '',
          type: 'PLYMesh',
          data_url: plyMesh.data_url || ''
        }))
        set({ layers: plyMeshes })
      } else {
        console.error('No data returned from API')
      }
    } catch (error) {
      console.error('Failed to fetch PLY meshes', error)
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

export default usePLYMeshesStore
