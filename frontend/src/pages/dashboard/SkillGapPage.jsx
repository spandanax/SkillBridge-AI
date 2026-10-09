import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assessmentAPI } from '../../services/api';
import { BarChart2, AlertCircle, ArrowRight, TrendingUp, CheckCircle, Target } from 'lucide-react';

export default function SkillGapPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    assessmentAPI.gapAnalysis()
      .then(res => setData(res.data.gapAnalysis))
      .catch(err => setError(err.response?.data?.message || 'Failed to load gap analysis.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  if (error || !data) return (
    <div className="max-w-2xl mx-auto text-center py-20 animate-slide-up">
      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Target size={32} className="text-slate-400" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">No Analysis Available</h2>
      <p className="text-slate-400 mb-6">{error || 'Please complete a skill assessment to view your gap analysis.'}</p>
      <Link to="/dashboard/assessment" className="btn-primary">Take Assessment</Link>
    </div>
  );

  const { strong = [], improve = [], missing = [] } = data;

  const SkillBar = ({ skill, currentLevel, targetLevel }) => (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-white">{skill}</span>
        <span className="text-xs text-slate-400">Target: {targetLevel}/5</span>
      </div>
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        {/* Target marker */}
        <div 
          className="absolute top-0 bottom-0 border-l border-white/40 z-10" 
          style={{ left: `${(targetLevel / 5) * 100}%` }}
        />
        {/* Current progress */}
        <div 
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${
            currentLevel >= targetLevel ? 'bg-green-500' : 
            currentLevel === 0 ? 'bg-transparent' : 'bg-primary-500'
          }`}
          style={{ width: `${(Math.max(currentLevel, 0.1) / 5) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
        <span>Current: {currentLevel}</span>
        <span className={currentLevel >= targetLevel ? 'text-green-400' : 'text-red-400'}>
          {currentLevel >= targetLevel ? 'Ready' : `Gap: -${targetLevel - currentLevel}`}
        </span>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <BarChart2 size={20} className="text-white" />
        </div>
        <div>
          <h1 className="section-title">Skill Gap Analysis</h1>
          <p className="text-slate-400 text-sm">Target Career: <span className="text-white font-medium">{data.careerGoal}</span></p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Readiness Score Card */}
        <div className="card-elevated md:col-span-1 text-center flex flex-col justify-center items-center py-8">
          <div className="relative w-32 h-32 mb-4">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path
                className="text-white/10"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary-500 transition-all duration-1000"
                strokeWidth="3"
                strokeDasharray={`${data.readinessScore}, 100`}
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{data.readinessScore}%</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Career Readiness</h3>
          <p className="text-sm font-medium text-primary-400 mb-2">{data.readinessLevel}</p>
          <p className="text-xs text-slate-400 px-4">{data.disclaimer}</p>
        </div>

        {/* Action Summary */}
        <div className="md:col-span-2 space-y-4">
          <div className="card border-green-500/20 bg-green-500/5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle size={18} className="text-green-400" />
              <h3 className="font-semibold text-white">Strong Skills ({strong.length})</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {strong.length > 0 ? (
                strong.map(s => <span key={s.skillName} className="badge bg-green-500/10 text-green-300">{s.skillName}</span>)
              ) : (
                <span className="text-sm text-slate-400">No strong skills identified yet.</span>
              )}
            </div>
          </div>

          <div className="card border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={18} className="text-yellow-400" />
              <h3 className="font-semibold text-white">Skills to Improve ({improve.length})</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {improve.length > 0 ? (
                improve.map(s => <span key={s.skillName} className="badge bg-yellow-500/10 text-yellow-300">{s.skillName}</span>)
              ) : (
                <span className="text-sm text-slate-400">No improvement skills identified.</span>
              )}
            </div>
          </div>

          <div className="card border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle size={18} className="text-red-400" />
              <h3 className="font-semibold text-white">Missing Skills ({missing.length})</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {missing.length > 0 ? (
                missing.map(s => <span key={s.skillName} className="badge bg-red-500/10 text-red-300">{s.skillName}</span>)
              ) : (
                <span className="text-sm text-slate-400">No missing skills identified.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Skill Breakdown */}
      <div className="card-elevated">
        <h2 className="font-semibold text-white mb-6">Detailed Skill Breakdown</h2>
        
        {improve.length > 0 && (
          <div className="mb-8 last:mb-0">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Needs Improvement</h3>
            <div className="space-y-4">
              {improve.map(s => <SkillBar key={s.skillName} skill={s.skillName} currentLevel={s.currentLevel} targetLevel={s.targetLevel} />)}
            </div>
          </div>
        )}

        {missing.length > 0 && (
          <div className="mb-8 last:mb-0">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Critical Gaps (Missing)</h3>
            <div className="space-y-4">
              {missing.map(s => <SkillBar key={s.skillName} skill={s.skillName} currentLevel={s.currentLevel} targetLevel={s.targetLevel} />)}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center mt-8">
        <Link to="/dashboard/roadmap" className="btn-primary flex items-center gap-2">
          View Learning Roadmap <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
