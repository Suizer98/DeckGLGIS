import { ScatterplotLayer } from '@deck.gl/layers'
import { useCallback, useEffect, useState } from 'react'

import { useVolumeStore } from '../../store/volumeStore'

export function usePointsLayer(drawingMode: boolean, deckRef: any) {
  const [points, setPoints] = useState<number[][]>([])
  const { setPolygons, setPolygons3D } = useVolumeStore()
  const [rightClickTimer, setRightClickTimer] = useState<NodeJS.Timeout | null>(null)

  const onClick = useCallback(
    (info: any) => {
      if (drawingMode) {
        if (info.object) {
          // Clicked on a 3D object
          const { x, y } = info
          const pickedObject = deckRef.current.pickObject({ x, y, unproject3D: true })

          if (pickedObject.coordinate) {
            // console.log(pickedObject.coordinate)
            setPoints((prevPoints) => [...prevPoints, pickedObject.coordinate])
          }
        } else if (info.coordinate) {
          // Clicked on the 2D plane
          const { coordinate } = info
          const [lng, lat] = coordinate
          setPoints((prevPoints) => [...prevPoints, [lng, lat]])
        }
      }
    },
    [drawingMode]
  )

  const onContextMenu = useCallback(
    (event: MouseEvent) => {
      if (drawingMode) event.preventDefault()

      if (rightClickTimer) {
        clearTimeout(rightClickTimer)
        setRightClickTimer(null)
        // Double right-click detected
        if (points.length > 2) {
          // Filter out altitude to ensure 2D coordinates, backend algo dont support 3D
          const filteredPoints = points.map((point) =>
            point.length === 3 ? [point[0], point[1]] : point
          )
          setPolygons3D(points)
          setPolygons(filteredPoints)
          setPoints([])
        } else if (points.length < 3) {
          setPoints([])
        }
      } else {
        setRightClickTimer(
          setTimeout(() => {
            setRightClickTimer(null)
          }, 300)
        )
      }
    },
    [drawingMode, points, rightClickTimer, setPolygons]
  )

  useEffect(() => {
    window.addEventListener('contextmenu', onContextMenu)
    return () => {
      window.removeEventListener('contextmenu', onContextMenu)
    }
  }, [onContextMenu])

  // Reset points when drawingMode is set to false
  useEffect(() => {
    if (!drawingMode) {
      setPoints([])
    }
  }, [drawingMode])

  const pointsLayer = new ScatterplotLayer({
    id: 'point-layer',
    data: points.map((point, index) => ({ position: point, id: index })),
    getPosition: (d: any) => d.position,
    getFillColor: [0, 0, 255, 255],
    getRadius: 10,
    sizeUnits: 'pixels',
    radiusMinPixels: 5,
    radiusMaxPixels: 10
  })

  return { pointsLayer, onClick }
}
