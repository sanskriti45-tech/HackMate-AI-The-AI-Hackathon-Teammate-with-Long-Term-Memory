import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Calendar as CalendarIcon, List, LayoutGrid, 
  Clock, CheckSquare, MessageSquare, AlertCircle, X, Sparkles, Send, Flame
} from 'lucide-react';
import { Workspace, Task, TaskStatus, TaskPriority } from '../types';
import confetti from 'canvas-confetti';
import ToggleSwitch from './ToggleSwitch';

interface TasksViewProps {
  workspace: Workspace;
  tasks: Task[];
  onAddTask: (taskData: any) => Promise<void>;
  onUpdateTask: (id: string, updates: any) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

export default function TasksView({ 
  workspace, 
  tasks, 
  onAddTask, 
  onUpdateTask, 
  onDeleteTask 
}: TasksViewProps) {
  const [activeTab, setActiveTab] = useState<'kanban' | 'timeline' | 'calendar' | 'list'>('kanban');
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showOnlyHighPriority, setShowOnlyHighPriority] = useState(false);

  // Form states for creating task
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');

  // Comment input state
  const [commentText, setCommentText] = useState('');

  // Filtered tasks array
  const displayedTasks = showOnlyHighPriority ? tasks.filter(t => t.priority === 'high') : tasks;

