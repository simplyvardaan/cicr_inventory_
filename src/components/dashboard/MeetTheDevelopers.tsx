import React, { useState, useCallback, useEffect } from 'react';
import {
  Github,
  Linkedin,
  Globe,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export type TeamRoleFilter = 'all' | 'mentor' | 'developer';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: 'mentor' | 'developer';
  filename: string;
  photoUrl: string;
  quote: string;
  linkedin: string;
  github: string;
  githubUser: string;
  portfolio?: string;
}

// Exactly ordered as requested: Gunjan (Mentor) | Vardaan - Samiksha - Arsh (Developer)
const teamMembers: TeamMember[] = [
  {
    id: 'gunjan',
    name: 'Gunjan Pal',
    role: 'Project Mentor & Technical Advisor',
    category: 'mentor',
    filename: 'gunjan_pal.tsx',
    photoUrl: '/images/team/gunjan.jpg',
    quote: 'Guiding technical innovation, hardware architecture, and robotics engineering.',
    linkedin: 'https://www.linkedin.com/in/gunjan-pal-796093284/',
    github: 'https://github.com/Gunjan00001',
    githubUser: 'Gunjan00001',
  },
  {
    id: 'vardaan',
    name: 'Vardaan Saxena',
    role: 'Lead Full-Stack Developer & Architect',
    category: 'developer',
    filename: 'vardaan_saxena.tsx',
    photoUrl: '/images/team/vardaan.jpg',
    quote: 'I always build something that I keep wishing someone would make for me.',
    linkedin: 'https://www.linkedin.com/in/simplyvardaan/',
    github: 'https://github.com/simplyvardaan',
    githubUser: 'simplyvardaan',
    portfolio: 'https://vardaansaxena.tech',
  },
  {
    id: 'samiksha',
    name: 'Samiksha Jhunjhunwala',
    role: 'Frontend & UI Specialist',
    category: 'developer',
    filename: 'samiksha_jhunjhunwala.tsx',
    photoUrl: '/images/team/samiksha.jpg',
    quote: 'Crafting intuitive, high-performance web dashboards and robotics interfaces.',
    linkedin: 'https://www.linkedin.com/in/samiksha-jhunjhunwala-9343b02b3/',
    github: 'https://github.com/Samikshajjw',
    githubUser: 'Samikshajjw',
  },
  {
    id: 'arsh',
    name: 'Mohammad Arsh',
    role: 'Hardware Systems & Robotics Developer',
    category: 'developer',
    filename: 'mohammad_arsh.tsx',
    photoUrl: '/images/team/arsh.jpg',
    quote: 'Engineering autonomous robotics systems, hardware-software integration, and scalable digital platforms.',
    linkedin: 'https://www.linkedin.com/in/mohammad-arsh-1792008-hd/',
    github: 'https://github.com/HybridzDynamics',
    githubUser: 'HybridzDynamics',
  },
];

