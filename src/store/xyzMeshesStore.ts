import axios from 'axios'
import { create } from 'zustand'

import { PointCloudMesh, PointcloudmeshesApiFp } from '../api/api'
import { Configuration } from '../api/configuration'

// Define the state interface for Point Cloud meshes
interface PointCloudMeshLayer {
  id: number
  name: string
  visible: boolean
  url?: string
  type: string
  data_url?: string
}

interface PointCloudMeshesState {
  layers: PointCloudMeshLayer[]
  fetchPointCloudMeshes: () => void
  addLayer: (layer: PointCloudMeshLayer) => void
  removeLayer: (id: number) => void
  toggleLayerVisibility: (id: number) => void
  clearLayers: () => void
}

// Create the Zustand store for Point Cloud meshes
export const usePointCloudMeshesStore = create<PointCloudMeshesState>((set) => ({
  layers: [],
  fetchPointCloudMeshes: async () => {
    try {
      const configuration = new Configuration({
        basePath: import.meta.env.VITE_APP_API_BASE_PATH
      })
      const api = PointcloudmeshesApiFp(configuration)
      const requestFunction = await api.pointcloudmeshesList()
      const response = await requestFunction(axios, configuration.basePath || '')

      if (response && response.data) {
        const pointCloudMeshes = response.data.map((pointCloudMesh: PointCloudMesh) => ({
          id: pointCloudMesh.id!,
          name: pointCloudMesh.name || 'Unnamed Layer',
          visible: false,
          url: pointCloudMesh.file_url || '',
          type: 'PointCloudMesh',
          data_url: pointCloudMesh.data_url || ''
        }))
        set({ layers: pointCloudMeshes })
      } else {
        console.error('No data returned from API')
      }
    } catch (error) {
      console.error('Failed to fetch Point Cloud meshes', error)
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

export default usePointCloudMeshesStore
