import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  Lock, 
  Globe, 
  Star, 
  GitFork, 
  MoreVertical, 
  Plus, 
  Trash2, 
  Edit2, 
  GripVertical, 
  Layers, 
  FolderPlus,
  MoveRight,
  ExternalLink,
  Code
} from 'lucide-react';
import { GitHubRepo, VirtualFolder } from '../../types';
import { getFolderColor, LANGUAGE_COLORS } from '../../data/constants';

interface ExplorerTreeProps {
  folders: VirtualFolder[];
  repos: GitHubRepo[];
  filteredRepos: GitHubRepo[];
  selectedRepoId: number | null;
  onSelectRepo: (repo: GitHubRepo) => void;
  onMoveRepo: (repoId: number, targetFolderId: string | null) => void;
  onToggleCollapse: (folderId: string) => void;
  onEditFolder: (folder: VirtualFolder) => void;
  onDeleteFolder: (folderId: string) => void;
  onAddSubfolder: (parentId: string) => void;
  onOpenMoveModal: (repo: GitHubRepo) => void;
}

export const ExplorerTree: React.FC<ExplorerTreeProps> = ({
  folders,
  repos,
  filteredRepos,
  selectedRepoId,
  onSelectRepo,
  onMoveRepo,
  onToggleCollapse,
  onEditFolder,
  onDeleteFolder,
  onAddSubfolder,
  onOpenMoveModal,
}) => {
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [draggedRepoId, setDraggedRepoId] = useState<number | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | 'unfiled' | null>(null);
  const [folderMenuOpen, setFolderMenuOpen] = useState<string | null>(null);

  // Drag and Drop handlers
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

  // Top level folders and tree hierarchy
  const rootFolders = folders.filter((f) => !f.parentId);
  const getSubfolders = (parentId: string) => folders.filter((f) => f.parentId === parentId);

  // Repos in current active view
  let displayedRepos: GitHubRepo[] = [];
  if (activeFolderId === null) {
    // Show all filtered repos
    displayedRepos = filteredRepos;
  } else if (activeFolderId === 'unfiled') {
    const allAssignedIds = new Set(folders.flatMap((f) => f.repoIds));
    displayedRepos = filteredRepos.filter((r) => !allAssignedIds.has(r.id));
  } else {
    const folder = folders.find((f) => f.id === activeFolderId);
    if (folder) {
      displayedRepos = filteredRepos.filter((r) => folder.repoIds.includes(r.id));
    }
  }

  // Count unfiled
  const allAssigned = new Set(folders.flatMap((f) => f.repoIds));
  const unfiledCount = repos.filter((r) => !allAssigned.has(r.id)).length;

  const renderFolderItem = (folder: VirtualFolder, depth = 0) => {
    const color = getFolderColor(folder.colorId);
    const subfolders = getSubfolders(folder.id);
    const isExpanded = !folder.collapsed;
    const isSelected = activeFolderId === folder.id;
    const isDragTarget = dragOverFolderId === folder.id;
    const repoCount = folder.repoIds.length;

    return (
      <div key={folder.id} className="select-none">
        <div
          onDragOver={(e) => handleDragOver(e, folder.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, folder.id)}
          onClick={() => setActiveFolderId(folder.id)}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          className={`group flex items-center justify-between py-2 pr-2 text-xs rounded-lg cursor-pointer transition-all ${
            isDragTarget
              ? 'bg-indigo-600/25 ring-2 ring-indigo-500 text-white'
              : isSelected
              ? 'bg-slate-800/90 text-white font-medium border border-slate-700/60'
              : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse(folder.id);
              }}
              className="p-0.5 text-slate-500 hover:text-slate-300 rounded"
            >
              {subfolders.length > 0 ? (
                isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <span className="w-3.5 inline-block" />
              )}
            </button>

            <span
              className="w-3 h-3 rounded-full shrink-0 flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ backgroundColor: color.hex }}
            />

            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-slate-400 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-slate-400 shrink-0" />
            )}

            <span className="truncate flex-1">{folder.name}</span>

            <span className="text-[11px] font-mono text-slate-500 tabular-nums px-1.5 py-0.2 bg-slate-900 rounded shrink-0">
              {repoCount}
            </span>
          </div>

          {/* Action buttons on hover */}
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1 ml-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddSubfolder(folder.id);
              }}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
              title="Add Subfolder"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditFolder(folder);
              }}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
              title="Edit Folder"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFolder(folder.id);
              }}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded"
              title="Delete Folder"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Subfolders */}
        {isExpanded && subfolders.length > 0 && (
          <div className="space-y-0.5 mt-0.5">
            {subfolders.map((sub) => renderFolderItem(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
      {/* Left Sidebar: Folder Directory Tree */}
      <div className="w-full md:w-72 lg:w-80 border-r border-slate-800 bg-[#0B0F17] flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold tracking-wider uppercase">
          <span>Directory Folders</span>
          <span className="text-[10px] text-slate-500 normal-case font-normal">
            Drag repos to organize
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* All Repositories Option */}
          <div
            onClick={() => setActiveFolderId(null)}
            className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${
              activeFolderId === null
                ? 'bg-slate-800 text-white font-medium border border-slate-700/60'
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>All Repositories</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 tabular-nums">
              {repos.length}
            </span>
          </div>

          {/* Root Level Folders */}
          {rootFolders.map((folder) => renderFolderItem(folder))}

          {/* Unfiled Repos Drop Zone */}
          <div
            onDragOver={(e) => handleDragOver(e, 'unfiled')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, null)}
            onClick={() => setActiveFolderId('unfiled')}
            className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-all ${
              dragOverFolderId === 'unfiled'
                ? 'bg-amber-500/20 ring-2 ring-amber-500 text-white'
                : activeFolderId === 'unfiled'
                ? 'bg-slate-800 text-white font-medium border border-slate-700/60'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full border border-dashed border-amber-400/80 bg-amber-400/10" />
              <span>Unfiled Repos</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 tabular-nums">
              {unfiledCount}
            </span>
          </div>
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Tip: Drag any repo into a folder</span>
          <span className="text-indigo-400 font-mono">⌘ / Ctrl</span>
        </div>
      </div>

      {/* Middle/Main Area: Repositories List in Current Folder */}
      <div className="flex-1 flex flex-col bg-[#080B11] overflow-hidden">
        {/* Breadcrumb Header */}
        <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/30">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="hover:text-slate-200 cursor-pointer" onClick={() => setActiveFolderId(null)}>
              Repositories
            </span>
            <span>/</span>
            <span className="text-white font-medium">
              {activeFolderId === null
                ? 'All Files'
                : activeFolderId === 'unfiled'
                ? 'Unfiled'
                : folders.find((f) => f.id === activeFolderId)?.name || 'Folder'}
            </span>
            <span className="text-slate-500 text-[11px]">
              ({displayedRepos.length} items)
            </span>
          </div>
        </div>

        {/* Repositories File View */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {displayedRepos.length === 0 ? (
            <div
              onDragOver={(e) => {
                if (activeFolderId && activeFolderId !== 'unfiled') {
                  handleDragOver(e, activeFolderId);
                }
              }}
              onDragLeave={handleDragLeave}
              onDrop={(e) => {
                if (activeFolderId && activeFolderId !== 'unfiled') {
                  handleDrop(e, activeFolderId);
                }
              }}
              className={`h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all ${
                dragOverFolderId === activeFolderId
                  ? 'border-indigo-500 bg-indigo-600/10'
                  : 'border-slate-800/80 bg-slate-900/20'
              }`}
            >
              <FolderPlus className="w-8 h-8 text-slate-600 mb-2" />
              <div className="text-sm font-semibold text-slate-300">
                This folder is currently empty
              </div>
              <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                Drag any repository from the sidebar or &quot;All Repositories&quot; list and drop it here to organize it into this folder.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayedRepos.map((repo) => {
                const isSelected = selectedRepoId === repo.id;
                const isBeingDragged = draggedRepoId === repo.id;
                const parentFolder = folders.find((f) => f.repoIds.includes(repo.id));
                const folderColor = parentFolder ? getFolderColor(parentFolder.colorId) : null;

                return (
                  <div
                    key={repo.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, repo.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onSelectRepo(repo)}
                    className={`group relative flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isBeingDragged
                        ? 'opacity-40 border-dashed border-indigo-400 bg-indigo-950/20'
                        : isSelected
                        ? 'border-indigo-500 bg-slate-800/90 shadow-md ring-1 ring-indigo-500/30'
                        : 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Drag handle */}
                      <div
                        className="text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing p-0.5"
                        title="Drag to relocate into folder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Icon */}
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                        {repo.private ? (
                          <Lock className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Code className="w-4 h-4 text-sky-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white font-mono truncate group-hover:text-indigo-300 transition-colors">
                            {repo.name}
                          </span>

                          {parentFolder && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: folderColor?.hex }}
                              />
                              <span>{parentFolder.name}</span>
                            </span>
                          )}
                        </div>

                        {repo.description && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-xl">
                            {repo.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Metadata right */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0 ml-3">
                      {repo.language && (
                        <div className="hidden sm:flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#64748B' }}
                          />
                          <span className="text-[11px] text-slate-300">{repo.language}</span>
                        </div>
                      )}

                      <div className="hidden md:flex items-center gap-1 text-[11px] font-mono text-slate-400 tabular-nums">
                        <Star className="w-3 h-3 text-amber-400/80" />
                        <span>{repo.stargazers_count}</span>
                      </div>

                      {/* Move button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenMoveModal(repo);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/80 rounded-lg transition-colors"
                        title="Move repository to folder"
                      >
                        <MoveRight className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/80 rounded-lg transition-colors"
                        title="Open on GitHub"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
