import React, { useMemo, useState } from 'react';
import { ArrowRight, FolderCheck, Hand, Search } from 'lucide-react';
import { STEP_COLOR_THEMES } from '../data/stepLibrary';
import { Student, StudentProgress, WritingStep } from '../types/writing';
import { ClipartImage } from './ClipartImage';
import { StudentSticker } from './StudentSticker';

interface StudentCardsGridProps {
  activeSteps: WritingStep[];
  students: Student[];
  progressByStudentId: Record<string, StudentProgress>;
  showEllGuides: boolean;
  onOpenStudentModal: (studentId: string) => void;
  onAdvanceStudent: (studentId: string) => void;
}

export function StudentCardsGrid({
  activeSteps,
  students,
  progressByStudentId,
  showEllGuides,
  onOpenStudentModal,
  onAdvanceStudent,
}: StudentCardsGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stepFilter, setStepFilter] = useState<string>('all');

  const fallbackStepId = activeSteps[0]?.id ?? '';

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const currentStepId =
        progressByStudentId[student.id]?.stepId &&
        activeSteps.some((s) => s.id === progressByStudentId[student.id]?.stepId)
          ? progressByStudentId[student.id].stepId
          : fallbackStepId;

      const matchesStep = stepFilter === 'all' || currentStepId === stepFilter;
      const matchesName = student.name
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
      return matchesStep && matchesName;
    });
  }, [students, progressByStudentId, activeSteps, fallbackStepId, stepFilter, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Search + Step Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full lg:max-w-xs">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find your name..."
            aria-label="Find student by name"
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <button
            type="button"
            onClick={() => setStepFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              stepFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All ({students.length})
          </button>
          {activeSteps.map((step) => {
            const count = students.filter((s) => {
              const sid = progressByStudentId[s.id]?.stepId;
              const resolved =
                sid && activeSteps.some((x) => x.id === sid) ? sid : fallbackStepId;
              return resolved === step.id;
            }).length;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setStepFilter(step.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 tabular-nums cursor-pointer ${
                  stepFilter === step.id
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {step.shortLabel} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Kiosk Student Cards */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="font-display font-bold text-slate-900 text-lg">
            No students match that filter
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Try clearing your search box or picking &ldquo;All&rdquo; steps.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((student) => {
            const prog = progressByStudentId[student.id];
            const currentIndex = Math.max(
              0,
              activeSteps.findIndex((s) => s.id === prog?.stepId)
            );
            const currentStep = activeSteps[currentIndex] ?? activeSteps[0];
            if (!currentStep) return null;

            const theme = STEP_COLOR_THEMES[currentStep.colorKey];
            const hasNextStep = currentIndex < activeSteps.length - 1;
            const needsHelp = prog?.needsConference ?? false;
            const folderDone = prog?.folderOrganized ?? false;

            return (
              <article
                key={student.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between transition-shadow hover:shadow-md"
              >
                <div>
                  <div className={`h-1.5 w-full ${theme.topAccent}`} />
                  <div className="p-4 space-y-4">
                    {/* Student Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <StudentSticker sticker={student.sticker} size="md" />
                        <h3 className="font-display font-bold text-slate-900 text-lg truncate">
                          {student.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
                        {needsHelp && (
                          <span
                            className="inline-flex items-center gap-1 text-amber-700"
                            title="Waiting for teacher conference"
                          >
                            <Hand className="w-4 h-4" aria-hidden="true" />
                            <span>Help</span>
                          </span>
                        )}
                        {folderDone && (
                          <span
                            className="inline-flex items-center gap-1 text-emerald-700"
                            title="Writing folder organized"
                          >
                            <FolderCheck className="w-4 h-4" aria-hidden="true" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Current Step Clipart Box */}
                    <button
                      type="button"
                      onClick={() => onOpenStudentModal(student.id)}
                      className={`w-full text-left p-3 rounded-xl border ${theme.border} ${theme.softBg} flex items-center gap-3 transition-colors hover:brightness-98 cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${theme.ringFocus}`}
                    >
                      <ClipartImage
                        src={currentStep.imageUrl}
                        alt={currentStep.label}
                        iconKey={currentStep.iconKey}
                        colorKey={currentStep.colorKey}
                        className="w-14 h-14 border border-slate-200/80"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold tabular-nums ${theme.badgeText}`}>
                          Step {currentIndex + 1} of {activeSteps.length}
                        </p>
                        <p className="font-display font-bold text-slate-900 text-sm leading-snug">
                          {currentStep.label}
                        </p>
                        {showEllGuides && (
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                            {currentStep.ellCue}
                          </p>
                        )}
                      </div>
                    </button>

                    {/* Progress Dots Strip */}
                    <div
                      className="flex items-center gap-1"
                      aria-label={`Progress: step ${currentIndex + 1} of ${activeSteps.length}`}
                    >
                      {activeSteps.map((s, idx) => {
                        const completedOrCurrent = idx <= currentIndex;
                        return (
                          <div
                            key={s.id}
                            title={s.label}
                            className={`h-2 flex-1 rounded-full transition-colors ${
                              completedOrCurrent ? theme.barFill : 'bg-slate-200'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="px-4 pb-4 pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenStudentModal(student.id)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Pick Step
                  </button>
                  {hasNextStep && (
                    <button
                      type="button"
                      onClick={() => onAdvanceStudent(student.id)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