  const statusColumns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'todo', label: 'Todo Backlog', color: 'bg-gray-400' },
    { id: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
    { id: 'review', label: 'In Review', color: 'bg-indigo-500' },
    { id: 'done', label: 'Completed', color: 'bg-emerald-500' }
  ];

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onAddTask({
      title,
      description,
      priority,
      assigneeId: assigneeId || null,
      startDate,
      deadline
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setAssigneeId('');
    setStartDate('');
    setDeadline('');
    setShowCreateDrawer(false);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await onUpdateTask(taskId, { status: newStatus });
    if (newStatus === 'done') {
      // Confetti burst on task finished!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    // Refresh detail drawer if open
    if (selectedTask?.id === taskId) {
      const updated = tasks.find(t => t.id === taskId);
      if (updated) setSelectedTask({ ...updated, status: newStatus });
    }
  };

  const handleProgressChange = async (taskId: string, pct: number) => {
    await onUpdateTask(taskId, { progress: pct });
    if (pct === 100) {
      handleStatusChange(taskId, 'done');
    } else if (selectedTask?.id === taskId) {
      const updated = tasks.find(t => t.id === taskId);
      if (updated) setSelectedTask({ ...updated, progress: pct });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTask) return;

    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText })
      });
      const data = await res.json();
      if (res.ok) {
        const updatedComments = [...selectedTask.comments, data];
        setSelectedTask({ ...selectedTask, comments: updatedComments });
        setCommentText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper getters
  const getMemberName = (id: string | null) => {
    if (!id) return 'Unassigned';
    const m = workspace.members.find(member => member.userId === id);
    return m ? m.name : id;
  };

  const getMemberAvatar = (id: string | null) => {
    if (!id) return 'https://api.dicebear.com/7.x/initials/svg?seed=U';
    const m = workspace.members.find(member => member.userId === id);
    return m ? m.avatar : 'https://api.dicebear.com/7.x/initials/svg?seed=' + id;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#F5F5F5] font-sans relative">
      {/* Sub Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Sprint Tasks Board</h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage tasks in Kanban columns, Calendar layouts, or Project Gantt timelines.</p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100/80 p-2 px-3 rounded-xl h-9.5">
            <ToggleSwitch
              id="high-priority-toggle"
              checked={showOnlyHighPriority}
              onChange={setShowOnlyHighPriority}
              activeColor="bg-red-500"
              icon={<Flame className="w-3.5 h-3.5 text-red-500" />}
              label="Urgent Only"
            />
          </div>

          <div className="bg-gray-100 p-1 rounded-xl flex">
            {[
              { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
              { id: 'list', label: 'List', icon: List },
              { id: 'timeline', label: 'Timeline', icon: Clock },
              { id: 'calendar', label: 'Calendar', icon: CalendarIcon }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowCreateDrawer(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-500/10 transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>
      </div>

      {/* Primary Tab Content Panel */}
      <div className="flex-1 overflow-y-auto p-8 h-full">
        {activeTab === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {statusColumns.map(col => {
              const columnTasks = displayedTasks.filter(t => t.status === col.id);
              return (
                <div key={col.id} className="bg-white border border-gray-100/80 rounded-3xl p-5 shadow-sm space-y-4">
                  {/* Column Header */}
                  <div className="flex justify-between items-center pb-2.5 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.color}`} />
                      <span className="text-xs font-bold text-gray-900">{col.label}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-bold font-mono rounded-md">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Task List */}
                  <div className="space-y-3.5 min-h-[300px]">
                    {columnTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="bg-[#F9F9F9] hover:bg-white hover:shadow-md hover:border-gray-200/50 border border-gray-100/50 rounded-2xl p-4 transition-all duration-300 cursor-pointer text-left space-y-3"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-xs font-bold text-gray-800 leading-snug line-clamp-1">{task.title}</h4>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono ${
                            task.priority === 'high' ? 'bg-red-50 text-red-700' :
                            task.priority === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-700'
                          }`}>
                            {task.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{task.description}</p>
                        
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] text-gray-400 font-mono">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all" style={{ width: `${task.progress}%` }} />
                          </div>
                        </div>

                        {/* Footer: assignee, date, comment counters */}
                        <div className="flex justify-between items-center pt-2.5 border-t border-gray-100/60">
                          <div className="flex items-center gap-1.5">
                            <img 
                              src={getMemberAvatar(task.assigneeId)} 
                              alt="assignee" 
                              className="w-5 h-5 rounded-full border border-gray-100"
                            />
                            <span className="text-[9px] text-gray-500 truncate max-w-[80px] font-medium">{getMemberName(task.assigneeId)}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[9px] text-gray-400 font-mono">
                            {task.comments.length > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {task.comments.length}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {task.deadline.split('-').slice(1).join('/')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'list' && (
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">All Sprints Backlog</h3>
            <div className="divide-y divide-gray-50">
              {displayedTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 px-4 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CheckSquare className={`w-4 h-4 shrink-0 ${task.status === 'done' ? 'text-emerald-500' : 'text-gray-400'}`} />
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 leading-snug">{task.title}</h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">Due: {task.deadline} • Priority: {task.priority}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] font-bold border border-gray-100 bg-white rounded-lg p-1.5 focus:outline-none focus:border-blue-500 font-mono"
                    >
                      <option value="todo">Todo</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Completed</option>
                    </select>
                    <img 
                      src={getMemberAvatar(task.assigneeId)} 
                      alt="assignee" 
                      className="w-6 h-6 rounded-full border"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 space-y-6">
            <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">Workspace Timeline (Gantt)</h3>
            <div className="space-y-5">
              {displayedTasks.map(task => (
                <div key={task.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-gray-800">
                    <span>{task.title}</span>
                    <span className="font-mono text-[10px] text-gray-400">{task.startDate} to {task.deadline}</span>
                  </div>
                  {/* Timeline segment bar */}
                  <div className="w-full h-4 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden relative">
                    <div className="h-full bg-blue-100/50 absolute left-1/4 right-1/4 rounded-lg flex items-center justify-center">
                      <div className="h-full bg-blue-500 rounded-lg" style={{ width: `${task.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 space-y-6">
            <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">July 2026 Calendar</h3>
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-gray-500 border-b pb-3 font-mono">
              <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
            </div>
            <div className="grid grid-cols-7 gap-2 text-left">
              {Array.from({ length: 31 }).map((_, idx) => {
                const day = idx + 1;
                const formattedDay = `2026-07-${day < 10 ? '0' + day : day}`;
                const dayTasks = displayedTasks.filter(t => t.deadline === formattedDay);
                return (
                  <div key={idx} className="min-h-[70px] bg-gray-50 border border-gray-100/50 rounded-xl p-1.5 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-gray-400 font-mono">{day}</span>
                    <div className="space-y-1">
                      {dayTasks.map(t => (
                        <div key={t.id} className="bg-blue-500 text-white text-[8px] font-bold py-0.5 px-1 rounded truncate leading-tight">
                          {t.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Drawer: Task Detail Sidebar */}
      <AnimatePresence>
        {selectedTask && (
          <>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/10 backdrop-blur-xs z-40" onClick={() => setSelectedTask(null)} />
            
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-gray-100 p-8 shadow-2xl z-50 overflow-y-auto flex flex-col space-y-6"
            >
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold font-mono rounded">Sprint Task</span>
                <button onClick={() => setSelectedTask(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title & description */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-900 leading-snug">{selectedTask.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
                  {selectedTask.description}
                </p>
              </div>

              {/* Progress sliders */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider block">Adjust Progress Pct</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedTask.progress}
                    onChange={(e) => handleProgressChange(selectedTask.id, parseInt(e.target.value))}
                    className="flex-1 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="text-xs font-bold font-mono text-gray-800">{selectedTask.progress}%</span>
                </div>
              </div>

              {/* Change Status */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider block">Modify Sprint Status</span>
                <div className="grid grid-cols-4 gap-2">
                  {(['todo', 'in_progress', 'review', 'done'] as TaskStatus[]).map(st => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedTask.id, st)}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold font-mono text-center transition-all ${
                        selectedTask.status === st 
                          ? 'bg-blue-500 text-white border border-blue-600 shadow-sm' 
                          : 'bg-gray-50 text-gray-600 border border-gray-100'
                      }`}
                    >
                      {st.toUpperCase().replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee & Dates details */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase font-mono tracking-wider block">Sprint Assignee</span>
                  <div className="flex items-center gap-2 mt-2">
                    <img src={getMemberAvatar(selectedTask.assigneeId)} className="w-6 h-6 rounded-full border" />
                    <span className="font-semibold text-gray-700">{getMemberName(selectedTask.assigneeId)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase font-mono tracking-wider block">Due Deadline</span>
                  <span className="font-semibold text-gray-700 block mt-2 font-mono">{selectedTask.deadline}</span>
                </div>
              </div>

              {/* Threaded Comments */}
              <div className="space-y-4 pt-4 border-t border-gray-50 flex-1 flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider block">Task Discussion Thread</span>
                
                {/* Comments Scrollable area */}
                <div className="flex-1 overflow-y-auto space-y-3.5 max-h-48 pr-1">
                  {selectedTask.comments.length > 0 ? (
                    selectedTask.comments.map(com => (
                      <div key={com.id} className="flex gap-2.5 items-start text-[11px] leading-relaxed">
                        <img src={com.userAvatar} className="w-6 h-6 rounded-full border mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800">{com.userName}</span>
                            <span className="text-[8px] text-gray-400 font-mono">
                              {new Date(com.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-0.5">{com.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-[10px] text-gray-400 font-mono">No comments yet. Be the first to reply!</div>
                  )}
                </div>

                {/* Send comment */}
                <form onSubmit={handleAddComment} className="flex gap-2.5 bg-gray-50 border border-gray-100 rounded-2xl p-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Ask a question or update status..."
                    className="flex-1 bg-transparent px-3 py-1.5 text-xs focus:outline-none"
                  />
                  <button type="submit" className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Delete task buttons */}
              <button
                onClick={async () => {
                  if (confirm("Delete this task from sprint backlog?")) {
                    await onDeleteTask(selectedTask.id);
                    setSelectedTask(null);
                  }
                }}
                className="w-full text-center py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-xs font-bold rounded-2xl transition-all"
              >
                Delete Sprint Task
              </button>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Drawer: Create Task Slider */}
      <AnimatePresence>
        {showCreateDrawer && (
          <>
            <div className="absolute inset-0 bg-black/10 backdrop-blur-xs z-40" onClick={() => setShowCreateDrawer(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-gray-100 p-8 shadow-2xl z-50 overflow-y-auto flex flex-col space-y-6"
            >
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <h3 className="text-xs font-bold text-gray-900 uppercase font-mono tracking-wider">Create Sprint Task</h3>
                <button onClick={() => setShowCreateDrawer(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">Task Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Integrate Gemini with Slack webhooks"
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-sm transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Task summary details, criteria..."
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-sm transition-all h-24"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-sm transition-all font-mono"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">Assignee</label>
                    <select
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-sm transition-all"
                    >
                      <option value="">Unassigned</option>
                      {workspace.members.map(m => (
                        <option key={m.userId} value={m.userId}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-sm transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider mb-1.5">Deadline</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-sm transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#0066FF] hover:bg-blue-600 text-white font-semibold text-xs rounded-2xl shadow-lg shadow-blue-500/10 transition-all duration-300"
                >
                  Create Project Task
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
