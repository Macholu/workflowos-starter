import type { CommandRenderer } from './types';
import { extractIntent } from './types';

export const renderPromptpack: CommandRenderer = (context) => {
  const scene = extractIntent(context.rawInput, 'promptpack', 'Night Runner urban pursuit sequence');

  const constants = [
    'CHARACTER: {{character_name}}, wardrobe={{wardrobe_constant}}, props={{props_constant}}',
    'LOOK: IMAX realism, 65mm style, high dynamic range, cinematic contrast',
    'LIGHTING: sodium vapor practicals + cool edge fill, wet asphalt reflections',
    'GRADE: teal shadows, amber highlights, controlled skin neutrality',
    'TEXTURE: pore detail, fabric weave, metallic micro-scratches, natural motion blur'
  ];

  return {
    bestNextStep: 'Run WIDE first to establish geography, then MEDIUM for action continuity, then CLOSE for emotional beat.',
    plan: [
      'Lock constants for character, wardrobe, and props.',
      'Generate WIDE, MEDIUM, CLOSE prompts with shared constants.',
      'Apply negatives to suppress anatomy and texture artifacts.',
      'Use iteration knobs based on failure mode after each render.'
    ],
    deliverables: [
      `Scene Seed: ${scene}`,
      `WIDE: ${constants.join(' | ')} | LENS={{wide_lens_18_24mm}} DOF={{deep}} MOTION={{dolly_arc_slow}} | BLOCKING={{subject_left_third_chased_by_headlights}} | SCENE=${scene}`,
      `MEDIUM: ${constants.join(' | ')} | LENS={{medium_lens_35_50mm}} DOF={{moderate}} MOTION={{handheld_stabilized_follow}} | BLOCKING={{torso_up_stride_through_steam}} | SCENE=${scene}`,
      `CLOSE: ${constants.join(' | ')} | LENS={{close_lens_75_100mm}} DOF={{shallow_precise_eye_focus}} MOTION={{micro_push_in}} | BLOCKING={{eye_line_shift_then_resolve}} | SCENE=${scene}`,
      `NEGATIVES: ${context.promptPackage.negativePrompt}`,
      `ITERATION_KNOBS: ${context.promptPackage.iterationKnobs.join(' | ')}`
    ],
    qa: [
      'Confirmed WIDE, MEDIUM, CLOSE prompts present with shared constants.',
      'Negative prompts included for realism and anatomy control.',
      'Iteration knobs included for composition and texture correction.'
    ],
    nextActions: [
      'Render pass 1 with WIDE/MEDIUM/CLOSE set.',
      'Score output with /continuity checklist.',
      'Apply targeted knob updates and rerun.'
    ]
  };
};
