import React, { useMemo, useRef, useState } from 'react';
import {
  Download,
  FolderCheck,
  Hand,
  Printer,
  Upload,
} from 'lucide-react';
import { STEP_COLOR_THEMES } from '../data/stepLibrary';
import {
  ClassroomState,
  Student,
  StudentProgress,
  WritingProject,
  WritingStep,
} from '../types/writing';
import { ClipartImage } from './ClipartImage';
import { StudentSticker } from './StudentSticker';

interface TeacherMonitorViewProps {
  classroom: ClassroomState;
  project: WritingProject;
  activeSteps: WritingStep[];
  onMoveStudentToStep: (studentId: string, stepId: string) => void;
  onToggleConference: (studentId: string) => void;
  onToggleFolderOrganized: (studentId: string) => void;
  onUpdateTeacherNote: (studentId: string, note: string) => void;
  onImportBackup: (imported: ClassroomState) => void;
}

type MonitorFilter = 'all' | 'needs-help' | 'folder-pending' | 'published';

export function TeacherMonitorView({
  classroom,
  project,
  activeSteps,
  onMoveStudentToStep,
  onToggleConference,
  onToggleFolderOrganized,
  onUpdateTeacherNote,
  onImportBackup,
}: TeacherMonitorViewProps) {
  const [filter, setFilter] = useState<MonitorFilter>('all');
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fallbackStepId = activeSteps[0]?.id ?? '';

  const getProgress = (studentId: string): StudentProgress => {
    const existing = project.progressByStudentId[studentId];
    if (existing) {
      const validStep = activeSteps.some((s) => s.id === existing.stepId)
        ? existing.stepId
        : fallbackStepId;
      return { ...existing, stepId: validStep };
    }
    return {
      stepId: fallbackStepId,
      needsConference: false,
      teacherNote: '',
      folderOrganized: false,
      updatedAt: project.createdAt,
    };
  };

  const stepCounts = useMemo(() => {
    return activeSteps.map((step) => {
      const count = classroom.students.filter(
        (stu) => getProgress(stu.id).stepId === step.id
      ).length;
      const pct =
        classroom.students.length > 0
          ? Math.round((count / classroom.students.length) * 100)
          : 0;
      return { step, count, pct };
    });
  }, [activeSteps, classroom.students, project.progressByStudentId]);

  const filteredStudents = useMemo(() => {
    return classroom.students.filter((stu) => {
      const prog = getProgress(stu.id);
      if (filter === 'needs-help') return prog.needsConference;
      if (filter === 'folder-pending') return !prog.folderOrganized;
      if (filter === 'published')
        return prog.stepId === 'published' || prog.stepId === 'writing-folder';
      return true;
    });
  }, [classroom.students, filter, project.progressByStudentId]);

  const helpCount = classroom.students.filter(
    (s) => getProgress(s.id).needsConference
  ).length;
  const folderReadyCount = classroom.students.filter(
    (s) => getProgress(s.id).folderOrganized
  ).length;

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(classroom, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeYear = classroom.schoolYear.replace(/[^a-zA-Z0-9-_]/g, '_');
    a.download = `hastings-writers-backup-${safeYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as ClassroomState;
        if (
          parsed &&
          Array.isArray(parsed.students) &&
          Array.isArray(parsed.projects) &&
          parsed.projects.length > 0
        ) {
          onImportBackup(parsed);
          setImportMessage('Class backup restored successfully.');
        } else {
          setImportMessage('That file does not look like a Hastings Writers backup.');
        }
      } catch {
        setImportMessage('Could not read that JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Summary Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-xl text-slate-900">
              Class Progress Snapshot
            </h2>
            <p className="text-sm text-slate-600 tabular-nums">
              {classroom.students.length} total writers · {helpCount} requesting
              conference · {folderReadyCount} writing folders organized
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 no-print">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              <span>Print Clipboard Sheet</span>
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Export Backup</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              <span>Import Backup</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {importMessage && (
          <p className="text-xs font-medium text-sky-800 bg-sky-50 border border-sky-200 rounded-xl px-3.5 py-2">
            {importMessage}
          </p>
        )}

        {/* Step Distribution Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {stepCounts.map(({ step, count, pct }, idx) => {
            const theme = STEP_COLOR_THEMES[step.colorKey];
            return (
              <div
                key={step.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-3"
              >
                <ClipartImage
                  src={step.imageUrl}
                  alt={step.label}
                  iconKey={step.iconKey}
                  colorKey={step.colorKey}
                  className="w-11 h-11 border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-800 truncate">
                      {idx + 1}. {step.shortLabel}
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums shrink-0">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full transition-all ${theme.barFill}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs + Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: `All Writers (${classroom.students.length})` },
                { id: 'needs-help', label: `Needs Conference (${helpCount})` },
                {
                  id: 'folder-pending',
                  label: `Folder Needed (${classroom.students.length - folderReadyCount})`,
                },
                { id: 'published', label: 'Published / Folder Done' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors tabular-nums cursor-pointer whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Current Writing Step</th>
                <th className="py-3 px-4">Conference</th>
                <th className="py-3 px-4">Writing Folder</th>
                <th className="py-3 px-4 min-w-[240px]">Teacher Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 px-4 text-center text-slate-500 text-sm"
                  >
                    No students match this filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student: Student) => {
                  const prog = getProgress(student.id);
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <StudentSticker sticker={student.sticker} size="sm" />
                          <span className="font-semibold text-slate-900 whitespace-nowrap">
                            {student.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          aria-label={`Writing step for ${student.name}`}
                          value={prog.stepId}
                          onChange={(e) =>
                            onMoveStudentToStep(student.id, e.target.value)
                          }
                          className="w-full max-w-[240px] px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          {activeSteps.map((step, i) => (
                            <option key={step.id} value={step.id}>
                              {i + 1}. {step.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => onToggleConference(student.id)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                            prog.needsConference
                              ? 'bg-amber-100 border-amber-300 text-amber-900'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Hand className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>
                            {prog.needsConference ? 'Needs Help' : 'On Track'}
                          </span>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => onToggleFolderOrganized(student.id)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                            prog.folderOrganized
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <FolderCheck className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>
                            {prog.folderOrganized ? 'Organized' : 'Not Yet'}
                          </span>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={prog.teacherNote}
                          onChange={(e) =>
                            onUpdateTeacherNote(student.id, e.target.value)
                          }
                          placeholder="Add quick conference note..."
                          aria-label={`Teacher note for ${student.name}`}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
