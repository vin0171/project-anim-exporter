import { emit, on, once, showUI } from '@create-figma-plugin/utilities'
import { CloseHandler, RecieveSingleFile, RecieveZIPData, RequestSpriteSheetAsBytes, SelectionChanged, ToggleSelectionChange } from './types'
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
  console.log("Timeline Duration of SpriteSheet is: ", timeLineDuration);
  const rawSprite = animationDetails.sprite;

  const noOfFrames = Math.round(timeLineDuration * spritesheetSettings.framesPerSecond);
  rawSprite.locked = true;
  rawSprite.visible = false;
  // So its not on Users figma ui screen 
  // spriteCopy.locked = true;
  // spriteCopy.visible = false;
  //spriteCopy.remove();

  for (let i = 0; i < noOfFrames; i++) {
    const copy = rawSprite.clone();
    copy.visible = true;
    const time = timeLineDuration * (i / (noOfFrames - 1));
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
  spriteCopy.remove();

  const files: Record<string, Uint8Array> = {};

  if (spriteSheetSettings.exportType === ExportTypes.SVG) {
    const string = await spriteSheet.exportAsync({ format: spriteSheetSettings.exportType });
    emit<RecieveSingleFile>('RECIEVE_SINGLE_FILE', "spriteSheet", strToU8(string), spriteSheetSettings.exportType);
    //files[`${spriteSheet.name}.svg`] = strToU8(string);
  } else {
    const bytes = await spriteSheet.exportAsync({
      format: spriteSheetSettings.exportType,
      constraint: {
        type: 'SCALE',
        value: spriteSheetSettings.scale
      }
    });
    //const ext = spriteSheetSettings.exportType === ExportTypes.JPG ? 'jpg' : 'png';
    emit<RecieveSingleFile>('RECIEVE_SINGLE_FILE', "spriteSheet", bytes, spriteSheetSettings.exportType);
    //files[`${spriteSheet.name}.${ext}`] = bytes;
  }  

  // idk why we would zip it
  // const allFiles = zipSync(files);
  // emit<RecieveZIPData>('RECIEVE_ZIP_DATA', 'sprite-sheet.zip', allFiles);
}
// Deals with Selection via Frame vs Selection of Group Of Nodes inside a Frame
async function copySelectionIntoNewFrame(nodeIds: SceneNodeInfo[], selectionType?: string) : Promise<FrameNode|null> {

  // for now fix this later as in if one selected it must be the main frame?
  // multiple selected means 

  // Change this condition to selectionTtype later 
  if (nodeIds.length === 1) {
    var part : BaseNode | null  = await figma.getNodeByIdAsync(nodeIds[0].id) as SceneNode;
    if ("children" in part) {
      var newNodeIds : SceneNodeInfo[] = [];
      for (var child of part.children) {
        newNodeIds.push({
          name: child.name, 
          id: child.id,
        });
      }
      nodeIds = newNodeIds;
    }
  }

  // from now on, parent shouldn't be the PAGE
  var part : BaseNode | null  = await figma.getNodeByIdAsync(nodeIds[0].id) as SceneNode;
  if (part === null) return null;

  var parent : BaseNode | null = part.parent;
  
  const frame = figma.createFrame();
  
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
  }
  
  // Copy bg and timeline duration 
  applyBackgroundAndTimelineSettings(animationCopy, part);

  return animationCopy;
}

function applyBackgroundAndTimelineSettings(animationCopy: FrameNode, part: SceneNode) {
  animationCopy.fills = [];
  if (part.timelines[0].duration) {
    const [timeline] = animationCopy.timelines
    if (timeline && 'setTimelineDuration' in animationCopy) {
      animationCopy.setTimelineDuration(timeline.id, part.timelines[0].duration);
    }
  }
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
