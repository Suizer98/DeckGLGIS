// import { COORDINATE_SYSTEM } from '@deck.gl/core'
import { SimpleMeshLayer } from '@deck.gl/mesh-layers'
import { load } from '@loaders.gl/core'
import { OBJLoader } from '@loaders.gl/obj'
import { useEffect, useRef, useState } from 'react'

import { useOBJMeshesStore } from '../../store/objMeshesStore'
import { ViewState } from '../map/types'

type MeshArea = {
  coordinates: [longitude: number, latitude: number]
}

export const useOBJLayer = (initialViewState: ViewState) => {
  const { layers: objLayers, fetchOBJMeshes } = useOBJMeshesStore()
  const [layers, setLayers] = useState<SimpleMeshLayer[]>([])
  const objCache = useRef<{ [url: string]: any }>({})
  const objJsonCache = useRef<{ [url: string]: any }>({})

  useEffect(() => {
    fetchOBJMeshes()
  }, [fetchOBJMeshes])

  useEffect(() => {
    const updateDeckLayers = async () => {
      const loadedLayers = await Promise.all(
        objLayers
          .filter((layer) => layer.visible)
          .map(async (layer) => {
            if (layer.url && !objCache.current[layer.url]) {
              const objDataOri = await fetch(`${layer.url}/content`)
              const objData = await load(objDataOri, OBJLoader)
              objCache.current[layer.url] = objData
            }

            if (layer.data_url && !objJsonCache.current[layer.data_url]) {
              const objJsonDataResponse = await fetch(`${layer.url}/get_json`)
              const objJsonData = await objJsonDataResponse.json()
              objJsonCache.current[layer.data_url] = objJsonData
            }

            // For current sample layer, we rotate y 90, save it then rotate z 90 when editing raw data
            if (layer.url && layer.data_url) {
              return new SimpleMeshLayer<MeshArea>({
                id: `simple-mesh-layer-${layer.id}`,
                data: objJsonCache.current[layer.data_url],
                // mesh: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/humanoid_quad.obj',
                mesh: objCache.current[layer.url],
                getColor: () => {
                  const color = 255 // Adjust tone value
                  const opacity = 255 // Full opacity
                  return [color, color, color, opacity]
                },
                // material: {
                //   ambient: 1, // Ka
                //   diffuse: 0.49412, // Kd (averaged the RGB values for simplicity)
                //   shininess: 250, // Ns
                //   specularColor: [5, 100, 5] // Ks
                // },
                getOrientation: () => [0, 0, 0],
                getPosition: (d: MeshArea) => d.coordinates,
                // coordinateOrigin: objJsonCache.current[layer.data_url][0].origincenter as any,
                // coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
                sizeScale: 1,
                pickable: true,
                loaders: [OBJLoader]
              })
            }
            return null
          })
      )

      setLayers(loadedLayers.filter((layer) => layer !== null))
    }

    updateDeckLayers()
  }, [objLayers, initialViewState])

  return layers
}
