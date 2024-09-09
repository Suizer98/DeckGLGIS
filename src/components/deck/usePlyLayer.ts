import { SimpleMeshLayer } from '@deck.gl/mesh-layers'
import { load } from '@loaders.gl/core'
import { PLYLoader } from '@loaders.gl/ply'
import { useEffect, useRef, useState } from 'react'

import { usePLYMeshesStore } from '../../store/plyMeshesStore'
import { ViewState } from '../map/types'

type MeshArea = {
  coordinates: [longitude: number, latitude: number]
}

export const usePLYLayer = (initialViewState: ViewState) => {
  const { layers: plyLayers, fetchPLYMeshes } = usePLYMeshesStore()
  const [layers, setLayers] = useState<SimpleMeshLayer[]>([])
  const plyCache = useRef<{ [url: string]: any }>({})
  const plyJsonCache = useRef<{ [url: string]: any }>({})

  useEffect(() => {
    fetchPLYMeshes()
  }, [fetchPLYMeshes])

  useEffect(() => {
    const updateDeckLayers = async () => {
      const loadedLayers = await Promise.all(
        plyLayers
          .filter((layer) => layer.visible)
          .map(async (layer) => {
            if (layer.url && !plyCache.current[layer.url]) {
              const plyDataOri = await fetch(`${layer.url}/content`)
              const plyData = await load(plyDataOri, PLYLoader)
              plyCache.current[layer.url] = plyData
            }

            if (layer.data_url && !plyJsonCache.current[layer.data_url]) {
              const plyJsonDataResponse = await fetch(`${layer.url}/get_json`)
              const plyJsonData = await plyJsonDataResponse.json()
              plyJsonCache.current[layer.data_url] = plyJsonData
            }

            if (layer.url && layer.data_url) {
              return new SimpleMeshLayer<MeshArea>({
                id: `simple-mesh-layer-${layer.id}`,
                data: plyJsonCache.current[layer.data_url],
                mesh: plyCache.current[layer.url],
                getColor: () => {
                  const color = 255 // Adjust tone value
                  const opacity = 255 // Full opacity
                  return [color, color, color, opacity]
                },
                getOrientation: () => [0, 0, 0],
                getPosition: (d: MeshArea) => d.coordinates,
                sizeScale: 1,
                pickable: true,
                loaders: [PLYLoader]
              })
            }
            return null
          })
      )

      setLayers(loadedLayers.filter((layer) => layer !== null))
    }

    updateDeckLayers()
  }, [plyLayers, initialViewState])

  return layers
}
