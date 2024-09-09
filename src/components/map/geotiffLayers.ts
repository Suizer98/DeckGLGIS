import maplibregl from 'maplibre-gl'

import { Layer } from '../../store/geotiffsStore'

export const updateGeotiffLayers = (map: maplibregl.Map, geotiffLayers: Layer[]) => {
  if (!map.isStyleLoaded()) {
    map.once('styledata', () => {
      applyGeotiffLayers(map, geotiffLayers)
    })
  } else {
    applyGeotiffLayers(map, geotiffLayers)
  }
}

const applyGeotiffLayers = (map: maplibregl.Map, geotiffLayers: Layer[]) => {
  removeGeotiffLayers(map, geotiffLayers)

  geotiffLayers.forEach((layer) => {
    const sourceId = `raster-tiles-${layer.id}`
    const layerId = `raster-layer-${layer.id}`

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

export const removeGeotiffLayers = (map: maplibregl.Map, geotiffLayers: Layer[]) => {
  geotiffLayers.forEach((layer) => {
    const sourceId = `raster-tiles-${layer.id}`
    const layerId = `raster-layer-${layer.id}`

    if (map.getLayer(layerId)) {
      map.removeLayer(layerId)
    }

    if (map.getSource(sourceId)) {
      map.removeSource(sourceId)
    }
  })
}
