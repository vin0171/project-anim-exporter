import { RotationPreset } from "../../interfaces/figmaInterface";
import { undefinedPropWarning } from "../UndefinedPropWarning";
import { StyleAdditions } from "./StyleAdditions";

export function convertRotation(style: AppliedAnimationStyle, styleAddition: StyleAdditions, time: number) {
  const anim = style.props as RotationPreset['props'];
  undefinedPropWarning(anim, 'RotationPreset');
  
  if (anim === null) return;
  

  return;
}