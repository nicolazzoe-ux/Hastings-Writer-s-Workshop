import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  FolderPlus,
  Plus,
  RotateCcw,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  PROJECT_PRESETS,
  STEP_COLOR_THEMES,
  STEP_IMAGE_MAP,
  STICKER_OPTIONS,
} from '../data/stepLibrary';
import {
  ClassroomState,
  StepColorKey,
  StepIconKey,
  StickerId,
  WritingProject,
  WritingStep,
} from '../types/writing';
import { ClipartImage } from './ClipartImage';
import { StickerIcon, StudentSticker } from './StudentSticker';

interface ProjectAndRosterSetupProps {
  classroom: ClassroomState;
  activeProject: WritingProject;
  onUpdateClassroomMeta: (
    patch: Partial<Pick<ClassroomState, 'classroomName' | 'schoolYear' | 'teacherName'>>
  ) => void;
  onUpdateProjectMeta: (
    projectId: string,
    patch: Partial<Pick<WritingProject, 'title' | 'unitLabel'>>
  ) => void;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (title: string, unitLabel: string, presetId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onUpdateProjectSteps: (projectId: string, steps: WritingStep[]) => void;
  onApplyPreset: (projectId: string, presetId: string) => void;
  onResetAllStudentsToFirstStep: (projectId: string) => void;
  onAddStudentsBulk: (names: string[], replaceExisting: boolean) => void;
  onAddSingleStudent: (name: string, sticker: StickerId) => void;
  onUpdateStudent: (studentId: string, patch: Partial<{ name: string; sticker: StickerId }>) => void;
  onRemoveStudent: (studentId: string) => void;
}

const CUSTOM_CLIPART_CHOICES: {
  id: string;
  label: string;
  imageUrl: string;
  iconKey: StepIconKey;
  colorKey: StepColorKey;
}[] = [
  { id: 'brainstorming', label: 'Lightbulb & Ideas', imageUrl: STEP_IMAGE_MAP.brainstorming, iconKey: 'lightbulb', colorKey: 'amber' },
  { id: 'drafting', label: 'Pencil & Paper', imageUrl: STEP_IMAGE_MAP.drafting, iconKey: 'pencil', colorKey: 'orange' },
  { id: 'revising', label: 'Magnifying Glass', imageUrl: STEP_IMAGE_MAP.revising, iconKey: 'search', colorKey: 'emerald' },
  { id: 'editing', label: 'Checkmarks & Pen', imageUrl: STEP_IMAGE_MAP.editing, iconKey: 'check-circle', colorKey: 'rose' },
  { id: 'typing', label: 'Rainbow Laptop', imageUrl: STEP_IMAGE_MAP.typing, iconKey: 'laptop', colorKey: 'teal' },
  { id: 'illustrations', label: 'Paint & Art', imageUrl: STEP_IMAGE_MAP.illustrations, iconKey: 'palette', colorKey: 'violet' },
  { id: 'about-author', label: 'Author Frame', imageUrl: STEP_IMAGE_MAP['about-author'], iconKey: 'user-round', colorKey: 'pink' },
  { id: 'published', label: 'Star Storybook', imageUrl: STEP_IMAGE_MAP.published, iconKey: 'book-open-check', colorKey: 'indigo' },
  { id: 'writing-folder', label: 'Writing Folder', imageUrl: STEP_IMAGE_MAP['writing-folder'], iconKey: 'folder-check', colorKey: 'sky' },
];

export function ProjectAndRosterSetup({
  classroom,
  activeProject,
  onUpdateClassroomMeta,
  onUpdateProjectMeta,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onUpdateProjectSteps,
  onApplyPreset,
  onResetAllStudentsToFirstStep,
  onAddStudentsBulk,
  onAddSingleStudent,
  onUpdateStudent,
  onRemoveStudent,
}: ProjectAndRosterSetupProps) {
  const [setupSection, setSetupSection] = useState<'project' | 'roster'>('project');

  // New project form
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectUnit, setNewProjectUnit] = useState('');
  const [newProjectPreset, setNewProjectPreset] = useState('full-book');

