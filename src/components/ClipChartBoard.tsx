import React, { useState } from 'react';
import { ChevronRight, FolderCheck, Hand } from 'lucide-react';
import { STEP_COLOR_THEMES } from '../data/stepLibrary';
import { Student, StudentProgress, WritingStep } from '../types/writing';
import { ClipartImage, StepGlyph } from './ClipartImage';
import { StudentSticker } from './StudentSticker';

interface ClipChartBoardProps {
  activeSteps: WritingStep[];
  students: Student[];
  progressByStudentId: Record<string, StudentProgress>;
  showEllGuides: boolean;
  onOpenStudentModal: (studentId: string) => void;
  onMoveStudentToStep: (studentId: string, stepId: string) => void;
  onAdvanceStudent: (studentId: string) => void;
}

export function ClipChartBoard({
  activeSteps,
  students,
  progressByStudentId,
  showEllGuides,
  onOpenStudentModal,
  onMoveStudentToStep,
  onAdvanceStudent,
}: ClipChartBoardProps) {
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);
  const [dragOverStepId, setDragOverStepId] = useState<string | null>(null);

  const fallbackStepId = activeSteps[0]?.id ?? '';

  const getStudentStepId = (studentId: string): string => {
    const stepId = progressByStudentId[studentId]?.stepId;
    if (stepId && activeSteps.some((s) => s.id === stepId)) {
      return stepId;
    }
    return fallbackStepId;
  };

  if (activeSteps.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <p className="font-display text-lg font-bold text-slate-900">
          No writing steps are turned on for this project yet.
        </p>
        <p className="text-sm text-slate-600 mt-1">
          Open Project &amp; Roster to choose the steps for this writing project.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <p>
          Tip for writers: Tap your name to pick a new picture, or tap the arrow to move to the next step.
        </p>
        <p className="tabular-nums font-medium text-slate-700">
          {students.length} writers · {activeSteps.length} steps
        </p>
      </div>

      {/* Horizontal Scrolling Classroom Clip Chart */}
      <div className="overflow-x-auto pb-4 -mx-1 px-1">
        <div className="flex items-stretch gap-4 min-w-max">
          {activeSteps.map((step, index) => {
            const theme = STEP_COLOR_THEMES[step.colorKey];
            const studentsInStep = students.filter(
              (student) => getStudentStepId(student.id) === step.id
            );
            const hasNextStep = index < activeSteps.length - 1;
            const isDropTarget = dragOverStepId === step.id;

            return (
              <section
                key={step.id}
                aria-label={`Step ${index + 1}: ${step.label}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragOverStepId !== step.id) {
                    setDragOverStepId(step.id);
                  }
                }}
                onDragLeave={() => {
                  if (dragOverStepId === step.id) {
                    setDragOverStepId(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedId =
                    e.dataTransfer.getData('text/plain') || draggedStudentId;
                  if (droppedId) {
                    onMoveStudentToStep(droppedId, step.id);
                  }
                  setDraggedStudentId(null);
                  setDragOverStepId(null);
                }}
                className={`w-[260px] flex flex-col rounded-2xl bg-white border transition-colors overflow-hidden ${
                  isDropTarget
                    ? 'border-sky-500 ring-2 ring-sky-400/50 bg-sky-50/30'
                    : 'border-slate-200'
                }`}
              >
                {/* Top Color Strip */}
                <div className={`h-2 w-full ${theme.topAccent}`} />

                {/* Step Header with Clipart */}
                <div className={`p-4 border-b border-slate-200 ${theme.headerBg}`}>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold tabular-nums ${theme.badgeText}`}
                    >
                      <StepGlyph iconKey={step.iconKey} className="w-3.5 h-3.5" />
                      <span>Step {index + 1}</span>
                    </span>
                    <span className="text-xs font-bold tabular-nums text-slate-700">
                      {studentsInStep.length}{' '}
                      {studentsInStep.length === 1 ? 'writer' : 'writers'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <ClipartImage
                      src={step.imageUrl}
                      alt={step.label}
                      iconKey={step.iconKey}
                      colorKey={step.colorKey}
                      className="w-16 h-16 border border-slate-200/80 shadow-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-bold text-slate-900 text-base leading-tight">
                        {step.label}
                      </h3>
                      {showEllGuides && (
                        <p className="text-xs text-slate-700 mt-1 leading-snug">
                          {step.ellCue}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Student Cards Stack */}
                <div className="flex-1 p-3 space-y-2.5 bg-slate-50/50 min-h-[260px]">
                  {studentsInStep.length === 0 ? (
                    <div className="h-full min-h-[120px] rounded-xl border border-dashed border-slate-200 flex items-center justify-center p-4 text-center">
                      <p className="text-xs text-slate-400">
                        No writers on this step
                      </p>
                    </div>
                  ) : (
                    studentsInStep.map((student) => {
                      const prog = progressByStudentId[student.id];
                      const needsHelp = prog?.needsConference ?? false;
                      const folderDone = prog?.folderOrganized ?? false;

                      return (
                        <div
                          key={student.id}
                          draggable
                          onDragStart={(e) => {
                            setDraggedStudentId(student.id);
                            e.dataTransfer.setData('text/plain', student.id);
                          }}
                          onDragEnd={() => {
                            setDraggedStudentId(null);
                            setDragOverStepId(null);
                          }}
                          className="group bg-white rounded-xl border border-slate-200 hover:border-sky-300 shadow-2xs transition-all flex items-center justify-between gap-2 p-2.5"
                        >
                          <button
                            type="button"
                            onClick={() => onOpenStudentModal(student.id)}
                            className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg p-0.5"
                          >
                            <StudentSticker sticker={student.sticker} size="md" />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-900 text-sm truncate">
                                {student.name}
                              </p>
                              {(needsHelp || folderDone) && (
                                <div className="flex items-center gap-2 mt-0.5 text-[11px] font-semibold">
                                  {needsHelp && (
                                    <span className="inline-flex items-center gap-1 text-amber-700">
                                      <Hand className="w-3 h-3" aria-hidden="true" />
                                      <span>Help</span>
                                    </span>
                                  )}
                                  {needsHelp && folderDone && (
                                    <span className="text-slate-300" aria-hidden="true">
                                      ·
                                    </span>
                                  )}
                                  {folderDone && (
                                    <span className="inline-flex items-center gap-1 text-emerald-700">
                                      <FolderCheck className="w-3 h-3" aria-hidden="true" />
                                      <span>Folder</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </button>

                          {hasNextStep && (
                            <button
                              type="button"
                              onClick={() => onAdvanceStudent(student.id)}
                              title={`Move ${student.name} to ${activeSteps[index + 1].shortLabel}`}
                              aria-label={`Move ${student.name} to next step: ${activeSteps[index + 1].label}`}
                              className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-sky-600 text-slate-600 hover:text-white inline-flex items-center justify-center transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
