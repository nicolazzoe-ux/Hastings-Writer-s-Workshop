import {
  ClassroomState,
  StepColorKey,
  StickerId,
  WritingProject,
  WritingStep,
} from '../types/writing';

export const STEP_IMAGE_MAP: Record<string, string> = {
  brainstorming: '/src/assets/images/clipart_brainstorming_1794949580665.jpg',
  drafting: '/src/assets/images/clipart_drafting_1794949580888.jpg',
  revising: '/src/assets/images/clipart_revising_1794949581651.jpg',
  editing: '/src/assets/images/clipart_editing_1794949581905.jpg',
  typing: '/src/assets/images/clipart_typing_1794949582120.jpg',
  illustrations: '/src/assets/images/clipart_illustrations_1794949582258.jpg',
  'about-author': '/src/assets/images/clipart_about_author_1794949583264.jpg',
  published: '/src/assets/images/clipart_published_1794949583070.jpg',
  'writing-folder': '/src/assets/images/clipart_writing_folder_1794949583556.jpg',
};

export const WORKSHOP_BANNER_IMAGE =
  '/src/assets/images/banner_writing_workshop_1794949584625.jpg';

export interface StepThemeClasses {
  headerBg: string;
  headerText: string;
  topAccent: string;
  softBg: string;
  border: string;
  badgeText: string;
  barFill: string;
  ringFocus: string;
}

export const STEP_COLOR_THEMES: Record<StepColorKey, StepThemeClasses> = {
  amber: {
    headerBg: 'bg-amber-50',
    headerText: 'text-amber-900',
    topAccent: 'bg-amber-400',
    softBg: 'bg-amber-50/70',
    border: 'border-amber-200',
    badgeText: 'text-amber-700',
    barFill: 'bg-amber-500',
    ringFocus: 'focus-visible:ring-amber-500',
  },
  orange: {
    headerBg: 'bg-orange-50',
    headerText: 'text-orange-900',
    topAccent: 'bg-orange-400',
    softBg: 'bg-orange-50/70',
    border: 'border-orange-200',
    badgeText: 'text-orange-700',
    barFill: 'bg-orange-500',
    ringFocus: 'focus-visible:ring-orange-500',
  },
  emerald: {
    headerBg: 'bg-emerald-50',
    headerText: 'text-emerald-900',
    topAccent: 'bg-emerald-500',
    softBg: 'bg-emerald-50/70',
    border: 'border-emerald-200',
    badgeText: 'text-emerald-700',
    barFill: 'bg-emerald-600',
    ringFocus: 'focus-visible:ring-emerald-500',
  },
  rose: {
    headerBg: 'bg-rose-50',
    headerText: 'text-rose-900',
    topAccent: 'bg-rose-500',
    softBg: 'bg-rose-50/70',
    border: 'border-rose-200',
    badgeText: 'text-rose-700',
    barFill: 'bg-rose-600',
    ringFocus: 'focus-visible:ring-rose-500',
  },
  teal: {
    headerBg: 'bg-teal-50',
    headerText: 'text-teal-900',
    topAccent: 'bg-teal-500',
    softBg: 'bg-teal-50/70',
    border: 'border-teal-200',
    badgeText: 'text-teal-700',
    barFill: 'bg-teal-600',
    ringFocus: 'focus-visible:ring-teal-500',
  },
  violet: {
    headerBg: 'bg-violet-50',
    headerText: 'text-violet-900',
    topAccent: 'bg-violet-500',
    softBg: 'bg-violet-50/70',
    border: 'border-violet-200',
    badgeText: 'text-violet-700',
    barFill: 'bg-violet-600',
    ringFocus: 'focus-visible:ring-violet-500',
  },
  pink: {
    headerBg: 'bg-pink-50',
    headerText: 'text-pink-900',
    topAccent: 'bg-pink-500',
    softBg: 'bg-pink-50/70',
    border: 'border-pink-200',
    badgeText: 'text-pink-700',
    barFill: 'bg-pink-600',
    ringFocus: 'focus-visible:ring-pink-500',
  },
  indigo: {
    headerBg: 'bg-indigo-50',
    headerText: 'text-indigo-900',
    topAccent: 'bg-indigo-500',
    softBg: 'bg-indigo-50/70',
    border: 'border-indigo-200',
    badgeText: 'text-indigo-700',
    barFill: 'bg-indigo-600',
    ringFocus: 'focus-visible:ring-indigo-500',
  },
  sky: {
    headerBg: 'bg-sky-50',
    headerText: 'text-sky-900',
    topAccent: 'bg-sky-500',
    softBg: 'bg-sky-50/70',
    border: 'border-sky-200',
    badgeText: 'text-sky-700',
    barFill: 'bg-sky-600',
    ringFocus: 'focus-visible:ring-sky-500',
  },
};

