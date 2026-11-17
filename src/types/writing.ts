export type StepColorKey =
  | 'amber'
  | 'orange'
  | 'emerald'
  | 'rose'
  | 'teal'
  | 'violet'
  | 'pink'
  | 'indigo'
  | 'sky';

export type StepIconKey =
  | 'lightbulb'
  | 'pencil'
  | 'search'
  | 'check-circle'
  | 'laptop'
  | 'palette'
  | 'user-round'
  | 'book-open-check'
  | 'folder-check'
  | 'sparkles';

export type StickerId =
  | 'star'
  | 'sun'
  | 'rocket'
  | 'heart'
  | 'flower'
  | 'leaf'
  | 'fish'
  | 'bird'
  | 'cat'
  | 'crown'
  | 'music'
  | 'umbrella';

export interface WritingStep {
  id: string;
  label: string;
  shortLabel: string;
  ellCue: string;
  ellChecklist: string;
  imageUrl: string;
  iconKey: StepIconKey;
  colorKey: StepColorKey;
  enabled: boolean;
  isCustom?: boolean;
}

export interface Student {
  id: string;
  name: string;
  sticker: StickerId;
}

export interface StudentProgress {
  stepId: string;
  needsConference: boolean;
  teacherNote: string;
  folderOrganized: boolean;
  updatedAt: string;
}

export interface WritingProject {
  id: string;
  title: string;
  unitLabel: string;
  steps: WritingStep[];
  progressByStudentId: Record<string, StudentProgress>;
  createdAt: string;
}

export interface ClassroomState {
  classroomName: string;
  schoolYear: string;
  teacherName: string;
  students: Student[];
  projects: WritingProject[];
  activeProjectId: string;
  studentSafeMode: boolean;
  showEllGuides: boolean;
}

export type WorkspaceTab = 'board' | 'cards' | 'monitor' | 'setup';
