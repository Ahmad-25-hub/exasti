import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { COLUMNS } from '../data/initialTasks';

export default function AddTaskModal({
  isOpen,
  onClose,
  onAddTask,
  initialStatus = 'todo',
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize initialStatus when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setStatus(initialStatus || 'todo');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen, initialStatus]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul task wajib diisi!');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onAddTask({
        title: title.trim(),
        description: description.trim(),
        status: status || 'todo',
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan task ke database');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      
      {/* Backdrop click dismiss */}
      <div 
        className="fixed inset-0" 
        onClick={!isSubmitting ? onClose : undefined} 
        aria-hidden="true" 
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden z-10">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Tambah Task Baru
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Task akan langsung disimpan ke database MySQL
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul Task <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              disabled={isSubmitting}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="Contoh: Implementasi Form Validasi"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 transition-all outline-hidden font-medium disabled:bg-slate-100"
              autoFocus
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi Task
            </label>
            <textarea
              rows="3"
              value={description}
              disabled={isSubmitting}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan detail instruksi atau catatan tugas ini (opsional)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 transition-all outline-hidden resize-none disabled:bg-slate-100"
            />
          </div>

          {/* Status Select / Radio group */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Status Kolom Awal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COLUMNS.map((col) => {
                const isSelected = status === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setStatus(col.id)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center cursor-pointer disabled:opacity-50 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200 font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    {col.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs shadow-indigo-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Simpan Task</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
