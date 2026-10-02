import React, { useState } from 'react';
import { 
  Menu, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  Building2, 
  Copy, 
  Check, 
  LogOut, 
  Users,
  BarChart3,
  CheckSquare,
  Kanban
} from 'lucide-react';

export default function Navbar({ 
  user,
  currentWorkspace, 
  onToggleSidebar,
  activeView,
  onOpenWorkspaceModal, 
  onOpenAddModal, 
  taskCounts,
  onLogout 
}) {
  const { todo = 0, inProgress = 0, done = 0 } = taskCounts || {};
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!currentWorkspace?.join_code) return;
    navigator.clipboard.writeText(currentWorkspace.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'my-tasks':
        return { label: 'Tugas Saya', icon: CheckSquare };
      case 'team':
        return { label: 'Anggota Tim', icon: Users };
      case 'overview':
        return { label: 'Ringkasan & Progres', icon: BarChart3 };
      default:
        return { label: 'Papan Kanban', icon: Kanban };
    }
  };

  const { label: viewLabel, icon: ViewIcon } = getViewTitle();

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 transition-all shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Hamburger Button & Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger Button to Open Sidebar */}
            <button
              onClick={onToggleSidebar}
              className="p-2 -ml-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Menu Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Current View */}
            <div className="flex items-center gap-2 min-w-0 text-xs">
              {currentWorkspace && (
                <button
                  type="button"
                  onClick={() => onOpenWorkspaceModal('list')}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 font-bold text-slate-700 transition-colors cursor-pointer truncate max-w-[150px] md:max-w-[200px]"
                  title="Ganti workspace"
                >
                  <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">{currentWorkspace.name}</span>
                </button>
              )}

              <span className="hidden sm:inline text-slate-300">/</span>

              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <ViewIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">{viewLabel}</span>
              </div>
            </div>
          </div>

          {/* Right: Task Metrics & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Quick Task Stats on Desktop */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white shadow-2xs text-[11px]">
                <ListTodo className="w-3 h-3 text-amber-500" />
                <span>To Do: <strong className="text-slate-800">{todo}</strong></span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white shadow-2xs text-[11px]">
                <Clock className="w-3 h-3 text-blue-500" />
                <span>In Progress: <strong className="text-slate-800">{inProgress}</strong></span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white shadow-2xs text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Done: <strong className="text-slate-800">{done}</strong></span>
              </div>
            </div>

            {/* Quick Copy Join Code Badge */}
            {currentWorkspace?.join_code && (
              <button
                type="button"
                onClick={handleCopyCode}
                title="Salin kode undangan workspace"
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 border border-slate-200/80 text-slate-700 hover:text-indigo-600 font-mono text-xs font-bold transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-sans text-[11px]">Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentWorkspace.join_code}</span>
                  </>
                )}
              </button>
            )}

            {/* Add Task Button */}
            <button
              onClick={() => onOpenAddModal('todo')}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Task</span>
            </button>

            {/* User Profile Mini Badge & Logout */}
            {user && (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
                <div 
                  title={`Login sebagai: ${user.name} (${user.email})`}
                  className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow-2xs cursor-default"
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <button
                  onClick={onLogout}
                  title="Keluar dari akun"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
