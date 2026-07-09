import { isAnimationStyleName, AnimationStyleName } from "./AnimationStyle";
import { convertOpacity } from "./MotionStyleConverter/ConvertOpacity";
import { convertPosition } from "./MotionStyleConverter/ConvertPosition";
import { convertRotation } from "./MotionStyleConverter/ConvertRotation";
import { convertScale } from "./MotionStyleConverter/ConvertScale";
import { convertSize } from "./MotionStyleConverter/ConvertSize";
import { StyleAdditions } from "./MotionStyleConverter/StyleAdditions";

export const animationHandlers: Record<AnimationStyleName, AnimationStyleHandler> = {
  'motion.preset_name.position': convertPosition,
  'motion.preset_name.opacity': convertOpacity,
  'motion.preset_name.scale': convertScale,
  'motion.preset_name.rotation': convertRotation,
  'motion.preset_name.size': convertSize,
};


type AnimationStyleHandler = (style: AppliedAnimationStyle, styleAddition: StyleAdditions, time: number) => void


export function calculateAdditionalValues(animationStyles: AppliedAnimationStyle[], time: number) : StyleAdditions {
  var styleAddition : StyleAdditions = {
    positionOffset: { x: 0, y: 0 },
    rotationOffset: 0,
    scaleFactor: { x: 1, y: 1},
    opacityMultiplier: 1,
  }

  for (var animationStyle of animationStyles) {
    if (isAnimationStyleName(animationStyle.name)) {
      const style: AnimationStyleName = animationStyle.name;
      const handler = animationHandlers[style];
      handler(animationStyle, styleAddition, time);
    } else {
      console.warn('name: ' + animationStyle.name + ' with styleId: ' + animationStyle.styleId + ' is either a new type or has been unimplemeneted');
    }
  }

  return styleAddition;
}


