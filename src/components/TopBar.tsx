import React, { useState, useRef, useEffect } from 'react';
import { 
  FolderGit2, 
  FolderPlus, 
  RefreshCw, 
  Download, 
  Upload, 
  LayoutGrid, 
  FolderTree, 
  KeyRound, 
  Github, 
  ChevronDown,
  Sparkles,
  LogOut,
  Check
} from 'lucide-react';
import { UserProfile, ViewMode } from '../types';

interface TopBarProps {
  user: UserProfile | null;
  hasToken: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenConnect: () => void;
  onOpenNewFolder: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onExport: () => void;
  onImport: (file: File) => void;
  onResetDemo: () => void;
  onDisconnect: () => void;
  totalRepos: number;
  totalFolders: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  hasToken,
  viewMode,
  onViewModeChange,
  onOpenConnect,
  onOpenNewFolder,
  onRefresh,
  isRefreshing,
  onExport,
  onImport,
  onResetDemo,
  onDisconnect,
  totalRepos,
  totalFolders,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setMenuOpen(false);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0B0F17]/90 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Zone 1: Wordmark & Brand with single-line identity */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">GitTree</span>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
                Explorer
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {totalFolders} folders · {totalRepos} repositories
            </p>
          </div>
        </div>
      </div>

      {/* Zone 2: Navigation & View Toggle (Functional segmented controls) */}
      <div className="flex items-center gap-2">
        <div className="bg-slate-900 border border-slate-800 p-1 rounded-lg flex items-center gap-1 shadow-inner">
          <button
            onClick={() => onViewModeChange('tree')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              viewMode === 'tree'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tree File Explorer"
          >
            <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">File Tree</span>
          </button>
          <button
            onClick={() => onViewModeChange('bento')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              viewMode === 'bento'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Color-Coded Bento Grid Overview"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Color Bento</span>
          </button>
        </div>

        <button
          onClick={onOpenNewFolder}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-sm shrink-0"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Folder</span>
        </button>
      </div>

      {/* Zone 3: Primary Account Action & Storage Menu */}
      <div className="flex items-center gap-2 shrink-0">
        {user && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-slate-700/50 disabled:opacity-50"
            title="Refresh Repositories"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        )}

        {/* Storage / Backup dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Backup</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs">
              <button
                onClick={() => {
                  onExport();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-medium">Export JSON Backup</div>
                  <div className="text-[10px] text-slate-500">Save folder layout to disk</div>
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-left px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2"
              >
                <Upload className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-medium">Import JSON Backup</div>
                  <div className="text-[10px] text-slate-500">Restore folders & notes</div>
                </div>
              </button>

              <div className="my-1 border-t border-slate-800" />

              <button
                onClick={() => {
                  onResetDemo();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-medium">Load University Demo</div>
                  <div className="text-[10px] text-slate-500">Reset to sample UNI setup</div>
                </div>
              </button>

              {user && (
                <>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    onClick={() => {
                      onDisconnect();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Disconnect Account</div>
                      <div className="text-[10px] text-rose-400/60">Clear token and cache</div>
                    </div>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />

        {/* GitHub Account Connect / Profile Badge */}
        {user ? (
          <button
            onClick={onOpenConnect}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors group"
            title={`Connected as @${user.login}`}
          >
            <img
              src={user.avatar_url || `https://github.com/${user.login}.png`}
              alt={user.login}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-md object-cover border border-slate-700"
            />
            <span className="text-xs font-medium text-slate-200 group-hover:text-white max-w-[100px] truncate">
              {user.login}
            </span>
            {hasToken && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20" title="Token Active" />
            )}
          </button>
        ) : (
          <button
            onClick={onOpenConnect}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700 shrink-0"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Connect GitHub</span>
          </button>
        )}
      </div>
    </header>
  );
};
