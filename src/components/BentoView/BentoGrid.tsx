import React, { useState } from 'react';
import { 
  Folder, 
  Lock, 
  Globe, 
  Star, 
  GitFork, 
  MoveRight, 
  ExternalLink, 
  Plus, 
  Edit2, 
  Trash2, 
  Layers, 
  GripVertical,
  Code2
} from 'lucide-react';
import { GitHubRepo, VirtualFolder } from '../../types';
import { getFolderColor, LANGUAGE_COLORS } from '../../data/constants';

interface BentoGridProps {
  folders: VirtualFolder[];
  repos: GitHubRepo[];
  filteredRepos: GitHubRepo[];
  selectedRepoId: number | null;
  onSelectRepo: (repo: GitHubRepo) => void;
  onMoveRepo: (repoId: number, targetFolderId: string | null) => void;
  onEditFolder: (folder: VirtualFolder) => void;
  onDeleteFolder: (folderId: string) => void;
  onOpenNewFolder: () => void;
  onOpenMoveModal: (repo: GitHubRepo) => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  folders,
  repos,
  filteredRepos,
  selectedRepoId,
  onSelectRepo,
  onMoveRepo,
  onEditFolder,
  onDeleteFolder,
  onOpenNewFolder,
  onOpenMoveModal,
}) => {
  const [draggedRepoId, setDraggedRepoId] = useState<number | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | 'unfiled' | null>(null);

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, repoId: number) => {
    e.dataTransfer.setData('text/plain', repoId.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggedRepoId(repoId);
  };

  const handleDragEnd = () => {
    setDraggedRepoId(null);
    setDragOverFolderId(null);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string | 'unfiled') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverFolderId !== targetId) {
      setDragOverFolderId(targetId);
    }
  };

  const handleDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    const repoIdStr = e.dataTransfer.getData('text/plain');
    const repoId = parseInt(repoIdStr, 10);
    if (!isNaN(repoId)) {
      onMoveRepo(repoId, targetFolderId);
    }
    setDraggedRepoId(null);
    setDragOverFolderId(null);
  };

  // Find unfiled repos
  const allAssignedIds = new Set(folders.flatMap((f) => f.repoIds));
  const unfiledRepos = filteredRepos.filter((r) => !allAssignedIds.has(r.id));

  // Compute language distribution for a folder
  const getFolderLanguages = (folderRepoIds: number[]) => {
    const langCounts: Record<string, number> = {};
    const folderRepos = repos.filter((r) => folderRepoIds.includes(r.id));
    folderRepos.forEach((r) => {
      if (r.language) {
        langCounts[r.language] = (langCounts[r.language] || 0) + 1;
      }
    });
    return Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#080B11]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {folders.map((folder) => {
            const color = getFolderColor(folder.colorId);
            const folderRepos = filteredRepos.filter((r) => folder.repoIds.includes(r.id));
            const totalInFolder = folder.repoIds.length;
            const topLanguages = getFolderLanguages(folder.repoIds);
            const parent = folders.find((f) => f.id === folder.parentId);
            const isDragTarget = dragOverFolderId === folder.id;

            return (
              <div
                key={folder.id}
                onDragOver={(e) => handleDragOver(e, folder.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, folder.id)}
                className={`rounded-2xl border transition-all flex flex-col overflow-hidden bg-slate-900/50 backdrop-blur-sm ${
                  isDragTarget
                    ? 'ring-2 ring-indigo-400 bg-indigo-950/20 border-indigo-400'
                    : color.borderClass
                } ${color.glowClass}`}
              >
                {/* Folder Bento Header */}
                <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-white truncate">
                            {folder.name}
                          </h3>
                        </div>
                        {parent && (
                          <div className="text-[10px] text-slate-500 truncate">
                            Subfolder of {parent.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEditFolder(folder)}
                        className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Edit Folder"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteFolder(folder.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Delete Folder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {folder.description && (
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-1">
                      {folder.description}
                    </p>
                  )}

                  {/* Quick stats strip */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                    <span className="text-[11px] text-slate-300 font-semibold">
                      {folderRepos.length} {folderRepos.length === 1 ? 'repo' : 'repos'}
                      {totalInFolder !== folderRepos.length && ` (${totalInFolder} total)`}
                    </span>

                    {/* Language dots */}
                    <div className="flex items-center gap-2">
                      {topLanguages.map(([lang]) => (
                        <div key={lang} className="flex items-center gap-1 text-[10px] text-slate-400">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: LANGUAGE_COLORS[lang] || '#64748B' }}
                          />
                          <span>{lang}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Folder Repos List inside Bento Card */}
                <div className="p-3 flex-1 overflow-y-auto max-h-80 space-y-1.5">
                  {folderRepos.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800/70 rounded-xl">
                      Drop repositories here to assign
                    </div>
                  ) : (
                    folderRepos.map((repo) => {
                      const isSelected = selectedRepoId === repo.id;
                      const isBeingDragged = draggedRepoId === repo.id;

                      return (
                        <div
                          key={repo.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, repo.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => onSelectRepo(repo)}
                          className={`group flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isBeingDragged
                              ? 'opacity-30 border-dashed border-indigo-400'
                              : isSelected
                              ? 'border-indigo-500 bg-slate-800/90 shadow-sm'
                              : 'border-slate-800/60 bg-slate-950/40 hover:bg-slate-800/60 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 cursor-grab shrink-0" />
                            {repo.private ? (
                              <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                            ) : (
                              <Code2 className="w-3 h-3 text-sky-400 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="font-mono font-medium text-slate-200 truncate group-hover:text-white">
                                {repo.name}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-slate-400 shrink-0 ml-2">
                            {repo.language && (
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#64748B' }}
                                title={repo.language}
                              />
                            )}
                            {repo.stargazers_count > 0 && (
                              <span className="text-[10px] font-mono tabular-nums text-slate-400 flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 text-amber-400/80" />
                                {repo.stargazers_count}
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenMoveModal(repo);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white rounded"
                              title="Move"
                            >
                              <MoveRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Unfiled Repositories Section */}
        {unfiledRepos.length > 0 && (
          <div
            onDragOver={(e) => handleDragOver(e, 'unfiled')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, null)}
            className={`rounded-2xl border border-dashed transition-all p-5 ${
              dragOverFolderId === 'unfiled'
                ? 'border-amber-400 bg-amber-950/20 ring-2 ring-amber-400/50'
                : 'border-slate-800 bg-slate-900/30'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border border-dashed border-amber-400 bg-amber-400/20" />
                <h3 className="text-sm font-bold text-white">
                  Unfiled Repositories ({unfiledRepos.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Drag any repository into the folders above, or use the move button
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {unfiledRepos.map((repo) => {
                const isSelected = selectedRepoId === repo.id;
                const isBeingDragged = draggedRepoId === repo.id;

                return (
                  <div
                    key={repo.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, repo.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onSelectRepo(repo)}
                    className={`group flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isBeingDragged
                        ? 'opacity-30 border-dashed border-indigo-400'
                        : isSelected
                        ? 'border-indigo-500 bg-slate-800/90 shadow-sm'
                        : 'border-slate-800/70 bg-slate-950/40 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 cursor-grab shrink-0" />
                      {repo.private ? (
                        <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                      ) : (
                        <Code2 className="w-3 h-3 text-sky-400 shrink-0" />
                      )}
                      <span className="font-mono font-medium text-slate-200 truncate group-hover:text-white">
                        {repo.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 shrink-0 ml-2">
                      {repo.language && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#64748B' }}
                          title={repo.language}
                        />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenMoveModal(repo);
                        }}
                        className="p-1 text-slate-400 hover:text-white rounded"
                        title="Move to Folder"
                      >
                        <MoveRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
