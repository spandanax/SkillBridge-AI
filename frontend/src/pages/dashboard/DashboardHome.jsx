import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { progressAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Target, Map, FolderOpen, Clock, TrendingUp, ArrowRight, AlertCircle, Zap, Trophy } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, sub, color = 'primary', to }) => (
  <Link to={to || '#'} className="card hover:border-primary-500/20 group">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center`}>
        <Icon size={20} className={`text-${color}-400`} />
      </div>
      {to && <ArrowRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />}
    </div>
    <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
    <p className="text-sm font-medium text-slate-300">{label}</p>
    {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
  </Link>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-white font-semibold">{payload[0].value}h learned</p>
      </div>
    );
  }
  return null;
};

export default function DashboardHome() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressAPI.getDashboard()
      .then(res => setData(res.data.dashboard))
      .catch(() => {}) // silent — show empty state
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  const weeklyData = (data?.weeklyActivity || []).slice(-7).map(a => ({
    day: new Date(a.date).toLocaleDateString('en', { weekday: 'short' }),
    hours: a.hoursLearned || 0,
  }));

  // Fill missing days
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = daysOfWeek.map(day => {
    const found = weeklyData.find(d => d.day === day);
    return { day, hours: found?.hours || 0 };
  });

  const nextSteps = [];
  if (!data?.careerGoal) nextSteps.push({ label: 'Complete your profile', to: '/dashboard/profile', icon: '👤' });
  else if (!data?.skillsAssessed) nextSteps.push({ label: 'Take your skill assessment', to: '/dashboard/assessment', icon: '🎯' });
  else if (!data?.roadmapProgress?.total) nextSteps.push({ label: 'Generate your learning roadmap', to: '/dashboard/roadmap', icon: '🗺️' });
  else nextSteps.push({ label: 'Continue your roadmap', to: '/dashboard/roadmap', icon: '📚' });

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-slate-400 mt-1">
            {data?.careerGoal
              ? `Tracking your journey to become a ${data.careerGoal}`
              : 'Set up your profile to get personalized recommendations'}
          </p>
        </div>
        <Link to="/dashboard/assessment" className="btn-primary hidden sm:inline-flex items-center gap-2 text-sm">
          <Zap size={15} /> Quick Assessment
        </Link>
      </div>

      {/* Next Step Banner */}
      {nextSteps.length > 0 && (
        <div className="bg-primary-600/10 border border-primary-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{nextSteps[0].icon}</span>
            <div>
              <p className="text-primary-300 font-medium text-sm">Recommended next step</p>
              <p className="text-white text-sm">{nextSteps[0].label}</p>
            </div>
          </div>
          <Link to={nextSteps[0].to} className="btn-primary text-sm px-4 py-2 flex-shrink-0">
            Go <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Career Goal"
          value={data?.careerGoal ? '✓' : '—'}
          sub={data?.careerGoal || 'Not set yet'}
          color="indigo"
          to="/dashboard/profile"
        />
        <StatCard
          icon={TrendingUp}
          label="Readiness Score"
          value={data?.assessmentScore ? `${data.assessmentScore}%` : '—'}
          sub={data?.readinessLevel || 'Take assessment'}
          color="purple"
          to="/dashboard/skill-gap"
        />
        <StatCard
          icon={Map}
          label="Roadmap"
          value={data?.roadmapProgress?.total ? `${data.roadmapProgress.completed}/${data.roadmapProgress.total}` : '—'}
          sub="Tasks completed"
          color="blue"
          to="/dashboard/roadmap"
        />
        <StatCard
          icon={FolderOpen}
          label="Projects"
          value={data?.projects?.inProgress || 0}
          sub="In progress"
          color="pink"
          to="/dashboard/projects"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Activity Chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-white">Weekly Learning Activity</h2>
              <p className="text-slate-500 text-xs mt-0.5">Hours learned this week</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{data?.totalHoursLearned || 0}h</p>
              <p className="text-slate-500 text-xs">Total hours</p>
            </div>
          </div>
          {chartData.some(d => d.hours > 0) ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barSize={24}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.1)' }} />
                <Bar dataKey="hours" radius={[6,6,0,0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={_.hours > 0 ? '#6366f1' : 'rgba(99,102,241,0.2)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500">
              <Clock size={32} className="mb-2 opacity-30" />
              <p className="text-sm">No activity logged yet</p>
              <p className="text-xs mt-1">Mark roadmap tasks complete to log hours</p>
            </div>
          )}
        </div>

        {/* Roadmap Progress + Achievements */}
        <div className="space-y-4">
          {/* Roadmap Progress */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3">Roadmap Progress</h3>
            {data?.roadmapProgress?.total ? (
              <>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">{data.roadmapProgress.completed} of {data.roadmapProgress.total} tasks</span>
                  <span className="text-primary-400 font-medium">{data.roadmapProgress.percentage}%</span>
                </div>
                <div className="progress-bar h-2">
                  <div className="progress-fill h-full" style={{ width: `${data.roadmapProgress.percentage}%` }} />
                </div>
                <Link to="/dashboard/roadmap" className="text-primary-400 hover:text-primary-300 text-xs mt-3 flex items-center gap-1 transition-colors">
                  View Roadmap <ArrowRight size={12} />
                </Link>
              </>
            ) : (
              <div className="text-center py-4">
                <Map size={28} className="text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-xs">No roadmap yet</p>
                <Link to="/dashboard/roadmap" className="text-primary-400 text-xs hover:underline mt-1 block">Generate one →</Link>
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3">Achievements</h3>
            {data?.achievements?.length ? (
              <div className="space-y-2">
                {data.achievements.slice(0, 3).map((a, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="text-xl">{a.icon || '🏆'}</span>
                    <div>
                      <p className="text-white text-xs font-medium">{a.title}</p>
                      <p className="text-slate-500 text-xs">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Trophy size={28} className="text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-xs">Complete tasks to earn achievements</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* No backend notice */}
      <div className="card border-yellow-500/20 bg-yellow-500/5">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-300 text-sm font-medium">Backend Required</p>
            <p className="text-slate-400 text-xs mt-0.5">
              This dashboard pulls live data from the backend. Make sure MongoDB is connected and the backend is running on port 5000.
              Run <code className="bg-white/10 px-1 rounded text-xs">npm run seed</code> in the backend folder to populate sample data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
