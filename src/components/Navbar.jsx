import React, { useState } from 'react';
import { 
  Kanban, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  Building2, 
  Copy, 
  Check, 
  LogOut, 
  Layers,
  User
} from 'lucide-react';

export default function Navbar({ 
  user,
  currentWorkspace, 
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

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Navbar Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3.5">
          
          {/* Brand & Workspace Switcher */}
          <div className="flex items-center justify-between md:justify-start gap-3 flex-wrap">
            <div className="flex items-center space-x-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
                <Kanban className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Kanban Board
                  </h1>
                </div>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  Sistem Kolaborasi Tim
                </p>
              </div>
            </div>

            {/* Active Workspace Selector Button */}
            {currentWorkspace && (
              <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/90 text-xs">
                <button
                  type="button"
                  onClick={onOpenWorkspaceModal}
                  title="Klik untuk mengganti workspace"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white shadow-2xs font-bold text-slate-800 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="max-w-[130px] sm:max-w-[180px] truncate">{currentWorkspace.name}</span>
                  <Layers className="w-3 h-3 text-slate-400 ml-0.5" />
                </button>

                {/* Quick Copy Join Code Button */}
                <button
                  type="button"
                  onClick={handleCopyCode}
                  title="Salin kode undangan workspace untuk dibagikan ke teman"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white text-slate-600 hover:text-indigo-600 font-mono text-[11px] transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="font-semibold text-emerald-600">Disalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span className="font-semibold">{currentWorkspace.join_code}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Area: Task Metrics, User Profile, Add Task & Logout */}
          <div className="flex items-center justify-between md:justify-end gap-2.5 flex-wrap">
            
            {/* Quick Task Stats */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white shadow-2xs">
                <ListTodo className="w-3.5 h-3.5 text-amber-500" />
                <span>To Do: <strong className="text-slate-800">{todo}</strong></span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>In Progress: <strong className="text-slate-800">{inProgress}</strong></span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Done: <strong className="text-slate-800">{done}</strong></span>
              </div>
            </div>

            {/* Add Task Button */}
            <button
              onClick={() => onOpenAddModal('todo')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Task</span>
            </button>

            {/* Logged in User Badge & Logout */}
            {user && (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <div 
                  title={`Login sebagai: ${user.name} (${user.email})`}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline">{user.name}</span>
                </div>

                <button
                  onClick={onLogout}
                  title="Keluar dari akun"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
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
