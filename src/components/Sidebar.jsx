import React, { useState } from 'react';
import { 
  Kanban, 
  CheckSquare, 
  Users, 
  BarChart3, 
  Plus, 
  Building2, 
  Copy, 
  Check, 
  LogOut, 
  Layers, 
  X, 
  Crown, 
  UserCheck, 
  KeyRound, 
  ChevronRight,
  Database
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  user,
  workspaces,
  currentWorkspace,
  onSelectWorkspace,
  onOpenWorkspaceModal,
  activeView,
  setActiveView,
  taskCounts,
  onLogout,
}) {
  const [copiedCode, setCopiedCode] = useState(false);

  const { total = 0, done = 0, myTasks = 0 } = taskCounts || {};
  const completionPercentage = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleCopyCode = (e) => {
    e.stopPropagation();
    if (!currentWorkspace?.join_code) return;
    navigator.clipboard.writeText(currentWorkspace.join_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const navItems = [
    {
      id: 'board',
      label: 'Papan Kanban',
      subtitle: 'Papan tugas utama',
      icon: Kanban,
      badge: total,
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'my-tasks',
      label: 'Tugas Saya',
      subtitle: 'Dibuat oleh Anda',
      icon: CheckSquare,
      badge: myTasks,
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'team',
      label: 'Anggota Tim',
      subtitle: 'Kolaborator & kode',
      icon: Users,
      badge: currentWorkspace?.total_members || 1,
      badgeColor: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'overview',
      label: 'Ringkasan & Progres',
      subtitle: 'Statistik & metrik',
      icon: BarChart3,
      badge: `${completionPercentage}%`,
      badgeColor: 'bg-amber-100 text-amber-700',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 1. Header & App Branding */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
              <Kanban className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">
                  EXASTI Board
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Multi-Workspace Kanban
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 lg:hidden cursor-pointer"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Current Workspace Card */}
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Workspace Aktif</span>
            <button
              onClick={() => onOpenWorkspaceModal('list')}
              className="text-indigo-600 hover:text-indigo-800 font-bold lowercase tracking-normal flex items-center gap-0.5 cursor-pointer"
              title="Ganti atau kelola workspace"
            >
              <span>ganti</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {currentWorkspace ? (
            <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {currentWorkspace.name}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                      {currentWorkspace.role === 'owner' ? (
                        <>
                          <Crown className="w-2.5 h-2.5 text-amber-500" />
                          <span>Owner</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-2.5 h-2.5 text-slate-400" />
                          <span>Anggota</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenWorkspaceModal('list')}
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Kelola Workspace"
                >
                  <Layers className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Invite Code Banner */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/80 -mx-1 -mb-1 px-2 py-1.5 rounded-lg text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <KeyRound className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">Kode:</span>
                  <span className="font-mono font-bold text-slate-700">
                    {currentWorkspace.join_code}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  title="Salin kode undangan workspace"
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white hover:bg-indigo-50 border border-slate-200 text-slate-600 hover:text-indigo-600 text-[10px] font-semibold transition-all cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                      <span className="text-emerald-600">Disalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-2.5 h-2.5 text-slate-400" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-3 border border-dashed border-slate-200 text-center">
              <p className="text-xs text-slate-500 font-medium">Belum ada workspace aktif</p>
              <button
                onClick={() => onOpenWorkspaceModal('create')}
                className="mt-2 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                + Buat Workspace
              </button>
            </div>
          )}
        </div>

        {/* 3. Navigation Links (Menu Utama) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Menu Navigasi
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                      />
                      <div className="truncate">
                        <p className="text-xs leading-none">{item.label}</p>
                        <p className={`text-[10px] mt-0.5 leading-none font-normal ${
                          isActive ? 'text-indigo-500' : 'text-slate-400'
                        }`}>
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 4. Quick Workspaces List */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Workspace Anda ({workspaces.length})
              </p>
              <button
                onClick={() => onOpenWorkspaceModal('create')}
                title="Buat Workspace Baru"
                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {workspaces.map((ws) => {
                const isSelected = currentWorkspace?.id === ws.id;
                return (
                  <button
                    key={ws.id}
                    onClick={() => {
                      onSelectWorkspace(ws);
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100 text-indigo-700 font-bold border border-slate-200/80'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isSelected ? 'bg-indigo-600' : 'bg-slate-300'
                        }`}
                      />
                      <span className="truncate">{ws.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal shrink-0">
                      {ws.total_tasks || 0} task
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-100 px-1 flex items-center gap-1.5">
              <button
                onClick={() => onOpenWorkspaceModal('create')}
                className="flex-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 py-1.5 px-2 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Buat Baru</span>
              </button>
              <button
                onClick={() => onOpenWorkspaceModal('join')}
                className="flex-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 py-1.5 px-2 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <KeyRound className="w-3 h-3 text-amber-500" />
                <span>Gabung Tim</span>
              </button>
            </div>
          </div>

          {/* Quick Database Status Info */}
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/60 text-[11px] text-slate-500">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold text-slate-700">MySQL XAMPP</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Terhubung
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Database: <strong className="text-slate-600">exasti</strong>
            </p>
          </div>
        </div>

        {/* 5. Footer: User Profile & Logout */}
        <div className="p-3.5 border-t border-slate-200/90 bg-white">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {user?.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Keluar dari akun"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
