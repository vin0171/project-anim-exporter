import { emit, on, once, showUI } from '@create-figma-plugin/utilities'
import { CloseHandler, RecieveZIPData, RequestSpriteSheetAsBytes, SelectionChanged, ToggleSelectionChange } from './types'
import { ExportTypes, SceneNodeInfo, SpriteSheetSettings } from './interfaces/pluginInterface';

import { ResetAnimations } from './utils/ResetAnimations';
import { applyAnimationSnapshot } from './utils/ApplyAnimationSnapshot';
import { strToU8, zipSync } from 'fflate';


let selectionEnabled = true;

// make this a callback
function handleSelectionChange() {
  if (!selectionEnabled) return;
  const nodes = figma.currentPage.selection;
  const sceneNodeInfo = nodes.map(node => {
    return {
      id: node.id,
      name: node.name,
      type: node.type,
    };
  });
  emit<SelectionChanged>("SELECTION_CHANGED", sceneNodeInfo);
}

// Hframes as in how many columns across
function createSpriteSheet(spriteCopy: FrameNode, spritesheetSettings: SpriteSheetSettings) {
  const frame = figma.createFrame();
  frame.fills = [];
  frame.name = 'SpriteSheet';
  frame.resize(spritesheetSettings.hFrames * spriteCopy.width, spriteCopy.height);
  frame.layoutMode = "GRID";

  frame.gridAutoTracks = "ROWS"
  frame.gridColumnCount = spritesheetSettings.hFrames;
  figma.currentPage.appendChild(frame);

  const animationDetails = ResetAnimations(spriteCopy);
  var timeLineDuration = animationDetails.timelineDuration;
  const rawSprite = animationDetails.sprite;

  const noOfFrames = timeLineDuration * spritesheetSettings.framesPerSecond
  for (var i = 0; i < noOfFrames; i++) {
    const copy = rawSprite.clone();
    var time = timeLineDuration * (i / noOfFrames);
    applyAnimationSnapshot(copy, animationDetails.originalAnimationPart, time);
    frame.appendChild(copy);
  }

  rawSprite.remove();

  return frame;
}

async function handleSpriteSheetBytes(nodeIds: SceneNodeInfo[], spriteSheetSettings: SpriteSheetSettings) {
  const spriteCopy = await copySelectionIntoNewFrame(nodeIds);
  if (spriteCopy === null) return;

  const spriteSheet = createSpriteSheet(spriteCopy, spriteSheetSettings);
  const files: Record<string, Uint8Array> = {};

  if (spriteSheetSettings.exportType === ExportTypes.SVG) {
    const string = await spriteSheet.exportAsync({ format: spriteSheetSettings.exportType });
    files[`${spriteSheet.name}.svg`] = strToU8(string);
  } else {
    const bytes = await spriteSheet.exportAsync({
      format: spriteSheetSettings.exportType,
      constraint: {
        type: 'SCALE',
        value: spriteSheetSettings.scale
      }
    });
    const ext = spriteSheetSettings.exportType === ExportTypes.JPG ? 'jpg' : 'png';
    files[`${spriteSheet.name}.${ext}`] = bytes;
  }

  spriteCopy.remove();
 
  const allFiles = zipSync(files);
  emit<RecieveZIPData>('RECIEVE_ZIP_DATA', 'sprite-sheet.zip', allFiles);
}

// Deals with Selection via Frame vs Selection of Group Of Nodes inside a Frame
async function copySelectionIntoNewFrame(nodeIds: SceneNodeInfo[]) : Promise<FrameNode|null> {
 var part : BaseNode | null  = await figma.getNodeByIdAsync(nodeIds[0].id) as SceneNode;
  if (part === null) return null;

  var parent : BaseNode | null = part.parent;
  
  const frame = parent?.type === 'PAGE' ? figma.currentPage : figma.createFrame();
  
  if ("resize" in frame && parent !== null && "width" in parent && "height" in parent) {
    frame.resize(parent.width ?? 512, parent.height ?? 512);
  }

  var animationCopy : any = frame;
  var part : BaseNode | null;
  for (var nodeInfo of nodeIds) {
    var node : BaseNode | null  = await figma.getNodeByIdAsync(nodeInfo.id) as SceneNode;
    if (node === null) continue;

    part = node; 

    const copy = node.clone() as FrameNode;
    frame.appendChild(copy);
    if (frame.type === 'PAGE') animationCopy = copy;
    
  }
  return animationCopy;
}

export default async function () {
  on<RequestSpriteSheetAsBytes>('REQUEST_SPRITESHEET_AS_BYTES', handleSpriteSheetBytes);

  on<ToggleSelectionChange>('TOGGLE_SELECTION_CHANGE', (value : boolean) => {
    selectionEnabled = value;
  });

  // Use Figma Inbuilt Selection Change 
  figma.on("selectionchange", handleSelectionChange);

  once<CloseHandler>('CLOSE', function () {
    figma.off("selectionchange", handleSelectionChange);
    figma.closePlugin()
  });

  showUI({
    height: 500,
    width: 1000
  });
}
