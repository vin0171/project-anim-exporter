import { PositionPreset } from "../../interfaces/figmaInterface";
import { findEasingFunction } from "../InterpolationUtils";
import { undefinedPropWarning } from "../UndefinedPropWarning";
import { StyleAdditions } from "./StyleAdditions";

export function convertPosition(style: AppliedAnimationStyle, styleAddition: StyleAdditions, time: number) {
  const anim = style.props as PositionPreset["props"];
  undefinedPropWarning(anim, 'PositionPreset');
  if (anim === null) return;

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

  const easingFunction = findEasingFunction(anim.easing);
  const t = (time - anim.delay) / style.duration;
  const easedT = easingFunction(t);

  switch (anim.type) {
    case "slide_in":
    case "slide_out": {
      const offset = anim.type === "slide_in" ? anim.distance * (1 - easedT) : anim.distance * easedT;
      const vectorOffset = calculateVectorOffset(offset, anim.direction);
      styleAddition.positionOffset.x += vectorOffset.x;
      styleAddition.positionOffset.y += vectorOffset.y;
      break;
    }

    case "custom": {
      if (anim.axis.includes("x")) {
        styleAddition.positionOffset.x += anim.startX + (anim.endX - anim.startX) * easedT;
      }

      if (anim.axis.includes("y")) {
        styleAddition.positionOffset.y += anim.startY + (anim.endY - anim.startY) * easedT;
      }

      break;
    }
  }
  return;
}


function calculateVectorOffset(valueOffset: number, direction: PositionPreset["props"]["direction"]) : { x: number, y: number} {
  const c = { x: 0, y: 0};
  if (direction === 'left') {
    c.x -= valueOffset;
  } else if (direction === 'right') {
    c.x += valueOffset;
  } else if (direction === 'bottom') {
    c.y += valueOffset;
  } else if (direction === 'top') {
    c.y -= valueOffset;
  } else if (direction === 'bottom_left') {
    const offset = valueOffset / Math.sqrt(2);
    c.x -= offset;
    c.y += offset;
  } else if (direction === 'bottom_right') {
    const offset = valueOffset / Math.sqrt(2);
    c.x += offset;
    c.y += offset;
  } else if (direction === 'top_left') {
    const offset = valueOffset / Math.sqrt(2);
    c.x -= offset;
    c.y -= offset;
  } else if (direction === 'top_right') {
    const offset = valueOffset / Math.sqrt(2);
    c.x += offset;
    c.y -= offset;
  }
  return c;
}
