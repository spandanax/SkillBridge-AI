import { useState, useEffect } from 'react';
import { profileAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, User, Save } from 'lucide-react';

const educationOptions = ['High School', 'Diploma', 'Undergraduate', 'Graduate', 'Postgraduate', 'Self-taught'];
const experienceOptions = ['Beginner', 'Intermediate', 'Advanced'];
const careerOptions = ['Frontend Developer', 'Backend Developer', 'Full-Stack Developer', 'Data Analyst', 'Cybersecurity Analyst', 'UI/UX Designer', 'Cloud Engineer'];

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    educationLevel: '',
    degree: '',
    branch: '',
    currentSkills: '',
    interests: '',
    preferredCareer: '',
    experienceLevel: 'Beginner',
    weeklyLearningHours: 5,
    linkedinUrl: '',
    githubUrl: '',
    bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileAPI.get()
      .then(res => {
        const p = res.data.profile;
        setForm({
          name: p.name || user?.name || '',
          educationLevel: p.educationLevel || '',
          degree: p.degree || '',
          branch: p.branch || '',
          currentSkills: (p.currentSkills || []).join(', '),
          interests: (p.interests || []).join(', '),
          preferredCareer: p.preferredCareer || '',
          experienceLevel: p.experienceLevel || 'Beginner',
          weeklyLearningHours: p.weeklyLearningHours || 5,
          linkedinUrl: p.linkedinUrl || '',
          githubUrl: p.githubUrl || '',
          bio: p.bio || '',
        });
      })
      .catch(() => {}) // No profile yet — use defaults
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.educationLevel || !form.preferredCareer) {
      return toast.error('Please fill in Name, Education Level, and Preferred Career.');
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        currentSkills: form.currentSkills.split(',').map(s => s.trim()).filter(Boolean),
        interests: form.interests.split(',').map(s => s.trim()).filter(Boolean),
      };
      await profileAPI.save(payload);
      toast.success('Profile saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
        <div>
          <h1 className="section-title">Student Profile</h1>
          <p className="text-slate-400 text-sm">Tell us about yourself to get personalized recommendations.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal */}
        <div className="card-elevated space-y-4">
          <h2 className="font-semibold text-white border-b border-white/5 pb-3">Personal Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input id="profile-name" type="text" className="input-field" value={form.name} onChange={set('name')} placeholder="Your name" required />
            </div>
            <div>
              <label className="label">Experience Level *</label>
              <select id="profile-experience" className="input-field" value={form.experienceLevel} onChange={set('experienceLevel')}>
                {experienceOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Bio (optional)</label>
            <textarea id="profile-bio" className="input-field resize-none" rows={3} value={form.bio} onChange={set('bio')} placeholder="A brief introduction about yourself..." maxLength={500} />
            <p className="text-xs text-slate-600 mt-1">{form.bio.length}/500</p>
          </div>
        </div>

        {/* Education */}
        <div className="card-elevated space-y-4">
          <h2 className="font-semibold text-white border-b border-white/5 pb-3">Education</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Education Level *</label>
              <select id="profile-education" className="input-field" value={form.educationLevel} onChange={set('educationLevel')} required>
                <option value="">Select level...</option>
                {educationOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Degree (e.g., B.Tech, B.Sc)</label>
              <input id="profile-degree" type="text" className="input-field" value={form.degree} onChange={set('degree')} placeholder="Your degree" />
            </div>
          </div>
          <div>
            <label className="label">Branch / Major (e.g., Computer Science)</label>
            <input id="profile-branch" type="text" className="input-field" value={form.branch} onChange={set('branch')} placeholder="Your branch or major" />
          </div>
        </div>

        {/* Skills & Career */}
        <div className="card-elevated space-y-4">
          <h2 className="font-semibold text-white border-b border-white/5 pb-3">Skills & Career</h2>
          <div>
            <label className="label">Preferred Career *</label>
            <select id="profile-career" className="input-field" value={form.preferredCareer} onChange={set('preferredCareer')} required>
              <option value="">Select career goal...</option>
              {careerOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Current Skills</label>
            <input id="profile-skills" type="text" className="input-field" value={form.currentSkills} onChange={set('currentSkills')} placeholder="HTML, CSS, Python, Excel (comma-separated)" />
            <p className="text-xs text-slate-500 mt-1">Separate skills with commas</p>
          </div>
          <div>
            <label className="label">Interests</label>
            <input id="profile-interests" type="text" className="input-field" value={form.interests} onChange={set('interests')} placeholder="Web development, Data science, Design (comma-separated)" />
          </div>
          <div>
            <label className="label">Weekly Learning Hours: <span className="text-primary-400">{form.weeklyLearningHours}h</span></label>
            <input type="range" min={1} max={40} value={form.weeklyLearningHours} onChange={set('weeklyLearningHours')} className="w-full accent-primary-500 mt-1" />
            <div className="flex justify-between text-xs text-slate-500 mt-1"><span>1h</span><span>40h</span></div>
          </div>
        </div>

        {/* Links */}
        <div className="card-elevated space-y-4">
          <h2 className="font-semibold text-white border-b border-white/5 pb-3">Links (Optional)</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">LinkedIn URL</label>
              <input id="profile-linkedin" type="url" className="input-field" value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <label className="label">GitHub URL</label>
              <input id="profile-github" type="url" className="input-field" value={form.githubUrl} onChange={set('githubUrl')} placeholder="https://github.com/..." />
            </div>
          </div>
        </div>

        <button id="profile-save" type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Profile</>}
        </button>
      </form>
    </div>
  );
}
