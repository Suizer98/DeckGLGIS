import { Box, Button } from '@chakra-ui/react'
import { useEffect } from 'react'

import { useDemsStore } from '../../store/demStore'
import { useGeotiffsStore } from '../../store/geotiffsStore'
import { useGLBMeshesStore } from '../../store/glbMeshesStore'
import { useOBJMeshesStore } from '../../store/objMeshesStore'
import { usePLYMeshesStore } from '../../store/plyMeshesStore'
import { useVolumeStore } from '../../store/volumeStore'
import { usePointCloudMeshesStore } from '../../store/xyzMeshesStore'
import LayerListComp from './LayerListComp'
import VolumeModePane from './VolumeModePane'

const Sidebar = () => {
  const {
    layers: geotiffLayers,
    fetchGeotiffs,
    toggleLayerVisibility: toggleGeoTIFFLayerVisibility
  } = useGeotiffsStore()

  const {
    layers: glbMeshLayers,
    fetchGLBMeshes,
    toggleLayerVisibility: toggleGLBMeshLayerVisibility
  } = useGLBMeshesStore()

  const {
    layers: demLayers,
    fetchDems,
    toggleLayerVisibility: toggleDemLayerVisibility
  } = useDemsStore()

  const {
    layers: pointCloudLayers,
    fetchPointCloudMeshes,
    toggleLayerVisibility: togglePointCloudLayerVisibility
  } = usePointCloudMeshesStore()

  const {
    layers: objMeshLayers,
    fetchOBJMeshes,
    toggleLayerVisibility: toggleOBJMeshLayerVisibility
  } = useOBJMeshesStore()

  const {
    layers: plyMeshLayers,
    fetchPLYMeshes,
    toggleLayerVisibility: togglePLYMeshLayerVisibility
  } = usePLYMeshesStore()

  const { volumeMode, enableVolumeMode } = useVolumeStore()

  useEffect(() => {
    fetchGeotiffs()
    fetchGLBMeshes()
    fetchDems()
    fetchPointCloudMeshes()
    fetchOBJMeshes()
    fetchPLYMeshes()
  }, [
    fetchGeotiffs,
    fetchGLBMeshes,
    fetchDems,
    fetchPointCloudMeshes,
    fetchOBJMeshes,
    fetchPLYMeshes
  ])

  const layerGroups = [
    {
      layers: geotiffLayers,
      toggleLayerVisibility: toggleGeoTIFFLayerVisibility,
      title: 'GeoTIFFs'
    },
    { layers: demLayers, toggleLayerVisibility: toggleDemLayerVisibility, title: 'DEMs' },
    {
      layers: glbMeshLayers,
      toggleLayerVisibility: toggleGLBMeshLayerVisibility,
      title: 'GLB Meshes'
    },
    {
      layers: pointCloudLayers,
      toggleLayerVisibility: togglePointCloudLayerVisibility,
      title: 'Point Cloud Meshes'
    },
    {
      layers: objMeshLayers,
      toggleLayerVisibility: toggleOBJMeshLayerVisibility,
      title: 'OBJ Meshes'
    },
    {
      layers: plyMeshLayers,
      toggleLayerVisibility: togglePLYMeshLayerVisibility,
      title: 'PLY Meshes'
    }
  ]

  return (
    <>
      <VolumeModePane />
      <Box
        as="aside"
        className={`p-4 ${volumeMode ? 'bg-gray-800 text-white w-70' : 'bg-gray-200'}`}
        width="15%"
        maxHeight="100vh"
        overflow="hidden"
      >
        {!volumeMode && (
          <>
            <h2 className="text-lg font-bold mb-4">Layers</h2>
            <Box overflowY="auto" overflowX="hidden" maxHeight="75vh">
              {layerGroups.map((group) => (
                <LayerListComp
                  key={group.title}
                  layers={group.layers}
                  toggleLayerVisibility={group.toggleLayerVisibility}
                  title={group.title}
                />
              ))}
            </Box>
            <Button colorScheme="blue" mt={5} w="full" onClick={enableVolumeMode}>
              Enter Volume Mode
            </Button>
          </>
        )}
      </Box>
    </>
  )
}

export default Sidebar
