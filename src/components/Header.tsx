import React from 'react';
import {
  LayoutDashboard,
  Layers,
  FileCheck2,
  ScrollText,
  ShieldCheck,
  UserCheck,
  LogOut,
  Sparkles,
  ExternalLink,
  Palette,
} from 'lucide-react';
import { MitIdCitizenSession } from '../types/schema';

export type ActiveTab = 'dashboard' | 'studio' | 'user-view' | 'submissions';

export interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentMitIdSession: MitIdCitizenSession | null;
  onOpenMitIdModal: () => void;
  onLogoutMitId: () => void;
  templateCount: number;
  submissionCount: number;
  onOpenVisualGalleryModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentMitIdSession,
  onOpenMitIdModal,
  onLogoutMitId,
  templateCount,
  submissionCount,
  onOpenVisualGalleryModal,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-black text-xl tracking-tight">
              AF
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">AutoForma</span>
                <span className="text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal">
                SurveyJS &bull; Dynamic Logic &bull; MitID &bull; NgDP Digital Post
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Templates</span>
              <span className="ml-1 bg-slate-900/40 text-slate-300 px-1.5 py-0.2 rounded-full text-[10px]">
                {templateCount}
              </span>
            </button>

            <button
              id="nav-tab-studio"
              onClick={() => setActiveTab('studio')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'studio'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Form & Logic Studio</span>
            </button>

            <button
              id="nav-tab-user-view"
              onClick={() => setActiveTab('user-view')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'user-view'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Citizen / User View</span>
            </button>

            <button
              id="nav-tab-submissions"
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'submissions'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ScrollText className="w-4 h-4" />
              <span>Audit & NgDP Logs</span>
              {submissionCount > 0 && (
                <span className="ml-1 bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full text-[10px]">
                  {submissionCount}
                </span>
              )}
            </button>
          </nav>

          {/* MitID Session Status & Simulator & Theme Explorer */}
          <div className="flex items-center space-x-2.5">
            {onOpenVisualGalleryModal && (
              <button
                id="btn-open-visual-gallery-header"
                type="button"
                onClick={onOpenVisualGalleryModal}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:border-sky-500/50"
                title="Åbn Visuelle Stilarter & Tema Galleri"
              >
                <Palette className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Visuelle Stilarter</span>
              </button>
            )}

            {currentMitIdSession?.authenticated ? (
              <div className="flex items-center space-x-2 bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <div className="text-left">
                  <div className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-200">
                      {currentMitIdSession.fullName}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400/80 font-mono">
                    CPR: {currentMitIdSession.cpr} &bull; {currentMitIdSession.authLevel}
                  </span>
                </div>
                <button
                  onClick={onLogoutMitId}
                  title="Log ud af MitID"
                  className="ml-2 text-emerald-400 hover:text-emerald-200 p-1 rounded hover:bg-emerald-900/50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="btn-simulate-mitid"
                onClick={onOpenMitIdModal}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all border border-blue-400/30"
              >
                <ShieldCheck className="w-4 h-4 text-blue-200" />
                <span>Simulate MitID Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
