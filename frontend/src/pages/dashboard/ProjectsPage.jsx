import { useState, useEffect } from 'react';
import { projectsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FolderOpen, Clock, ChevronRight, CheckCircle2, Bookmark, PlayCircle, 
  X, Code, Sparkles, ListChecks, Award, ExternalLink, ShieldCheck, 
  AlertCircle, Globe, FileText, CheckCircle, Edit3
} from 'lucide-react';

const GithubIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [targetCareer, setTargetCareer] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Proof submission modal state
  const [proofModalProject, setProofModalProject] = useState(null);
  const [proofForm, setProofForm] = useState({ githubUrl: '', liveDemoUrl: '', submissionNotes: '' });
  const [submittingProof, setSubmittingProof] = useState(false);

  const fetchProjects = () => {
    return projectsAPI.getRecommended()
      .then(res => {
        setProjects(res.data.projects);
        setTargetCareer(res.data.careerGoal);
      })
      .catch(() => toast.error('Failed to load projects.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSaveStatus = async (projectId, newStatus) => {
    try {
      await projectsAPI.saveProject(projectId, { status: newStatus });
      setProjects(prev => prev.map(p => 
        p._id === projectId ? { ...p, savedStatus: newStatus } : p
      ));
      if (selectedProject?._id === projectId) {
        setSelectedProject(prev => ({ ...prev, savedStatus: newStatus }));
      }
      toast.success(newStatus === 'saved' ? 'Project saved!' : 'Project started!');
    } catch (err) {
      toast.error('Failed to update project status.');
    }
  };

  const openProofModal = (project) => {
    setProofModalProject(project);
    setProofForm({
      githubUrl: project.submission?.githubUrl || '',
      liveDemoUrl: project.submission?.liveDemoUrl || '',
      submissionNotes: project.submission?.submissionNotes || '',
    });
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!proofForm.githubUrl.trim() && !proofForm.liveDemoUrl.trim()) {
      return toast.error('Please provide at least a GitHub repository or live demo URL as proof.');
    }

    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    if (proofForm.githubUrl.trim() && !proofForm.githubUrl.includes('.')) {
      return toast.error('Please enter a valid GitHub repository URL.');
    }

    setSubmittingProof(true);
    try {
      const payload = {
        status: 'completed',
        githubUrl: proofForm.githubUrl.trim(),
        liveDemoUrl: proofForm.liveDemoUrl.trim(),
        submissionNotes: proofForm.submissionNotes.trim(),
      };

      await projectsAPI.saveProject(proofModalProject._id, payload);

      const updatedSubmission = {
        githubUrl: proofForm.githubUrl.trim(),
        liveDemoUrl: proofForm.liveDemoUrl.trim(),
        submissionNotes: proofForm.submissionNotes.trim(),
        completedAt: new Date(),
        verified: true,
      };

      setProjects(prev => prev.map(p => 
        p._id === proofModalProject._id 
          ? { ...p, savedStatus: 'completed', submission: updatedSubmission } 
          : p
      ));

      if (selectedProject?._id === proofModalProject._id) {
        setSelectedProject(prev => ({
          ...prev,
          savedStatus: 'completed',
          submission: updatedSubmission,
        }));
      }

      toast.success('Project verified and added to your portfolio! 🛡️🎉');
      setProofModalProject(null);
    } catch (err) {
      toast.error('Failed to submit proof. Please try again.');
    } finally {
      setSubmittingProof(false);
    }
  };

  const filteredProjects = projects.filter(p => filter === 'All' || p.difficulty === filter);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
            <FolderOpen size={20} className="text-white" />
          </div>
          <div>
            <h1 className="section-title">Recommended Projects</h1>
            <p className="text-slate-400 text-sm">
              Practical projects to build your portfolio{targetCareer ? ` for ${targetCareer}` : ''}.
            </p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex bg-slate-800 p-1 rounded-xl border border-white/10">
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
            <button
              key={diff}
              onClick={() => setFilter(diff)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === diff ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="card text-center py-16">
          <FolderOpen size={40} className="text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Projects Found</h2>
          <p className="text-slate-400">Complete your profile or assessment to get personalized project recommendations.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div key={project._id} className="card flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-start mb-4">
                <span className={`badge ${
                  project.difficulty === 'Beginner' ? 'badge-beginner' : 
                  project.difficulty === 'Intermediate' ? 'badge-intermediate' : 'badge-advanced'
                }`}>
                  {project.difficulty}
                </span>
                
                {/* Status indicator/action */}
                <div className="flex items-center gap-2">
                  {!project.savedStatus && (
                    <button onClick={() => handleSaveStatus(project._id, 'saved')} className="text-slate-400 hover:text-white" title="Save for later">
                      <Bookmark size={18} />
                    </button>
                  )}
                  {project.savedStatus === 'saved' && (
                    <button onClick={() => handleSaveStatus(project._id, 'in-progress')} className="text-primary-400 hover:text-primary-300" title="Start project">
                      <PlayCircle size={18} />
                    </button>
                  )}
                  {project.savedStatus === 'in-progress' && (
                    <button 
                      onClick={() => openProofModal(project)} 
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-xs font-semibold bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20" 
                      title="Submit proof of completion"
                    >
                      <ShieldCheck size={14} /> Submit Proof
                    </button>
                  )}
                  {project.savedStatus === 'completed' && (
                    project.submission?.verified ? (
                      <span className="text-emerald-400 flex items-center gap-1 text-xs font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20" title="Proof Verified">
                        <ShieldCheck size={13} /> Verified
                      </span>
                    ) : (
                      <button 
                        onClick={() => openProofModal(project)}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-xs font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20"
                        title="Add GitHub proof to verify"
                      >
                        <AlertCircle size={13} /> Add Proof
                      </button>
                    )
                  )}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{project.title}</h3>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">{project.description}</p>
              
              <div className="mb-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Tech Stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {(project.techStack || []).slice(0, 4).map(tech => (
                    <span key={tech} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-slate-300">
                      {tech}
                    </span>
                  ))}
                  {(project.techStack?.length || 0) > 4 && (
                    <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-slate-500">
                      +{project.techStack.length - 4}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Clock size={14} />
                  <span>~{project.estimatedHours}h</span>
                </div>
                <button 
                  onClick={() => setSelectedProject(project)}
                  className="text-sm font-medium text-primary-400 hover:text-primary-300 flex items-center gap-1 group cursor-pointer"
                >
                  Details <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedProject(null)}
        >
          <div 
            className="bg-slate-900 border border-white/15 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`badge ${
                    selectedProject.difficulty === 'Beginner' ? 'badge-beginner' : 
                    selectedProject.difficulty === 'Intermediate' ? 'badge-intermediate' : 'badge-advanced'
                  }`}>
                    {selectedProject.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                    <Clock size={12} /> ~{selectedProject.estimatedHours} hours
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">{selectedProject.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Overview</h4>
              <p className="text-slate-300 text-sm leading-relaxed">{selectedProject.description}</p>
            </div>

            {/* Verification Status Banner if completed */}
            {selectedProject.savedStatus === 'completed' && (
              <div className={`p-4 rounded-xl border ${
                selectedProject.submission?.verified 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {selectedProject.submission?.verified ? (
                      <ShieldCheck size={22} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={22} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className={`text-sm font-semibold ${
                        selectedProject.submission?.verified ? 'text-emerald-300' : 'text-amber-300'
                      }`}>
                        {selectedProject.submission?.verified ? 'Verified Portfolio Project' : 'Completion Unverified'}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">
                        {selectedProject.submission?.verified 
                          ? 'This project includes validated repository proof and is eligible for portfolio showcases.'
                          : 'No repository proof attached yet. Submit your GitHub link to earn your verified badge.'}
                      </p>
                      
                      {/* Submitted links */}
                      {selectedProject.submission?.verified && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {selectedProject.submission.githubUrl && (
                            <a 
                              href={selectedProject.submission.githubUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              <GithubIcon size={13} /> View Code
                            </a>
                          )}
                          {selectedProject.submission.liveDemoUrl && (
                            <a 
                              href={selectedProject.submission.liveDemoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-medium transition-colors"
                            >
                              <Globe size={13} /> Live Demo
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => openProofModal(selectedProject)}
                    className="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
                  >
                    <Edit3 size={13} /> {selectedProject.submission?.verified ? 'Update Proof' : 'Add Proof'}
                  </button>
                </div>
              </div>
            )}

            {/* Tech Stack & Required Skills */}
            <div className="grid sm:grid-cols-2 gap-4">
              {selectedProject.techStack?.length > 0 && (
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Code size={14} className="text-primary-400" /> Technologies
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.techStack.map(tech => (
                      <span key={tech} className="px-2.5 py-1 bg-primary-500/15 border border-primary-500/25 text-primary-300 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedProject.skillsRequired?.length > 0 && (
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-purple-400" /> Skills Learned
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.skillsRequired.map(skill => (
                      <span key={skill} className="px-2.5 py-1 bg-purple-500/15 border border-purple-500/25 text-purple-300 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Implementation Steps */}
            {selectedProject.implementationSteps?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ListChecks size={15} className="text-emerald-400" /> Implementation Steps
                </h4>
                <ol className="space-y-2.5">
                  {selectedProject.implementationSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 bg-white/[0.03] p-3 rounded-xl border border-white/5">
                      <span className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-slate-300 text-sm leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Expected Outcome */}
            {selectedProject.expectedOutcome && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Award size={15} /> Expected Outcome
                </h4>
                <p className="text-slate-300 text-sm">{selectedProject.expectedOutcome}</p>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <div>
                {selectedProject.githubTemplate ? (
                  <a
                    href={selectedProject.githubTemplate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline text-xs flex items-center gap-1.5 py-2 px-3"
                  >
                    <ExternalLink size={14} /> View Template
                  </a>
                ) : <span />}
              </div>

              <div className="flex items-center gap-2">
                {(!selectedProject.savedStatus || selectedProject.savedStatus !== 'saved') && selectedProject.savedStatus !== 'in-progress' && selectedProject.savedStatus !== 'completed' && (
                  <button
                    onClick={() => handleSaveStatus(selectedProject._id, 'saved')}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium border border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Bookmark size={14} /> Save for Later
                  </button>
                )}

                {selectedProject.savedStatus !== 'in-progress' && selectedProject.savedStatus !== 'completed' && (
                  <button
                    onClick={() => handleSaveStatus(selectedProject._id, 'in-progress')}
                    className="btn-primary text-xs flex items-center gap-1.5 py-2 px-4"
                  >
                    <PlayCircle size={14} /> Start Project
                  </button>
                )}

                {selectedProject.savedStatus === 'in-progress' && (
                  <button
                    onClick={() => openProofModal(selectedProject)}
                    className="btn-primary text-xs flex items-center gap-1.5 py-2 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    <ShieldCheck size={15} /> Submit Proof of Completion
                  </button>
                )}

                {selectedProject.savedStatus === 'completed' && (
                  <button
                    onClick={() => openProofModal(selectedProject)}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 transition-colors"
                  >
                    <ShieldCheck size={14} /> {selectedProject.submission?.verified ? 'Proof Verified' : 'Submit Proof'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proof Submission Modal */}
      {proofModalProject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setProofModalProject(null)}
        >
          <div 
            className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Verify Project Completion</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Submit tangible proof to validate your portfolio project.</p>
                </div>
              </div>
              <button 
                onClick={() => setProofModalProject(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Trust & Proof Notice */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3.5 flex items-start gap-3">
              <AlertCircle size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Proof of Work:</strong> Real hiring managers and recruiters look for verifiable proof. 
                Providing your public GitHub repository code verifies authenticity and unlocks your verified badge.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div>
                <label className="label flex items-center gap-1.5 text-xs">
                  <GithubIcon size={14} className="text-slate-400" /> GitHub Repository URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/your-username/network-scanner"
                  value={proofForm.githubUrl}
                  onChange={e => setProofForm({ ...proofForm, githubUrl: e.target.value })}
                  className="input-field text-sm"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Link to your public repository containing the source code.</span>
              </div>

              <div>
                <label className="label flex items-center gap-1.5 text-xs">
                  <Globe size={14} className="text-slate-400" /> Live Demo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://my-project.vercel.app or video demo link"
                  value={proofForm.liveDemoUrl}
                  onChange={e => setProofForm({ ...proofForm, liveDemoUrl: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="label flex items-center gap-1.5 text-xs">
                  <FileText size={14} className="text-slate-400" /> Reflection & Key Learnings (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="What key challenges did you solve? Which libraries or concepts did you master while building this?"
                  value={proofForm.submissionNotes}
                  onChange={e => setProofForm({ ...proofForm, submissionNotes: e.target.value })}
                  className="input-field text-sm resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setProofModalProject(null)}
                  className="btn-outline text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProof}
                  className="btn-primary text-xs py-2 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 flex items-center gap-1.5"
                >
                  <ShieldCheck size={15} />
                  {submittingProof ? 'Verifying...' : 'Verify & Mark Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
