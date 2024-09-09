import { BASEMAP } from '@deck.gl/carto'
import { Deck } from '@deck.gl/core'
import DeckGL from '@deck.gl/react'
import { Map } from 'maplibre-gl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useDemsStore } from '../../store/demStore'
import { useGeotiffsStore } from '../../store/geotiffsStore'
import { useVolumeStore } from '../../store/volumeStore'
import { updateDemLayers } from '../map/demLayers'
import { updateGeotiffLayers } from '../map/geotiffLayers'
import { ViewState } from '../map/types'
import { usePointsLayer } from './PointsLayer'
import { usePolygonsLayer } from './PolygonsLayer'
import { useGLTFLayer } from './useGLTFLayer'
import { useOBJLayer } from './useObjLayer'
import { usePLYLayer } from './usePlyLayer'
import { usePointCloudLayer } from './useXYZLayer'

const VIEW_BOUNDS = [85.405469615, 21.930024852, 85.408038986, 21.931698096]

const INITIAL_VIEW_STATE: ViewState = {
  longitude: (VIEW_BOUNDS[0] + VIEW_BOUNDS[2]) / 2,
  latitude: (VIEW_BOUNDS[1] + VIEW_BOUNDS[3]) / 2,
  zoom: 15,
  // longitude: -122.4,
  // latitude: 37.74,
  // zoom: 11,
  pitch: 0,
  bearing: 0
}

export function Deck3D() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const deckRef = useRef<Deck | any>()
  const { layers: geotiffLayers } = useGeotiffsStore()
  const { layers: demLayers } = useDemsStore()
  const { drawingMode } = useVolumeStore()
  const [viewState, setViewState] = useState<any>(INITIAL_VIEW_STATE)

  const { pointsLayer, onClick } = usePointsLayer(drawingMode, deckRef)
  const { polygonsLayer, textLayer } = usePolygonsLayer()
  const gltfLayers = useGLTFLayer(viewState)
  const xyzLayers = usePointCloudLayer(viewState)
  const objLayers = useOBJLayer(viewState)
  const plyLayers = usePLYLayer(viewState)

  const onMapMove = useCallback(() => {
    if (mapRef.current) {
      const { lng, lat } = mapRef.current.getCenter()
      const newViewState = {
        longitude: lng,
        latitude: lat,
        zoom: mapRef.current.getZoom(),
        pitch: mapRef.current.getPitch(),
        bearing: mapRef.current.getBearing()
      }

      setViewState((prevState: any) => {
        if (
          prevState.longitude !== newViewState.longitude ||
          prevState.latitude !== newViewState.latitude ||
          prevState.zoom !== newViewState.zoom ||
          prevState.pitch !== newViewState.pitch ||
          prevState.bearing !== newViewState.bearing
        ) {
          return newViewState
        }
        return prevState
      })
    }
  }, [])

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new Map({
        container: mapContainerRef.current,
        style: BASEMAP.POSITRON,
        center: [viewState.longitude, viewState.latitude],
        zoom: viewState.zoom,
        pitch: viewState.pitch,
        bearing: viewState.bearing
      })

      mapRef.current.on('move', onMapMove)
      updateGeotiffLayers(mapRef.current, geotiffLayers)
      updateDemLayers(mapRef.current, demLayers)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off('move', onMapMove)
        mapRef.current.remove()
        mapRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onMapMove])

  useEffect(() => {
    if (mapRef.current) {
      const { longitude, latitude, zoom, pitch, bearing } = viewState
      mapRef.current.setCenter([longitude, latitude])
      mapRef.current.setZoom(zoom)
      mapRef.current.setPitch(pitch)
      mapRef.current.setBearing(bearing)
    }
  }, [viewState])

  useEffect(() => {
    if (mapRef.current) {
      updateGeotiffLayers(mapRef.current, geotiffLayers)
    }
  }, [geotiffLayers])

  useEffect(() => {
    if (mapRef.current) {
      updateDemLayers(mapRef.current, demLayers)
    }
  }, [demLayers])

  const handleResetView = () => {
    setViewState(INITIAL_VIEW_STATE)
  }

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <div
        ref={mapContainerRef}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '100%'
        }}
      />
      <DeckGL
        ref={(instance) => {
          if (instance) {
            deckRef.current = instance.deck
          }
        }}
        viewState={viewState}
        controller={{ doubleClickZoom: false }}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        layers={[
          ...gltfLayers,
          objLayers,
          plyLayers,
          xyzLayers,
          pointsLayer,
          polygonsLayer,
          textLayer
        ]}
        onClick={(info, event) => {
          const mouseEvent = event.srcEvent as MouseEvent
          // console.log(info)
          if (mouseEvent.button === 0) {
            onClick(info)
          }
        }}
      />
      <button
        onClick={handleResetView}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1,
          padding: '10px 20px',
          backgroundColor: 'white',
          border: 'none',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          cursor: 'pointer'
        }}
      >
        Reset View
      </button>
    </div>
  )
}
