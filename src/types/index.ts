export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  updated_at: string;
  pushed_at: string;
  created_at: string;
  default_branch: string;
  size: number;
  archived: boolean;
  visibility?: 'public' | 'private' | 'internal';
}

export interface VirtualFolder {
  id: string;
  name: string;
  parentId: string | null;
  colorId: string;
  repoIds: number[];
  collapsed?: boolean;
  description?: string;
}

export interface FolderColor {
  id: string;
  name: string;
  hex: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  glowClass: string;
}

export interface UserProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  total_private_repos?: number;
  owned_private_repos?: number;
}

export type ViewMode = 'tree' | 'bento';

export interface FilterState {
  query: string;
  visibility: 'all' | 'public' | 'private';
  type: 'all' | 'sources' | 'forks' | 'archived';
  language: string;
  sortBy: 'pushed' | 'updated' | 'stars' | 'name';
  sortOrder: 'asc' | 'desc';
}

export interface GitTreeBackup {
  version: 1;
  exportedAt: string;
  username: string;
  folders: VirtualFolder[];
  repoNotes: Record<number, string>;
}
