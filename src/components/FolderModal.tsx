import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Folder, Check } from 'lucide-react';
import { VirtualFolder } from '../types';
import { FOLDER_COLORS } from '../data/constants';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveFolder: (folderData: {
    name: string;
    parentId: string | null;
    colorId: string;
    description?: string;
  }) => void;
  existingFolders: VirtualFolder[];
  editingFolder?: VirtualFolder | null;
  defaultParentId?: string | null;
}

export const FolderModal: React.FC<FolderModalProps> = ({
  isOpen,
  onClose,
  onSaveFolder,
  existingFolders,
  editingFolder,
  defaultParentId = null,
}) => {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [colorId, setColorId] = useState<string>('emerald');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingFolder) {
      setName(editingFolder.name);
      setParentId(editingFolder.parentId);
      setColorId(editingFolder.colorId);
      setDescription(editingFolder.description || '');
    } else {
      setName('');
      setParentId(defaultParentId);
      setColorId('emerald');
      setDescription('');
    }
    setError(null);
  }, [editingFolder, defaultParentId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Folder name is required.');
      return;
    }

    // Check circular reference if editing
    if (editingFolder && parentId === editingFolder.id) {
      setError('A folder cannot be its own parent.');
      return;
    }

    onSaveFolder({
      name: name.trim(),
      parentId: parentId || null,
      colorId,
      description: description.trim() || undefined,
    });
    onClose();
  };

  // Filter out the folder itself and its descendants from parent options
  const eligibleParents = existingFolders.filter((f) => {
    if (!editingFolder) return true;
    return f.id !== editingFolder.id && f.parentId !== editingFolder.id;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              {editingFolder ? <Folder className="w-4 h-4" /> : <FolderPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {editingFolder ? 'Edit Folder' : 'Create Virtual Folder'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Organize your repositories into an intuitive directory tree
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Folder Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. UNI, Side Projects, Work, or Thesis"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 rounded-xl text-slate-200 placeholder:text-slate-600 outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Parent Folder (Optional for Nesting)
            </label>
            <select
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 rounded-xl text-slate-200 outline-none cursor-pointer"
            >
              <option value="">Root Level (No Parent)</option>
              {eligibleParents.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.parentId ? `↳ ${f.name}` : f.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Place this folder inside another directory (e.g. &quot;Year 3&quot; inside &quot;UNI&quot;).
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Folder Theme & Accent Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {FOLDER_COLORS.map((color) => {
                const isSelected = colorId === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setColorId(color.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? `${color.borderClass} bg-slate-800/90 ring-1 ring-white/20`
                        : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/50'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </span>
                    <span className="text-[11px] text-slate-300 truncate">
                      {color.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Description / Notes (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Academic coursework and laboratory assignments"
              rows={2}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 rounded-xl text-slate-200 placeholder:text-slate-600 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors shadow-sm"
            >
              {editingFolder ? 'Save Changes' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
