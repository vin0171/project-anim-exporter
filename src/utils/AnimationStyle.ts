
export function isAnimationStyleName(value: string): value is AnimationStyleName {
  return (
    value === 'motion.preset_name.position' ||
    value === 'motion.preset_name.opacity' ||
    value === 'motion.preset_name.scale' ||
    value === 'motion.preset_name.rotation' ||
    value === 'motion.preset_name.size'
  );
}

export type AnimationStyleName = 
'motion.preset_name.position' | 
'motion.preset_name.opacity' |
'motion.preset_name.scale' |
'motion.preset_name.rotation' |
'motion.preset_name.size'
;


export const animationStyleNamesMap: Record<AnimationStyleName, string> = {
  'motion.preset_name.position': 'Position',
  'motion.preset_name.opacity': 'Opacity',
  'motion.preset_name.scale': 'Scale',
  'motion.preset_name.rotation': 'Rotation',
  'motion.preset_name.size': 'Size',
};

