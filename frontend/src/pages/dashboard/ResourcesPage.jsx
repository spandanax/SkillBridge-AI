import { useState, useEffect } from 'react';
import { resourcesAPI } from '../../services/api';
import { BookOpen, Search, Filter, ExternalLink, Star, Loader2 } from 'lucide-react';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    // Debounce or simple fetch for demo
    const fetchResources = async () => {
      setLoading(true);
      try {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (filterType !== 'All') params.type = filterType;
        const res = await resourcesAPI.getAll(params);
        setResources(res.data.resources);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(fetchResources, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterType]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h1 className="section-title">Resource Library</h1>
              <p className="text-slate-400 text-sm">Curated courses, tutorials, and documentation.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search resources..." 
              className="input-field pl-10 py-2 w-full"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="input-field py-2 w-full sm:w-40 appearance-none bg-slate-800"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Course">Course</option>
            <option value="Tutorial">Tutorial</option>
            <option value="Documentation">Documentation</option>
            <option value="Practice">Practice</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="text-primary-500 animate-spin" />
        </div>
      ) : resources.length === 0 ? (
        <div className="card text-center py-16">
          <BookOpen size={40} className="text-slate-600 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-white mb-2">No resources found</h2>
          <p className="text-slate-400 text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(resource => (
            <div key={resource._id} className="card flex flex-col hover:border-blue-500/30 transition-colors group">
              <div className="flex justify-between items-start mb-3">
                <span className="badge bg-blue-500/10 text-blue-400 border border-blue-500/20">{resource.resourceType}</span>
                {resource.isFree ? (
                  <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">FREE</span>
                ) : (
                  <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">PAID</span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                {resource.title}
              </h3>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">{resource.description}</p>
              
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(resource.skills || []).slice(0,3).map(s => (
                  <span key={s} className="text-[10px] font-medium text-slate-300 bg-slate-800 px-2 py-1 rounded">{s}</span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Star size={12} className="text-yellow-400" /> {resource.rating || 'N/A'}</span>
                  <span>{resource.provider}</span>
                </div>
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
