import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle, Loader2, Palette, Check } from 'lucide-react';
import { COLOR_THEMES } from '../data/initialTasks';

export default function ColumnModal({
  isOpen,
  onClose,
  onSaveColumn,
  columnToEdit = null,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('indigo');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(columnToEdit);

  useEffect(() => {
    if (isOpen) {
      if (columnToEdit) {
        setTitle(columnToEdit.title || '');
        setDescription(columnToEdit.description || '');
        setColor(columnToEdit.color || 'indigo');
      } else {
        setTitle('');
        setDescription('');
        setColor('indigo');
      }
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen, columnToEdit]);

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
      setError('Judul kolom / board wajib diisi!');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSaveColumn({
        title: title.trim(),
        description: description.trim(),
        color,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan kolom');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0" 
        onClick={!isSubmitting ? onClose : undefined} 
        aria-hidden="true" 
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden z-10">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {isEditing ? 'Edit Kolom Board' : 'Tambah Kolom Board Baru'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing 
                ? 'Sesuaikan judul, deskripsi, atau tema warna kolom'
                : 'Buat kolom baru untuk memperluas alur kerja Kanban Anda'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul Kolom <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              disabled={isSubmitting}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="Contoh: Code Review, Testing / QA, Backlog"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 transition-all outline-hidden font-medium disabled:bg-slate-100"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi Kolom (Opsional)
            </label>
            <textarea
              rows="2"
              value={description}
              disabled={isSubmitting}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan tujuan atau kriteria kolom ini..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 text-sm text-slate-800 placeholder-slate-400 transition-all outline-hidden resize-none disabled:bg-slate-100"
            />
          </div>

          {/* Color Palette Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-500" />
              <span>Pilih Warna Aksen Kolom</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(COLOR_THEMES).map(([key, theme]) => {
                const isSelected = color === key;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setColor(key)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-200 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${theme.dotColor} shrink-0 flex items-center justify-center`}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    <span className="truncate">{theme.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
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
              className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  {isEditing ? null : <Plus className="w-4 h-4" />}
                  <span>{isEditing ? 'Simpan Perubahan' : 'Tambah Kolom'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
