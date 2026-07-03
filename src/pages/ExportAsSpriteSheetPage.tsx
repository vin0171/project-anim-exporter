import { h } from 'preact'
import { Button, Container, VerticalSpace, Text, Bold, Muted, Divider, TextboxNumeric, Checkbox} from '@create-figma-plugin/ui'
import { ExportTypes, SpriteSheetSettings } from '../pluginInterface'
import { usePage } from '../context/PageContext'
import { useNodes } from '../context/NodeContext'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { RecieveZIPData, RequestSpriteSheetAsBytes } from '../types'
import { emit, on } from '@create-figma-plugin/utilities'
import { ExportSection } from '../components/ExportTypeSection'


export function ExportAsSpriteSheet() {
  const { setCurrentPage } = usePage()
  const { nodes } = useNodes()

  const [FPSString, setFPSString] = useState('3');
  const [FPS, setFPS] = useState<number | null>(3);
  const [useManualKeyFrames, setUseManualKeyFrames] = useState(false);
  const [exportType, setExportType] = useState(ExportTypes.PNG);

  const [scale, setScale] = useState<number | null>(1);
  const [scaleString, setScaleString] = useState('1x');

  const [hFrames, setHFrames] = useState<number | null>(5);
  const [hFramesString, setHFramesString] = useState('5');

  const firstNodeName = nodes[0]?.name || 'Selected Layer';

  const handleExport = useCallback(
    function () {
      var spriteSheetSettings : SpriteSheetSettings = {
        framesPerSecond: FPS || 60,
        hFrames: hFrames || 5,
        useManualKeyFrames: useManualKeyFrames,
        exportType: exportType,
        scale: scale || 1
      }
      emit<RequestSpriteSheetAsBytes>("REQUEST_SPRITESHEET_AS_BYTES", nodes, spriteSheetSettings);
    },
    [FPS, hFrames, useManualKeyFrames, scale, exportType]
  )

  useEffect(() => {
    return on<RecieveZIPData>('RECIEVE_ZIP_DATA', function (zipName: string, data : Uint8Array) {
      const blob = new Blob([Uint8Array.from(data)], { type: "application/zip" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = zipName;
      a.click();

      URL.revokeObjectURL(url);
    })
  });

  return (
    <Container space="medium">
      <VerticalSpace space="large" />
      <Text><Bold>{firstNodeName}</Bold></Text>
      <VerticalSpace space="small" />
      <Text><Muted>Exporting As SpriteSheet</Muted></Text>

      <VerticalSpace space="medium" />
      <Checkbox
        value={useManualKeyFrames}
        onValueChange={setUseManualKeyFrames}
      >
      <Text>Use only manual keyframes</Text>
      </Checkbox>
      
      <VerticalSpace space="large" />
        {useManualKeyFrames === false && (
          <div>
            <Text>Frames per second (If You Set 60FPS And the total Aniamtion Duration is 3 seconds it will export 180 frames)</Text>
            <VerticalSpace space="small" />
            <TextboxNumeric
              onNumericValueInput={setFPS}
              onValueInput={setFPSString}
              value={FPSString}
            />
            <VerticalSpace space="large" />
          </div>
        )}

      <Divider></Divider>
      <VerticalSpace space="large" />

      <Text>HFrames: How many Frames Across In The SpriteSheet?</Text>
      <VerticalSpace space="small" />
      <TextboxNumeric
        onNumericValueInput={setHFrames}
        onValueInput={setHFramesString}
        value={hFramesString}
      />

      <VerticalSpace space="large" />
      <Divider />

      <VerticalSpace space="large" />
      
      <ExportSection
        exportType={exportType}
        setExportType={setExportType}
        setScale={setScale}
        setScaleString={setScaleString}
        scaleString={scaleString}
        scale={scale}
      />
      <VerticalSpace space="large" />

      <Button fullWidth onClick={handleExport}>
        Export
      </Button>

      <VerticalSpace space="small" />
      
      <Button fullWidth onClick={() => setCurrentPage('action')} secondary>
        Back To Selection
      </Button>

    </Container>
  )
}