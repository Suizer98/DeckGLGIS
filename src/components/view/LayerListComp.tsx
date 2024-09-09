import { List, ListItem, Spinner, Switch } from '@chakra-ui/react'

interface Layer {
  id: string
  name: string
  visible: boolean
}

interface LayerListProps {
  layers: Layer[] | any[]
  toggleLayerVisibility: (id: string | any) => void
  title: string
}

const LayerListComp: React.FC<LayerListProps> = ({ layers, toggleLayerVisibility, title }) => {
  return (
    <>
      <h3 className="text-md font-semibold mb-2">{title}</h3>
      {layers.length === 0 ? (
        <Spinner size="md" />
      ) : (
        <List spacing={3} mb={4}>
          {layers.map((layer) => (
            <ListItem
              key={layer.id}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              {layer.name}
              <Switch isChecked={layer.visible} onChange={() => toggleLayerVisibility(layer.id)} />
            </ListItem>
          ))}
        </List>
      )}
    </>
  )
}

export default LayerListComp
