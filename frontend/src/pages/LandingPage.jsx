import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Target, TrendingUp, Zap, Users, Star, CheckCircle, ChevronRight } from 'lucide-react';

const features = [
  { icon: Target, title: 'Skill Gap Analysis', desc: 'Compare your current skills against industry requirements for your dream career.', color: 'text-indigo-400' },
  { icon: TrendingUp, title: 'Personalized Roadmap', desc: 'Get a step-by-step learning plan tailored to your goals, skills, and schedule.', color: 'text-purple-400' },
  { icon: BookOpen, title: 'Curated Resources', desc: 'Access a library of vetted learning resources filtered for your specific career path.', color: 'text-blue-400' },
  { icon: Zap, title: 'Project Recommendations', desc: 'Build real-world projects that align with your career and showcase your skills.', color: 'text-pink-400' },
];

const careers = [
  { name: 'Frontend Developer', icon: '🎨', slug: 'frontend-developer' },
  { name: 'Backend Developer', icon: '⚙️', slug: 'backend-developer' },
  { name: 'Full-Stack Developer', icon: '🔥', slug: 'fullstack-developer' },
  { name: 'Data Analyst', icon: '📊', slug: 'data-analyst' },
  { name: 'Cybersecurity Analyst', icon: '🔐', slug: 'cybersecurity-analyst' },
  { name: 'UI/UX Designer', icon: '✏️', slug: 'uiux-designer' },
  { name: 'Cloud Engineer', icon: '☁️', slug: 'cloud-engineer' },
];

const steps = [
  { step: '01', title: 'Create Your Profile', desc: 'Tell us about your education, current skills, interests, and career goals.' },
  { step: '02', title: 'Take Skill Assessment', desc: 'Rate your proficiency across relevant skills for your chosen career path.' },
  { step: '03', title: 'Get Your Roadmap', desc: 'Receive a personalized learning plan with resources, timelines, and projects.' },
  { step: '04', title: 'Track & Achieve', desc: 'Follow your roadmap, complete projects, and watch your career readiness grow.' },
];

const testimonials = [
  { name: 'Arjun Mehta', role: 'CS Student, 3rd Year', quote: 'SkillBridge helped me understand exactly which skills I needed for frontend development. The roadmap was incredibly focused.', avatar: 'AM', rating: 5 },
  { name: 'Priya Sharma', role: 'Fresh Graduate', quote: 'I was overwhelmed by all the resources online. SkillBridge pointed me to exactly what I needed to learn for data analysis.', avatar: 'PS', rating: 5 },
  { name: 'Rahul Gupta', role: 'Aspiring Cloud Engineer', quote: 'The skill gap analysis was eye-opening. I knew exactly where I stood and what to work on next.', avatar: 'RG', rating: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-900 text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white">SkillBridge <span className="text-gradient">AI</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/careers" className="text-slate-400 hover:text-white text-sm transition-colors">Explore Careers</Link>
            <Link to="/login" className="text-slate-400 hover:text-white text-sm transition-colors">Login</Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started Free</Link>
          </div>
          <div className="md:hidden flex items-center gap-3">
            <Link to="/login" className="text-slate-400 hover:text-white text-sm">Login</Link>
            <Link to="/register" className="btn-primary text-sm px-3 py-2">Start</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-8">
            <Zap size={14} className="text-primary-400" />
            <span className="text-primary-400 text-sm font-medium">AI-Powered Career Readiness Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            Bridge the Gap Between<br />
            <span className="text-gradient">Your Skills & Your Dream Career</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            SkillBridge AI helps students and fresh graduates identify skill gaps, discover learning resources,
            and build a personalized roadmap to become career-ready — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary inline-flex items-center justify-center gap-2 text-base px-8 py-3.5">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/careers" className="btn-secondary inline-flex items-center justify-center gap-2 text-base px-8 py-3.5">
              Explore Careers <ChevronRight size={18} />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 text-slate-500 text-sm">
            <div className="flex items-center gap-2"><CheckCircle size={16} className="text-primary-500" /> Free to use</div>
            <div className="flex items-center gap-2"><CheckCircle size={16} className="text-primary-500" /> No credit card</div>
            <div className="flex items-center gap-2"><CheckCircle size={16} className="text-primary-500" /> 7 career paths</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything You Need to <span className="text-gradient">Launch Your Career</span></h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">One platform to assess, learn, build, and track your journey to your dream job.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card hover:glow group">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} className={color} />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How <span className="text-gradient">SkillBridge AI</span> Works</h2>
            <p className="text-slate-400 text-lg">Four simple steps to transform your career readiness.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="text-center relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
                  <span className="text-white font-bold text-lg">{step}</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Paths */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Popular <span className="text-gradient">Career Paths</span></h2>
            <p className="text-slate-400 text-lg">Explore structured paths for in-demand tech careers.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {careers.map(({ name, icon, slug }) => (
              <Link key={slug} to={`/careers/${slug}`} className="card text-center hover:border-primary-500/30 hover:bg-primary-500/5 group cursor-pointer">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform inline-block">{icon}</div>
                <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{name}</p>
              </Link>
            ))}
            <Link to="/careers" className="card text-center hover:border-primary-500/30 hover:bg-primary-500/5 group cursor-pointer flex flex-col items-center justify-center">
              <ChevronRight size={32} className="text-primary-400 mb-2 group-hover:translate-x-1 transition-transform" />
              <p className="text-sm font-medium text-primary-400">View All</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">What Students Say</h2>
            <p className="text-slate-500 text-sm italic">The following are sample testimonials for illustration purposes.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, quote, avatar, rating }) => (
              <div key={name} className="card">
                <div className="flex gap-1 mb-4">
                  {[...Array(rating)].map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">{avatar}</div>
                  <div>
                    <p className="text-white text-sm font-medium">{name}</p>
                    <p className="text-slate-500 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-primary-900/50 to-indigo-900/50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-slate-400 text-lg mb-8">Join thousands of students using SkillBridge AI to navigate their career paths.</p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-4 gap-8 mb-8">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Zap size={14} className="text-white" />
                </div>
                <span className="font-bold text-white">SkillBridge AI</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">Helping students and fresh graduates bridge the gap between their skills and career readiness.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Platform</h4>
              <div className="flex flex-col gap-2">
                <Link to="/careers" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Explore Careers</Link>
                <Link to="/register" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Get Started</Link>
                <Link to="/login" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Login</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Dashboard</h4>
              <div className="flex flex-col gap-2">
                <Link to="/dashboard" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Dashboard</Link>
                <Link to="/dashboard/assessment" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Skill Assessment</Link>
                <Link to="/dashboard/resources" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Resources</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-slate-600 text-xs">© 2024 SkillBridge AI. For educational purposes only.</p>
            <p className="text-slate-600 text-xs">Career readiness scores are estimates, not guarantees of employment.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
