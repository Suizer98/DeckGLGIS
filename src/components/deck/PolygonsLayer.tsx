import { PolygonLayer, TextLayer } from '@deck.gl/layers'
import { useEffect, useRef, useState } from 'react'

import { useVolumeStore } from '../../store/volumeStore'

type PolygonData = {
  polygon: number[][]
  id: number
  color: number[]
}

export function usePolygonsLayer() {
  const {
    polygons,
    polygons3D,
    computeVolume,
    addVolumeResult,
    volumeResults,
    setFocusedVolumeResult
  } = useVolumeStore()
  const [polygonData, setPolygonData] = useState<PolygonData[]>([])
  const polygonColors = useRef<Record<number, number[]>>({})

  useEffect(() => {
    setPolygonData(
      polygons3D.map((polygon: any, index: number) => {
        if (!polygonColors.current[index]) {
          polygonColors.current[index] = getRandomColor()
        }
        return {
          polygon,
          id: index,
          color: polygonColors.current[index]
        }
      })
    )

    if (polygons.length > 0) {
      computeVolume(polygons)
        .then((results) => {
          if (results && results.length > 0) {
            const transformedResults = results.flat().map((item: any, index: number) => ({
              no: index + 1,
              Points: polygons[index],
              netVolume:
                typeof item.volume_above_base_level === 'number'
                  ? `${item.volume_above_base_level.toFixed(2)} m³`
                  : item.volume_above_base_level,
              area: `${calculateArea(polygons[index]).toFixed(2)} m²`
            }))
            transformedResults.forEach((result: any) => addVolumeResult(result))
          }
        })
        .catch((error) => {
          console.error('Error computing volume:', error)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polygons])

  const getRandomColor = () => {
    const r = Math.floor(Math.random() * 256)
    const g = Math.floor(Math.random() * 256)
    const b = Math.floor(Math.random() * 256)
    return [r, g, b, 150]
  }

  const calculateArea = (polygon: any) => {
    // Using the Shoelace formula for area of a polygon
    let area = 0
    const n = polygon.length
    for (let i = 0; i < n; i++) {
      const [x1, y1] = polygon[i]
      const [x2, y2] = polygon[(i + 1) % n]
      area += x1 * y2 - x2 * y1
    }
    area = Math.abs(area) / 2

    // Convert from square degrees to square meters (approximation)
    const metersPerDegree = 111139 // Average meters per degree of latitude/longitude
    const areaInSquareMeters = area * Math.pow(metersPerDegree, 2)

    return areaInSquareMeters
  }

  const getPolygonCentroid = (polygon: number[][]) => {
    const n = polygon.length

    const centroid = [0, 0]

    for (let i = 0; i < n; i++) {
      centroid[0] += polygon[i][0]
      centroid[1] += polygon[i][1]
    }

    centroid[0] /= n
    centroid[1] /= n

    return centroid
  }

  const handlePolygonClick = ({ object }: any) => {
    if (object) {
      const result = volumeResults.find((res) => res.no === object.id + 1)
      setFocusedVolumeResult(result)
    }
  }

  const polygonsLayer = new PolygonLayer({
    id: 'polygon-layer',
    data: polygonData,
    getPolygon: (d) => d.polygon,
    getFillColor: (d) => d.color,
    getLineColor: [0, 0, 0, 255],
    getLineWidth: 0.5,
    pickable: true,
    onClick: handlePolygonClick
  })

  const textLayer = new TextLayer({
    id: 'text-layer',
    data: polygonData,
    getPosition: (d) => getPolygonCentroid(d.polygon) as any,
    getText: (d) => `${d.id + 1}`,
    getSize: 20,
    getColor: [0, 0, 0, 255],
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center',
    pickable: false
  })

  return { polygonsLayer, textLayer }
}
