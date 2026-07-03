export interface SpriteSheetSettings {
  framesPerSecond: number,
  useManualKeyFrames: boolean,
  exportType: ExportTypes,
  scale: number,
  hFrames: number,
}

export interface SceneNodeInfo {
    name: string,
    id: string, 
}

export enum ExportTypes {
  SVG = 'SVG_STRING',
  PNG = 'PNG', 
  JPG = 'JPG'
}