export function createDefaultSteps(enabledIds?: string[]): WritingStep[] {
  const allSteps: WritingStep[] = [
    {
      id: 'brainstorming',
      label: 'Brainstorming',
      shortLabel: 'Brainstorm',
      ellCue: 'Think & draw ideas',
      ellChecklist: 'Make a web, list, or sketch of your story ideas.',
      imageUrl: STEP_IMAGE_MAP.brainstorming,
      iconKey: 'lightbulb',
      colorKey: 'amber',
      enabled: true,
    },
    {
      id: 'drafting',
      label: 'Drafting',
      shortLabel: 'Draft',
      ellCue: 'Write your story',
      ellChecklist: 'Put your ideas into sentences on lined paper.',
      imageUrl: STEP_IMAGE_MAP.drafting,
      iconKey: 'pencil',
      colorKey: 'orange',
      enabled: true,
    },
    {
      id: 'revising',
      label: 'Revising',
      shortLabel: 'Revise',
      ellCue: 'Make ideas better',
      ellChecklist: 'Add juicy details, strong words, and clear order.',
      imageUrl: STEP_IMAGE_MAP.revising,
      iconKey: 'search',
      colorKey: 'emerald',
      enabled: true,
    },
    {
      id: 'editing',
      label: 'Editing',
      shortLabel: 'Edit',
      ellCue: 'Fix capitals & periods',
      ellChecklist: 'Check capitals, punctuation, spacing, and spelling.',
      imageUrl: STEP_IMAGE_MAP.editing,
      iconKey: 'check-circle',
      colorKey: 'rose',
      enabled: true,
    },
    {
      id: 'typing',
      label: 'Typing',
      shortLabel: 'Type',
      ellCue: 'Type on computer',
      ellChecklist: 'Type your neat final story on your Chromebook.',
      imageUrl: STEP_IMAGE_MAP.typing,
      iconKey: 'laptop',
      colorKey: 'teal',
      enabled: true,
    },
    {
      id: 'illustrations',
      label: 'Creating Illustrations & Artwork',
      shortLabel: 'Artwork',
      ellCue: 'Draw & color pictures',
      ellChecklist: 'Create bright drawings that match your words.',
      imageUrl: STEP_IMAGE_MAP.illustrations,
      iconKey: 'palette',
      colorKey: 'violet',
      enabled: true,
    },
    {
      id: 'about-author',
      label: 'About the Author',
      shortLabel: 'About Author',
      ellCue: 'Write about you!',
      ellChecklist: 'Share 3 fun facts about yourself and a self-portrait.',
      imageUrl: STEP_IMAGE_MAP['about-author'],
      iconKey: 'user-round',
      colorKey: 'pink',
      enabled: true,
    },
    {
      id: 'published',
      label: 'Fully Published',
      shortLabel: 'Published',
      ellCue: 'Book is finished!',
      ellChecklist: 'Your finished piece is ready to share with our class.',
      imageUrl: STEP_IMAGE_MAP.published,
      iconKey: 'book-open-check',
      colorKey: 'indigo',
      enabled: true,
    },
    {
      id: 'writing-folder',
      label: 'Organized in Writing Folder',
      shortLabel: 'Writing Folder',
      ellCue: 'Put all papers in folder',
      ellChecklist: 'File drafts, plans, and final pages neatly in your folder.',
      imageUrl: STEP_IMAGE_MAP['writing-folder'],
      iconKey: 'folder-check',
      colorKey: 'sky',
      enabled: true,
    },
  ];

  if (!enabledIds) {
    return allSteps;
  }

  return allSteps.map((step) => ({
    ...step,
    enabled: enabledIds.includes(step.id),
  }));
}

