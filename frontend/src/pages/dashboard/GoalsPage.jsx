import { useState, useEffect } from 'react';
import { goalsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Trophy, Bell, Plus, CheckCircle2, Circle, Clock, Trash2, Target } from 'lucide-react';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', targetHoursPerWeek: 5 });

  const fetchData = async () => {
    try {
      const [goalsRes, notifRes] = await Promise.all([
        goalsAPI.getAll(),
        goalsAPI.getNotifications()
      ]);
      setGoals(goalsRes.data.goals);
      setNotifications(notifRes.data.notifications);
    } catch (err) {
      toast.error('Failed to load goals data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title) return;
    try {
      const res = await goalsAPI.create(newGoal);
      setGoals([res.data.goal, ...goals]);
      setShowAddForm(false);
      setNewGoal({ title: '', targetHoursPerWeek: 5 });
      toast.success('Goal created!');
      // Refresh notifications to show the new one
      goalsAPI.getNotifications().then(res => setNotifications(res.data.notifications));
    } catch (err) {
      toast.error('Failed to create goal.');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const status = currentStatus === 'active' ? 'completed' : 'active';
    try {
      await goalsAPI.update(id, { status });
      setGoals(goals.map(g => g._id === id ? { ...g, status } : g));
      if (status === 'completed') toast.success('Goal completed! 🏆');
    } catch (err) {
      toast.error('Failed to update goal.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await goalsAPI.delete(id);
      setGoals(goals.filter(g => g._id !== id));
      toast.success('Goal deleted.');
    } catch (err) {
      toast.error('Failed to delete goal.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
          <Trophy size={20} className="text-white" />
        </div>
        <div>
          <h1 className="section-title">Goals & Notifications</h1>
          <p className="text-slate-400 text-sm">Set weekly targets and track your achievements.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Goals List */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">My Goals</h2>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
            >
              <Plus size={14} /> {showAddForm ? 'Cancel' : 'New Goal'}
            </button>
          </div>

          {showAddForm && (
            <div className="card-elevated animate-fade-in border-primary-500/30 bg-primary-500/5">
              <form onSubmit={handleAddGoal} className="space-y-4">
                <div>
                  <label className="label text-xs">Goal Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Learn React hooks deeply" 
                    className="input-field py-2"
                    value={newGoal.title}
                    onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="label text-xs">Target Hours / Week</label>
                  <input 
                    type="number" 
                    min={1} max={40}
                    className="input-field py-2"
                    value={newGoal.targetHoursPerWeek}
                    onChange={e => setNewGoal({...newGoal, targetHoursPerWeek: Number(e.target.value)})}
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-2 text-sm">Save Goal</button>
              </form>
            </div>
          )}

          {goals.length === 0 && !showAddForm ? (
            <div className="card text-center py-10">
              <Target size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No goals set yet. Start by adding a weekly learning target!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map(goal => (
                <div key={goal._id} className={`card p-4 flex gap-3 transition-opacity ${goal.status === 'completed' ? 'opacity-60' : ''}`}>
                  <button 
                    onClick={() => handleToggleStatus(goal._id, goal.status)}
                    className="mt-0.5 text-slate-400 hover:text-white transition-colors"
                  >
                    {goal.status === 'completed' ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${goal.status === 'completed' ? 'text-slate-400 line-through' : 'text-white'}`}>
                      {goal.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><Clock size={12}/> {goal.targetHoursPerWeek}h / week</span>
                      <span className={`px-1.5 py-0.5 rounded ${goal.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-primary-500/10 text-primary-400'}`}>
                        {goal.status}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(goal._id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell size={18} /> Notifications
            </h2>
            {notifications.some(n => !n.isRead) && (
              <button 
                onClick={async () => {
                  await goalsAPI.markAllRead();
                  setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                }}
                className="text-xs text-primary-400 hover:text-primary-300"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="bg-slate-800 border border-white/5 rounded-2xl overflow-hidden">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No new notifications
              </div>
            ) : (
              <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                {notifications.map(n => (
                  <div key={n._id} className={`p-4 ${!n.isRead ? 'bg-primary-500/5' : ''}`}>
                    <div className="flex gap-3">
                      <span className="text-lg mt-0.5">{n.icon || (n.type === 'success' ? '✅' : n.type === 'achievement' ? '🏆' : '🔔')}</span>
                      <div>
                        <h4 className={`text-sm ${!n.isRead ? 'font-semibold text-white' : 'font-medium text-slate-300'}`}>
                          {n.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-slate-500 mt-2">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
