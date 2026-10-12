/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  GitHubRepo, 
  VirtualFolder, 
  UserProfile, 
  ViewMode, 
  FilterState 
} from './types';
import { 
  loadStoredAuth, 
  saveStoredAuth, 
  loadStoredUserProfile, 
  saveStoredUserProfile, 
  loadStoredFolders, 
  saveStoredFolders, 
  loadStoredNotes, 
  saveStoredNotes, 
  exportBackup, 
  parseImportBackup, 
  resetDemoState 
} from './utils/storage';
import { fetchUserAndRepos } from './services/github';
import { MOCK_REPOS, MOCK_USER, MOCK_FOLDERS } from './data/mockData';
import { TopBar } from './components/TopBar';
import { FilterBar } from './components/FilterBar';
import { ExplorerTree } from './components/TreeView/ExplorerTree';
import { BentoGrid } from './components/BentoView/BentoGrid';
import { RepoInspector } from './components/RepoInspector';
import { ConnectModal } from './components/ConnectModal';
import { FolderModal } from './components/FolderModal';
import { MoveRepoModal } from './components/MoveRepoModal';

export default function App() {
  // Authentication & Repos state
  const [token, setToken] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [folders, setFolders] = useState<VirtualFolder[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});

  // View & UI state
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<VirtualFolder | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [repoToMove, setRepoToMove] = useState<GitHubRepo | null>(null);

  // Filter state
  const [filter, setFilter] = useState<FilterState>({
    query: '',
    visibility: 'all',
    type: 'all',
    language: 'all',
    sortBy: 'pushed',
    sortOrder: 'desc',
  });

  // Show transient toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  // Initialize from storage or demo data
  useEffect(() => {
    const auth = loadStoredAuth();
    setToken(auth.token);
    setUsername(auth.username);

    const storedUser = loadStoredUserProfile();
    const storedFolders = loadStoredFolders();
    const storedNotes = loadStoredNotes();

    setFolders(storedFolders);
    setNotes(storedNotes);

    if (auth.token || auth.username) {
      setUser(storedUser);
      // Fetch live repos with token
      fetchFreshRepos(auth.token, auth.username);
    } else {
      // Load sample University demo dataset
      setUser(MOCK_USER);
      setRepos(MOCK_REPOS);
      setNotes({
        101: 'Due on Friday: Assignment 4 Dynamic Programming lab report.',
        102: 'Supervisor meeting every Tuesday at 2 PM.',
        201: 'v1.2 release planned with tree-sitter highlighting.',
      });
      setSelectedRepoId(101);
    }
  }, []);

  const fetchFreshRepos = async (authToken?: string, authUser?: string) => {
    setIsRefreshing(true);
    setAuthError(null);
    try {
      const result = await fetchUserAndRepos(authToken, authUser);
      setUser(result.user);
      setRepos(result.repos);
      saveStoredUserProfile(result.user);
      if (result.repos.length > 0 && !selectedRepoId) {
        setSelectedRepoId(result.repos[0].id);
      }
      showToast(`Loaded ${result.repos.length} repositories from GitHub.`);
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Failed to fetch repositories.');
      // Fallback to mock data if fresh account fails or has rate limit
      if (repos.length === 0) {
        setUser(MOCK_USER);
        setRepos(MOCK_REPOS);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Connect via Personal Access Token
  const handleConnectToken = async (newToken: string) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const result = await fetchUserAndRepos(newToken, undefined);
      setToken(newToken);
      setUser(result.user);
      setRepos(result.repos);
      saveStoredAuth(newToken, result.user.login);
      saveStoredUserProfile(result.user);
      setIsConnectModalOpen(false);
      showToast(`Connected as @${result.user.login}! Fetched ${result.repos.length} repositories.`);
    } catch (err: any) {
      setAuthError(err.message || 'Verification failed.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Connect via Username
  const handleConnectUsername = async (newUsername: string) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const result = await fetchUserAndRepos(undefined, newUsername);
      setToken('');
      setUsername(newUsername);
      setUser(result.user);
      setRepos(result.repos);
      saveStoredAuth('', newUsername);
      saveStoredUserProfile(result.user);
      setIsConnectModalOpen(false);
      showToast(`Fetched public repositories for @${result.user.login}.`);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to fetch user.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Load interactive demo data
  const handleLoadDemo = () => {
    const demo = resetDemoState();
    setUser(demo.user);
    setRepos(demo.repos);
    setFolders(demo.folders);
    setNotes(demo.notes);
    setToken('');
    setUsername('');
    setSelectedRepoId(101);
    showToast('Loaded University & Projects interactive demo data.');
  };

  // Disconnect
  const handleDisconnect = () => {
    saveStoredAuth('', '');
    saveStoredUserProfile(null);
    setToken('');
    setUsername('');
    handleLoadDemo();
    showToast('Account disconnected.');
  };

  // Move repo between folders or to unfiled (root)
  const handleMoveRepo = (repoId: number, targetFolderId: string | null) => {
    const targetRepo = repos.find((r) => r.id === repoId);
    if (!targetRepo) return;

    const nextFolders = folders.map((folder) => {
      // Remove from any current folder
      const filteredRepoIds = folder.repoIds.filter((id) => id !== repoId);

      // Add to target folder if matches
      if (targetFolderId && folder.id === targetFolderId) {
        return {
          ...folder,
          repoIds: [...filteredRepoIds, repoId],
        };
      }
      return {
        ...folder,
        repoIds: filteredRepoIds,
      };
    });

    setFolders(nextFolders);
    saveStoredFolders(nextFolders);

    if (targetFolderId) {
      const folderName = folders.find((f) => f.id === targetFolderId)?.name || 'folder';
      showToast(`Moved "${targetRepo.name}" to ${folderName}`);
    } else {
      showToast(`Moved "${targetRepo.name}" to Unfiled`);
    }
  };

  // Folder CRUD
  const handleSaveFolder = (folderData: {
    name: string;
    parentId: string | null;
    colorId: string;
    description?: string;
  }) => {
    let nextFolders: VirtualFolder[];

    if (editingFolder) {
      nextFolders = folders.map((f) =>
        f.id === editingFolder.id
          ? {
              ...f,
              name: folderData.name,
              parentId: folderData.parentId,
              colorId: folderData.colorId,
              description: folderData.description,
            }
          : f
      );
      showToast(`Updated folder "${folderData.name}".`);
    } else {
      const newFolder: VirtualFolder = {
        id: `f-${Date.now()}`,
        name: folderData.name,
        parentId: folderData.parentId,
        colorId: folderData.colorId,
        repoIds: [],
        collapsed: false,
        description: folderData.description,
      };
      nextFolders = [...folders, newFolder];
      showToast(`Created folder "${folderData.name}".`);
    }

    setFolders(nextFolders);
    saveStoredFolders(nextFolders);
    setEditingFolder(null);
    setDefaultParentId(null);
  };

  const handleDeleteFolder = (folderId: string) => {
    const folderToDelete = folders.find((f) => f.id === folderId);
    if (!folderToDelete) return;

    if (window.confirm(`Delete folder "${folderToDelete.name}"? Contained repositories will be moved to Unfiled.`)) {
      // Move any subfolders to root
      const nextFolders = folders
        .filter((f) => f.id !== folderId)
        .map((f) => (f.parentId === folderId ? { ...f, parentId: null } : f));

      setFolders(nextFolders);
      saveStoredFolders(nextFolders);
      showToast(`Deleted folder "${folderToDelete.name}".`);
    }
  };

  const handleToggleCollapse = (folderId: string) => {
    const nextFolders = folders.map((f) =>
      f.id === folderId ? { ...f, collapsed: !f.collapsed } : f
    );
    setFolders(nextFolders);
    saveStoredFolders(nextFolders);
  };

  // Save personal notes for a repo
  const handleSaveNote = (repoId: number, note: string) => {
    const nextNotes = { ...notes, [repoId]: note };
    setNotes(nextNotes);
    saveStoredNotes(nextNotes);
    showToast('Saved developer note.');
  };

  // Export & Import backup
  const handleExport = () => {
    exportBackup(user?.login || 'config', folders, notes);
    showToast('Exported GitTree backup JSON file.');
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const backup = parseImportBackup(text);
      setFolders(backup.folders);
      saveStoredFolders(backup.folders);
      if (backup.repoNotes) {
        setNotes(backup.repoNotes);
        saveStoredNotes(backup.repoNotes);
      }
      showToast(`Imported ${backup.folders.length} folders from backup.`);
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    }
  };

  // Filter & Sort calculation
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    repos.forEach((r) => {
      if (r.language) langs.add(r.language);
    });
    return Array.from(langs).sort();
  }, [repos]);

  const filteredRepos = useMemo(() => {
    return repos.filter((r) => {
      // Query filter
      if (filter.query) {
        const q = filter.query.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesDesc = r.description?.toLowerCase().includes(q);
        const matchesLang = r.language?.toLowerCase().includes(q);
        const matchesTopic = r.topics.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesLang && !matchesTopic) {
          return false;
        }
      }

      // Visibility filter
      if (filter.visibility === 'private' && !r.private) return false;
      if (filter.visibility === 'public' && r.private) return false;

      // Type filter
      if (filter.type === 'sources' && (r.fork || r.archived)) return false;
      if (filter.type === 'forks' && !r.fork) return false;
      if (filter.type === 'archived' && !r.archived) return false;

      // Language filter
      if (filter.language !== 'all' && r.language !== filter.language) return false;

      return true;
    }).sort((a, b) => {
      let result = 0;
      if (filter.sortBy === 'name') {
        result = a.name.localeCompare(b.name);
      } else if (filter.sortBy === 'stars') {
        result = b.stargazers_count - a.stargazers_count;
      } else if (filter.sortBy === 'updated') {
        result = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else {
        result = new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
      }
      return filter.sortOrder === 'asc' ? -result : result;
    });
  }, [repos, filter]);

  const totalPrivate = useMemo(() => repos.filter((r) => r.private).length, [repos]);
  const totalPublic = useMemo(() => repos.filter((r) => !r.private).length, [repos]);
  const allAssignedIds = useMemo(() => new Set(folders.flatMap((f) => f.repoIds)), [folders]);
  const unfiledCount = useMemo(() => repos.filter((r) => !allAssignedIds.has(r.id)).length, [repos, allAssignedIds]);

  const selectedRepo = useMemo(
    () => repos.find((r) => r.id === selectedRepoId) || null,
    [repos, selectedRepoId]
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0B0F17] text-slate-100 overflow-hidden font-sans">
      {/* Top Bar adhering to Top Bar Contract */}
      <TopBar
        user={user}
        hasToken={!!token}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenConnect={() => {
          setAuthError(null);
          setIsConnectModalOpen(true);
        }}
        onOpenNewFolder={() => {
          setEditingFolder(null);
          setDefaultParentId(null);
          setIsFolderModalOpen(true);
        }}
        onRefresh={() => fetchFreshRepos(token, username)}
        isRefreshing={isRefreshing}
        onExport={handleExport}
        onImport={handleImport}
        onResetDemo={handleLoadDemo}
        onDisconnect={handleDisconnect}
        totalRepos={repos.length}
        totalFolders={folders.length}
      />

      {/* Filter and Search Bar */}
      <FilterBar
        filter={filter}
        onFilterChange={(updates) => setFilter((prev) => ({ ...prev, ...updates }))}
        availableLanguages={availableLanguages}
        totalVisible={filteredRepos.length}
        totalPrivate={totalPrivate}
        totalPublic={totalPublic}
        unfiledCount={unfiledCount}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {viewMode === 'tree' ? (
          <ExplorerTree
            folders={folders}
            repos={repos}
            filteredRepos={filteredRepos}
            selectedRepoId={selectedRepoId}
            onSelectRepo={(repo) => setSelectedRepoId(repo.id)}
            onMoveRepo={handleMoveRepo}
            onToggleCollapse={handleToggleCollapse}
            onEditFolder={(folder) => {
              setEditingFolder(folder);
              setIsFolderModalOpen(true);
            }}
            onDeleteFolder={handleDeleteFolder}
            onAddSubfolder={(parentId) => {
              setEditingFolder(null);
              setDefaultParentId(parentId);
              setIsFolderModalOpen(true);
            }}
            onOpenMoveModal={(repo) => {
              setRepoToMove(repo);
              setIsMoveModalOpen(true);
            }}
          />
        ) : (
          <BentoGrid
            folders={folders}
            repos={repos}
            filteredRepos={filteredRepos}
            selectedRepoId={selectedRepoId}
            onSelectRepo={(repo) => setSelectedRepoId(repo.id)}
            onMoveRepo={handleMoveRepo}
            onEditFolder={(folder) => {
              setEditingFolder(folder);
              setIsFolderModalOpen(true);
            }}
            onDeleteFolder={handleDeleteFolder}
            onOpenNewFolder={() => {
              setEditingFolder(null);
              setDefaultParentId(null);
              setIsFolderModalOpen(true);
            }}
            onOpenMoveModal={(repo) => {
              setRepoToMove(repo);
              setIsMoveModalOpen(true);
            }}
          />
        )}

        {/* Selected Repository Inspector Drawer */}
        {selectedRepo && (
          <RepoInspector
            repo={selectedRepo}
            folders={folders}
            notes={notes}
            onSaveNote={handleSaveNote}
            onOpenMoveModal={(repo) => {
              setRepoToMove(repo);
              setIsMoveModalOpen(true);
            }}
            onClose={() => setSelectedRepoId(null)}
            token={token}
          />
        )}
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/95 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Connect GitHub Modal */}
      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnectToken={handleConnectToken}
        onConnectUsername={handleConnectUsername}
        onLoadDemo={handleLoadDemo}
        currentUser={user}
        currentToken={token}
        isLoading={isLoadingAuth}
        error={authError}
      />

      {/* Create / Edit Folder Modal */}
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false);
          setEditingFolder(null);
          setDefaultParentId(null);
        }}
        onSaveFolder={handleSaveFolder}
        existingFolders={folders}
        editingFolder={editingFolder}
        defaultParentId={defaultParentId}
      />

      {/* Move Repo Modal */}
      <MoveRepoModal
        isOpen={isMoveModalOpen}
        onClose={() => {
          setIsMoveModalOpen(false);
          setRepoToMove(null);
        }}
        repo={repoToMove}
        currentFolderId={
          repoToMove
            ? folders.find((f) => f.repoIds.includes(repoToMove.id))?.id || null
            : null
        }
        folders={folders}
        onMove={handleMoveRepo}
      />
    </div>
  );
}
