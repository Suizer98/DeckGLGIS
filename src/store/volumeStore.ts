import axios from 'axios'
import { create } from 'zustand'

import { VolumeApiFp } from '../api/api'
import { Configuration } from '../api/configuration'

// Store for managing the current DEM
interface CurrentDEMState {
  currentDEM: number
  setCurrentDEM: (demId: number) => void
}

export const useCurrentDEMStore = create<CurrentDEMState>((set) => ({
  currentDEM: 1, // Default DEM id
  setCurrentDEM: (demId) => set({ currentDEM: demId })
}))

interface VolumeState {
  volumeMode: boolean
  drawingMode: boolean
  polygons: number[][] // Array of polygons, each polygon is an array of points
  polygons3D: number[][] // 3D polygons
  volumeResults: {
    no: number
    Points: number[][]
    netVolume: string
    area: string
  }[]
  focusedVolumeResult: {
    no: number
    Points: number[][]
    netVolume: string
    area: string
  } | null
  enableVolumeMode: () => void
  disableVolumeMode: () => void
  toggleDrawingMode: () => void
  setPolygons: (polygon: number[][]) => void
  setPolygons3D: (polygon3D: number[][]) => void
  clearPolygons: () => void
  clearPolygons3D: () => void
  addVolumeResult: (result: any) => void
  clearVolumeResults: () => void
  computeVolume: (polygon: number[][]) => Promise<any>
  computeVolume3D: (polygon3D: number[][]) => Promise<any>
  setFocusedVolumeResult: (result: any) => void
  clearFocusedVolumeResult: () => void
}

const createConfiguration = () =>
  new Configuration({
    basePath: import.meta.env.VITE_APP_API_BASE_PATH
  })

// Create the Zustand store for volume computation and mode management
export const useVolumeStore = create<VolumeState>((set) => ({
  // Initial state
  volumeMode: false,
  drawingMode: false,
  polygons: [],
  polygons3D: [], // Initialize the 3D polygons array
  volumeResults: [],
  focusedVolumeResult: null, // Initialize the focused volume result as null

  // Actions for managing volume mode
  enableVolumeMode: () => set({ volumeMode: true }),
  disableVolumeMode: () => set({ volumeMode: false, drawingMode: false }),

  // Action to toggle drawing mode
  toggleDrawingMode: () => set((state) => ({ drawingMode: !state.drawingMode })),

  // Action to set the polygons array
  setPolygons: (polygon: number[][]) =>
    set((state) => ({ polygons: [...state.polygons, polygon] as any })),
  clearPolygons: () => set({ polygons: [] }),

  // Action to set the polygons3D array
  setPolygons3D: (polygon3D: number[][]) =>
    set((state) => ({ polygons3D: [...state.polygons3D, polygon3D] as any })),
  clearPolygons3D: () => set({ polygons3D: [] }),

  // Action to add a volume result to the volumeResults array
  addVolumeResult: (result) =>
    set((state) => ({ volumeResults: [...state.volumeResults, result] })),

  // Action to clear all volume results
  clearVolumeResults: () => set({ volumeResults: [] }),

  // Action to compute the volume for a given polygon
  computeVolume: async (polygons: any) => {
    try {
      const configuration = createConfiguration()
      const api = VolumeApiFp(configuration)
      const currentDEM = useCurrentDEMStore.getState().currentDEM
      const requestFunction = await api.volumeComputation({
        polygons: polygons,
        id: currentDEM
      })
      const result = await requestFunction(axios, configuration.basePath || '')

      return result.data
    } catch (error) {
      console.error('Failed to compute volume', error)
      return []
    }
  },

  // Action to compute the volume for a given 3D polygon
  computeVolume3D: async (polygons3D: any) => {
    try {
      const configuration = createConfiguration()
      const api = VolumeApiFp(configuration)
      const currentDEM = useCurrentDEMStore.getState().currentDEM

      const requestFunction = await api.volumeComputation({
        polygons: polygons3D,
        id: currentDEM
      })
      const result = await requestFunction(axios, configuration.basePath || '')
      return result.data
    } catch (error) {
      console.error('Failed to compute volume', error)
      return []
    }
  },

  // Action to set the focused volume result
  setFocusedVolumeResult: (result) => set({ focusedVolumeResult: result }),

  // Action to clear the focused volume result
  clearFocusedVolumeResult: () => set({ focusedVolumeResult: null })
}))
