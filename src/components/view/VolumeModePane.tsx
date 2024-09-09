import { Box, Button, Divider, Flex, List, ListItem } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import { useCurrentDEMStore, useVolumeStore } from '../../store/volumeStore'
import VolumeDetails from './VolumeDetails'

const VolumeModePane = () => {
  const {
    volumeMode,
    disableVolumeMode,
    drawingMode,
    toggleDrawingMode,
    clearPolygons,
    clearPolygons3D,
    volumeResults,
    focusedVolumeResult,
    setFocusedVolumeResult,
    clearFocusedVolumeResult
  } = useVolumeStore()

  const { currentDEM, setCurrentDEM } = useCurrentDEMStore()

  const [currentResultIndex, setCurrentResultIndex] = useState(0)

  useEffect(() => {
    if (volumeResults.length > 0) {
      setCurrentResultIndex(volumeResults.length - 1)
      setFocusedVolumeResult(volumeResults[volumeResults.length - 1])
    }
  }, [volumeResults, setFocusedVolumeResult])

  const handleNextResult = () => {
    if (volumeResults.length > 0) {
      const nextIndex = (currentResultIndex + 1) % volumeResults.length
      setCurrentResultIndex(nextIndex)
      setFocusedVolumeResult(volumeResults[nextIndex])
    }
  }

  const handlePreviousResult = () => {
    if (volumeResults.length > 0) {
      const prevIndex = (currentResultIndex - 1 + volumeResults.length) % volumeResults.length
      setCurrentResultIndex(prevIndex)
      setFocusedVolumeResult(volumeResults[prevIndex])
    }
  }

  const handleNextDEM = () => {
    setCurrentDEM(currentDEM + 1)
  }

  const handlePreviousDEM = () => {
    setCurrentDEM(currentDEM > 1 ? currentDEM - 1 : 1)
  }

  return (
    <Box
      as="aside"
      className={`p-4 bg-gray-900 text-white h-full fixed overflow-y-auto transition-transform duration-100 ease-in-out ${
        volumeMode ? 'translate-x-0' : '-translate-x-full'
      }`}
      width={volumeMode ? '15%' : '0%'}
    >
      <h2 className="text-lg font-bold mb-4">Volume Mode</h2>

      <Flex justify="space-between" alignItems="center" mb={4}>
        <Button onClick={handlePreviousDEM} colorScheme="teal">
          {'<'}
        </Button>
        <Box mx={2}>Current DEM: {currentDEM}</Box>
        <Button onClick={handleNextDEM} colorScheme="teal">
          {'>'}
        </Button>
      </Flex>

      <Button
        colorScheme={drawingMode ? 'orange' : 'gray'}
        mb={2}
        w="full"
        onClick={toggleDrawingMode}
      >
        {drawingMode ? 'End Drawing' : 'Start Drawing'}
      </Button>

      <Divider my={4} />

      <h3 className="text-md font-semibold mb-4">Drawing Modes</h3>
      <List spacing={3}>
        <ListItem>
          <Button colorScheme="gray" w="full">
            Polygon Mode
          </Button>
        </ListItem>
        <ListItem>
          {/* <Button colorScheme="gray" w="full" disabled={true} variant="outline">
            Rectangle Mode
          </Button> */}
        </ListItem>
      </List>

      <Divider my={4} />

      <VolumeDetails details={focusedVolumeResult} />

      <Flex justify="space-between" mt={4} mb={2}>
        <Button colorScheme="teal" onClick={handlePreviousResult} w="48%">
          Previous
        </Button>
        <Button colorScheme="teal" onClick={handleNextResult} w="48%">
          Next
        </Button>
      </Flex>

      <Button
        colorScheme="red"
        mb={4}
        mt={4}
        onClick={() => {
          clearPolygons()
          clearFocusedVolumeResult()
          clearPolygons3D()
        }}
        w="full"
      >
        Clear all polygons
      </Button>

      <Divider my={4} />

      <Button colorScheme="yellow" mb={4} onClick={disableVolumeMode} w="full">
        Exit Volume Mode
      </Button>
    </Box>
  )
}

export default VolumeModePane
