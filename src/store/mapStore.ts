import { Deck } from '@deck.gl/core'
import create from 'zustand'

interface MapStoreState {
  isMapLoading: boolean
  mapRef: maplibregl.Map | null
  deckRef: Deck | null
  setIsMapLoading: (loading: boolean) => void
  setMapRef: (map: maplibregl.Map | null) => void
  setDeckRef: (deck: Deck | null) => void
}

export const useMapStore = create<MapStoreState>((set) => ({
  isMapLoading: true,
  mapRef: null,
  deckRef: null,
  setIsMapLoading: (loading) => set({ isMapLoading: loading }),
  setMapRef: (map) => set({ mapRef: map }),
  setDeckRef: (deck) => set({ deckRef: deck })
}))
