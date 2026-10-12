import { GitHubRepo, UserProfile } from '../types';

export interface FetchReposResult {
  user: UserProfile;
  repos: GitHubRepo[];
}

export async function fetchUserAndRepos(
  token?: string,
  username?: string
): Promise<FetchReposResult> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  const cleanToken = token?.trim();
  if (cleanToken) {
    headers['Authorization'] = `Bearer ${cleanToken}`;
  }

  // 1. Fetch User Profile
  const userEndpoint = cleanToken
    ? 'https://api.github.com/user'
    : `https://api.github.com/users/${encodeURIComponent(username || '')}`;

  const userRes = await fetch(userEndpoint, { headers });

  if (!userRes.ok) {
    if (userRes.status === 401) {
      throw new Error('Invalid GitHub Personal Access Token. Please verify token permissions and expiration.');
    }
    if (userRes.status === 404) {
      throw new Error(`GitHub user "${username}" was not found.`);
    }
    if (userRes.status === 403) {
      const remaining = userRes.headers.get('x-ratelimit-remaining');
      if (remaining === '0') {
        const resetTime = userRes.headers.get('x-ratelimit-reset');
        const resetDate = resetTime ? new Date(parseInt(resetTime, 10) * 1000).toLocaleTimeString() : 'shortly';
        throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate}. Using a Personal Access Token provides 5,000 requests/hour.`);
      }
      throw new Error('GitHub access forbidden. Check token scope (needs "repo" scope for private repositories).');
    }
    throw new Error(`GitHub API error: ${userRes.status} ${userRes.statusText}`);
  }

  const rawUser = await userRes.json();
  const user: UserProfile = {
    login: rawUser.login,
    name: rawUser.name || rawUser.login,
    avatar_url: rawUser.avatar_url,
    html_url: rawUser.html_url,
    bio: rawUser.bio,
    public_repos: rawUser.public_repos || 0,
    total_private_repos: rawUser.total_private_repos,
    owned_private_repos: rawUser.owned_private_repos,
  };

  // 2. Fetch Repositories with pagination (up to 300 repos for performance)
  const repos: GitHubRepo[] = [];
  let page = 1;
  const maxPages = 4; // up to 400 repositories

  while (page <= maxPages) {
    const reposEndpoint = cleanToken
      ? `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`
      : `https://api.github.com/users/${encodeURIComponent(user.login)}/repos?per_page=100&page=${page}&sort=updated`;

    const reposRes = await fetch(reposEndpoint, { headers });

    if (!reposRes.ok) {
      if (repos.length > 0) {
        // We already got earlier pages, return what we have
        break;
      }
      throw new Error(`Failed to fetch repositories: ${reposRes.status} ${reposRes.statusText}`);
    }

    const pageRepos: any[] = await reposRes.json();
    if (!Array.isArray(pageRepos) || pageRepos.length === 0) {
      break;
    }

    for (const item of pageRepos) {
      repos.push({
        id: item.id,
        name: item.name,
        full_name: item.full_name,
        owner: {
          login: item.owner?.login || user.login,
          avatar_url: item.owner?.avatar_url || user.avatar_url,
          html_url: item.owner?.html_url || user.html_url,
        },
        private: !!item.private,
        html_url: item.html_url,
        description: item.description,
        fork: !!item.fork,
        stargazers_count: item.stargazers_count || 0,
        forks_count: item.forks_count || 0,
        open_issues_count: item.open_issues_count || 0,
        language: item.language,
        topics: Array.isArray(item.topics) ? item.topics : [],
        updated_at: item.updated_at,
        pushed_at: item.pushed_at || item.updated_at,
        created_at: item.created_at,
        default_branch: item.default_branch || 'main',
        size: item.size || 0,
        archived: !!item.archived,
        visibility: item.visibility,
      });
    }

    if (pageRepos.length < 100) {
      break;
    }
    page++;
  }

  return { user, repos };
}

export async function fetchRepoReadme(
  fullName: string,
  token?: string
): Promise<string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  const cleanToken = token?.trim();
  if (cleanToken) {
    headers['Authorization'] = `Bearer ${cleanToken}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${fullName}/readme`, { headers });
    if (!res.ok) {
      return '';
    }
    const data = await res.json();
    if (data.content && data.encoding === 'base64') {
      // Decode UTF-8 base64 safely in browser
      const binary = atob(data.content.replace(/\s/g, ''));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new TextDecoder().decode(bytes);
    }
    return '';
  } catch {
    return '';
  }
}
