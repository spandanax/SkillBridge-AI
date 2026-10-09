import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { roadmapAPI, progressAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Map, CheckCircle2, Circle, Clock, Loader2, ArrowRight, ExternalLink } from 'lucide-react';

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [updating, setUpdating] = useState(null);

  const fetchRoadmap = () => {
    setLoading(true);
    roadmapAPI.get()
      .then(res => setRoadmap(res.data.roadmap))
      .catch(() => setRoadmap(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await roadmapAPI.generate();
      setRoadmap(res.data.roadmap);
      toast.success('Learning roadmap generated successfully! 🗺️');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate roadmap. Make sure you have completed an assessment.');
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (itemId, currentStatus, estimatedHours) => {
    if (updating) return;
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    setUpdating(itemId);
    
    try {
      const res = await roadmapAPI.updateItem(itemId, { status: newStatus });
      setRoadmap(res.data.roadmap);
      
      if (newStatus === 'completed') {
        toast.success(`Task completed! 🎉`);
        // Log activity implicitly
        await progressAPI.logActivity({ 
          hoursLearned: estimatedHours || 0,
          notes: `Completed roadmap item` 
        }).catch(() => {}); // silent fail for activity log
      }
    } catch (err) {
      toast.error('Failed to update task status.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  if (!roadmap) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 animate-slide-up">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Map size={32} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">No Roadmap Found</h2>
        <p className="text-slate-400 mb-6">Generate a personalized learning roadmap based on your latest skill assessment.</p>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={handleGenerate} 
            disabled={generating}
            className="btn-primary flex items-center gap-2"
          >
            {generating ? <Loader2 size={18} className="animate-spin" /> : <Map size={18} />}
            {generating ? 'Generating...' : 'Generate Roadmap'}
          </button>
          <Link to="/dashboard/assessment" className="btn-secondary">Take Assessment</Link>
        </div>
      </div>
    );
  }

  const { items = [], careerGoal, progressPercentage, totalHours, completedHours } = roadmap;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Map size={20} className="text-white" />
          </div>
          <div>
            <h1 className="section-title">Learning Roadmap</h1>
            <p className="text-slate-400 text-sm">Path to becoming a <span className="text-white font-medium">{careerGoal}</span></p>
          </div>
        </div>
        <button onClick={handleGenerate} disabled={generating} className="btn-secondary text-sm hidden sm:block">
          {generating ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>

      {/* Overall Progress */}
      <div className="card-elevated">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="font-semibold text-white text-lg">Overall Progress</h2>
            <p className="text-sm text-slate-400">{completedHours} / {totalHours} estimated hours completed</p>
          </div>
          <div className="text-3xl font-bold text-primary-400">{progressPercentage}%</div>
        </div>
        <div className="progress-bar h-3 mb-2">
          <div className="progress-fill h-full" style={{ width: `${progressPercentage}%` }} />
        </div>
      </div>

      {/* Roadmap Items */}
      <div className="space-y-4">
        {items.map((item, index) => {
          const isCompleted = item.status === 'completed';
          return (
            <div 
              key={item._id} 
              className={`card flex gap-4 transition-all duration-300 ${isCompleted ? 'opacity-60 bg-white/5 border-transparent' : ''}`}
            >
              {/* Checkbox */}
              <button 
                onClick={() => handleStatusChange(item._id, item.status, item.estimatedHours)}
                disabled={updating === item._id}
                className="flex-shrink-0 mt-1 focus:outline-none group"
              >
                {updating === item._id ? (
                  <Loader2 size={24} className="text-primary-500 animate-spin" />
                ) : isCompleted ? (
                  <CheckCircle2 size={24} className="text-green-500" />
                ) : (
                  <Circle size={24} className="text-slate-500 group-hover:text-primary-400 transition-colors" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className={`font-semibold ${isCompleted ? 'text-slate-400 line-through' : 'text-white'} truncate`}>
                    {item.learningObjective}
                  </h3>
                  <span className={`badge ${
                    item.difficulty === 'Beginner' ? 'badge-beginner' : 
                    item.difficulty === 'Intermediate' ? 'badge-intermediate' : 'badge-advanced'
                  }`}>
                    {item.difficulty}
                  </span>
                  {item.priority === 'High' && !isCompleted && (
                    <span className="badge badge-high">High Priority</span>
                  )}
                </div>
                
                <p className={`text-sm mb-3 ${isCompleted ? 'text-slate-500' : 'text-slate-300'}`}>
                  Skill focus: <span className="font-medium text-white">{item.skillName}</span>
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={14} />
                    <span>~{item.estimatedHours} hours</span>
                  </div>
                  
                  {item.recommendedResource && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Suggested resource:</span>
                      {item.resourceUrl ? (
                        <a 
                          href={item.resourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 flex items-center gap-1"
                        >
                          {item.recommendedResource} <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-slate-400">{item.recommendedResource}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-8">
        <Link to="/dashboard/projects" className="btn-primary flex items-center gap-2">
          Ready to build? View Projects <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
