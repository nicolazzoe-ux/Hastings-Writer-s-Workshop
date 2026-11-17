import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  Eye,
  EyeOff,
  Lock,
  Pencil,
  Sparkles,
  Unlock,
} from 'lucide-react';
import { ClipartImage } from './components/ClipartImage';
import { ClipChartBoard } from './components/ClipChartBoard';
import { ProjectAndRosterSetup } from './components/ProjectAndRosterSetup';
import { StudentCardsGrid } from './components/StudentCardsGrid';
import { StudentStepModal } from './components/StudentStepModal';
import { TeacherMonitorView } from './components/TeacherMonitorView';
import {
  createDefaultSteps,
  createInitialClassroomState,
  PROJECT_PRESETS,
  STICKER_OPTIONS,
  WORKSHOP_BANNER_IMAGE,
} from './data/stepLibrary';
import {
  ClassroomState,
  StickerId,
  Student,
  StudentProgress,
  WorkspaceTab,
  WritingProject,
  WritingStep,
} from './types/writing';

const STORAGE_KEY = 'pencil_path_classroom_v1';

function loadSavedClassroom(): ClassroomState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialClassroomState();
    const parsed = JSON.parse(raw) as ClassroomState;
    if (
      parsed &&
      Array.isArray(parsed.students) &&
      Array.isArray(parsed.projects) &&
      parsed.projects.length > 0
    ) {
      return parsed;
    }
  } catch {
    // Fallback to initial classroom state
  }
  return createInitialClassroomState();
}

