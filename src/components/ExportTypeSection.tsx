import { Fragment, h } from 'preact'
import { VerticalSpace, Text, Dropdown, DropdownOption, Textbox, Muted } from '@create-figma-plugin/ui'
import { ExportTypes } from '../interfaces/pluginInterface'
import { useCallback } from 'preact/hooks'


const FORMAT_OPTIONS: Array<DropdownOption> = [
  { value: ExportTypes.PNG, text: 'PNG' },
  { value: ExportTypes.SVG, text: 'SVG'},
  { value: ExportTypes.JPG, text: 'JPG' }
]

interface ExportSectionProps {
  exportType: ExportTypes
  setExportType: (exportType: ExportTypes) => void
  setScale: (scale: number | null) => void
  scaleString: string
  setScaleString: (scaleString: string) => void
  scale: number | null
}

export function ExportSection({ exportType, setExportType, scaleString, setScaleString, setScale, scale }: ExportSectionProps) {
  
  const handleExportTypeChange = useCallback(
    function (event: any) {
      setExportType(event.currentTarget.value as ExportTypes)
    },
  []);

  function handleBlur(event: any) {
    var string = event.currentTarget.value;
    const cleaned = string.replace(/x/g, "");
    const num = cleaned === "" ? 1 : Math.min(Number(cleaned), 1024);

    setScale(num);
    setScaleString(num + "x");
  }

  function validateOnBlur(value: string): string | boolean {
    const cleaned = value.replace(/x/g, "");
    return (!/^\d*\.?\d*$/.test(cleaned));
  }

return (
  <Fragment>
    <Text>Result Export</Text>
    <VerticalSpace space="small" />
    <Text>Choose format and export.</Text>
    <VerticalSpace space="small" />

    <div style={{ display: 'flex', gap: '8px' }}>
      {exportType !== ExportTypes.SVG && (
        <div style={{ flex: 1 }}>
          <Text style={{ fontSize: '11px' }}>
            <Muted> Scale </Muted>
          </Text>
          <VerticalSpace space="extraSmall" />
          <Textbox
            validateOnBlur={validateOnBlur}
            onBlur={handleBlur}
            value={scaleString}
          />
        </div>
      )}

      <div style={{ flex: 4 }}>
        <Text style={{ fontSize: '11px' }}>
          <Muted> Format </Muted>
        </Text>
        <VerticalSpace space="extraSmall" />
        <Dropdown
          onChange={handleExportTypeChange}
          options={FORMAT_OPTIONS}
          value={exportType}
        />
      </div>
    </div>
  </Fragment>
)
}