export interface ProjectPreset {
  id: string;
  name: string;
  description: string;
  stepOrderAndEnabled: string[];
}

export const PROJECT_PRESETS: ProjectPreset[] = [
  {
    id: 'full-book',
    name: 'Full Published Book (All 9 Steps)',
    description: 'Complete writer’s workshop journey from brainstorming through publishing and folder organization.',
    stepOrderAndEnabled: [
      'brainstorming',
      'drafting',
      'revising',
      'editing',
      'typing',
      'illustrations',
      'about-author',
      'published',
      'writing-folder',
    ],
  },
  {
    id: 'quick-story',
    name: 'Quick Story / Paragraph',
    description: 'Focused 5-step process for shorter weekly writing pieces.',
    stepOrderAndEnabled: [
      'brainstorming',
      'drafting',
      'revising',
      'editing',
      'writing-folder',
    ],
  },
  {
    id: 'typed-essay',
    name: 'Typed Opinion or Info Essay',
    description: 'Skip hand-drawn pages and move straight from editing to typing and publishing.',
    stepOrderAndEnabled: [
      'brainstorming',
      'drafting',
      'revising',
      'editing',
      'typing',
      'published',
      'writing-folder',
    ],
  },
  {
    id: 'picture-book',
    name: 'Illustrated Picture Book',
    description: 'Hand-written storybook highlighting artwork and About the Author.',
    stepOrderAndEnabled: [
      'brainstorming',
      'drafting',
      'revising',
      'editing',
      'illustrations',
      'about-author',
      'published',
      'writing-folder',
    ],
  },
];