  // Custom step form
  const [customStepLabel, setCustomStepLabel] = useState('');
  const [customStepCue, setCustomStepCue] = useState('');
  const [customStepArt, setCustomStepArt] = useState(CUSTOM_CLIPART_CHOICES[0].id);

  // Single student form
  const [singleName, setSingleName] = useState('');
  const [singleSticker, setSingleSticker] = useState<StickerId>('star');

  // Bulk roster paste form
  const [bulkText, setBulkText] = useState('');
  const [confirmReplaceRoster, setConfirmReplaceRoster] = useState(false);
  const [confirmResetStep, setConfirmResetStep] = useState(false);
  const [rosterNotice, setRosterNotice] = useState<string | null>(null);

  const parsedBulkNames = bulkText
    .split(/[\n,;]+/)
    .map((n) => n.trim())
    .filter((n) => n.length > 0);

  const handleToggleStep = (stepId: string) => {
    const enabledCount = activeProject.steps.filter((s) => s.enabled).length;
    const target = activeProject.steps.find((s) => s.id === stepId);
    if (target?.enabled && enabledCount <= 1) {
      return; // Keep at least 1 active step
    }
    const updated = activeProject.steps.map((step) =>
      step.id === stepId ? { ...step, enabled: !step.enabled } : step
    );
    onUpdateProjectSteps(activeProject.id, updated);
  };

