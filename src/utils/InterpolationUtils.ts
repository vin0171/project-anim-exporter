import bezier from "bezier-easing";

export function findInterpValue(kfA: ManualKeyframeInput, kfB: ManualKeyframeInput, time: number): number {
  const { x1, y1, x2, y2 } = (kfA.easing as MotionEasing).easingFunctionCubicBezier ?? { x1: 0, y1: 0, x2: 1, y2: 1 };

  const span = kfB.timelinePosition - kfA.timelinePosition;
  const xIn = span === 0 ? 0 : (time - kfA.timelinePosition) / span;

  var easingFunction = bezier(x1, y1, x2, y2);
  const easedT = kfA.easing?.type === 'LINEAR' ? xIn : easingFunction(xIn);
  return easedT;
}

export function findEasingFunction(motionEasing: MotionEasing) {
  const { x1, y1, x2, y2 } = motionEasing.easingFunctionCubicBezier ?? { x1: 0, y1: 0, x2: 1, y2: 1 };
  return bezier(x1, y1, x2, y2);
}

// Keyframe A, Keyframe B
export function lerpScalar(kfA: ManualKeyframeInput, kfB: ManualKeyframeInput, time: number): number {
  const easedT = findInterpValue(kfA, kfB, time);

  if (kfA.value.type === 'FLOAT' && kfB.value.type == 'FLOAT') {
    return kfA.value.value + (kfB.value.value - kfA.value.value) * easedT;
  }
  throw new Error('Incorrect Type' + kfA.value.type + ", " + kfB.value.type + " needed FLOAT");
}

export function lerpAngle(kfA: ManualKeyframeInput, kfB: ManualKeyframeInput, time: number): number {
  const easedT = findInterpValue(kfA, kfB, time);

  if (kfA.value.type === 'FLOAT' && kfB.value.type === 'FLOAT') {
    const a = kfA.value.value;
    const b = kfB.value.value;
    // Angles in figma can go from -360 to 360 
    // Also to note thta figma has counter-clockwise positive rotation
    let delta = (b - a) % 360;
    delta = ((delta + 540) % 360) - 180;
    return a + delta * easedT;
  }
  throw new Error('Incorrect type' + kfA.value.type + ", " + kfB.value.type + " needed FLOAT");
}

export function lerpVector(kfA: ManualKeyframeInput, kfB: ManualKeyframeInput, time: number): Vector {
  const easedT = findInterpValue(kfA, kfB, time);

  if (kfA.value.type === "VECTOR" && kfB.value.type === "VECTOR") {
    const a = kfA.value.value;
    const b = kfB.value.value;
    return { x: a.x + (b.x - a.x) * easedT, y: a.y + (b.y - a.y) * easedT };
  }

  throw new Error("Incorrect type" + kfA.value.type + ", " + kfB.value.type + " needed VECTOR");
}

// Can Only Sample Two Types as of Now: Float and Vector
export function sampleValue(keyFramesAll: ManualKeyframeTrackInput, time: number, angular = false): any {
  const { baseValue } = keyFramesAll;
  const keyframes : ManualKeyframeInput[] = [...(keyFramesAll.keyframes ?? [])].sort(
    (a, b) => a.timelinePosition - b.timelinePosition
  );

  if (baseValue === undefined) {
    console.warn('This has no basevalue somehow');
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
        console.warn(type + ' This Type is not supported by this plugin');
      }
    }
  }

  return keyframes[keyframes.length - 1].value.value;
}

