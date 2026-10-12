import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Lock, 
  Globe, 
  GitFork, 
  Star, 
  Folder, 
  FileText, 
  GitBranch, 
  Calendar, 
  HardDrive, 
  Tag, 
  Sparkles,
  MoveRight,
  BookOpen
} from 'lucide-react';
import { GitHubRepo, VirtualFolder } from '../types';
import { getFolderColor, LANGUAGE_COLORS } from '../data/constants';
import { fetchRepoReadme } from '../services/github';

interface RepoInspectorProps {
  repo: GitHubRepo | null;
  folders: VirtualFolder[];
  notes: Record<number, string>;
  onSaveNote: (repoId: number, note: string) => void;
  onOpenMoveModal: (repo: GitHubRepo) => void;
  onClose: () => void;
  token?: string;
}

export const RepoInspector: React.FC<RepoInspectorProps> = ({
  repo,
  folders,
  notes,
  onSaveNote,
  onOpenMoveModal,
  onClose,
  token,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'readme'>('info');
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [isLoadingReadme, setIsLoadingReadme] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [copiedClone, setCopiedClone] = useState(false);

  useEffect(() => {
    if (repo) {
      setNoteText(notes[repo.id] || '');
      setReadmeContent('');

      // Fetch README if opened
      setIsLoadingReadme(true);
      fetchRepoReadme(repo.full_name, token)
        .then((content) => {
          setReadmeContent(content);
        })
        .finally(() => {
          setIsLoadingReadme(false);
        });
    }
  }, [repo?.id, token]);

  // Handle note change with debounce or onBlur
  const handleNoteBlur = () => {
    if (repo) {
      onSaveNote(repo.id, noteText);
    }
  };

  if (!repo) return null;

  const currentFolder = folders.find((f) => f.repoIds.includes(repo.id));
  const folderColor = currentFolder ? getFolderColor(currentFolder.colorId) : null;
  const cloneCommand = `git clone ${repo.html_url}.git`;

  const handleCopyClone = () => {
    navigator.clipboard.writeText(cloneCommand);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const formattedPushed = new Date(repo.pushed_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedSize = (repo.size / 1024).toFixed(1);

  return (
    <div className="w-full lg:w-96 border-l border-slate-800 bg-[#0E1522] flex flex-col h-full shrink-0 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-start justify-between gap-3 bg-slate-900/60">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            {repo.private ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
                <Lock className="w-2.5 h-2.5" />
                Private
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-400 bg-sky-500/10 border border-sky-500/30 px-1.5 py-0.5 rounded">
                <Globe className="w-2.5 h-2.5" />
                Public
              </span>
            )}

            {repo.fork && (
              <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                Fork
              </span>
            )}

            {repo.archived && (
              <span className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.5 rounded">
                Archived
              </span>
            )}
          </div>

          <h2 className="text-sm font-bold text-white truncate font-mono" title={repo.name}>
            {repo.name}
          </h2>
          <div className="text-[11px] text-slate-400 truncate">{repo.full_name}</div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs px-3 pt-2 gap-2">
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-2 px-2 font-medium border-b-2 transition-colors ${
            activeTab === 'info'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Details & Notes
        </button>
        <button
          onClick={() => setActiveTab('readme')}
          className={`pb-2 px-2 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'readme'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>README</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'info' ? (
          <>
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition-colors shadow-sm"
              >
                <span>Open in GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => onOpenMoveModal(repo)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors border border-slate-700/60"
                title="Change Virtual Folder"
              >
                <MoveRight className="w-3.5 h-3.5 text-indigo-400" />
                <span>Move</span>
              </button>
            </div>

            {/* Folder Location Banner */}
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                Current Folder Location
              </div>
              {currentFolder ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: folderColor?.hex }}
                    />
                    <span className="text-xs font-medium text-slate-200">
                      {currentFolder.name}
                    </span>
                  </div>
                  <button
                    onClick={() => onOpenMoveModal(repo)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Root / Unfiled</span>
                  <button
                    onClick={() => onOpenMoveModal(repo)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Assign Folder
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                Description
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                {repo.description || <span className="text-slate-500 italic">No description provided on GitHub.</span>}
              </p>
            </div>

            {/* Git Clone Command */}
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                Clone URL
              </div>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-1">
                <input
                  type="text"
                  readOnly
                  value={cloneCommand}
                  className="bg-transparent text-[11px] font-mono text-slate-300 px-2 py-1 flex-1 outline-none select-all"
                />
                <button
                  onClick={handleCopyClone}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                  title="Copy git clone"
                >
                  {copiedClone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Metadata Stats Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-950/50 border border-slate-800/60 rounded-xl">
                <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mb-1">
                  <Star className="w-3 h-3 text-amber-400" />
                  <span>Stars & Forks</span>
                </div>
                <div className="font-mono text-slate-200 tabular-nums">
                  {repo.stargazers_count} ★ · {repo.forks_count} ⑂
                </div>
              </div>

              <div className="p-2.5 bg-slate-950/50 border border-slate-800/60 rounded-xl">
                <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mb-1">
                  <GitBranch className="w-3 h-3 text-indigo-400" />
                  <span>Default Branch</span>
                </div>
                <div className="font-mono text-slate-200 truncate">
                  {repo.default_branch}
                </div>
              </div>

              <div className="p-2.5 bg-slate-950/50 border border-slate-800/60 rounded-xl">
                <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Last Pushed</span>
                </div>
                <div className="text-slate-200 text-[11px] truncate">
                  {formattedPushed}
                </div>
              </div>

              <div className="p-2.5 bg-slate-950/50 border border-slate-800/60 rounded-xl">
                <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mb-1">
                  <HardDrive className="w-3 h-3 text-slate-400" />
                  <span>Disk Size</span>
                </div>
                <div className="font-mono text-slate-200 tabular-nums">
                  {formattedSize} MB
                </div>
              </div>
            </div>

            {/* Language */}
            {repo.language && (
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                  Primary Language
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#64748B' }}
                  />
                  <span>{repo.language}</span>
                </div>
              </div>
            )}

            {/* Topics */}
            {repo.topics && repo.topics.length > 0 && (
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
                  Topics
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {repo.topics.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/70 text-slate-300 border border-slate-700/50"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* User Custom Notes */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Personal Notes & Uni Deadlines</span>
                </label>
                <span className="text-[10px] text-slate-500">Auto-saved</span>
              </div>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onBlur={handleNoteBlur}
                placeholder="e.g. Due next Friday! Assignment 3 requires testing on Linux kernel..."
                rows={3}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 rounded-xl text-slate-200 placeholder:text-slate-600 outline-none resize-none"
              />
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {isLoadingReadme ? (
              <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
                Fetching README from GitHub...
              </div>
            ) : readmeContent ? (
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px]">
                {readmeContent}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                No README.md found in repository.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
