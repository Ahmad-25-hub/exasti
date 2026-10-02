import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import KanbanBoard from './components/KanbanBoard';
import AddTaskModal from './components/AddTaskModal';
import EditTaskModal from './components/EditTaskModal';
import ColumnModal from './components/ColumnModal';
import AuthModal from './components/AuthModal';
import WorkspaceModal from './components/WorkspaceModal';
import { taskApi } from './services/taskApi';
import { formatColumn, COLUMNS } from './data/initialTasks';
import { 
  Search, 
  Info, 
  RotateCcw, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  KeyRound, 
  Copy, 
  Check,
  Plus
} from 'lucide-react';

export default function App() {
  // 1. User & Auth State (Persistent)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kanban_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 2. Workspace States
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);

  // 3. Dynamic Columns / Boards States
  const [columns, setColumns] = useState([]);
  const [isLoadingColumns, setIsLoadingColumns] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [columnToEdit, setColumnToEdit] = useState(null);

  // 4. Task & Board States
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notification, setNotification] = useState(null);

  // 5. Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialStatus, setAddModalInitialStatus] = useState('todo');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // 6. Search Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Fetch workspaces for logged in user
  const loadWorkspaces = useCallback(async (userId, preferredWsId = null) => {
    if (!userId) return [];
    try {
      setIsLoadingWorkspaces(true);
      const wsList = await taskApi.getUserWorkspaces(userId);
      setWorkspaces(wsList);

      // Tentukan workspace yang aktif
      let selected = null;
      if (preferredWsId) {
        selected = wsList.find((w) => w.id === Number(preferredWsId));
      }
      if (!selected) {
        const savedWsId = localStorage.getItem('kanban_active_ws');
        if (savedWsId) {
          selected = wsList.find((w) => w.id === Number(savedWsId));
        }
      }
      if (!selected && wsList.length > 0) {
        selected = wsList[0];
      }

      setCurrentWorkspace(selected || null);
      if (selected) {
        localStorage.setItem('kanban_active_ws', String(selected.id));
      }
      return wsList;
    } catch (err) {
      console.error('Error saat loadWorkspaces:', err);
      setErrorMessage(err.message || 'Gagal memuat daftar workspace');
      return [];
    } finally {
      setIsLoadingWorkspaces(false);
    }
  }, []);

  // Fetch columns per workspace
  const loadColumns = useCallback(async (workspaceId) => {
    if (!workspaceId) {
      setColumns([]);
      return;
    }
    try {
      setIsLoadingColumns(true);
      const data = await taskApi.getColumns(workspaceId);
      const formatted = Array.isArray(data) ? data.map(formatColumn) : [];
      setColumns(formatted.length > 0 ? formatted : COLUMNS.map(formatColumn));
    } catch (err) {
      console.error('Error saat loadColumns:', err);
      setColumns(COLUMNS.map(formatColumn));
    } finally {
      setIsLoadingColumns(false);
    }
  }, []);

  // Fetch tasks for the active workspace
  const loadTasks = useCallback(async (workspaceId) => {
    if (!workspaceId) {
      setTasks([]);
      return;
    }
    try {
      setIsLoadingTasks(true);
      setErrorMessage('');
      const data = await taskApi.getTasks(workspaceId);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error saat loadTasks:', err);
      setErrorMessage(
        err.message || 'Gagal memuat data task dari backend PHP / MySQL XAMPP'
      );
    } finally {
      setIsLoadingTasks(false);
    }
  }, []);

  // Effect saat user berubah / saat pertama kali dibuka
  useEffect(() => {
    if (user && user.id) {
      loadWorkspaces(user.id, user.default_workspace_id);
    } else {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setTasks([]);
      setColumns([]);
    }
  }, [user, loadWorkspaces]);

  // Effect saat currentWorkspace berubah -> load tasks & columns
  useEffect(() => {
    if (currentWorkspace && currentWorkspace.id) {
      loadColumns(currentWorkspace.id);
      loadTasks(currentWorkspace.id);
    } else {
      setTasks([]);
      setColumns([]);
    }
  }, [currentWorkspace, loadTasks, loadColumns]);

  // Auth Handlers
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('kanban_user', JSON.stringify(userData));
    showToast(`Selamat datang, ${userData.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('kanban_user');
    localStorage.removeItem('kanban_active_ws');
    setUser(null);
    setCurrentWorkspace(null);
    setWorkspaces([]);
    setTasks([]);
    setColumns([]);
    showToast('Anda telah keluar dari akun.');
  };

  // Workspace Switch Handler
  const handleSelectWorkspace = (ws) => {
    setCurrentWorkspace(ws);
    localStorage.setItem('kanban_active_ws', String(ws.id));
    showToast(`Beralih ke workspace "${ws.name}"`);
  };

  // Column CRUD Handlers
  const handleOpenAddColumnModal = () => {
    setColumnToEdit(null);
    setIsColumnModalOpen(true);
  };

  const handleOpenEditColumnModal = (col) => {
    setColumnToEdit(col);
    setIsColumnModalOpen(true);
  };

  const handleSaveColumn = async (payload) => {
    if (!currentWorkspace?.id) return;
    if (columnToEdit) {
      await taskApi.updateColumn(columnToEdit.column_id, payload);
      showToast(`Kolom "${payload.title}" berhasil diperbarui!`);
    } else {
      await taskApi.createColumn({
        workspaceId: currentWorkspace.id,
        ...payload,
      });
      showToast(`Kolom "${payload.title}" berhasil ditambahkan ke workspace!`);
    }
    await loadColumns(currentWorkspace.id);
    await loadTasks(currentWorkspace.id);
  };

  const handleDeleteColumn = async (col) => {
    if (!currentWorkspace?.id) return;
    try {
      await taskApi.deleteColumn(col.column_id);
      showToast(`Kolom "${col.title}" berhasil dihapus.`);
      await loadColumns(currentWorkspace.id);
      await loadTasks(currentWorkspace.id);
    } catch (err) {
      console.error(err);
      alert(`Gagal menghapus kolom: ${err.message}`);
    }
  };

  // Task Handlers
  const handleOpenAddModal = (status = null) => {
    const defaultStatus = status || (columns.length > 0 ? columns[0].id : 'todo');
    setAddModalInitialStatus(defaultStatus);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    setIsEditModalOpen(true);
  };

  const handleAddTask = async ({ title, description, status }) => {
    if (!currentWorkspace) {
      alert('Pilih workspace terlebih dahulu!');
      return;
    }

    const createdTask = await taskApi.createTask({
      title,
      description,
      status,
      workspaceId: currentWorkspace.id,
      userId: user?.id,
    });

    setTasks((prevTasks) => {
      const exists = prevTasks.some((t) => t.id === createdTask.id);
      if (exists) {
        return prevTasks.map((t) => (t.id === createdTask.id ? createdTask : t));
      }
      return [createdTask, ...prevTasks];
    });

    showToast(`Task "${createdTask.title}" berhasil disimpan ke MySQL!`);
  };

  const handleMoveTask = async (taskId, targetStatus) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask || targetTask.status === targetStatus) return;

    const previousTasks = [...tasks];

    // Optimistic UI update
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: targetStatus } : task
      )
    );

    try {
      const updatedTask = await taskApi.updateStatus(taskId, targetStatus);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, ...updatedTask } : task
        )
      );
      showToast(`Status task diperbarui ke ${targetStatus}`);
    } catch (err) {
      console.error(err);
      setTasks(previousTasks);
      alert(`Gagal memindahkan task: ${err.message}`);
    }
  };

  const handleSaveEditTask = async (id, payload) => {
    const updatedTask = await taskApi.updateTask(id, payload);
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? { ...task, ...updatedTask } : task))
    );
    showToast('Perubahan task berhasil disimpan!');
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskApi.deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      showToast('Task berhasil dihapus dari database.');
    } catch (err) {
      console.error(err);
      alert(`Gagal menghapus task: ${err.message}`);
    }
  };

  const handleCopyCurrentCode = () => {
    if (!currentWorkspace?.join_code) return;
    navigator.clipboard.writeText(currentWorkspace.join_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Filter tasks based on search
  const filteredTasks = tasks.filter((task) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = task.title?.toLowerCase().includes(query);
    const descMatch = task.description?.toLowerCase().includes(query);
    return titleMatch || descMatch;
  });

  // Effective columns list
  const effectiveColumns = columns.length > 0 ? columns : COLUMNS.map(formatColumn);

  // Jika belum login, tampilkan layar Auth
  if (!user) {
    return <AuthModal onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        user={user}
        currentWorkspace={currentWorkspace}
        onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
        onOpenAddModal={handleOpenAddModal}
        columns={effectiveColumns}
        tasks={tasks}
        onLogout={handleLogout}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-7">
        
        {/* Workspace Quick Invitation Banner */}
        {currentWorkspace && (
          <div className="mb-6 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-200" />
                <h3 className="text-lg font-extrabold tracking-tight">
                  {currentWorkspace.name}
                </h3>
              </div>
              <p className="text-xs text-indigo-100/90 mt-1 max-w-xl">
                {currentWorkspace.description || 'Ruang kerja tim untuk berkolaborasi dan mengelola progres tugas.'}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 self-start sm:self-auto">
              <KeyRound className="w-4 h-4 text-amber-300" />
              <div className="text-left">
                <p className="text-[10px] text-indigo-200 font-semibold uppercase tracking-wider">
                  Kode Undangan Tim
                </p>
                <p className="text-sm font-mono font-bold tracking-wider">
                  {currentWorkspace.join_code}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyCurrentCode}
                title="Salin kode untuk dibagikan ke teman kelompok"
                className="ml-2 p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-indigo-700 transition-all cursor-pointer"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Database & Connection Info Bar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${errorMessage ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${errorMessage ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span className="font-semibold text-slate-700">Database MySQL:</span>
            <span className="px-2 py-0.5 rounded-md font-mono bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
              exasti
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-slate-500 hidden sm:inline">
              Workspace Aktif: <strong>{currentWorkspace?.name}</strong> ({effectiveColumns.length} Kolom Board)
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-slate-500 hidden sm:inline">
              User: <strong>{user.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddColumnModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kolom</span>
            </button>

            <button
              onClick={() => {
                if (currentWorkspace) {
                  loadColumns(currentWorkspace.id);
                  loadTasks(currentWorkspace.id);
                }
              }}
              disabled={isLoadingTasks || isLoadingColumns}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${(isLoadingTasks || isLoadingColumns) ? 'animate-spin text-indigo-600' : ''}`} />
              <span>Sinkronkan Data</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-bold">Koneksi Backend / Database Gagal</p>
              <p className="mt-1 text-xs text-rose-700 leading-relaxed">{errorMessage}</p>
            </div>
            <button
              onClick={() => {
                if (currentWorkspace) {
                  loadColumns(currentWorkspace.id);
                  loadTasks(currentWorkspace.id);
                }
              }}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Action Header & Search */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Papan Manajemen Tugas
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>
                Setiap workspace memiliki kolom board dan alur tugas kustom tersendiri.
              </span>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari task..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs font-medium"
            />
          </div>
        </div>

        {/* Search Results Notice if active */}
        {searchQuery.trim() !== '' && (
          <div className="mb-4 text-xs text-slate-600 bg-indigo-50/70 border border-indigo-100 px-3.5 py-2 rounded-xl flex items-center justify-between">
            <span>
              Menampilkan hasil pencarian untuk &ldquo;<strong>{searchQuery}</strong>&rdquo; ({filteredTasks.length} task ditemukan)
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              Hapus Filter
            </button>
          </div>
        )}

        {/* Board Content */}
        {(isLoadingTasks && tasks.length === 0) || (isLoadingColumns && columns.length === 0) ? (
          <div className="py-28 flex flex-col items-center justify-center text-center bg-white/60 rounded-2xl border border-slate-200/60">
            <Loader2 className="w-9 h-9 text-indigo-600 animate-spin mb-3" />
            <p className="text-sm font-bold text-slate-800">
              Memuat data board &amp; task workspace dari MySQL...
            </p>
          </div>
        ) : (
          <KanbanBoard
            columns={effectiveColumns}
            tasks={filteredTasks}
            onMoveTask={handleMoveTask}
            onDeleteTask={handleDeleteTask}
            onOpenAddModal={handleOpenAddModal}
            onEditTask={handleOpenEditModal}
            onOpenAddColumnModal={handleOpenAddColumnModal}
            onEditColumn={handleOpenEditColumnModal}
            onDeleteColumn={handleDeleteColumn}
          />
        )}

      </main>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={handleAddTask}
        columns={effectiveColumns}
        initialStatus={addModalInitialStatus}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        task={taskToEdit}
        columns={effectiveColumns}
        onClose={() => {
          setIsEditModalOpen(false);
          setTaskToEdit(null);
        }}
        onSaveTask={handleSaveEditTask}
      />

      {/* Add / Edit Column Modal */}
      <ColumnModal
        isOpen={isColumnModalOpen}
        columnToEdit={columnToEdit}
        onClose={() => {
          setIsColumnModalOpen(false);
          setColumnToEdit(null);
        }}
        onSaveColumn={handleSaveColumn}
      />

      {/* Workspace Management Modal */}
      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        user={user}
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        onSelectWorkspace={handleSelectWorkspace}
        onWorkspacesUpdated={() => loadWorkspaces(user.id)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          Tugas Kuliah • Kanban Board Fullstack • Multi-Workspace &amp; Dynamic Boards MySQL (`exasti`)
        </div>
      </footer>

    </div>
  );
}
