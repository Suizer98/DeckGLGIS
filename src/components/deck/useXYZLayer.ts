import { COORDINATE_SYSTEM } from '@deck.gl/core'
import { PointCloudLayer } from '@deck.gl/layers'
import { useEffect, useRef, useState } from 'react'

import { usePointCloudMeshesStore } from '../../store/xyzMeshesStore'
import { ViewState } from '../map/types'

type DataType = {
  position: [x: number, y: number, z: number]
  normal: [nx: number, ny: number, nz: number]
  color: [r: number, g: number, b: number]
}

export const usePointCloudLayer = (initialViewState: ViewState) => {
  const { layers: xyzLayers, fetchPointCloudMeshes } = usePointCloudMeshesStore()
  const [layers, setLayers] = useState<PointCloudLayer[]>([])
  const pointCloudCache = useRef<{ [url: string]: any }>({})

  useEffect(() => {
    fetchPointCloudMeshes()
  }, [fetchPointCloudMeshes])

  useEffect(() => {
    const updateDeckLayers = async () => {
      const loadedLayers = await Promise.all(
        xyzLayers
          .filter((layer) => layer.visible)
          .map(async (layer) => {
            if (layer.url && !pointCloudCache.current[layer.url]) {
              const response = await fetch(`${layer.url}/get_json`)
              const pointCloudData = await response.json()
              pointCloudCache.current[layer.url] = pointCloudData
            }

            if (layer.url) {
              const coordinateOrigin = pointCloudCache.current[layer.url]

              return new PointCloudLayer({
                id: `point-cloud-layer-${layer.id}`,
                data: pointCloudCache.current[layer.url],
                getColor: (d: DataType) => {
                  // Change color to grayish and set opacity
                  //   const gray = 128 // Grayish tone value
                  //   const opacity = 100 // Opacity value from 0 (transparent) to 255 (opaque)
                  //   return [gray, gray, gray, opacity]
                  return d.color
                },
                getNormal: (d: DataType) => d.normal,
                getPosition: (d: DataType) => {
                  return d.position
                },
                coordinateOrigin: coordinateOrigin[0].origincenter as any,
                pointSize: 1,
                sizeUnits: 'meters',
                coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
                pickable: true
              })
            }
            return null
          })
      )

      setLayers(loadedLayers.filter((layer) => layer !== null))
    }

    updateDeckLayers()
  }, [xyzLayers, initialViewState])

  return layers
}
