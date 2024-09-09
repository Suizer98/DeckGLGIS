import { Box, Text, VStack } from '@chakra-ui/react'

const VolumeDetails = ({ details }: any) => {
  const volumeDetails = {
    no: 0,
    Points: [],
    netVolume: '0 m³',
    area: '0 m²'
  }

  const displayDetails = details || volumeDetails

  return (
    <Box mt={6} p={4} borderRadius="md" borderWidth="1px" borderColor="gray.700" bg="gray.800">
      <VStack align="start" spacing={2}>
        <Text fontWeight="bold" fontSize="lg" color="white">
          Volume Details
        </Text>
        <Text color="gray.300">
          Polygon:{' '}
          <Text as="span" color="white">
            {displayDetails.no}
          </Text>
        </Text>
        {/* <Text color="gray.300">
          Points:
          <Box as="span" color="white" maxH="100px" overflowY="auto" display="block">
            {displayDetails.Points.map((point: number[], index: number) => (
              <Text key={index} as="span" display="block">
                ({point.join(', ')})
              </Text>
            ))}
          </Box>
        </Text> */}
        <Text color="gray.300">
          Net Volume:{' '}
          <Text as="span" color="white">
            {displayDetails.netVolume}
          </Text>
        </Text>
        <Text color="gray.300">
          Area:{' '}
          <Text as="span" color="white">
            {displayDetails.area}
          </Text>
        </Text>
      </VStack>
    </Box>
  )
}

export default VolumeDetails
