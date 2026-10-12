import { GitTreeBackup, UserProfile, VirtualFolder } from '../types';
import { MOCK_FOLDERS, MOCK_REPOS, MOCK_USER } from '../data/mockData';

const STORAGE_KEYS = {
  TOKEN: 'gittree_gh_token',
  USERNAME: 'gittree_gh_username',
  USER_PROFILE: 'gittree_user_profile',
  REPOS: 'gittree_repos_cache',
  FOLDERS: 'gittree_virtual_folders',
  NOTES: 'gittree_repo_notes',
  LAST_FETCHED: 'gittree_last_fetched',
};

export function loadStoredAuth(): { token: string; username: string } {
  return {
    token: localStorage.getItem(STORAGE_KEYS.TOKEN) || '',
    username: localStorage.getItem(STORAGE_KEYS.USERNAME) || '',
  };
}

export function saveStoredAuth(token: string, username: string): void {
  if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  else localStorage.removeItem(STORAGE_KEYS.TOKEN);

  if (username) localStorage.setItem(STORAGE_KEYS.USERNAME, username);
  else localStorage.removeItem(STORAGE_KEYS.USERNAME);
}

export function loadStoredUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredUserProfile(user: UserProfile | null): void {
  if (user) localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
}

export function loadStoredFolders(): VirtualFolder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse stored folders', e);
  }
  // Default to initial mock folders if fresh visit
  return MOCK_FOLDERS;
}

export function saveStoredFolders(folders: VirtualFolder[]): void {
  localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
}

export function loadStoredNotes(): Record<number, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredNotes(notes: Record<number, string>): void {
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
}

export function exportBackup(username: string, folders: VirtualFolder[], notes: Record<number, string>): void {
  const backup: GitTreeBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    username: username || 'user',
    folders,
    repoNotes: notes,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gittree-backup-${username || 'config'}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImportBackup(jsonText: string): GitTreeBackup {
  const data = JSON.parse(jsonText);
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid backup file: Root must be a JSON object.');
  }
  if (!Array.isArray(data.folders)) {
    throw new Error('Invalid backup file: "folders" must be an array.');
  }
  return {
    version: data.version || 1,
    exportedAt: data.exportedAt || new Date().toISOString(),
    username: data.username || '',
    folders: data.folders,
    repoNotes: data.repoNotes && typeof data.repoNotes === 'object' ? data.repoNotes : {},
  };
}

export function resetDemoState() {
  localStorage.clear();
  return {
    user: MOCK_USER,
    repos: MOCK_REPOS,
    folders: MOCK_FOLDERS,
    notes: {
      101: 'Due on Friday: Assignment 4 Dynamic Programming lab report.',
      102: 'Supervisor meeting every Tuesday at 2 PM.',
      201: 'v1.2 release planned with tree-sitter highlighting.',
    },
  };
}
