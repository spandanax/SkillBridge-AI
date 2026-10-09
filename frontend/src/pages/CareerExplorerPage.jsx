import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { careersAPI } from '../services/api';
import { Briefcase, ArrowLeft, Search, Loader2 } from 'lucide-react';

export default function CareerExplorerPage() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    careersAPI.getAll()
      .then(res => setCareers(res.data.careers))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = careers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      {/* Simple Nav */}
      <nav className="border-b border-white/5 bg-navy-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <div className="font-bold text-lg">SkillBridge <span className="text-gradient">AI</span></div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Briefcase size={32} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Explore Career Paths</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Discover in-demand tech careers, understand what they do, and see the exact skills you need to land your first job.
          </p>
        </div>

        <div className="max-w-md mx-auto relative mb-12">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search careers or tags (e.g., React, Data)..." 
            className="input-field pl-12 py-3 rounded-full bg-slate-800/50"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={40} className="text-primary-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-slate-400 py-10">No careers found matching "{search}"</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(career => (
              <Link key={career.slug} to={`/careers/${career.slug}`} className="card hover:-translate-y-1 transition-transform group">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl">{career.icon}</div>
                  <span className={`badge ${career.demandLevel === 'High' ? 'badge-advanced' : 'badge-intermediate'}`}>
                    {career.demandLevel} Demand
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">{career.name}</h2>
                <p className="text-sm text-slate-400 mb-6 line-clamp-3">{career.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-auto">
                  {career.tags.map(tag => (
                    <span key={tag} className="text-xs font-medium text-slate-300 bg-slate-800 px-2 py-1 rounded">#{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
