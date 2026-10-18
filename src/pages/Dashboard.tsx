import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/App';
import { getGreeting, formatRelativeTime, cn, getProficiencyColor } from '@/lib/utils';
import {
  Zap, GraduationCap, BookOpen, FileText, FolderKanban, Library,
  ArrowUpRight, TrendingUp, Plus, CheckCircle2, ChevronRight,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const readinessCategories = [
  { label: 'Java', skills: ['Java'] },
  { label: 'Spring Boot', skills: ['Spring Boot'] },
  { label: 'Spring Data JPA', skills: ['Spring Data JPA'] },
  { label: 'Hibernate', skills: ['Hibernate'] },
  { label: 'REST APIs', skills: ['REST APIs'] },
  { label: 'Spring Security', skills: ['Spring Security'] },
  { label: 'SQL', skills: ['SQL'] },
  { label: 'PostgreSQL', skills: ['PostgreSQL'] },
  { label: 'HTML/CSS', skills: ['HTML & CSS'] },
  { label: 'JavaScript', skills: ['JavaScript'] },
  { label: 'React', skills: ['React'] },
  { label: 'TypeScript', skills: ['TypeScript'] },
  { label: 'Git/GitHub', skills: ['Git & GitHub'] },
  { label: 'Docker', skills: ['Docker'] },
];

const proficiencyScore: Record<string, number> = {
  'Beginner': 25,
  'Intermediate': 55,
  'Mastered': 100,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { skills, projects, courses, academics, resumes, activity, library } = useApp();

  // Metrics
  const totalSkills = skills.length;
  const masteredSkills = skills.filter((s) => s.proficiency === 'Mastered').length;
  const completedSubjects = academics.filter((a) => a.status === 'Completed' && a.score && a.score > 0);
  const cgpa = completedSubjects.length > 0
    ? (completedSubjects.reduce((sum, a) => sum + (a.score || 0) * a.credits, 0) / completedSubjects.reduce((sum, a) => sum + a.credits, 0)).toFixed(1)
    : '0.0';
  const activeCourses = courses.filter((c) => c.status === 'In Progress').length;
  const totalCourses = courses.length;
  const resumeCount = resumes.length;

  // Full Stack readiness
  const readinessScores = readinessCategories.map((cat) => {
    const skill = skills.find((s) => cat.skills.includes(s.name));
    return { label: cat.label, score: skill ? proficiencyScore[skill.proficiency] || 0 : 0, found: !!skill };
  });
  const overallReadiness = Math.round(readinessScores.reduce((s, r) => s + r.score, 0) / readinessCategories.length);
  const completedCompetencies = readinessScores.filter((r) => r.score >= 55).length;

  // Skills by category
  const categoryData = ['Backend', 'Frontend', 'Database/DevOps', 'AI', 'Full Stack'].map((cat) => ({
    name: cat,
    value: skills.filter((s) => s.category === cat).length,
  })).filter(cat => cat.value > 0);
  const pieColors = ['#ea580c', '#0ea5e9', '#7c3aed', '#ec4899', '#14b8a6'];

  // Course progress data for chart
  const courseProgressData = courses.filter((c) => c.status === 'In Progress').map((c) => ({
    name: c.title.length > 18 ? c.title.substring(0, 18) + '...' : c.title,
    progress: c.progressPercentage,
  }));

  const metricCards = [
    {
      label: 'Total Skills', value: totalSkills, sub: `${masteredSkills} mastered`,
      icon: Zap, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-950/30',
      path: '/skills',
    },
    {
      label: 'Academic Average', value: `${cgpa}`, sub: 'Current CGPA performance',
      icon: GraduationCap, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30',
      path: '/academics',
    },
    {
      label: 'Active Courses', value: activeCourses, sub: `${totalCourses} total enrolled`,
      icon: BookOpen, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30',
      path: '/academics?tab=courses',
    },
    {
      label: 'Resumes Created', value: resumeCount, sub: `${resumes.filter((r) => (r.selectedSkillIds || []).length > 5).length} tailored profiles`,
      icon: FileText, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30',
      path: '/projects-resumes?tab=resume',
    },
  ];

  const quickActions = [
    { label: 'Add Skill', icon: Zap, path: '/skills?add=true' },
    { label: 'Add Course', icon: BookOpen, path: '/academics?tab=courses&add=true' },
    { label: 'Add Project', icon: FolderKanban, path: '/projects-resumes?add=true' },
    { label: 'Add Note', icon: Library, path: '/library?add=true' },
    { label: 'Create Resume', icon: FileText, path: '/projects-resumes?tab=resume&add=true' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">{getGreeting()}, Shiv 👋</h1>
          <p className="page-subtitle">Track your learning, skills, projects and career readiness.</p>
        </div>
        <button onClick={() => navigate('/skills?add=true')} className="btn-primary self-start">
          <Plus className="w-4 h-4" /> Quick Add
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={() => navigate(card.path)}
              className="card card-hover p-5 text-left group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', card.bg)}>
                  <Icon className={cn('w-5 h-5', card.color)} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 dark:text-dark-500 group-hover:text-brand-500 transition-colors" />
              </div>
              <p className="stat-number text-gray-900 dark:text-gray-50">{card.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.sub}</p>
            </button>
          );
        })}
      </div>

      {/* Full Stack Readiness + Skills by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Full Stack Readiness */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title">Java Full Stack Readiness</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {completedCompetencies} of {readinessCategories.length} competencies acquired
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">{overallReadiness}%</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-gray-100 dark:bg-dark-300 rounded-full mb-5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full progress-animate"
              style={{ width: `${overallReadiness}%` }}
            />
          </div>

          {/* Competency grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {readinessScores.map((r) => (
              <div
                key={r.label}
                className={cn(
                  'px-2.5 py-2 rounded-xl text-center text-xs font-medium border transition-all',
                  r.score >= 85
                    ? 'bg-brand-50 dark:bg-brand-950/30 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-400'
                    : r.score >= 55
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                    : r.score > 0
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                    : 'bg-gray-50 dark:bg-dark-200 border-gray-200 dark:border-dark-400 text-gray-400 dark:text-gray-500'
                )}
              >
                <p className="truncate">{r.label}</p>
                <p className="text-[10px] mt-0.5 opacity-75">{r.score}%</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/skills')}
            className="mt-4 text-sm text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 transition-colors"
          >
            View Skill Matrix <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Skills by Category */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Skills by Category</h2>
          {categoryData.length > 0 ? (
            <>
              <div className="flex justify-center mb-4">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--tw-bg-opacity, 1) ? #fff : #1c1f2e',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                        padding: '8px 12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {categoryData.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                      <span className="text-gray-600 dark:text-gray-400">{cat.name}</span>
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{cat.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
             <div className="flex items-center justify-center h-48 text-sm text-gray-400">No skills added yet</div>
          )}
        </div>
      </div>

      {/* Learning Analytics (Course Progress) + Activity Feed + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Course Progress Chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Learning Progress</h2>
            <button onClick={() => navigate('/academics?tab=courses')} className="text-sm text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {courseProgressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={courseProgressData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f055" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Progress']}
                />
                <Bar dataKey="progress" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400">No active courses</div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-200 border border-gray-100 dark:border-dark-300 transition-all hover:border-brand-200 dark:hover:border-brand-800 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900/40 transition-colors">
                    <Icon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  {action.label}
                  <Plus className="w-3.5 h-3.5 ml-auto text-gray-300 dark:text-dark-500 group-hover:text-brand-500 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity + Projects Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Recent Activity</h2>
          <div className="space-y-0">
            {activity.slice(0, 8).map((item, i) => {
              const iconMap: Record<string, React.ReactNode> = {
                skill: <Zap className="w-3.5 h-3.5" />,
                project: <FolderKanban className="w-3.5 h-3.5" />,
                course: <BookOpen className="w-3.5 h-3.5" />,
                academic: <GraduationCap className="w-3.5 h-3.5" />,
                resume: <FileText className="w-3.5 h-3.5" />,
                library: <Library className="w-3.5 h-3.5" />,
              };
              return (
                <div key={item.id} className="flex items-start gap-3 py-3 border-b border-gray-50 dark:border-dark-300 last:border-0">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center text-brand-600 dark:text-brand-400 mt-0.5 shrink-0">
                    {iconMap[item.type] || <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      <span className="font-medium">{item.action}</span> {item.entityName}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatRelativeTime(item.timestamp)}</p>
                  </div>
                </div>
              );
            })}
            {activity.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No recent activity</p>
            )}
          </div>
        </div>

        {/* Active Projects */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Latest Projects</h2>
            <button onClick={() => navigate('/projects-resumes')} className="text-sm text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {projects.slice(0, 4).map((project) => (
              <div
                key={project.id}
                className="p-4 rounded-xl border border-gray-100 dark:border-dark-300 hover:border-brand-200 dark:hover:border-brand-800 transition-all cursor-pointer group"
                onClick={() => navigate('/projects-resumes')}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {project.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(project.techStack || []).slice(0, 4).map((tech) => (
                    <span key={tech} className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-gray-100 dark:bg-dark-300 text-gray-600 dark:text-gray-400">
                      {tech}
                    </span>
                  ))}
                  {(project.techStack || []).length > 4 && (
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-gray-100 dark:bg-dark-300 text-gray-500">
                      +{(project.techStack || []).length - 4}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No projects yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
