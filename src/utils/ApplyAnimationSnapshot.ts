import { lerpAngle, lerpScalar, lerpVector } from "./InterpolationUtils";



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
}[], time: number)
{
  for (const detail of animationDetails) {
    const match = copy.findOne(node => node.name === detail.animationPart.name);
    if (match === null) continue;

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

    const theta = (rotationTrack?.baseValue && rotationTrack.baseValue.type === 'FLOAT')
      ? -sampleValue(rotationTrack, time, true) * Math.PI / 180
      : 0;

    const translation = (translationTrack?.baseValue && translationTrack.baseValue.type === 'VECTOR')
      ? sampleValue(translationTrack, time) as Vector
      : { x: 0, y: 0 };

    const scale = (scaleTrack?.baseValue && scaleTrack.baseValue.type === 'VECTOR')
      ? sampleValue(scaleTrack, time) as Vector
      : { x: 1, y: 1 };

    const opacity = (opacityTrack?.baseValue && opacityTrack.baseValue.type === 'FLOAT')
      ? sampleValue(opacityTrack, time) as number
      : 100;

    const hasRotation = rotationTrack?.baseValue?.type === 'FLOAT' && 'rotation' in match;
    const hasTranslation = translationTrack?.baseValue?.type === 'VECTOR';
    const hasScale = scaleTrack?.baseValue?.type === 'VECTOR';
    const hasOpacity = opacityTrack?.baseValue?.type === 'FLOAT';

    if (hasRotation || hasTranslation) {
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

      const scaleCx = cx * Math.abs(scale.x);
      const scaleCy = cy * Math.abs(scale.y);
 
      match.relativeTransform = [
        [m00, m01 , pivotX - (c_ * scaleCx - s_ * scaleCy )],
        [m10, m11 , pivotY - (s_ * scaleCx  + c_  * scaleCy )],
      ];

      // now we can resize with positive component!
      if ('resize' in match && typeof match.resize === 'function') {
        console.log(time, detail.animationPart.name, scale.y, scale.x, baseH, baseW);
        match.resize(baseW * Math.abs(scale.x), baseH * Math.abs(scale.y));
      }
    }
    
    if (hasOpacity && 'opacity' in match) {
      match.opacity = opacity;
    }
  }
}


// Can Only Sample Two Types as of Now: Float and Vector
function sampleValue(keyFramesAll: ManualKeyframeTrackInput, time: number, angular = false): any {
  const { baseValue } = keyFramesAll;
  const keyframes = [...(keyFramesAll.keyframes ?? [])].sort(
    (a, b) => a.timelinePosition - b.timelinePosition
  );

  if (baseValue === undefined) {
    console.log('This has no basevalue somehow');
    return;
  }

  if (!keyframes || keyframes.length === 0) {
    return baseValue.value;
  }

  if (time <= keyframes[0].timelinePosition) return keyframes[0].value.value;
  if (time >= keyframes[keyframes.length - 1].timelinePosition) {
    return keyframes[keyframes.length - 1].value.value;
  }
  const type = baseValue.type;

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (time >= keyframes[i].timelinePosition && time <= keyframes[i + 1].timelinePosition) {
      if (type === 'VECTOR') {
        return lerpVector(keyframes[i], keyframes[i + 1], time);
      } else if (type === 'FLOAT') {
        return angular
          ? lerpAngle(keyframes[i], keyframes[i + 1], time)
          : lerpScalar(keyframes[i], keyframes[i + 1], time);
      } else {
        console.log(type + ' This Type is not supported by this plugin');
      }
    }
  }

  return keyframes[keyframes.length - 1].value.value;
}

