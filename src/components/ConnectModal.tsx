import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  Github, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  HelpCircle,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { UserProfile } from '../types';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectToken: (token: string) => Promise<void>;
  onConnectUsername: (username: string) => Promise<void>;
  onLoadDemo: () => void;
  currentUser: UserProfile | null;
  currentToken: string;
  isLoading: boolean;
  error: string | null;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  isOpen,
  onClose,
  onConnectToken,
  onConnectUsername,
  onLoadDemo,
  currentUser,
  currentToken,
  isLoading,
  error,
}) => {
  const [tab, setTab] = useState<'token' | 'username'>('token');
  const [tokenInput, setTokenInput] = useState(currentToken || '');
  const [usernameInput, setUsernameInput] = useState(currentUser?.login || '');
  const [showTokenHelp, setShowTokenHelp] = useState(false);

  if (!isOpen) return null;

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    await onConnectToken(tokenInput.trim());
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    await onConnectUsername(usernameInput.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Connect GitHub Account</h2>
              <p className="text-[11px] text-slate-400">Load all your public and private repositories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-800/90 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setTab('token')}
              className={`py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                tab === 'token'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>Personal Access Token</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('username')}
              className={`py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                tab === 'username'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Github className="w-3.5 h-3.5 text-slate-400" />
              <span>Username (Public Only)</span>
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {tab === 'token' ? (
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  GitHub Personal Access Token (PAT)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_xxxx"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 rounded-xl text-slate-200 font-mono placeholder:text-slate-600 outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Security & Scope Info */}
              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Private & Local Storage Only</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your token is stored exclusively in your browser&apos;s localStorage and sent directly to GitHub&apos;s API. It is never saved on any third-party server.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=GitTree+File+Explorer"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    <span>Generate token on GitHub with `repo` scope</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowTokenHelp(!showTokenHelp)}
                    className="text-[11px] text-slate-400 hover:text-slate-300 flex items-center gap-1"
                  >
                    <span>Steps</span>
                    {showTokenHelp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {showTokenHelp && (
                  <div className="pt-2 text-[11px] text-slate-400 space-y-1.5 border-t border-slate-800/50">
                    <div>1. Click the link above to open GitHub Token creation.</div>
                    <div>2. Ensure the <strong className="text-slate-200">repo</strong> scope checkbox is checked (enables reading private repos).</div>
                    <div>3. Click &quot;Generate token&quot; at the bottom of the GitHub page.</div>
                    <div>4. Copy and paste the resulting string here!</div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !tokenInput.trim()}
                  className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                >
                  {isLoading ? 'Verifying & Fetching Repos...' : 'Load Repositories'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  GitHub Username
                </label>
                <div className="relative">
                  <Github className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. torvalds or octocat"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 rounded-xl text-slate-200 placeholder:text-slate-600 outline-none"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Note: GitHub does not expose private repositories to unauthenticated username queries.</span>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !usernameInput.trim()}
                  className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                >
                  {isLoading ? 'Fetching Repos...' : 'Fetch Public Repos'}
                </button>
              </div>
            </form>
          )}

          {/* Demo Fallback Option */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Want to test without signing in?</span>
            <button
              type="button"
              onClick={() => {
                onLoadDemo();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load CS Student Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
