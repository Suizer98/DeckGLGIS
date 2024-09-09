import { Box, ChakraProvider, Flex } from '@chakra-ui/react'

import './App.css'
import { Deck3D } from './components/deck/Deck3D'
import Sidebar from './components/view/Sidebar'
import Topbar from './components/view/Topbar'

function App() {
  return (
    <ChakraProvider>
      <Flex direction="column" className="h-screen">
        <Topbar />
        <Flex flex="1">
          <Sidebar />
          <Box flex="1" className="relative">
            <Deck3D />
          </Box>
        </Flex>
      </Flex>
    </ChakraProvider>
  )
}

export default App