export const STICKER_OPTIONS: { id: StickerId; label: string; bg: string; text: string }[] = [
  { id: 'star', label: 'Star', bg: 'bg-amber-100', text: 'text-amber-700' },
  { id: 'sun', label: 'Sun', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  { id: 'rocket', label: 'Rocket', bg: 'bg-sky-100', text: 'text-sky-700' },
  { id: 'heart', label: 'Heart', bg: 'bg-rose-100', text: 'text-rose-700' },
  { id: 'flower', label: 'Flower', bg: 'bg-pink-100', text: 'text-pink-700' },
  { id: 'leaf', label: 'Leaf', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { id: 'fish', label: 'Fish', bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { id: 'bird', label: 'Bird', bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { id: 'cat', label: 'Cat', bg: 'bg-orange-100', text: 'text-orange-700' },
  { id: 'crown', label: 'Crown', bg: 'bg-violet-100', text: 'text-violet-700' },
  { id: 'music', label: 'Music', bg: 'bg-teal-100', text: 'text-teal-700' },
  { id: 'umbrella', label: 'Umbrella', bg: 'bg-blue-100', text: 'text-blue-700' },
];

export function createInitialClassroomState(): ClassroomState {
  const now = new Date().toISOString();
  const sampleStudents = [
    { id: 'stu-1', name: 'Maya L.', sticker: 'star' as StickerId },
    { id: 'stu-2', name: 'Mateo R.', sticker: 'rocket' as StickerId },
    { id: 'stu-3', name: 'Aisha K.', sticker: 'flower' as StickerId },
    { id: 'stu-4', name: 'Leo T.', sticker: 'sun' as StickerId },
    { id: 'stu-5', name: 'Sofia M.', sticker: 'bird' as StickerId },
    { id: 'stu-6', name: 'Noah P.', sticker: 'fish' as StickerId },
    { id: 'stu-7', name: 'Priya S.', sticker: 'crown' as StickerId },
    { id: 'stu-8', name: 'Ethan W.', sticker: 'leaf' as StickerId },
    { id: 'stu-9', name: 'Chloe B.', sticker: 'heart' as StickerId },
    { id: 'stu-10', name: 'Omar H.', sticker: 'cat' as StickerId },
    { id: 'stu-11', name: 'Mia C.', sticker: 'music' as StickerId },
    { id: 'stu-12', name: 'Lucas D.', sticker: 'umbrella' as StickerId },
  ];

  const narrativeSteps = createDefaultSteps();
  const narrativeProgress: WritingProject['progressByStudentId'] = {
    'stu-1': { stepId: 'published', needsConference: false, teacherNote: 'Ready for Author Chair!', folderOrganized: true, updatedAt: now },
    'stu-2': { stepId: 'typing', needsConference: false, teacherNote: '', folderOrganized: false, updatedAt: now },
    'stu-3': { stepId: 'revising', needsConference: true, teacherNote: 'Add sensory details to middle', folderOrganized: false, updatedAt: now },
    'stu-4': { stepId: 'drafting', needsConference: false, teacherNote: '', folderOrganized: false, updatedAt: now },
    'stu-5': { stepId: 'illustrations', needsConference: false, teacherNote: 'Cover art looks great', folderOrganized: false, updatedAt: now },
    'stu-6': { stepId: 'brainstorming', needsConference: false, teacherNote: 'Using story map graphic organizer', folderOrganized: false, updatedAt: now },
    'stu-7': { stepId: 'writing-folder', needsConference: false, teacherNote: 'All pages filed neatly', folderOrganized: true, updatedAt: now },
    'stu-8': { stepId: 'editing', needsConference: true, teacherNote: 'Check end punctuation', folderOrganized: false, updatedAt: now },
    'stu-9': { stepId: 'about-author', needsConference: false, teacherNote: '', folderOrganized: false, updatedAt: now },
    'stu-10': { stepId: 'drafting', needsConference: false, teacherNote: '', folderOrganized: false, updatedAt: now },
    'stu-11': { stepId: 'revising', needsConference: false, teacherNote: '', folderOrganized: false, updatedAt: now },
    'stu-12': { stepId: 'typing', needsConference: false, teacherNote: '', folderOrganized: false, updatedAt: now },
  };

  const opinionSteps = createDefaultSteps([
    'brainstorming',
    'drafting',
    'revising',
    'editing',
    'typing',
    'published',
    'writing-folder',
  ]);
  const opinionProgress: WritingProject['progressByStudentId'] = {};
  sampleStudents.forEach((student, idx) => {
    const enabled = opinionSteps.filter((s) => s.enabled);
    const chosen = enabled[idx % enabled.length];
    opinionProgress[student.id] = {
      stepId: chosen.id,
      needsConference: idx === 2,
      teacherNote: '',
      folderOrganized: chosen.id === 'writing-folder',
      updatedAt: now,
    };
  });

  return {
    classroomName: 'Grade 3 · Room 12',
    schoolYear: '2026–2027',
    teacherName: 'Ms. Rivera',
    students: sampleStudents,
    projects: [
      {
        id: 'proj-narrative',
        title: 'Personal Narrative: A Special Memory',
        unitLabel: 'Unit 1 · Narrative Writing',
        steps: narrativeSteps,
        progressByStudentId: narrativeProgress,
        createdAt: now,
      },
      {
        id: 'proj-opinion',
        title: 'Opinion Essay: Best Classroom Pet',
        unitLabel: 'Unit 2 · Opinion Writing',
        steps: opinionSteps,
        progressByStudentId: opinionProgress,
        createdAt: now,
      },
    ],
    activeProjectId: 'proj-narrative',
    studentSafeMode: false,
    showEllGuides: true,
  };
}
