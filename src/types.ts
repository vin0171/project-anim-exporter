import { EventHandler } from '@create-figma-plugin/utilities'
import { SceneNodeInfo, SpriteSheetSettings } from './interfaces/pluginInterface'

export interface CreateRectanglesHandler extends EventHandler {
  name: 'CREATE_RECTANGLES'
  handler: (count: number) => void
}

export interface CloseHandler extends EventHandler {
  name: 'CLOSE'
  handler: () => void
}

export interface CancelHandler extends EventHandler {
  name: 'CANCEL'
  handler: () => void
} 

export interface NextHandler extends EventHandler {
  name: 'NEXT'
  handler: (name: string, mode: string) => void
}


export interface SelectAnimationHandler extends EventHandler {
  name: 'SELECT_ANIMATION'
  handler: () => void
}

export interface SelectionChanged extends EventHandler {
  name: 'SELECTION_CHANGED'
  handler: (nodes: SceneNodeInfo[]) => void;
}

export interface NoSelection extends EventHandler {
  name: 'NO_SELECTION'
  handler: () => void
}

export interface ExportSpriteSheet extends EventHandler {
  name: 'EXPORT_SPRITESHEET'
  handler: (nodes: SceneNodeInfo[]) => void
}

export interface RecieveZIPData extends EventHandler {
  name: 'RECIEVE_ZIP_DATA'
  handler: (zipName: string, data: Uint8Array) => void
}

export interface RequestSpriteSheetAsBytes extends EventHandler {
  name: 'REQUEST_SPRITESHEET_AS_BYTES'
  handler: (nodeIds: SceneNodeInfo[], spriteSheetSettings: SpriteSheetSettings) => void
}

export interface ToggleSelectionChange extends EventHandler {
  name: 'TOGGLE_SELECTION_CHANGE'
  handler: (value : boolean) => void
} 