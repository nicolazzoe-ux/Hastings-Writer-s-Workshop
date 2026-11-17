import React from 'react';
import {
  ArrowRight,
  Check,
  FolderCheck,
  Hand,
  PartyPopper,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { STEP_COLOR_THEMES } from '../data/stepLibrary';
import { Student, StudentProgress, WritingStep } from '../types/writing';
import { ClipartImage, StepGlyph } from './ClipartImage';
import { StudentSticker } from './StudentSticker';

interface StudentStepModalProps {
  student: Student;
  progress: StudentProgress;
  activeSteps: WritingStep[];
  showEllGuides: boolean;
  onSelectStep: (stepId: string) => void;
  onToggleHelp: () => void;
  onToggleFolderOrganized: () => void;
  onClose: () => void;
}

export function StudentStepModal({
  student,
  progress,
  activeSteps,
  showEllGuides,
  onSelectStep,
  onToggleHelp,
  onToggleFolderOrganized,
  onClose,
}: StudentStepModalProps) {
  const currentIndex = activeSteps.findIndex((s) => s.id === progress.stepId);
  const currentStep =
    currentIndex >= 0 ? activeSteps[currentIndex] : activeSteps[0];
  const nextStep =
    currentIndex >= 0 && currentIndex < activeSteps.length - 1
      ? activeSteps[currentIndex + 1]
      : null;

  const isFinished =
    currentStep?.id === 'published' || currentStep?.id === 'writing-folder';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-modal-title"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3.5 min-w-0">
            <StudentSticker sticker={student.sticker} size="lg" />
            <div className="min-w-0">
              <h2
                id="student-modal-title"
                className="text-xl sm:text-2xl font-bold text-slate-900 truncate"
              >
                Hi, {student.name}!
              </h2>
              <p className="text-sm text-slate-600">
                Tap the picture that shows where you are in your writing today.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 inline-flex items-center justify-center transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            aria-label="Close window"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Quick Next Step / Celebration Banner */}
          {isFinished ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <PartyPopper className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-bold text-indigo-950 text-base">
                    Awesome writing work, {student.name}!
                  </p>
                  <p className="text-sm text-indigo-800">
                    You reached {currentStep?.label}. Great job!
                  </p>
                </div>
              </div>
              {nextStep && (
                <button
                  type="button"
                  onClick={() => onSelectStep(nextStep.id)}
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Go to {nextStep.shortLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : nextStep ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-sky-50 border border-sky-200">
              <div className="flex items-center gap-3">
                <ClipartImage
                  src={currentStep.imageUrl}
                  alt={currentStep.label}
                  iconKey={currentStep.iconKey}
                  colorKey={currentStep.colorKey}
                  className="w-12 h-12 border border-sky-200"
                />
                <div>
                  <p className="text-xs font-semibold text-sky-700">
                    Right now you are on Step {currentIndex + 1} of{' '}
                    {activeSteps.length}
                  </p>
                  <p className="font-bold text-slate-900 text-base">
                    {currentStep.label}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectStep(nextStep.id)}
                className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>I am ready for {nextStep.shortLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : null}

          {/* Giant Illustrated Step Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {activeSteps.map((step, index) => {
              const isSelected = step.id === progress.stepId;
              const theme = STEP_COLOR_THEMES[step.colorKey];

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onSelectStep(step.id)}
                  className={`group relative text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${theme.ringFocus} ${
                    isSelected
                      ? `${theme.softBg} ${theme.border} ring-2 ring-offset-1 ring-sky-500`
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <ClipartImage
                      src={step.imageUrl}
                      alt={step.label}
                      iconKey={step.iconKey}
                      colorKey={step.colorKey}
                      className="w-16 h-16 border border-slate-200"
                    />
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-bold tabular-nums inline-flex items-center gap-1 ${theme.badgeText}`}
                        >
                          <StepGlyph iconKey={step.iconKey} className="w-3.5 h-3.5" />
                          <span>Step {index + 1}</span>
                        </span>
                        {isSelected && (
                          <span className="w-6 h-6 rounded-full bg-sky-600 text-white inline-flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <p className="font-display font-bold text-slate-900 text-base leading-snug mt-0.5">
                        {step.label}
                      </p>
                      {showEllGuides && (
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {step.ellCue}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Kid-friendly Help & Folder Quick Toggles */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onToggleHelp}
                className={`px-4 py-2.5 rounded-xl border text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  progress.needsConference
                    ? 'bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Hand className="w-4 h-4" />
                <span>
                  {progress.needsConference
                    ? 'Hand Raised: Waiting for Teacher'
                    : 'I Need Teacher Help'}
                </span>
              </button>

              <button
                type="button"
                onClick={onToggleFolderOrganized}
                className={`px-4 py-2.5 rounded-xl border text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  progress.folderOrganized
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FolderCheck className="w-4 h-4" />
                <span>
                  {progress.folderOrganized
                    ? 'Writing Folder Organized'
                    : 'Mark Writing Folder Organized'}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