export default function App() {
  const [classroom, setClassroom] = useState<ClassroomState>(loadSavedClassroom);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('board');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [bannerImgError, setBannerImgError] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);
  const [editingClassroomMeta, setEditingClassroomMeta] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(classroom));
    } catch {
      // Ignore storage quota errors
    }
  }, [classroom]);

  useEffect(() => {
    if (!celebrationMsg) return;
    const timer = window.setTimeout(() => setCelebrationMsg(null), 4000);
    return () => window.clearTimeout(timer);
  }, [celebrationMsg]);

  const activeProject = useMemo(() => {
    return (
      classroom.projects.find((p) => p.id === classroom.activeProjectId) ??
      classroom.projects[0]
    );
  }, [classroom.projects, classroom.activeProjectId]);

  const activeSteps = useMemo(() => {
    return activeProject.steps.filter((step) => step.enabled);
  }, [activeProject.steps]);

  const firstActiveStepId = activeSteps[0]?.id ?? '';

  const updateProject = (
    projectId: string,
    updater: (project: WritingProject) => WritingProject
  ) => {
    setClassroom((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === projectId ? updater(p) : p)),
    }));
  };

  const ensureProgress = (
    proj: WritingProject,
    studentId: string
  ): StudentProgress => {
    return (
      proj.progressByStudentId[studentId] ?? {
        stepId: firstActiveStepId,
        needsConference: false,
        teacherNote: '',
        folderOrganized: false,
        updatedAt: new Date().toISOString(),
      }
    );
  };

  const handleMoveStudentToStep = (studentId: string, stepId: string) => {
    const student = classroom.students.find((s) => s.id === studentId);
    const targetStep = activeSteps.find((s) => s.id === stepId);

    updateProject(activeProject.id, (proj) => {
      const current = ensureProgress(proj, studentId);
      const autoFolder =
        stepId === 'writing-folder' ? true : current.folderOrganized;

      return {
        ...proj,
        progressByStudentId: {
          ...proj.progressByStudentId,
          [studentId]: {
            ...current,
            stepId,
            folderOrganized: autoFolder,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });

    if (
      student &&
      targetStep &&
      (targetStep.id === 'published' || targetStep.id === 'writing-folder')
    ) {
      setCelebrationMsg(
        `Way to go, ${student.name}! Moved to ${targetStep.label}.`
      );
    }
  };

  const handleAdvanceStudent = (studentId: string) => {
    const current = ensureProgress(activeProject, studentId);
    const currentIndex = activeSteps.findIndex((s) => s.id === current.stepId);
    const nextIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
    if (nextIndex < activeSteps.length) {
      handleMoveStudentToStep(studentId, activeSteps[nextIndex].id);
    }
  };

  const handleToggleConference = (studentId: string) => {
    updateProject(activeProject.id, (proj) => {
      const current = ensureProgress(proj, studentId);
      return {
        ...proj,
        progressByStudentId: {
          ...proj.progressByStudentId,
          [studentId]: {
            ...current,
            needsConference: !current.needsConference,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  };

  const handleToggleFolderOrganized = (studentId: string) => {
    updateProject(activeProject.id, (proj) => {
      const current = ensureProgress(proj, studentId);
      return {
        ...proj,
        progressByStudentId: {
          ...proj.progressByStudentId,
          [studentId]: {
            ...current,
            folderOrganized: !current.folderOrganized,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  };

  const handleUpdateTeacherNote = (studentId: string, note: string) => {
    updateProject(activeProject.id, (proj) => {
      const current = ensureProgress(proj, studentId);
      return {
        ...proj,
        progressByStudentId: {
          ...proj.progressByStudentId,
          [studentId]: {
            ...current,
            teacherNote: note,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  };

  const handleCreateProject = (
    title: string,
    unitLabel: string,
    presetId: string
  ) => {
    const preset =
      PROJECT_PRESETS.find((p) => p.id === presetId) ?? PROJECT_PRESETS[0];
    const baseSteps = createDefaultSteps();
    const orderedSteps: WritingStep[] = [
      ...preset.stepOrderAndEnabled
        .map((id) => baseSteps.find((s) => s.id === id))
        .filter((s): s is WritingStep => Boolean(s))
        .map((s) => ({ ...s, enabled: true })),
      ...baseSteps
        .filter((s) => !preset.stepOrderAndEnabled.includes(s.id))
        .map((s) => ({ ...s, enabled: false })),
    ];

    const now = new Date().toISOString();
    const firstId = orderedSteps.find((s) => s.enabled)?.id ?? 'brainstorming';
    const progressByStudentId: Record<string, StudentProgress> = {};
    classroom.students.forEach((stu) => {
      progressByStudentId[stu.id] = {
        stepId: firstId,
        needsConference: false,
        teacherNote: '',
        folderOrganized: false,
        updatedAt: now,
      };
    });

    const newProject: WritingProject = {
      id: `proj-${Date.now()}`,
      title,
      unitLabel,
      steps: orderedSteps,
      progressByStudentId,
      createdAt: now,
    };

    setClassroom((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
      activeProjectId: newProject.id,
    }));
  };

  const handleDeleteProject = (projectId: string) => {
    setClassroom((prev) => {
      if (prev.projects.length <= 1) return prev;
      const remaining = prev.projects.filter((p) => p.id !== projectId);
      return {
        ...prev,
        projects: remaining,
        activeProjectId:
          prev.activeProjectId === projectId
            ? remaining[0].id
            : prev.activeProjectId,
      };
    });
  };

  const handleApplyPreset = (projectId: string, presetId: string) => {
    const preset = PROJECT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    updateProject(projectId, (proj) => {
      const existingById = new Map(proj.steps.map((s) => [s.id, s]));
      const enabledInPreset = preset.stepOrderAndEnabled
        .map((id) => existingById.get(id))
        .filter((s): s is WritingStep => Boolean(s))
        .map((s) => ({ ...s, enabled: true }));

      const remainingDisabled = proj.steps
        .filter((s) => !preset.stepOrderAndEnabled.includes(s.id))
        .map((s) => ({ ...s, enabled: false }));

      return {
        ...proj,
        steps: [...enabledInPreset, ...remainingDisabled],
      };
    });
  };

  const handleResetAllStudentsToFirstStep = (projectId: string) => {
    const targetProj = classroom.projects.find((p) => p.id === projectId);
    const firstId =
      targetProj?.steps.find((s) => s.enabled)?.id ?? 'brainstorming';
    const now = new Date().toISOString();

    updateProject(projectId, (proj) => {
      const nextProgress: Record<string, StudentProgress> = {};
      classroom.students.forEach((stu) => {
        nextProgress[stu.id] = {
          stepId: firstId,
          needsConference: false,
          teacherNote: '',
          folderOrganized: false,
          updatedAt: now,
        };
      });
      return {
        ...proj,
        progressByStudentId: nextProgress,
      };
    });
  };

  const handleAddSingleStudent = (name: string, sticker: StickerId) => {
    const newStudent: Student = {
      id: `stu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      sticker,
    };
    const now = new Date().toISOString();

    setClassroom((prev) => ({
      ...prev,
      students: [...prev.students, newStudent],
      projects: prev.projects.map((proj) => ({
        ...proj,
        progressByStudentId: {
          ...proj.progressByStudentId,
          [newStudent.id]: {
            stepId: proj.steps.find((s) => s.enabled)?.id ?? 'brainstorming',
            needsConference: false,
            teacherNote: '',
            folderOrganized: false,
            updatedAt: now,
          },
        },
      })),
    }));
  };

  const handleAddStudentsBulk = (names: string[], replaceExisting: boolean) => {
    const now = new Date().toISOString();
    const baseOffset = replaceExisting ? 0 : classroom.students.length;

    const newStudents: Student[] = names.map((name, idx) => ({
      id: `stu-${Date.now()}-${idx}`,
      name,
      sticker: STICKER_OPTIONS[(baseOffset + idx) % STICKER_OPTIONS.length].id,
    }));

    setClassroom((prev) => {
      const nextStudents = replaceExisting
        ? newStudents
        : [...prev.students, ...newStudents];

      const nextProjects = prev.projects.map((proj) => {
        const firstId = proj.steps.find((s) => s.enabled)?.id ?? 'brainstorming';
        const nextProgress: Record<string, StudentProgress> = replaceExisting
          ? {}
          : { ...proj.progressByStudentId };

        newStudents.forEach((stu) => {
          nextProgress[stu.id] = {
            stepId: firstId,
            needsConference: false,
            teacherNote: '',
            folderOrganized: false,
            updatedAt: now,
          };
        });

        return {
          ...proj,
          progressByStudentId: nextProgress,
        };
      });

      return {
        ...prev,
        students: nextStudents,
        projects: nextProjects,
      };
    });
  };

  const handleUpdateStudent = (
    studentId: string,
    patch: Partial<{ name: string; sticker: StickerId }>
  ) => {
    setClassroom((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, ...patch } : s
      ),
    }));
  };

  const handleRemoveStudent = (studentId: string) => {
    setClassroom((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== studentId),
    }));
  };

  const handleToggleSafeMode = () => {
    setClassroom((prev) => {
      const nextSafe = !prev.studentSafeMode;
      if (nextSafe) {
        setEditingClassroomMeta(false);
        if (activeTab === 'monitor' || activeTab === 'setup') {
          setActiveTab('board');
        }
      }
      return { ...prev, studentSafeMode: nextSafe };
    });
  };

  const selectedStudent = selectedStudentId
    ? classroom.students.find((s) => s.id === selectedStudentId) ?? null
    : null;

  const publishedCount = classroom.students.filter((s) => {
    const sid = activeProject.progressByStudentId[s.id]?.stepId;
    return sid === 'published' || sid === 'writing-folder';
  }).length;

  const helpCount = classroom.students.filter(
    (s) => activeProject.progressByStudentId[s.id]?.needsConference
  ).length;

  const navItems: { id: WorkspaceTab; label: string; teacherOnly?: boolean }[] = [
    { id: 'board', label: 'Clip Chart' },
    { id: 'cards', label: 'Student Cards' },
    { id: 'monitor', label: 'Teacher Monitor', teacherOnly: true },
    { id: 'setup', label: 'Project & Roster', teacherOnly: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 no-print">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('board')}
            className="font-display text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg px-1"
          >
            Hastings Writers
          </button>

          {/* Zone 2: Concise Single-Line Nav Links */}
          <nav
            aria-label="Primary views"
            className="hidden md:flex items-center gap-6"
          >
            {navItems
              .filter((item) => !(classroom.studentSafeMode && item.teacherOnly))
              .map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`py-1.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                      isActive
                        ? 'border-sky-600 text-sky-700'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleToggleSafeMode}
              className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                classroom.studentSafeMode
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  : 'bg-sky-600 text-white hover:bg-sky-700'
              }`}
            >
              {classroom.studentSafeMode ? (
                <>
                  <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Unlock Teacher Tools</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Student Tap Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="md:hidden border-t border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto bg-slate-50/80">
          {navItems
            .filter((item) => !(classroom.studentSafeMode && item.teacherOnly))
            .map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-sky-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Project Banner */}
        <section
          aria-label="Current writing project"
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between gap-5">
              <div className="space-y-2.5">
                {!classroom.studentSafeMode && editingClassroomMeta ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setEditingClassroomMeta(false);
                    }}
                    className="flex flex-wrap items-center gap-2 text-xs"
                  >
                    <label className="sr-only" htmlFor="inline-classroom-name">
                      Grade and Room
                    </label>
                    <input
                      id="inline-classroom-name"
                      type="text"
                      value={classroom.classroomName}
                      onChange={(e) =>
                        setClassroom((prev) => ({
                          ...prev,
                          classroomName: e.target.value,
                        }))
                      }
                      placeholder="Grade & Room"
                      aria-label="Grade and Room"
                      autoFocus
                      className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-sky-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 w-36"
                    />
                    <label className="sr-only" htmlFor="inline-school-year">
                      School Year
                    </label>
                    <input
                      id="inline-school-year"
                      type="text"
                      value={classroom.schoolYear}
                      onChange={(e) =>
                        setClassroom((prev) => ({
                          ...prev,
                          schoolYear: e.target.value,
                        }))
                      }
                      placeholder="School Year"
                      aria-label="School Year"
                      className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-sky-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 w-24"
                    />
                    <label className="sr-only" htmlFor="inline-teacher-name">
                      Teacher Name
                    </label>
                    <input
                      id="inline-teacher-name"
                      type="text"
                      value={classroom.teacherName}
                      onChange={(e) =>
                        setClassroom((prev) => ({
                          ...prev,
                          teacherName: e.target.value,
                        }))
                      }
                      placeholder="Teacher Name"
                      aria-label="Teacher Name"
                      className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-sky-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 w-32"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Done</span>
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                    {!classroom.studentSafeMode ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditingClassroomMeta(true)}
                          title="Click to edit grade, room, year, or teacher name"
                          className="group inline-flex items-center gap-1 text-slate-600 hover:text-sky-700 underline decoration-dotted decoration-slate-300 underline-offset-4 cursor-pointer rounded px-1 py-0.5 hover:bg-sky-50/70 transition-colors"
                        >
                          <span>{classroom.classroomName || 'Add Grade & Room'}</span>
                          <Pencil className="w-3 h-3 text-slate-400 group-hover:text-sky-600" aria-hidden="true" />
                        </button>
                        <span aria-hidden="true">·</span>
                        <button
                          type="button"
                          onClick={() => setEditingClassroomMeta(true)}
                          title="Click to edit school year"
                          className="group inline-flex items-center gap-1 text-slate-600 hover:text-sky-700 underline decoration-dotted decoration-slate-300 underline-offset-4 cursor-pointer rounded px-1 py-0.5 hover:bg-sky-50/70 transition-colors"
                        >
                          <span>{classroom.schoolYear || 'School Year'}</span>
                        </button>
                        <span aria-hidden="true">·</span>
                        <button
                          type="button"
                          onClick={() => setEditingClassroomMeta(true)}
                          title="Click to edit teacher name"
                          className="group inline-flex items-center gap-1 text-slate-600 hover:text-sky-700 underline decoration-dotted decoration-slate-300 underline-offset-4 cursor-pointer rounded px-1 py-0.5 hover:bg-sky-50/70 transition-colors"
                        >
                          <span>{classroom.teacherName || 'Add Teacher Name'}</span>
                          <Pencil className="w-3 h-3 text-slate-400 group-hover:text-sky-600" aria-hidden="true" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span>{classroom.classroomName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{classroom.schoolYear}</span>
                        <span aria-hidden="true">·</span>
                        <span>{classroom.teacherName}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="text-sky-700 font-semibold">
                      {activeProject.unitLabel}
                    </span>
                  </div>
                )}

                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight text-balance leading-tight">
                  {activeProject.title}
                </h1>

                <p className="text-sm text-slate-600 tabular-nums">
                  {classroom.students.length} writers
                  <span className="mx-2 text-slate-300" aria-hidden="true">
                    ·
                  </span>
                  {activeSteps.length} writing steps
                  <span className="mx-2 text-slate-300" aria-hidden="true">
                    ·
                  </span>
                  {publishedCount} finished
                  {helpCount > 0 && (
                    <>
                      <span className="mx-2 text-slate-300" aria-hidden="true">
                        ·
                      </span>
                      <span className="font-semibold text-amber-700">
                        {helpCount} requesting help
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* Workspace Toolbar */}
              <div className="flex flex-wrap items-center gap-3 pt-1 no-print">
                {classroom.projects.length > 1 && (
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="quick-project-select"
                      className="text-xs font-semibold text-slate-600 whitespace-nowrap"
                    >
                      Project:
                    </label>
                    <select
                      id="quick-project-select"
                      value={activeProject.id}
                      onChange={(e) =>
                        setClassroom((prev) => ({
                          ...prev,
                          activeProjectId: e.target.value,
                        }))
                      }
                      className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {classroom.projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setClassroom((prev) => ({
                      ...prev,
                      showEllGuides: !prev.showEllGuides,
                    }))
                  }
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {classroom.showEllGuides ? (
                    <Eye className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  )}
                  <span>
                    Picture Cues: {classroom.showEllGuides ? 'On' : 'Off'}
                  </span>
                </button>

                {!classroom.studentSafeMode && activeTab !== 'setup' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('setup')}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Edit Title, Steps &amp; Roster
                  </button>
                )}
              </div>
            </div>

            {/* Banner Artwork */}
            <div className="lg:col-span-5 bg-sky-50 border-t lg:border-t-0 lg:border-l border-slate-200 min-h-[180px] lg:min-h-[220px] flex items-center justify-center overflow-hidden">
              {bannerImgError ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <BookOpen className="w-7 h-7" aria-hidden="true" />
                  </div>
                  <p className="font-display font-bold text-slate-800 text-sm">
                    Classroom Writing Workshop
                  </p>
                </div>
              ) : (
                <img
                  src={WORKSHOP_BANNER_IMAGE}
                  alt="Bright elementary classroom writing workshop desk with books, pencils, crayons, and paper airplanes"
                  referrerPolicy="no-referrer"
                  onError={() => setBannerImgError(true)}
                  className="w-full h-full object-cover max-h-[250px] lg:max-h-none"
                />
              )}
            </div>
          </div>

          {/* Visual Writing Path Legend Strip (Language Learner Friendly) */}
          {activeSteps.length > 0 && activeTab !== 'setup' && (
            <div className="border-t border-slate-200 bg-slate-50/80 px-4 sm:px-6 py-3 overflow-x-auto no-print">
              <div className="flex items-center gap-3 min-w-max">
                <span className="text-xs font-bold text-slate-500 shrink-0">
                  Writing Path:
                </span>
                {activeSteps.map((step, idx) => (
                  <React.Fragment key={step.id}>
                    <div className="flex items-center gap-2 shrink-0">
                      <ClipartImage
                        src={step.imageUrl}
                        alt={step.shortLabel}
                        iconKey={step.iconKey}
                        colorKey={step.colorKey}
                        className="w-8 h-8 border border-slate-200"
                      />
                      <span className="text-xs font-semibold text-slate-800 tabular-nums whitespace-nowrap">
                        {idx + 1}. {step.shortLabel}
                      </span>
                    </div>
                    {idx < activeSteps.length - 1 && (
                      <span
                        className="text-slate-300 text-xs select-none"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Active Workspace View */}
        {activeTab === 'board' && (
          <ClipChartBoard
            activeSteps={activeSteps}
            students={classroom.students}
            progressByStudentId={activeProject.progressByStudentId}
            showEllGuides={classroom.showEllGuides}
            onOpenStudentModal={(id) => setSelectedStudentId(id)}
            onMoveStudentToStep={handleMoveStudentToStep}
            onAdvanceStudent={handleAdvanceStudent}
          />
        )}

        {activeTab === 'cards' && (
          <StudentCardsGrid
            activeSteps={activeSteps}
            students={classroom.students}
            progressByStudentId={activeProject.progressByStudentId}
            showEllGuides={classroom.showEllGuides}
            onOpenStudentModal={(id) => setSelectedStudentId(id)}
            onAdvanceStudent={handleAdvanceStudent}
          />
        )}

        {activeTab === 'monitor' && !classroom.studentSafeMode && (
          <TeacherMonitorView
            classroom={classroom}
            project={activeProject}
            activeSteps={activeSteps}
            onMoveStudentToStep={handleMoveStudentToStep}
            onToggleConference={handleToggleConference}
            onToggleFolderOrganized={handleToggleFolderOrganized}
            onUpdateTeacherNote={handleUpdateTeacherNote}
            onImportBackup={(imported) => setClassroom(imported)}
          />
        )}

        {activeTab === 'setup' && !classroom.studentSafeMode && (
          <ProjectAndRosterSetup
            classroom={classroom}
            activeProject={activeProject}
            onUpdateClassroomMeta={(patch) =>
              setClassroom((prev) => ({ ...prev, ...patch }))
            }
            onUpdateProjectMeta={(projectId, patch) =>
              updateProject(projectId, (proj) => ({ ...proj, ...patch }))
            }
            onSelectProject={(projectId) =>
              setClassroom((prev) => ({ ...prev, activeProjectId: projectId }))
            }
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            onUpdateProjectSteps={(projectId, steps) =>
              updateProject(projectId, (proj) => ({ ...proj, steps }))
            }
            onApplyPreset={handleApplyPreset}
            onResetAllStudentsToFirstStep={handleResetAllStudentsToFirstStep}
            onAddStudentsBulk={handleAddStudentsBulk}
            onAddSingleStudent={handleAddSingleStudent}
            onUpdateStudent={handleUpdateStudent}
            onRemoveStudent={handleRemoveStudent}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto no-print">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>
            Hastings Writers · Classroom Writing Workshop Tracker
          </span>
          <span>
            {classroom.studentSafeMode
              ? 'Student Tap Mode is active (setup tools hidden)'
              : 'Teacher Mode active · All changes save automatically'}
          </span>
        </div>
      </footer>

      {/* Kid-Friendly Step Picker Modal */}
      {selectedStudent && (
        <StudentStepModal
          student={selectedStudent}
          progress={ensureProgress(activeProject, selectedStudent.id)}
          activeSteps={activeSteps}
          showEllGuides={classroom.showEllGuides}
          onSelectStep={(stepId) => {
            handleMoveStudentToStep(selectedStudent.id, stepId);
            setSelectedStudentId(null);
          }}
          onToggleHelp={() => handleToggleConference(selectedStudent.id)}
          onToggleFolderOrganized={() =>
            handleToggleFolderOrganized(selectedStudent.id)
          }
          onClose={() => setSelectedStudentId(null)}
        />
      )}

      {/* Celebration Toast */}
      {celebrationMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-indigo-600 text-white px-5 py-3.5 rounded-2xl shadow-lg flex items-center gap-3 max-w-sm"
        >
          <Sparkles className="w-5 h-5 text-amber-300 shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold">{celebrationMsg}</p>
        </div>
      )}
    </div>
  );
}
