// In case we need to use more property names
const ALL_KEYFRAME_PROPERTY_NAMES_MAP: Record<KeyframePropertyFieldName, true> = {
  CORNER_RADIUS: true,
  STROKE_WEIGHT: true,
  STACK_SPACING: true,
  STACK_PADDING_LEFT: true,
  STACK_PADDING_TOP: true,
  STACK_PADDING_RIGHT: true,
  STACK_PADDING_BOTTOM: true,
  WIDTH: true,
  HEIGHT: true,
  RECTANGLE_TOP_LEFT_CORNER_RADIUS: true,
  RECTANGLE_TOP_RIGHT_CORNER_RADIUS: true,
  RECTANGLE_BOTTOM_LEFT_CORNER_RADIUS: true,
  RECTANGLE_BOTTOM_RIGHT_CORNER_RADIUS: true,
  BORDER_TOP_WEIGHT: true,
  BORDER_BOTTOM_WEIGHT: true,
  BORDER_LEFT_WEIGHT: true,
  BORDER_RIGHT_WEIGHT: true,
  STACK_COUNTER_SPACING: true,
  OPACITY: true,
  GRID_ROW_GAP: true,
  GRID_COLUMN_GAP: true,
  TRANSLATION_X: true,
  TRANSLATION_Y: true,
  TRANSLATION_XY: true,
  ROTATION: true,
  SCALE_X: true,
  SCALE_Y: true,
  SCALE_XY: true,
  PATH_TRIM_START: true,
  PATH_TRIM_END: true
};


// Since we are cloning the frame it will include the animations
// so we are just going to delete them 
export function ResetAnimations(spriteData: FrameNode) {

  // So theres two forms of animation the manual key frames and the aniamtions styles (preset animation blocks)
  const allAnimationParts = spriteData.findAll(c => Object.keys(c.animations).length > 0);
  const allAnimationStyles = spriteData.findAll(c => Object.keys(c.animationStyles).length > 0);

  // Rename all parts for use later. Could use UID
  allAnimationParts.forEach((part, i) => {
    part.name = "AnimaTionPart_#%721" + String(i);
  });

  var timelineDuration = 0;
  
  const originalAnimationPart = allAnimationParts.map(n => ({
    animationPart: {
      node: n,
      name: n.name,
      rotation: 'rotation' in n ? n.rotation ?? 0 : 0,
      x: n.x,
      y: n.y,
      height: n.height,
      width: n.width,
    },
    tracks: JSON.parse(JSON.stringify(n.manualKeyframeTracks)) as Record<KeyframePropertyFieldName, ManualKeyframeTrackInput>
    //animationStyle: 
  }));

  for (const animationPart of allAnimationParts) {
    timelineDuration = animationPart.timelines[0].duration;
    const ALL_KEYFRAME_PROPERTY_NAMES = Object.keys(ALL_KEYFRAME_PROPERTY_NAMES_MAP) as KeyframePropertyFieldName[];

    for (const name of ALL_KEYFRAME_PROPERTY_NAMES) {
      // Each new sprite in our spriteSheet created does not need animations
      animationPart.removeManualKeyframeTrack({type: 'PROPERTY', name});
    }
  }

  const sprite = spriteData.clone();

  for (const { animationPart, tracks } of originalAnimationPart) {
    for (const [key, value] of Object.entries(tracks)) {
      const typedKey = key as KeyframePropertyFieldName;
      const typedValue = value as ManualKeyframeTrackInput;
      animationPart.node.applyManualKeyframeTrack({type: 'PROPERTY', name: typedKey }, typedValue);
    }
  }

  return { sprite, timelineDuration, originalAnimationPart };
}