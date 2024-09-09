import axios from 'axios'
import { create } from 'zustand'

import { GLBMesh, GlbmeshesApiFp } from '../api/api'
import { Configuration } from '../api/configuration'

// Define the state interface for GLB meshes
interface GLBMeshLayer {
  id: number
  name: string
  visible: boolean
  url: string
  type: string
  data_url: string
}

interface GLBMeshesState {
  layers: GLBMeshLayer[]
  fetchGLBMeshes: () => void
  addLayer: (layer: GLBMeshLayer) => void
  removeLayer: (id: number) => void
  toggleLayerVisibility: (id: number) => void
  clearLayers: () => void
}

// Create the Zustand store for GLB meshes
export const useGLBMeshesStore = create<GLBMeshesState>((set) => ({
  layers: [],
  fetchGLBMeshes: async () => {
    try {
      const configuration = new Configuration({
        basePath: import.meta.env.VITE_APP_API_BASE_PATH
      })
      const api = GlbmeshesApiFp(configuration)
      const requestFunction = await api.glbmeshesList()
      const response = await requestFunction(axios, configuration.basePath || '')

      if (response && response.data) {
        const glbMeshes = response.data.map((glbMesh: GLBMesh) => ({
          id: glbMesh.id,
          name: glbMesh.name,
          visible: false,
          url: glbMesh.file_url,
          type: 'GLBMesh',
          data_url: glbMesh.data_url
        }))
        set({ layers: glbMeshes as any })
      } else {
        console.error('No data returned from API')
      }
    } catch (error) {
      console.error('Failed to fetch GLB meshes', error)
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

export default useGLBMeshesStore
