export type FigmaAnimationStylePreset =
  | PositionPreset
  | ScalePreset
  | RotationPreset
  | SizePreset
  | OpacityPreset
  | PathPreset;

interface PathPreset {
  styleId: "Path";
  name: "motion.preset_name.path";
  description: string;
  props: {
    type: "draw" | "erase" | "travel" | "custom";
    direction: "forward" | "reverse";
    axis: "pathTrimStart" | "pathTrimEnd" | "combined";
    segment: number;

    pathStartStartFrame: number;
    pathStartEndWithoutDivider: number;
    pathEndStartWithoutDivider: number;
    pathStartEndWithDivider: number;
    pathEndStartWithDivider: number;
    pathEndEndFrame: number;

    delay: number;
    duration: number;
    easing: Easing;
  };
}

interface OpacityPreset {
  styleId: "Opacity";
  name: "motion.preset_name.opacity";
  description: string;
  props: {
    type: "fadeIn" | "fadeOut" | "custom";
    amount: number;
    startFrame: number;
    endFrame: number;
    delay: number;
    duration: number;
    easing: Easing;
  };
}


interface SizePreset {
  styleId: "Size";
  name: "motion.preset_name.size";
  description: string;
  props: {
    type: "resize_in" | "resize_out" | "custom";
    amount: number;
    axis: "x" | "y" | "xy";
    startWidth: number;
    startHeight: number;
    endWidth: number;
    endHeight: number;
    delay: number;
    duration: number;
    easing: Easing;
  };
}


interface RotationPreset {
  styleId: "Rotation";
  name: "motion.preset_name.rotation";
  description: string;
  props: {
    type: "rotateIn" | "rotateOut" | "custom";
    direction: "clockwise" | "counterClockwise";
    amount: number;
    start: number;
    end: number;
    delay: number;
    duration: number;
    easing: Easing;
  };
}


interface ScalePreset {
  styleId: "Scale";
  name: "motion.preset_name.scale";
  description: string;
  props: {
    type: "scaleIn" | "scaleOut" | "custom";
    axis: "w" | "h" | "whCombined";
    amount: number;

    wStartWithDivider: number;
    wEndWithoutDivider: number;
    hStartWithoutDivider: number;
    wEndWithDivider: number;
    hStartWithDivider: number;
    hEndWithoutDivider: number;

    delay: number;
    duration: number;
    easing: Easing;
  };
}


interface PositionPreset {
  styleId: "Position";
  name: "motion.preset_name.position";
  description: string;
  props: {
    type: "slide_in" | "slide_out" | "custom";
    direction:
      | "left"
      | "right"
      | "top"
      | "bottom"
      | "top_left"
      | "top_right"
      | "bottom_left"
      | "bottom_right";
    distance: number;
    axis: "x" | "y" | "xy";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    delay: number;
    duration: number;
    easing: Easing;
  };
}