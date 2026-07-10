import { calculateAdditionalValues } from "./CalculateAdditionalValuesFromStyleData";
import { sampleValue } from "./InterpolationUtils";

export function applyAnimationSnapshot(copy: FrameNode, animationDetails: {
  animationPart: {
    node: SceneNode,
    name: string,
    x: number,
    y: number,
    rotation: number,
    width: number, 
    height: number
  };
  tracks: Record<KeyframePropertyFieldName, ManualKeyframeTrackInput>;
  animationStyles: AppliedAnimationStyle[];
}[], time: number)
{
  for (const detail of animationDetails) {
    const match = copy.findOne(node => node.name === detail.animationPart.name);
    if (match === null) continue;

    const customAnimationStyleData = calculateAdditionalValues(detail.animationStyles, time);

    // we can't access the raw rotation value, as thats for top left pivot 
    // (see rotation documentaiton)
    // so can need to calcualte from the center instead 
    const baseX = detail.animationPart.x;
    const baseY = detail.animationPart.y;
    const baseW = detail.animationPart.width;
    const baseH = detail.animationPart.height;
    const cx = baseW / 2;
    const cy = baseH / 2;

    const rotationTrack = detail.tracks["ROTATION"]; 
    // I'd assume (after testing) that you cant have transaltionXY with translationX and translatinY
    // so cannot co-exist
    const translationTrack = detail.tracks["TRANSLATION_XY"];
    const scaleTrack = detail.tracks["SCALE_XY"];
    const opacityTrack = detail.tracks["OPACITY"];

    // hieght and width should be applied to scale zzzz
    //const heightTrack = detail.tracks["HEIGHT"];
    
    var theta = (rotationTrack?.baseValue && rotationTrack.baseValue.type === 'FLOAT')
      ? -sampleValue(rotationTrack, time, true) * Math.PI / 180
      : 0;

    var translation = (translationTrack?.baseValue && translationTrack.baseValue.type === 'VECTOR')
      ? sampleValue(translationTrack, time)
      : { x: 0, y: 0 };

    var scale = (scaleTrack?.baseValue && scaleTrack.baseValue.type === 'VECTOR')
      ? sampleValue(scaleTrack, time) 
      : { x: 1, y: 1 };

    var opacity = (opacityTrack?.baseValue && opacityTrack.baseValue.type === 'FLOAT')
      ? sampleValue(opacityTrack, time) as number
      : 100;        

    // Apply offsets
    translation.x += customAnimationStyleData.positionOffset.x;
    translation.y += customAnimationStyleData.positionOffset.y;

    theta += customAnimationStyleData.rotationOffset;

    scale.x *= customAnimationStyleData.scaleFactor.x;
    scale.y *= customAnimationStyleData.scaleFactor.y;

    opacity *= customAnimationStyleData.opacityMultiplier;

    // Most of figmas mnaualKeyframes are done with
    // the pivot point as the centre
    const c_ = Math.cos(theta);
    const s_ = Math.sin(theta);

    const pivotX = baseX + cx + translation.x;
    const pivotY = baseY + cy + translation.y;

    //figma allows NEGATIVE SCALE so
    // and resize doesnt allow for negatvei width so we do
    // this instead to mimic the effect
    const flipX = scale.x < 0 ? -1 : 1;
    const flipY = scale.y < 0 ? -1 : 1;

    const m00 = c_ * flipX;
    const m10 = s_ * flipX;
    const m01 = -s_ * flipY;
    const m11 = c_ * flipY;

    // for correct pviot measurements after scale
    const scaledCx = cx * Math.abs(scale.x);
    const scaledCy = cy * Math.abs(scale.y);

    match.relativeTransform = [
      [m00, m01, pivotX - (m00 * scaledCx + m01 * scaledCy)],
      [m10, m11, pivotY - (m10 * scaledCx + m11 * scaledCy)],
    ];

    // now we can resize with positive component
    if ('resize' in match && typeof match.resize === 'function') {
      match.resize(baseW * Math.abs(scale.x), baseH * Math.abs(scale.y));
    }
  
    if ('opacity' in match) {
      match.opacity = opacity / 100;
    }
    
  }
}

