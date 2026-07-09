import { h } from 'preact'
import { Button, Container, VerticalSpace, Text, Bold, Muted, Divider, Banner, IconInfoSmall24, Dropdown, Stack, RadioButtons } from '@create-figma-plugin/ui'
import { SceneNodeInfo } from '../interfaces/pluginInterface'
import { usePage } from '../context/PageContext'
import { useNodes } from '../context/NodeContext'
import { useEffect, useState } from 'preact/hooks'
import { on } from '@create-figma-plugin/utilities'
import { SelectionChanged } from '../types'

type SelectionType = 'single' | 'multi' | 'components';

export function ActionSelectPage() {
  const { setCurrentPage } = usePage();
  const { nodes, setNodes } = useNodes();
  const [selectionType, setSelectionType] = useState<SelectionType>('single');

  useEffect(() => {
    return on<SelectionChanged>('SELECTION_CHANGED', function (nodes: SceneNodeInfo[]) {
      if (nodes.length !== 0) {
        setNodes(nodes);
        setCurrentPage('action');
      }
    });
  });

  if (nodes.length === 0) {
    return (
      <Container space="medium">
        <VerticalSpace space="large" />
        <VerticalSpace space="large" />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              border: '1px dashed var(--figma-color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconInfoSmall24 />
          </div>
        </div>
        <VerticalSpace space="medium" />
        <Text align="center">
          <Bold>No selection yet</Bold>
        </Text>
        <VerticalSpace space="extraSmall" />
        <Text align="center">
          <Muted>Select a frame, component, or set in Figma it'll show up here automatically.</Muted>
        </Text>
        <VerticalSpace space="large" />
        <VerticalSpace space="large" />
      </Container>
    );
  }

  const handleSelectionChange = (value: string) => {
    setSelectionType(value as SelectionType);
  };

  return (
    <Container space="medium">
      <VerticalSpace space="large" />
      <Text>
        <Bold>{nodes.map((n) => n.name).join(', ')}</Bold>
      </Text>
      <VerticalSpace space="small" />
      <Text>
        <Muted>Confirm that this is your selection</Muted>
      </Text>

      <VerticalSpace space="large" />
      <Divider />
      <VerticalSpace space="large" />

      <Text>
        <Bold>What does your selection contain?</Bold>
      </Text>
      <VerticalSpace space="small" />
      <RadioButtons
        value={selectionType}
        onValueChange={handleSelectionChange}
        space="small"
        options={[
          { value: 'single', children: 'Single animation - one frame containing one animation' },
          { value: 'multi', children: 'Multiple animations - each child of the frame is its own animation (WIP)' },
          { value: 'components', children: 'Animation components - selection is a set of animation components' },
        ]}
      />

      <VerticalSpace space="large" />
      <Divider />
      <VerticalSpace space="large" />

      <Stack space="small">
        <Button fullWidth onClick={() => setCurrentPage('export')}>
          Confirm Selection And Export As Spritesheet
        </Button>
        <Button fullWidth onClick={() => setCurrentPage('export-godot-scene')}>
          Confirm Selection And Export As Godot Scene
        </Button>
        <Button fullWidth onClick={() => setCurrentPage('action')} secondary>
          Refresh Selection
        </Button>
      </Stack>
    </Container>
  );

}
