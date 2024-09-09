import axios from 'axios'
import { create } from 'zustand'

import { OBJMesh, ObjmeshesApiFp } from '../api/api'
import { Configuration } from '../api/configuration'

// Define the state interface for OBJ meshes
interface OBJMeshLayer {
  id: number
  name: string
  visible: boolean
  url?: string
  type: string
  data_url?: string
}

interface OBJMeshesState {
  layers: OBJMeshLayer[]
  fetchOBJMeshes: () => void
  addLayer: (layer: OBJMeshLayer) => void
  removeLayer: (id: number) => void
  toggleLayerVisibility: (id: number) => void
  clearLayers: () => void
}

// Create the Zustand store for OBJ meshes
export const useOBJMeshesStore = create<OBJMeshesState>((set) => ({
  layers: [],
  fetchOBJMeshes: async () => {
    try {
      const configuration = new Configuration({
        basePath: import.meta.env.VITE_APP_API_BASE_PATH
      })
      const api = ObjmeshesApiFp(configuration)
      const requestFunction = await api.objmeshesList()
      const response = await requestFunction(axios, configuration.basePath || '')

      if (response && response.data) {
        const objMeshes = response.data.map((objMesh: OBJMesh) => ({
          id: objMesh.id!,
          name: objMesh.name || 'Unnamed Layer',
          visible: false,
          url: objMesh.file_url || '',
          type: 'OBJMesh',
          data_url: objMesh.data_url || ''
        }))
        set({ layers: objMeshes })
      } else {
        console.error('No data returned from API')
      }
    } catch (error) {
      console.error('Failed to fetch OBJ meshes', error)
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

export default useOBJMeshesStore
