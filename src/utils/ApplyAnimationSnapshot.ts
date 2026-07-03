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

    const hasRotation = rotationTrack?.baseValue?.type === 'FLOAT' && 'rotation' in match;
    const hasTranslation = translationTrack?.baseValue?.type === 'VECTOR';
    const hasScale = scaleTrack?.baseValue?.type === 'VECTOR';

    if (hasRotation || hasTranslation || hasScale) {
      const c_ = Math.cos(theta);
      const s_ = Math.sin(theta);
      const sx = scale.x;
      const sy = scale.y;

      const pivotX = baseX + cx + translation.x;
      const pivotY = baseY + cy + translation.y;

      match.relativeTransform = [
        [c_ * sx, -s_ * sy, pivotX - (c_ * sx * cx - s_ * sy * cy)],
        [s_ * sx,  c_ * sy, pivotY - (s_ * sx * cx + c_ * sy * cy)],
      ];
    }

    if (hasScale && 'resize' in match && typeof (match as any).resize === 'function') {
      match.resize(baseW * scale.x, baseH * scale.y);
    } else if (scaleTrack && !('resize' in match)) {
      console.log('This Node cannot be resized');
      return;
    }

    if (opacityTrack && 'opacity' in match) {
      match.opacity = sampleValue(opacityTrack, time);
    }
  }
}

// Can Only Sample Two Types as of Now: Float and Vector
function sampleValue(keyFramesAll: ManualKeyframeTrackInput, time: number, angular = false): any {
  const { keyframes, baseValue } = keyFramesAll;

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

