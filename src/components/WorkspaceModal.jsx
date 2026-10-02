import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  KeyRound, 
  Check, 
  Copy, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X,
  Layers,
  Crown,
  ChevronRight
} from 'lucide-react';
import { taskApi } from '../services/taskApi';

export default function WorkspaceModal({
  isOpen,
  onClose,
  user,
  workspaces,
  currentWorkspace,
  onSelectWorkspace,
  onWorkspacesUpdated,
}) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create' | 'join'
  const [copiedCode, setCopiedCode] = useState(null);

  // Form states for creating workspace
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Form state for joining workspace
  const [joinCode, setJoinCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Handle Copy Join Code
  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Handle Create Workspace
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError('Nama workspace wajib diisi');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccessMsg('');
      const created = await taskApi.createWorkspace({
        name: newName.trim(),
        description: newDesc.trim(),
        userId: user.id,
      });

      setSuccessMsg(`Workspace "${created.name}" berhasil dibuat!`);
      setNewName('');
      setNewDesc('');
      await onWorkspacesUpdated();
      onSelectWorkspace(created);
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('list');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Gagal membuat workspace');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Join Workspace
  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setError('Kode workspace wajib dimasukkan');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccessMsg('');
      const joined = await taskApi.joinWorkspace({
        joinCode: joinCode.trim().toUpperCase(),
        userId: user.id,
      });

      setSuccessMsg(`Berhasil bergabung ke "${joined.name}"!`);
      setJoinCode('');
      await onWorkspacesUpdated();
      onSelectWorkspace(joined);
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('list');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Gagal bergabung ke workspace');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0" 
        onClick={currentWorkspace ? onClose : undefined} 
        aria-hidden="true" 
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Kelola Workspace
              </h3>
              <p className="text-xs text-slate-500">
                Pilih workspace aktif, buat baru, atau gabung lewat kode undangan
              </p>
            </div>
          </div>

          {currentWorkspace && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 pb-1 border-b border-slate-100 bg-white flex gap-2">
          <button
            type="button"
            onClick={() => { setActiveTab('list'); setError(''); setSuccessMsg(''); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Daftar Workspace ({workspaces.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('create'); setError(''); setSuccessMsg(''); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Buat Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('join'); setError(''); setSuccessMsg(''); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'join'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Gabung via Kode</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LIST WORKSPACES */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              {workspaces.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">Belum ada workspace</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Buat workspace baru atau minta kode undangan dari rekan tim Anda.
                  </p>
                </div>
              ) : (
                workspaces.map((ws) => {
                  const isActive = currentWorkspace && currentWorkspace.id === ws.id;
                  const isOwner = ws.role === 'owner' || ws.created_by === user.id;

                  return (
                    <div
                      key={ws.id}
                      onClick={() => {
                        onSelectWorkspace(ws);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                        isActive
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-900 truncate">
                            {ws.name}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                              Aktif
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                            isOwner 
                              ? 'bg-amber-50 text-amber-800 border-amber-200' 
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {isOwner && <Crown className="w-2.5 h-2.5 text-amber-500" />}
                            {isOwner ? 'Owner' : 'Member'}
                          </span>
                        </div>

                        {ws.description && (
                          <p className="text-xs text-slate-500 mt-1 truncate">
                            {ws.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-medium">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {ws.total_members || 1} Anggota
                          </span>
                          <span>•</span>
                          <span>{ws.total_tasks || 0} Tugas</span>
                        </div>
                      </div>

                      {/* Join code & action */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleCopyCode(ws.join_code, e)}
                          title="Salin kode undangan workspace"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer shadow-2xs"
                        >
                          {copiedCode === ws.join_code ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-600 font-sans">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>{ws.join_code}</span>
                            </>
                          )}
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: CREATE WORKSPACE */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Ruang Kerja (Workspace) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Tim Tugas Akhir Pemrograman Web"
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 transition-all outline-hidden font-medium"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Deskripsi / Catatan Proyek (Opsional)
                </label>
                <textarea
                  rows="3"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Jelaskan tujuan atau anggota kelompok workspace ini..."
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 transition-all outline-hidden resize-none font-medium"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <Crown className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Setelah dibuat, sistem akan otomatis menghasilkan <strong>Kode Undangan Unik</strong> yang dapat Anda bagikan ke rekan sekelompok.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Membuat Workspace...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Buat Workspace Sekarang</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: JOIN VIA CODE */}
          {activeTab === 'join' && (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Masukkan Kode Undangan Workspace <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: EXA-95Z2X"
                    disabled={isLoading}
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 text-base font-mono font-bold tracking-wider text-slate-900 placeholder-slate-400 uppercase transition-all outline-hidden"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Dapatkan kode unik dari ketua kelompok / pembuat workspace Anda.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Kode...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Gabung ke Workspace</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