export const MeetTheDevelopers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TeamRoleFilter>('all');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('gunjan');

  const visibleMembers = activeTab === 'all'
    ? teamMembers
    : teamMembers.filter((m) => m.category === activeTab);

  const currentMember =
    visibleMembers.find((m) => m.id === selectedMemberId) ||
    visibleMembers[0] ||
    teamMembers[0];

  const handleTabChange = (tab: TeamRoleFilter) => {
    setActiveTab(tab);
    if (tab === 'mentor') {
      setSelectedMemberId('gunjan');
    } else if (tab === 'developer') {
      setSelectedMemberId('vardaan');
    }
  };

  const handlePrevMember = useCallback(() => {
    if (visibleMembers.length <= 1) return;
    const currentIndex = visibleMembers.findIndex((m) => m.id === currentMember.id);
    const prevIndex = (currentIndex - 1 + visibleMembers.length) % visibleMembers.length;
    setSelectedMemberId(visibleMembers[prevIndex].id);
  }, [visibleMembers, currentMember]);

  const handleNextMember = useCallback(() => {
    if (visibleMembers.length <= 1) return;
    const currentIndex = visibleMembers.findIndex((m) => m.id === currentMember.id);
    const nextIndex = (currentIndex + 1) % visibleMembers.length;
    setSelectedMemberId(visibleMembers[nextIndex].id);
  }, [visibleMembers, currentMember]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevMember();
      if (e.key === 'ArrowRight') handleNextMember();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePrevMember, handleNextMember]);

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 space-y-6 sm:space-y-8 pb-24 select-none animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Meet the Team
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">
          Creative &amp; Innovative Cell in Robotics &bull; JIIT Noida
        </p>
      </div>

      {/* Role Filter Tabs (KPH Style) */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-[#120d22] border-2 border-slate-200 dark:border-zinc-800 shadow-sm">
          <button
            type="button"
            onClick={() => handleTabChange('all')}
            className={`px-3.5 sm:px-5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blue-600 dark:bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Members ({teamMembers.length})
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('mentor')}
            className={`px-3.5 sm:px-5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'mentor'
                ? 'bg-blue-600 dark:bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mentor (1)
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('developer')}
            className={`px-3.5 sm:px-5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'developer'
                ? 'bg-blue-600 dark:bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Developers (3)
          </button>
        </div>
      </div>

      {/* macOS Window Showcase Profile Card */}
      <article
        className="w-full rounded-3xl bg-white dark:bg-[#0c0918] border-2 border-slate-200 dark:border-[#222232] shadow-2xl shadow-slate-900/10 dark:shadow-black/60 overflow-hidden flex flex-col transition-all duration-300"
        aria-label={`Profile of ${currentMember.name}`}
      >
        {/* macOS Title Bar */}
        <div className="select-none bg-slate-100/80 dark:bg-[#141026]/90 border-b border-slate-200 dark:border-[#222232] px-4 sm:px-7 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] inline-block shadow-sm" />
          </div>

          <div className="font-mono text-xs font-semibold text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
            <span className="text-blue-600 dark:text-purple-400 font-bold">~</span>
            <span>{currentMember.filename}</span>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 dark:bg-purple-950/50 text-blue-700 dark:text-purple-300 border border-blue-200 dark:border-purple-800/60 font-bold uppercase">
            {currentMember.category === 'mentor' ? 'Mentor' : 'Developer'}
          </span>
        </div>

        {/* Profile Card Body */}
        <div className="p-5 sm:p-10 md:p-12 flex flex-col md:flex-row items-center gap-6 sm:gap-8 md:gap-12">
          {/* Avatar with Radiant Glow Ring */}
          <div className="shrink-0 relative">
            <div className={`w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 rounded-full p-2 bg-gradient-to-br shadow-2xl ${
              currentMember.category === 'mentor'
                ? 'from-amber-400/40 via-yellow-500/20 to-orange-500/30 ring-2 ring-amber-400/50'
                : 'from-blue-500/40 via-purple-500/20 to-pink-500/30 ring-2 ring-purple-400/50'
            }`}>
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-white/30 dark:border-white/10 shadow-inner">
                <img
                  src={currentMember.photoUrl}
                  alt={currentMember.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    // Graceful fallback avatar if image fails to load
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Member Details */}
          <div className="flex-1 text-center md:text-left space-y-3 min-w-0 w-full">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">
                Hi, my name is
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                <Sparkles className="w-3 h-3 text-amber-500" />
                {currentMember.category === 'mentor' ? 'Mentor' : 'Developer'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {currentMember.name}
            </h2>

            <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-purple-400">
              {currentMember.role}
            </p>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 italic leading-relaxed max-w-xl mx-auto md:mx-0">
              &ldquo;{currentMember.quote}&rdquo;
            </p>

            {/* Social Links Row */}
            <div className="flex items-center justify-center md:justify-start gap-2 pt-2 flex-wrap">
              {/* LinkedIn */}
              {currentMember.linkedin && (
                <a
                  href={currentMember.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#16122a] dark:hover:bg-[#221c3e] border border-slate-300 dark:border-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-all shadow-sm active:scale-95 touch-manipulation cursor-pointer"
                  title={`${currentMember.name}'s LinkedIn`}
                >
                  <Linkedin className="w-3.5 h-3.5 text-[#0077b5] shrink-0" />
                  <span>{currentMember.name}</span>
                </a>
              )}

              {/* Portfolio (for Vardaan) */}
              {currentMember.portfolio && (
                <a
                  href={currentMember.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-purple-950/40 dark:hover:bg-purple-950/70 border border-blue-200 dark:border-purple-500/30 text-xs font-bold text-blue-700 dark:text-purple-300 transition-all shadow-sm active:scale-95 touch-manipulation cursor-pointer"
                  title="Portfolio Website"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-purple-400 shrink-0" />
                  <span>vardaansaxena.tech</span>
                </a>
              )}

              {/* GitHub */}
              {currentMember.github && (
                <a
                  href={currentMember.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#16122a] dark:hover:bg-[#221c3e] border border-slate-300 dark:border-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-all shadow-sm active:scale-95 touch-manipulation cursor-pointer"
                  title={`${currentMember.githubUser} on GitHub`}
                >
                  <Github className="w-3.5 h-3.5 text-slate-800 dark:text-zinc-200 shrink-0" />
                  <span>{currentMember.githubUser}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Member Avatar Selection Track with Carousel Controls */}
      <div
        className="flex items-center justify-center gap-2 sm:gap-4 pt-2 max-w-lg mx-auto px-2"
        aria-label="Member selection carousel"
      >
        {/* Left Arrow Button */}
        {visibleMembers.length > 1 && (
          <button
            type="button"
            onClick={handlePrevMember}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-[#141026] text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border-2 border-slate-200 dark:border-zinc-800 flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 shrink-0 touch-manipulation"
            title="Previous member"
            aria-label="Previous member"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Circular Avatar Track */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-4 p-1 flex-wrap">
          {visibleMembers.map((member) => {
            const isSelected = member.id === currentMember.id;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedMemberId(member.id)}
                className={`flex flex-col items-center gap-1 rounded-full transition-all duration-300 cursor-pointer shrink-0 active:scale-95 touch-manipulation group ${
                  isSelected
                    ? 'scale-105 opacity-100'
                    : 'opacity-60 hover:opacity-100 hover:scale-105'
                }`}
                title={`${member.name} (${member.category === 'mentor' ? 'Mentor' : 'Developer'})`}
                aria-label={`Select ${member.name}`}
              >
                <div className={`w-13 h-13 sm:w-15 sm:h-15 w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] rounded-full overflow-hidden bg-slate-900 border-2 transition-all ${
                  isSelected
                    ? member.category === 'mentor'
                      ? 'ring-3 ring-amber-400 border-amber-400 shadow-lg shadow-amber-400/30'
                      : 'ring-3 ring-purple-500 border-purple-500 shadow-lg shadow-purple-500/30'
                    : 'border-slate-300 dark:border-zinc-700'
                }`}>
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className={`text-[10px] font-bold truncate max-w-[64px] transition-colors ${
                  isSelected
                    ? member.category === 'mentor'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-blue-600 dark:text-purple-400'
                    : 'text-slate-500 dark:text-zinc-500 group-hover:text-slate-800 dark:group-hover:text-zinc-300'
                }`}>
                  {member.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        {visibleMembers.length > 1 && (
          <button
            type="button"
            onClick={handleNextMember}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-[#141026] text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border-2 border-slate-200 dark:border-zinc-800 flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 shrink-0 touch-manipulation"
            title="Next member"
            aria-label="Next member"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

    </div>
  );
};
