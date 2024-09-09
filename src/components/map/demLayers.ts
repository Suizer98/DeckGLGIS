import maplibregl from 'maplibre-gl'

import { Layer } from '../../store/demStore'

export const updateDemLayers = (map: maplibregl.Map, demLayers: Layer[]) => {
  if (!map.isStyleLoaded()) {
    map.once('styledata', () => {
      applyDemLayers(map, demLayers)
    })
  } else {
    applyDemLayers(map, demLayers)
  }
}

const applyDemLayers = (map: maplibregl.Map, demLayers: Layer[]) => {
  removeDemLayers(map, demLayers)

  demLayers.forEach((layer) => {
    const sourceId = `dem-tiles-${layer.id}`
    const layerId = `dem-layer-${layer.id}`

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'raster',
        tiles: [`${layer.geoserver_url}`],
        tileSize: 256
      })

      map.addLayer({
        id: layerId,
        type: 'raster',
        source: sourceId,
        minzoom: 0,
        maxzoom: 22
      })
    }

    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', layer.visible ? 'visible' : 'none')
    }
  })
}

export const removeDemLayers = (map: maplibregl.Map, demLayers: Layer[]) => {
  demLayers.forEach((layer) => {
    const sourceId = `dem-tiles-${layer.id}`
    const layerId = `dem-layer-${layer.id}`

    if (map.getLayer(layerId)) {
      map.removeLayer(layerId)
    }

    if (map.getSource(sourceId)) {
      map.removeSource(sourceId)
    }
  })
}
