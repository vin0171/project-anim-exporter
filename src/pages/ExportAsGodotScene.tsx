import {
  Columns,
  Text,
  IconChevronRight16,
  IconChevronDown16,
  VerticalSpace,
  Bold
} from '@create-figma-plugin/ui';
import { Fragment, h, JSX } from 'preact';
import { useState } from 'preact/hooks';

type Layer = {
  id: string;
  name: string;
  children?: Layer[];
};

const layers: Layer[] = [
  {
    id: '1',
    name: 'Frame',
    children: [
      {
        id: '2',
        name: 'Character',
        children: [
          { id: '3', name: 'Head' },
          { id: '4', name: 'Body' },
          { id: '5', name: 'Arm' }
        ]
      },
      {
        id: '6',
        name: 'Background'
      }
    ]
  }
];

export function ExportAsGodotScene() {
  const [selectedId, setSelectedId] = useState<string>('3');

  const [open, setOpen] = useState<Record<string, boolean>>({
    '1': true,
    '2': true
  });

  function toggle(id: string) {
    setOpen((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  }

  function renderLayer(layer: Layer, depth = 0): JSX.Element {
    const isOpen = open[layer.id];
    const hasChildren = !!layer.children?.length;

    return (
      <Fragment key={layer.id}>
        <div
          onClick={() => setSelectedId(layer.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            paddingLeft: 8 + depth * 14,
            borderRadius: 6,
            cursor: 'pointer',
            background:
              selectedId === layer.id
                ? 'rgba(13,153,255,0.15)'
                : undefined
          }}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggle(layer.id);
            }}
            style={{
              width: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {hasChildren ? (
              isOpen ? (
                <IconChevronDown16 />
              ) : (
                <IconChevronRight16 />
              )
            ) : (
              <div style={{ width: 16 }} />
            )}
          </div>
          <Text>{layer.name}</Text>
        </div>

        {hasChildren && isOpen && (
          <div>
            {layer.children!.map((child) =>
              renderLayer(child, depth + 1)
            )}
          </div>
        )}
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Columns space="large">
        <div
          style={{
            width: '45%',
            height: 520,
            border: '1px solid #E5E5E5',
            borderRadius: 8,
            overflow: 'auto',
            background: 'white'
          }}
        >
          <div
            style={{
              padding: 10,
              borderBottom: '1px solid #E5E5E5'
            }}
          >
            <Text>
              <Bold>Layers</Bold>
            </Text>
          </div>

          <VerticalSpace space="extraSmall" />

          <div>{layers.map((layer) => renderLayer(layer))}</div>
        </div>

        <div
          style={{
            flex: 1,
            height: 520,
            border: '1px solid #E5E5E5',
            borderRadius: 8,
            background: '#FAFAFA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: 260,
              height: 260,
              border: '1px dashed #B3B3B3',
              borderRadius: 8,
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: 12
            }}
          >
            <Text>
              Export Preview
              <br />
              Selected Layer: {selectedId}
            </Text>
          </div>
        </div>
      </Columns>
    </Fragment>
  );
}