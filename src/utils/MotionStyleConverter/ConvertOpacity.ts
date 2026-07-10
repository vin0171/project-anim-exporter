import { OpacityPreset } from "../../interfaces/figmaInterface";
import { findEasingFunction } from "../InterpolationUtils";
import { undefinedPropWarning } from "../UndefinedPropWarning";
import { StyleAdditions } from "./StyleAdditions";

export function convertOpacity(style: AppliedAnimationStyle, styleAddition: StyleAdditions, time: number) {
  const anim = style.props as OpacityPreset['props'];
  undefinedPropWarning(anim, 'OpacityPreset');
  
  if (style.duration == null || style.duration <= 0) {
    return;
  }
  // these animatiuon styles have a delay so, the offset is already applied for all 
  // times < delay
  if (time <= anim.delay) time = anim.delay;
  
  //delay is start time, so time does not fall with anim style
  if (time > (style.duration + anim.delay)) {
    return;
  }
  // console.log(figma.motion.figmaAnimationStyles());
  const easingFunction = findEasingFunction(anim.easing);
  const t = (time - anim.delay) / style.duration;
  const easedT = easingFunction(t);

  switch (anim.type) {
    case "fadeIn":
    case "fadeOut": {
      const offset = anim.type === "fadeIn" ? anim.amount * (1 - easedT) : anim.amount * easedT;
      styleAddition.opacityMultiplier *= offset;
      break;
    }

    case "custom": {
      var op = anim.startFrame + (anim.endFrame - anim.startFrame) * easedT 
      styleAddition.opacityMultiplier *= (op / 100);
      break;
    }
  }

}