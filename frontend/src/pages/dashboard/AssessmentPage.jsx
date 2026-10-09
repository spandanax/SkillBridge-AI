import { useState, useEffect } from 'react';
import { assessmentAPI, careersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Loader2, Target, ChevronDown, Info } from 'lucide-react';

const careerOptions = ['Frontend Developer', 'Backend Developer', 'Full-Stack Developer', 'Data Analyst', 'Cybersecurity Analyst', 'UI/UX Designer', 'Cloud Engineer'];

// Career skill templates used if backend data is unavailable
const careerSkillsMap = {
  'Frontend Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Git', 'Responsive Design', 'REST APIs'],
  'Backend Developer': ['Node.js', 'JavaScript', 'Express.js', 'MongoDB', 'SQL', 'REST APIs', 'Git', 'Authentication & Security'],
  'Full-Stack Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'REST APIs', 'Git'],
  'Data Analyst': ['Python', 'SQL', 'Excel', 'Tableau', 'Pandas', 'Statistics', 'Data Visualization', 'Power BI'],
  'Cybersecurity Analyst': ['Networking', 'Linux', 'Security Protocols', 'Python', 'Threat Analysis', 'SIEM Tools', 'Cryptography', 'Ethical Hacking'],
  'UI/UX Designer': ['Figma', 'UI Design Principles', 'UX Research', 'Prototyping', 'User Testing', 'Typography & Color', 'Wireframing', 'HTML/CSS (basic)'],
  'Cloud Engineer': ['AWS/Azure/GCP', 'Linux', 'Docker', 'Kubernetes', 'Networking', 'Infrastructure as Code', 'CI/CD Pipelines', 'Python/Bash scripting'],
};

const ratingLabels = ['Not familiar', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];

export default function AssessmentPage() {
  const [careerGoal, setCareerGoal] = useState('');
  const [skills, setSkills] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existing, setExisting] = useState(null);

  useEffect(() => {
    assessmentAPI.get()
      .then(res => setExisting(res.data.assessment))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (careerGoal) {
      const skillList = careerSkillsMap[careerGoal] || [];
      setSkills(skillList);
      const initial = {};
      skillList.forEach(s => { initial[s] = 0; });
      setRatings(initial);
    }
  }, [careerGoal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!careerGoal) return toast.error('Please select a career goal.');
    const unrated = skills.filter(s => ratings[s] === undefined);
    if (unrated.length > 0) return toast.error('Please rate all skills.');

    setLoading(true);
    try {
      const skillRatings = skills.map(s => ({
        skillName: s,
        proficiency: ratings[s] || 0,
        category: 'General',
      }));
      await assessmentAPI.submit({ careerGoal, skillRatings });
      toast.success('Assessment submitted! View your skill gap analysis. 🎯');
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit assessment.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 animate-slide-up">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold text-white mb-2">Assessment Complete!</h2>
        <p className="text-slate-400 mb-6">Your skill levels have been saved. Check your skill gap analysis or generate a learning roadmap.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="/dashboard/skill-gap" className="btn-primary">View Skill Gap</a>
          <a href="/dashboard/roadmap" className="btn-secondary">Generate Roadmap</a>
          <button onClick={() => { setSubmitted(false); setCareerGoal(''); setSkills([]); setRatings({}); }} className="btn-outline">Retake Assessment</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <Target size={20} className="text-white" />
        </div>
        <div>
          <h1 className="section-title">Skill Assessment</h1>
          <p className="text-slate-400 text-sm">Rate your proficiency in relevant skills for your career goal.</p>
        </div>
      </div>

      {/* Existing assessment notice */}
      {existing && (
        <div className="card border-blue-500/20 bg-blue-500/5 flex items-start gap-3">
          <Info size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-slate-300 text-sm">
            You have a previous assessment for <span className="text-white font-medium">{existing.careerGoal}</span> (score: {existing.overallScore}%).
            You can retake it below to update your results.
          </p>
        </div>
      )}

      {/* Scoring explanation */}
      <div className="card border-primary-500/20 bg-primary-500/5">
        <h3 className="text-primary-300 font-medium text-sm mb-2 flex items-center gap-2"><Info size={15} /> How scoring works</h3>
        <p className="text-slate-400 text-xs leading-relaxed">
          Rate each skill from 0 (not familiar) to 5 (expert). Your overall score is calculated as
          <strong className="text-white"> (sum of your ratings) ÷ (max possible score) × 100</strong>.
          This score is an <em>estimate based on self-reported ratings</em> — not a guaranteed measure of employment readiness.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Career goal */}
        <div className="card-elevated">
          <label className="label text-base mb-3">Select Your Career Goal *</label>
          <div className="relative">
            <select
              id="assessment-career"
              className="input-field appearance-none pr-10"
              value={careerGoal}
              onChange={e => setCareerGoal(e.target.value)}
              required
            >
              <option value="">Choose a career path...</option>
              {careerOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Skill ratings */}
        {skills.length > 0 && (
          <div className="card-elevated space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Rate Your Skills</h2>
              <span className="text-xs text-slate-500">{skills.length} skills to rate</span>
            </div>
            <div className="space-y-6">
              {skills.map(skill => (
                <div key={skill}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-white">{skill}</label>
                    <span className="text-xs text-primary-400 font-medium bg-primary-500/10 px-2 py-0.5 rounded-full">
                      {ratingLabels[ratings[skill] || 0]}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4, 5].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRatings(p => ({ ...p, [skill]: val }))}
                        className={`flex-1 h-9 rounded-lg text-sm font-semibold transition-all duration-150 border
                          ${ratings[skill] === val
                            ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/25'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-primary-500/40 hover:text-white'
                          }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 mt-1">
                    <span>0 = Not familiar</span>
                    <span>5 = Expert</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {skills.length > 0 && (
          <div className="card bg-slate-800/50 border-white/5">
            <p className="text-slate-400 text-sm text-center">
              Current average:{' '}
              <span className="text-white font-semibold">
                {(Object.values(ratings).reduce((a, b) => a + b, 0) / (skills.length * 5) * 100).toFixed(0)}%
              </span>
              {' '}readiness estimate
            </p>
          </div>
        )}

        <button
          id="assessment-submit"
          type="submit"
          disabled={loading || skills.length === 0}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : '🎯 Submit Assessment'}
        </button>
      </form>
    </div>
  );
}