  const handleMoveStep = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= activeProject.steps.length) return;
    const copy = [...activeProject.steps];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    onUpdateProjectSteps(activeProject.id, copy);
  };

  const handleUpdateStepText = (
    stepId: string,
    patch: Partial<Pick<WritingStep, 'label' | 'shortLabel' | 'ellCue'>>
  ) => {
    const updated = activeProject.steps.map((step) =>
      step.id === stepId ? { ...step, ...patch } : step
    );
    onUpdateProjectSteps(activeProject.id, updated);
  };

  const handleAddCustomStep = (e: React.FormEvent) => {
    e.preventDefault();
    const label = customStepLabel.trim();
    if (!label) return;
    const art =
      CUSTOM_CLIPART_CHOICES.find((c) => c.id === customStepArt) ??
      CUSTOM_CLIPART_CHOICES[0];
    const newStep: WritingStep = {
      id: `custom-${Date.now()}`,
      label,
      shortLabel: label.length > 16 ? `${label.slice(0, 14)}…` : label,
      ellCue: customStepCue.trim() || 'Complete this writing step',
      ellChecklist: customStepCue.trim() || 'Finish this step and check your work.',
      imageUrl: art.imageUrl,
      iconKey: art.iconKey,
      colorKey: art.colorKey,
      enabled: true,
      isCustom: true,
    };
    onUpdateProjectSteps(activeProject.id, [...activeProject.steps, newStep]);
    setCustomStepLabel('');
    setCustomStepCue('');
  };

  const handleDeleteCustomStep = (stepId: string) => {
    onUpdateProjectSteps(
      activeProject.id,
      activeProject.steps.filter((s) => s.id !== stepId)
    );
  };

  const handleSingleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = singleName.trim();
    if (!trimmed) return;
    onAddSingleStudent(trimmed, singleSticker);
    setSingleName('');
    const currentIdx = STICKER_OPTIONS.findIndex((s) => s.id === singleSticker);
    const nextSticker =
      STICKER_OPTIONS[(currentIdx + 1) % STICKER_OPTIONS.length].id;
    setSingleSticker(nextSticker);
  };

  const handleBulkAdd = (replaceExisting: boolean) => {
    if (parsedBulkNames.length === 0) return;
    onAddStudentsBulk(parsedBulkNames, replaceExisting);
    setRosterNotice(
      replaceExisting
        ? `Replaced class roster with ${parsedBulkNames.length} students.`
        : `Added ${parsedBulkNames.length} students to your class.`
    );
    setBulkText('');
    setConfirmReplaceRoster(false);
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation between Project/Steps and Yearly Roster */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSetupSection('project')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              setupSection === 'project'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Project Title &amp; Writing Steps
          </button>
          <button
            type="button"
            onClick={() => setSetupSection('roster')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              setupSection === 'roster'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Yearly Student Roster ({classroom.students.length})</span>
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Changes save automatically on this browser.
        </p>
      </div>

      {setupSection === 'project' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Project Selector & Title */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display font-bold text-lg text-slate-900">
                  Active Writing Project
                </h2>
                <button
                  type="button"
                  onClick={() => setShowNewProjectForm((v) => !v)}
                  className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>New Project</span>
                </button>
              </div>

              {showNewProjectForm && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newProjectTitle.trim()) return;
                    onCreateProject(
                      newProjectTitle.trim(),
                      newProjectUnit.trim() || 'Writing Unit',
                      newProjectPreset
                    );
                    setNewProjectTitle('');
                    setNewProjectUnit('');
                    setShowNewProjectForm(false);
                  }}
                  className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-3"
                >
                  <p className="font-semibold text-sm text-slate-900">
                    Create a New Writing Project
                  </p>
                  <input
                    type="text"
                    required
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    placeholder="Project Title (e.g., Animal Research Book)"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <input
                    type="text"
                    value={newProjectUnit}
                    onChange={(e) => setNewProjectUnit(e.target.value)}
                    placeholder="Unit Label (e.g., Unit 3 · Informational)"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <select
                    value={newProjectPreset}
                    onChange={(e) => setNewProjectPreset(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {PROJECT_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowNewProjectForm(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      Create Project
                    </button>
                  </div>
                </form>
              )}

              {/* Switch Existing Projects */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600">
                  Switch Writing Project
                </label>
                <div className="space-y-1.5">
                  {classroom.projects.map((proj) => {
                    const isActive = proj.id === activeProject.id;
                    const enabledCount = proj.steps.filter((s) => s.enabled).length;
                    return (
                      <div
                        key={proj.id}
                        className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-colors ${
                          isActive
                            ? 'bg-sky-50 border-sky-300'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectProject(proj.id)}
                          className="text-left flex-1 min-w-0 cursor-pointer"
                        >
                          <p className="font-semibold text-sm text-slate-900 truncate">
                            {proj.title}
                          </p>
                          <p className="text-xs text-slate-600 tabular-nums">
                            {proj.unitLabel} · {enabledCount} steps
                          </p>
                        </button>
                        {classroom.projects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onDeleteProject(proj.id)}
                            title={`Delete ${proj.title}`}
                            aria-label={`Delete project ${proj.title}`}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Edit Active Project Title & Unit */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div>
                  <label
                    htmlFor="project-title-input"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Project Title (shown on classroom board)
                  </label>
                  <input
                    id="project-title-input"
                    type="text"
                    value={activeProject.title}
                    onChange={(e) =>
                      onUpdateProjectMeta(activeProject.id, {
                        title: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="project-unit-input"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Unit / Genre Label
                  </label>
                  <input
                    id="project-unit-input"
                    type="text"
                    value={activeProject.unitLabel}
                    onChange={(e) =>
                      onUpdateProjectMeta(activeProject.id, {
                        unitLabel: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </section>

            {/* Quick Step Presets */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <h3 className="font-display font-bold text-base text-slate-900">
                1-Click Step Templates
              </h3>
              <p className="text-xs text-slate-600">
                Quickly switch which steps are turned on and their order for this project.
              </p>
              <div className="space-y-2">
                {PROJECT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onApplyPreset(activeProject.id, preset.id)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 transition-colors cursor-pointer"
                  >
                    <p className="font-semibold text-sm text-slate-900">
                      {preset.name}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {preset.description}
                    </p>
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200">
                {!confirmResetStep ? (
                  <button
                    type="button"
                    onClick={() => setConfirmResetStep(true)}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Move All Writers Back to Step 1</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                    <p className="text-xs font-semibold text-amber-900">
                      Reset everyone on &ldquo;{activeProject.title}&rdquo; to Step 1?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onResetAllStudentsToFirstStep(activeProject.id);
                          setConfirmResetStep(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer"
                      >
                        Yes, Reset All
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmResetStep(false)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Interchangeable Step List + Custom Step */}
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900">
                  Interchangeable Project Steps
                </h2>
                <p className="text-sm text-slate-600">
                  Turn steps on or off for this project, use arrows to reorder them, or edit labels for your students.
                </p>
              </div>

              <div className="space-y-2.5">
                {activeProject.steps.map((step, index) => {
                  const theme = STEP_COLOR_THEMES[step.colorKey];
                  return (
                    <div
                      key={step.id}
                      className={`p-3 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center gap-3 ${
                        step.enabled
                          ? 'bg-white border-slate-200'
                          : 'bg-slate-50 border-slate-200/70 opacity-65'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveStep(index, -1)}
                            aria-label={`Move ${step.label} up`}
                            className="p-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 cursor-pointer disabled:cursor-default"
                          >
                            <ArrowUp className="w-3.5 h-3.5 text-slate-700" />
                          </button>
                          <button
                            type="button"
                            disabled={index === activeProject.steps.length - 1}
                            onClick={() => handleMoveStep(index, 1)}
                            aria-label={`Move ${step.label} down`}
                            className="p-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 cursor-pointer disabled:cursor-default"
                          >
                            <ArrowDown className="w-3.5 h-3.5 text-slate-700" />
                          </button>
                        </div>

                        <ClipartImage
                          src={step.imageUrl}
                          alt={step.label}
                          iconKey={step.iconKey}
                          colorKey={step.colorKey}
                          className="w-14 h-14 border border-slate-200"
                        />

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <input
                            type="text"
                            value={step.label}
                            onChange={(e) =>
                              handleUpdateStepText(step.id, {
                                label: e.target.value,
                                shortLabel:
                                  e.target.value.length > 16
                                    ? `${e.target.value.slice(0, 14)}…`
                                    : e.target.value,
                              })
                            }
                            aria-label={`Step title for ${step.label}`}
                            className="w-full px-2.5 py-1 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                          <input
                            type="text"
                            value={step.ellCue}
                            onChange={(e) =>
                              handleUpdateStepText(step.id, {
                                ellCue: e.target.value,
                              })
                            }
                            aria-label={`Language learner visual cue for ${step.label}`}
                            placeholder="Short picture cue (e.g., Think & draw ideas)"
                            className="w-full px-2.5 py-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 shrink-0">
                        {step.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomStep(step.id)}
                            aria-label={`Remove custom step ${step.label}`}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleStep(step.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                            step.enabled
                              ? `${theme.softBg} ${theme.border} ${theme.badgeText}`
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {step.enabled && <Check className="w-3.5 h-3.5" />}
                          <span>{step.enabled ? 'Included' : 'Skipped'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Step */}
              <form
                onSubmit={handleAddCustomStep}
                className="pt-4 border-t border-slate-200 space-y-3"
              >
                <p className="font-display font-bold text-sm text-slate-900">
                  Add a Custom Writing Step
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={customStepLabel}
                    onChange={(e) => setCustomStepLabel(e.target.value)}
                    placeholder="Step Name (e.g., Peer Share)"
                    className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <input
                    type="text"
                    value={customStepCue}
                    onChange={(e) => setCustomStepCue(e.target.value)}
                    placeholder="Picture cue (e.g., Read to a friend)"
                    className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <select
                    value={customStepArt}
                    onChange={(e) => setCustomStepArt(e.target.value)}
                    aria-label="Choose clipart icon for custom step"
                    className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {CUSTOM_CLIPART_CHOICES.map((art) => (
                      <option key={art.id} value={art.id}>
                        Clipart: {art.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Custom Step</span>
                </button>
              </form>
            </section>
          </div>
        </div>
      ) : (
        /* Yearly Student Roster Section */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Class Info + Easy Bulk Yearly Import */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <h2 className="font-display font-bold text-lg text-slate-900">
                Classroom &amp; School Year
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Classroom Name
                  </label>
                  <input
                    type="text"
                    value={classroom.classroomName}
                    onChange={(e) =>
                      onUpdateClassroomMeta({ classroomName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    School Year
                  </label>
                  <input
                    type="text"
                    value={classroom.schoolYear}
                    onChange={(e) =>
                      onUpdateClassroomMeta({ schoolYear: e.target.value })
                    }
                    placeholder="2026–2027"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Teacher Name
                </label>
                <input
                  type="text"
                  value={classroom.teacherName}
                  onChange={(e) =>
                    onUpdateClassroomMeta({ teacherName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </section>

            {/* Paste New Year Class Roster */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-sky-600" aria-hidden="true" />
                <h3 className="font-display font-bold text-base text-slate-900">
                  Paste Class List (New School Year)
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                Paste student names from your attendance sheet (one per line or separated by commas). Each student automatically gets a colorful sticker icon.
              </p>

              <textarea
                rows={6}
                value={bulkText}
                onChange={(e) => {
                  setBulkText(e.target.value);
                  setConfirmReplaceRoster(false);
                }}
                placeholder={'Elena G.\nMarcus T.\nSora K.\nLiam P.'}
                aria-label="Paste list of student names"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              {rosterNotice && (
                <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                  {rosterNotice}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={parsedBulkNames.length === 0}
                  onClick={() => handleBulkAdd(false)}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white text-xs font-semibold cursor-pointer disabled:cursor-default whitespace-nowrap"
                >
                  Add {parsedBulkNames.length > 0 ? parsedBulkNames.length : ''} to Class
                </button>

                {!confirmReplaceRoster ? (
                  <button
                    type="button"
                    disabled={parsedBulkNames.length === 0}
                    onClick={() => setConfirmReplaceRoster(true)}
                    className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 disabled:opacity-40 text-rose-800 text-xs font-semibold cursor-pointer disabled:cursor-default whitespace-nowrap"
                  >
                    Replace Whole Class for New Year
                  </button>
                ) : (
                  <div className="w-full p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                    <p className="text-xs font-semibold text-rose-900">
                      Replace all {classroom.students.length} current students with these{' '}
                      {parsedBulkNames.length} new students?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleBulkAdd(true)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
                      >
                        Yes, Start New Roster
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmReplaceRoster(false)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Quick Add Single + Editable Student List */}
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h2 className="font-display font-bold text-lg text-slate-900">
                Current Students ({classroom.students.length})
              </h2>

              {/* Add One Student */}
              <form
                onSubmit={handleSingleStudentSubmit}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={singleName}
                    onChange={(e) => setSingleName(e.target.value)}
                    placeholder="Add one student (e.g., Jordan M.)"
                    aria-label="New student name"
                    className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Student</span>
                  </button>
                </div>

                {/* Sticker Picker */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-600 mr-1">Sticker:</span>
                  {STICKER_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSingleSticker(opt.id)}
                      title={opt.label}
                      aria-label={`Choose ${opt.label} sticker`}
                      className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                        opt.bg
                      } ${opt.text} ${
                        singleSticker === opt.id
                          ? 'ring-2 ring-sky-600 ring-offset-1 scale-105'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      <StickerIcon sticker={opt.id} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </form>

              {/* Student Roster List */}
              {classroom.students.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                  <p className="text-sm text-slate-600">
                    No students yet. Add a student above or paste your class list on the left.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {classroom.students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      <StudentSticker sticker={student.sticker} size="sm" />
                      <input
                        type="text"
                        value={student.name}
                        onChange={(e) =>
                          onUpdateStudent(student.id, { name: e.target.value })
                        }
                        aria-label={`Edit name for ${student.name}`}
                        className="flex-1 min-w-0 px-2 py-1 text-sm font-medium text-slate-900 bg-transparent border border-transparent hover:border-slate-200 focus:border-sky-400 focus:bg-slate-50 rounded-lg focus:outline-none"
                      />
                      <select
                        value={student.sticker}
                        onChange={(e) =>
                          onUpdateStudent(student.id, {
                            sticker: e.target.value as StickerId,
                          })
                        }
                        aria-label={`Change sticker for ${student.name}`}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 text-slate-600"
                      >
                        {STICKER_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => onRemoveStudent(student.id)}
                        aria-label={`Remove ${student.name}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
