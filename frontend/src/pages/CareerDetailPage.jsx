import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { careersAPI } from '../services/api';
import { ArrowLeft, Loader2, DollarSign, Activity, CheckCircle, Zap } from 'lucide-react';

export default function CareerDetailPage() {
  const { slug } = useParams();
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    careersAPI.getBySlug(slug)
      .then(res => setCareer(res.data.career))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <Loader2 size={40} className="text-primary-500 animate-spin" />
    </div>
  );

  if (!career) return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center text-white">
      <h1 className="text-2xl font-bold mb-4">Career not found</h1>
      <Link to="/careers" className="btn-primary">Browse Careers</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-navy-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/careers" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} /> Back to Explorer
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 animate-slide-up">
        {/* Header */}
        <div className="text-center">
          <div className="text-6xl mb-6">{career.icon}</div>
          <h1 className="text-4xl font-bold mb-4">{career.name}</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">{career.description}</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <div className="card py-3 px-6 flex items-center gap-3">
              <DollarSign className="text-green-400" size={24} />
              <div className="text-left">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Avg Salary</p>
                <p className="font-semibold text-white">{career.averageSalary}</p>
              </div>
            </div>
            <div className="card py-3 px-6 flex items-center gap-3">
              <Activity className="text-primary-400" size={24} />
              <div className="text-left">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Market Demand</p>
                <p className="font-semibold text-white">{career.demandLevel}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Required Skills */}
        <div className="card-elevated">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Zap className="text-yellow-400" /> Required Skills</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {career.requiredSkills.map(skill => (
              <div key={skill.skillName} className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-white">{skill.skillName}</h3>
                  <span className={`badge ${
                    skill.priority === 'Essential' ? 'badge-high' : 
                    skill.priority === 'Important' ? 'badge-medium' : 'badge-low'
                  }`}>
                    {skill.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span>Target Level: {skill.targetLevel || skill.targetProficiency}/5</span>
                  <span className="text-slate-600">•</span>
                  <span>{skill.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two Columns: Responsibilities & Learning Path */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-elevated">
            <h2 className="text-xl font-bold mb-6">What You'll Do</h2>
            <ul className="space-y-4">
              {career.responsibilities.map((task, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-primary-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{task}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-elevated">
            <h2 className="text-xl font-bold mb-6">Learning Path</h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
              {career.learningPath.map((step, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-navy-900 bg-primary-500 text-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <span className="text-[10px] font-bold text-white">{i + 1}</span>
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-slate-800/80 p-4 rounded-xl border border-white/5 shadow">
                    <span className="text-slate-300 text-sm">{step}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="card text-center py-12 bg-gradient-to-br from-slate-800 to-slate-900 border-primary-500/20">
          <h2 className="text-2xl font-bold mb-4">Ready to become a {career.name}?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">Create a free account to assess your current skills, find your exact gaps, and get a personalized learning roadmap.</p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="btn-primary">Start Your Journey</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
