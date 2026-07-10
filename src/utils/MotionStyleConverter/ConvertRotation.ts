import { RotationPreset } from "../../interfaces/figmaInterface";
import { findEasingFunction } from "../InterpolationUtils";
import { undefinedPropWarning } from "../UndefinedPropWarning";
import { StyleAdditions } from "./StyleAdditions";

export function convertRotation(style: AppliedAnimationStyle, styleAddition: StyleAdditions, time: number) {
  const anim = style.props as RotationPreset['props'];
  undefinedPropWarning(anim, 'RotationPreset');
  //console.log(figma.)
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
  console.log("Applying Rotaiton Style");

  switch (anim.type) {
    case "rotateIn":
    case "rotateOut": {
      const offset = anim.type === "rotateIn" ? anim.amount * (1 - easedT) : anim.amount * easedT;
      styleAddition.rotationOffset += calculateWithDirectionToRad(offset, anim.direction);
      break;
    }

    case "custom": {
      var rot = anim.start + (anim.end - anim.start) * easedT 
      styleAddition.rotationOffset += calculateWithDirectionToRad(rot, anim.direction);
      break;
    }
  }

  return;
}


function calculateWithDirectionToRad(rot: number, direction: RotationPreset["props"]["direction"]): number {
  const radians = (rot * Math.PI) / 180;
  return direction === "clockwise" ? radians : -radians;
}