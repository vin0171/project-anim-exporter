import { h } from 'preact'
import { Button, Container, VerticalSpace, Text, Bold, Muted, Divider, Banner, IconInfoSmall24 } from '@create-figma-plugin/ui'
import { SceneNodeInfo } from '../interfaces/pluginInterface'
import { usePage } from '../context/PageContext'
import { useNodes } from '../context/NodeContext'
import { useEffect } from 'preact/hooks'
import { on } from '@create-figma-plugin/utilities'
import { SelectionChanged } from '../types'

export function ActionSelectPage() {
  const { setCurrentPage } = usePage();
  const { nodes, setNodes } = useNodes();


  useEffect(() => {
    return on<SelectionChanged>('SELECTION_CHANGED', function (nodes: SceneNodeInfo[]) {
      if (nodes.length !== 0) {
        setNodes(nodes);
        setCurrentPage('action');
      }
    });
  });

  if (nodes.length === 0) { return (
    <Container space="medium">
      <VerticalSpace space="small" />
      <Banner icon={<IconInfoSmall24 />}> Click a frame or component in Figma to get started. </Banner>;
    </Container>
  ) } else {
      return (
        <Container space="medium">
          <VerticalSpace space="large" />
          <Text><Bold>{nodes.map((n) => n.name).join(', ')}</Bold></Text>
          <VerticalSpace space="small" />
          <Text><Muted>Confirm that this is your thingy</Muted></Text>
          <VerticalSpace space="large" />
          <Divider />
          <VerticalSpace space="large" />

          <Button fullWidth onClick={() => setCurrentPage('export')}>
            Confirm Selection And Export As SpriteSheet
          </Button>

          <Button fullWidth onClick={() => setCurrentPage('export-godot-scene')}>
            Confirm Selection And Export As Godot Scene
          </Button>

          <Button fullWidth onClick={() => setCurrentPage('action')} secondary>
            Refresh Selection
          </Button>
        </Container>
      );
  }
}