// import { COORDINATE_SYSTEM } from '@deck.gl/core'
import { ScenegraphLayer } from '@deck.gl/mesh-layers'
import { load } from '@loaders.gl/core'
import { GLTFLoader } from '@loaders.gl/gltf'
import { useEffect, useRef, useState } from 'react'

import { useGLBMeshesStore } from '../../store/glbMeshesStore'
import { ViewState } from '../map/types'

export const useGLTFLayer = (initialViewState: ViewState) => {
  const { layers: glbLayers, fetchGLBMeshes } = useGLBMeshesStore()
  const [layers, setLayers] = useState<ScenegraphLayer[]>([])
  const gltfCache = useRef<{ [url: string]: any }>({})
  const gltfJsonCache = useRef<{ [url: string]: any }>({})

  useEffect(() => {
    fetchGLBMeshes()
  }, [fetchGLBMeshes])

  useEffect(() => {
    const updateDeckLayers = async () => {
      const loadedLayers = await Promise.all(
        glbLayers
          .filter((layer) => layer.visible)
          .map(async (layer) => {
            if (!gltfCache.current[layer.url]) {
              const glbData = await fetch(`${layer.url}/content`)
              const arrayBuffer = await glbData.arrayBuffer()
              const gltfData = await load(arrayBuffer, GLTFLoader, { gltf: { normalize: true } })
              gltfCache.current[layer.url] = gltfData
            }

            if (!gltfJsonCache.current[layer.data_url]) {
              const glbJsonDataResponse = await fetch(`${layer.url}/get_json`)
              const glbJsonData = await glbJsonDataResponse.json()
              gltfJsonCache.current[layer.data_url] = glbJsonData
            }

            return new ScenegraphLayer({
              id: `scenegraph-layer-${layer.id}`,
              data: gltfJsonCache.current[layer.data_url],
              scenegraph: gltfCache.current[layer.url],
              getPosition: (d: any) => d.coordinates,
              getOrientation: () => [0, 0, 0],
              // coordinateOrigin: [85.405469615, 21.930024852] as any,
              // coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
              sizeScale: 10,
              pickable: true,
              _lighting: 'pbr'
              // getColor: () => [255, 255, 255],
              // _animations: {
              //   '*': { speed: 5 }
              // }
              // onClick: s => console.log(s)
            })
          })
      )

      setLayers(loadedLayers.filter((layer) => layer !== null))
    }

    updateDeckLayers()
  }, [glbLayers, initialViewState])

  return layers
}
