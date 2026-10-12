import React from 'react';
import { X, Folder, MoveRight, Layers, Check } from 'lucide-react';
import { GitHubRepo, VirtualFolder } from '../types';
import { getFolderColor } from '../data/constants';

interface MoveRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  repo: GitHubRepo | null;
  currentFolderId: string | null;
  folders: VirtualFolder[];
  onMove: (repoId: number, targetFolderId: string | null) => void;
}

export const MoveRepoModal: React.FC<MoveRepoModalProps> = ({
  isOpen,
  onClose,
  repo,
  currentFolderId,
  folders,
  onMove,
}) => {
  if (!isOpen || !repo) return null;

  const handleSelect = (folderId: string | null) => {
    onMove(repo.id, folderId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MoveRight className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white">Move Repository</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-800/60 bg-slate-950/40">
          <div className="text-[11px] text-slate-500 mb-1">Moving:</div>
          <div className="text-xs font-mono font-medium text-slate-200 truncate">
            {repo.name}
          </div>
        </div>

        <div className="p-3 max-h-72 overflow-y-auto space-y-1">
          {/* Option: Unfiled / Root */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors text-xs ${
              currentFolderId === null
                ? 'bg-indigo-600/15 border border-indigo-500/30 text-indigo-300'
                : 'text-slate-300 hover:bg-slate-800/70 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-slate-400" />
              <div>
                <div className="font-medium">Unfiled (Root Explorer)</div>
                <div className="text-[10px] text-slate-500">Not assigned to any folder</div>
              </div>
            </div>
            {currentFolderId === null && <Check className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Folder Options */}
          {folders.map((folder) => {
            const color = getFolderColor(folder.colorId);
            const isCurrent = currentFolderId === folder.id;
            const parent = folders.find((f) => f.id === folder.parentId);

            return (
              <button
                key={folder.id}
                type="button"
                onClick={() => handleSelect(folder.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors text-xs ${
                  isCurrent
                    ? 'bg-indigo-600/15 border border-indigo-500/30 text-indigo-300'
                    : 'text-slate-300 hover:bg-slate-800/70 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="min-w-0">
                    <div className="font-medium truncate flex items-center gap-1.5">
                      <span>{folder.name}</span>
                      {parent && (
                        <span className="text-[10px] text-slate-500">
                          (in {parent.name})
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {folder.repoIds.length} repositories
                    </div>
                  </div>
                </div>
                {isCurrent && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
