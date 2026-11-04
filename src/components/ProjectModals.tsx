import React, { useEffect, useState } from 'react';
import { X, ArrowUpRight, Check, Copy, Plus } from 'lucide-react';
import { ProjectCategory, ProjectItem, SpeakingEngagement } from '../data/portfolioData';
import { EditorialVisualPlate } from './VisualPlates';

interface ProjectLightboxProps {
  project: ProjectItem | null;
  onClose: () => void;
  onInquireAboutProject: (projectTitle: string) => void;
}

export const ProjectLightboxModal: React.FC<ProjectLightboxProps> = ({
  project,
  onClose,
  onInquireAboutProject
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  const handleCopyBrief = () => {
    const text = `${project.title} (${project.organization}, ${project.year})\nRole: ${project.role}\n\n${project.summary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#FAF9F6] text-[#141413] rounded-t-2xl sm:rounded-2xl border border-[#E6E4DD] overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header Bar */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#E6E4DD] bg-white shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#575652] font-mono truncate">
            <span>{project.organization}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{project.year}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close case study"
            className="w-10 h-10 rounded-lg border border-[#E6E4DD] flex items-center justify-center text-[#141413] hover:bg-[#141413] hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6">
          <EditorialVisualPlate
            theme={project.visualTheme}
            customImageUrl={project.customImageUrl}
            title={project.title}
            className="w-full h-52 sm:h-64 rounded-xl"
          />

          <div className="space-y-2 border-b border-[#E6E4DD] pb-6">
            <div className="text-xs font-mono text-[#1D4ED8]">{project.role}</div>
            <h2
              id="modal-project-title"
              className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#141413]"
            >
              {project.title}
            </h2>
            <p className="text-sm sm:text-base text-[#3F3E3A] leading-relaxed">{project.summary}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-[#E6E4DD] pb-6">
            <div className="space-y-1.5">
              <h3 className="text-xs font-mono text-[#575652]">01 · CHALLENGE</h3>
              <p className="text-sm text-[#3F3E3A] leading-relaxed">{project.challenge}</p>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xs font-mono text-[#575652]">02 · INTERVENTION</h3>
              <p className="text-sm text-[#3F3E3A] leading-relaxed">{project.intervention}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-xs font-mono text-[#575652]">KEY IMPACT</h3>
              <ul className="space-y-1.5">
                {project.impactMetrics.map((metric, idx) => (
                  <li key={idx} className="text-sm text-[#141413] flex items-start gap-2">
                    <span className="font-mono text-xs text-[#1D4ED8] pt-0.5">0{idx + 1}</span>
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-mono text-[#575652]">DELIVERABLES</h3>
              <ul className="space-y-1.5">
                {project.deliverables.map((item, idx) => (
                  <li key={idx} className="text-sm text-[#3F3E3A] flex items-start gap-2">
                    <span className="font-mono text-xs text-[#575652]">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#E6E4DD] bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopyBrief}
            className="px-3.5 py-2 text-xs font-medium text-[#141413] border border-[#E6E4DD] rounded-lg hover:bg-[#FAF9F6] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Summary'}
          </button>

          <button
            type="button"
            onClick={() => {
              const title = project.title;
              onClose();
              onInquireAboutProject(title);
            }}
            className="px-4 py-2.5 text-xs font-medium text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            Enquire About Similar Work
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface SpeakingReaderModalProps {
  item: SpeakingEngagement | null;
  onClose: () => void;
  onBookTopic: (topicTitle: string) => void;
}

export const SpeakingReaderModal: React.FC<SpeakingReaderModalProps> = ({ item, onClose, onBookTopic }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (item) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-speaking-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#FAF9F6] text-[#141413] rounded-t-2xl sm:rounded-2xl border border-[#E6E4DD] overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#E6E4DD] bg-white shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#575652] font-mono truncate">
            <span>{item.format}</span>
            <span aria-hidden="true">·</span>
            <span>{item.date}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-10 h-10 rounded-lg border border-[#E6E4DD] flex items-center justify-center text-[#141413] hover:bg-[#141413] hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-8 overflow-y-auto space-y-5">
          <div className="space-y-1.5 border-b border-[#E6E4DD] pb-5">
            <div className="text-xs font-mono text-[#1D4ED8]">
              {item.event} · {item.location}
            </div>
            <h2
              id="modal-speaking-title"
              className="text-xl sm:text-2xl font-display font-bold tracking-tight text-[#141413]"
            >
              {item.title}
            </h2>
          </div>

          <div className="space-y-3">
            {item.fullText.map((paragraph, index) => (
              <p key={index} className="text-sm sm:text-base text-[#272725] leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="bg-white border border-[#E6E4DD] rounded-xl p-5 space-y-2.5">
            <h3 className="text-xs font-mono text-[#575652]">KEY TAKEAWAYS</h3>
            <ul className="space-y-1.5">
              {item.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="text-sm text-[#3F3E3A] flex items-start gap-2">
                  <span className="font-mono text-xs text-[#1D4ED8] pt-0.5">0{idx + 1}.</span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-[#E6E4DD] bg-white flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              const title = item.title;
              onClose();
              onBookTopic(title);
            }}
            className="px-4 py-2.5 text-xs font-medium text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            Book This Talk
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (newProject: ProjectItem) => void;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onAddProject }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<ProjectCategory, 'All'>>('WCAG & Accessibility');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('Accessibility Consultant');
  const [year, setYear] = useState('2026');
  const [summary, setSummary] = useState('');
  const [outcome, setOutcome] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;

    const created: ProjectItem = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      subtitle: organization.trim() || 'Inclusion Mandate',
      category,
      year: year.trim() || '2026',
      organization: organization.trim() || 'Advisory',
      role: role.trim() || 'Lead Strategist',
      visualTheme:
        category === 'D&I Strategy'
          ? 'council'
          : category === 'Workforce & Tech'
            ? 'fintech'
            : 'audit',
      summary: summary.trim(),
      challenge: 'Addressing structural accessibility and inclusion barriers across systems.',
      intervention: 'Implemented WCAG standards and inclusive governance frameworks.',
      impactMetrics: [outcome.trim() || 'Full WCAG accessibility and inclusion parity achieved'],
      deliverables: ['Audit & Strategy Specification', 'Implementation Roadmap']
    };

    onAddProject(created);
    setTitle('');
    setOrganization('');
    setSummary('');
    setOutcome('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-project-heading"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#FAF9F6] text-[#141413] rounded-t-2xl sm:rounded-2xl border border-[#E6E4DD] overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E6E4DD] bg-white">
          <h2 id="add-project-heading" className="text-base font-display font-semibold">
            Add Case Study
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="w-9 h-9 rounded-lg border border-[#E6E4DD] flex items-center justify-center hover:bg-[#141413] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="proj-title" className="block text-xs font-medium text-[#141413] mb-1">
                Project Title *
              </label>
              <input
                id="proj-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Platform WCAG Audit"
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#E6E4DD] rounded-lg"
              />
            </div>

            <div>
              <label htmlFor="proj-category" className="block text-xs font-medium text-[#141413] mb-1">
                Category
              </label>
              <select
                id="proj-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Exclude<ProjectCategory, 'All'>)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#E6E4DD] rounded-lg"
              >
                <option value="WCAG & Accessibility">WCAG & Accessibility</option>
                <option value="D&I Strategy">D&I Strategy</option>
                <option value="Workforce & Tech">Workforce & Tech</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="proj-org" className="block text-xs font-medium text-[#141413] mb-1">
                Organization
              </label>
              <input
                id="proj-org"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Rushbox"
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#E6E4DD] rounded-lg"
              />
            </div>

            <div>
              <label htmlFor="proj-role" className="block text-xs font-medium text-[#141413] mb-1">
                Role
              </label>
              <input
                id="proj-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#E6E4DD] rounded-lg"
              />
            </div>

            <div>
              <label htmlFor="proj-year" className="block text-xs font-medium text-[#141413] mb-1">
                Year
              </label>
              <input
                id="proj-year"
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono bg-white border border-[#E6E4DD] rounded-lg"
              />
            </div>
          </div>

          <div>
            <label htmlFor="proj-summary" className="block text-xs font-medium text-[#141413] mb-1">
              One-Line Summary *
            </label>
            <input
              id="proj-summary"
              type="text"
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Concise 1-sentence description..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#E6E4DD] rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="proj-outcome" className="block text-xs font-medium text-[#141413] mb-1">
              Key Metric / Outcome
            </label>
            <input
              id="proj-outcome"
              type="text"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="e.g. 200+ Community Members Scaled"
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#E6E4DD] rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-[#E6E4DD] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#575652] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-[#1D4ED8] rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
