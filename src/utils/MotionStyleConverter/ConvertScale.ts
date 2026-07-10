import { ScalePreset } from "../../interfaces/figmaInterface";
import { findEasingFunction } from "../InterpolationUtils";
import { undefinedPropWarning } from "../UndefinedPropWarning";
import { StyleAdditions } from "./StyleAdditions";

export function convertScale(style: AppliedAnimationStyle, styleAddition: StyleAdditions, time: number) {
  const anim = style.props as ScalePreset['props'];
  undefinedPropWarning(anim, 'ScalePreset');

  // wEndWithoutDivider  
  // w start with divider | use 
  // h endwithout divider | use
  if (anim.wEndWithDivider === anim.wEndWithoutDivider) {
    console.warn("wEndWith/Without is still the same");
  }

  if (anim.hStartWithDivider === anim.hStartWithoutDivider) {
    console.warn("hStartWith/Without is still the same")
  }

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
    case "scaleIn":
    case "scaleOut": {
      const factor = anim.type === "scaleIn" ? anim.amount * (1 - easedT) : anim.amount * easedT;
      styleAddition.scaleFactor.x *= (factor / 100);
      styleAddition.scaleFactor.y *= (factor / 100);
      break;
    }

    case "custom": {
      var wFactor = anim.wStartWithDivider + (anim.wEndWithDivider - anim.wStartWithDivider) * easedT;
      var hFactor = anim.hStartWithoutDivider + (anim.hEndWithoutDivider - anim.hStartWithoutDivider) * easedT;
      styleAddition.scaleFactor.x *= (wFactor / 100);
      styleAddition.scaleFactor.y *= (hFactor / 100);
      break;
    }
  }

  return;
}

