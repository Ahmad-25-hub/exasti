import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Crown, 
  UserCheck, 
  KeyRound, 
  Copy, 
  Check, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck, 
  UserPlus, 
  Mail, 
  Calendar, 
  RefreshCw 
} from 'lucide-react';
import { taskApi } from '../services/taskApi';

export default function TeamView({
  currentWorkspace,
  user,
  onBackToBoard,
  onOpenWorkspaceModal,
}) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const fetchMembers = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    try {
      setIsLoading(true);
      setError('');
      const data = await taskApi.getWorkspaceDetail(currentWorkspace.id);
      if (data && data.members) {
        setMembers(data.members);
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Gagal memuat anggota workspace');
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleCopyCode = () => {
    if (!currentWorkspace?.join_code) return;
    navigator.clipboard.writeText(currentWorkspace.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={onBackToBoard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Papan Kanban</span>
          </button>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Anggota &amp; Kolaborasi Tim</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Daftar anggota yang memiliki akses ke workspace <strong>{currentWorkspace?.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMembers}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            title="Segarkan daftar anggota"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={() => onOpenWorkspaceModal('join')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Gabung Workspace Lain</span>
          </button>
        </div>
      </div>

      {/* Invite Code Highlight Box */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-indigo-100 text-[11px] font-semibold backdrop-blur-md">
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              <span>Undang Anggota Kelompok</span>
            </div>
            <h3 className="text-lg font-bold">
              Ajak teman berkolaborasi di workspace ini
            </h3>
            <p className="text-xs text-indigo-100/90 max-w-xl leading-relaxed">
              Bagikan kode unik di samping ke rekan satu tim. Mereka cukup login dan memasukkan kode ini melalui menu <strong>&ldquo;Gabung Tim&rdquo;</strong> untuk langsung melihat dan mengelola tugas bersama.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shrink-0">
            <div>
              <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">
                Kode Undangan Tim
              </p>
              <p className="text-2xl font-mono font-extrabold tracking-widest text-amber-300 mt-0.5">
                {currentWorkspace?.join_code || '---'}
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              title="Salin Kode Undangan"
              className="p-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-semibold transition-all cursor-pointer shadow-xs"
            >
              {copied ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold px-1">
                  <Check className="w-4 h-4" />
                  <span>Tersalin!</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold px-1">
                  <Copy className="w-4 h-4" />
                  <span>Salin Kode</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Members List Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Daftar Anggota Aktif ({members.length})
            </h3>
            <p className="text-xs text-slate-400">
              Hak akses dan status keanggotaan dalam database MySQL
            </p>
          </div>
        </div>

        {isLoading && members.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mb-2" />
            <p className="text-xs text-slate-500 font-medium">Memuat data anggota...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map((member) => {
              const isCurrentUser = member.id === user?.id;
              const isOwner = member.role === 'owner';

              return (
                <div
                  key={member.id}
                  className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs shrink-0 ${
                      isOwner
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    }`}>
                      {member.name?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {member.name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Anda
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{member.email}</span>
                        </span>
                        {member.joined_at && (
                          <span className="hidden sm:flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>Bergabung {member.joined_at.split(' ')[0]}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isOwner ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                        <span>Owner Workspace</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                        <span>Anggota Tim</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-2xl flex items-start gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-800">Privasi &amp; Isolasi Data Workspace</p>
          <p className="mt-0.5 leading-relaxed">
            Semua tugas (Kanban Board) yang dibuat di dalam workspace ini hanya dapat diakses, diedit, dan dipindahkan oleh anggota yang terdaftar di atas. Anggota workspace lain tidak dapat melihat isi tugas Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
