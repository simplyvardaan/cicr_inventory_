import React, { useState, useCallback, useEffect } from 'react';
import {
  Github,
  Linkedin,
  Globe,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type TeamRole = 'mentor' | 'developer';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: TeamRole;
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
    role: 'Mentor',
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
    role: 'Developer',
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
    role: 'Developer',
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
    role: 'Developer',
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
  const [activeTab, setActiveTab] = useState<TeamRole>('developer');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('vardaan');

  const activeCategoryMembers = teamMembers.filter((m) => m.category === activeTab);
  const currentMember =
    activeCategoryMembers.find((m) => m.id === selectedMemberId) ||
    activeCategoryMembers[0] ||
    teamMembers[0];

  const handleTabChange = (role: TeamRole) => {
    setActiveTab(role);
    if (role === 'mentor') {
      setSelectedMemberId('gunjan');
    } else {
      setSelectedMemberId('vardaan');
    }
  };

  const handlePrevMember = useCallback(() => {
    if (activeCategoryMembers.length <= 1) return;
    const currentIndex = activeCategoryMembers.findIndex((m) => m.id === currentMember.id);
    const prevIndex = (currentIndex - 1 + activeCategoryMembers.length) % activeCategoryMembers.length;
    setSelectedMemberId(activeCategoryMembers[prevIndex].id);
  }, [activeCategoryMembers, currentMember]);

  const handleNextMember = useCallback(() => {
    if (activeCategoryMembers.length <= 1) return;
    const currentIndex = activeCategoryMembers.findIndex((m) => m.id === currentMember.id);
    const nextIndex = (currentIndex + 1) % activeCategoryMembers.length;
    setSelectedMemberId(activeCategoryMembers[nextIndex].id);
  }, [activeCategoryMembers, currentMember]);

  // Keyboard arrow navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevMember();
      if (e.key === 'ArrowRight') handleNextMember();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePrevMember, handleNextMember]);

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 space-y-6 sm:space-y-8 pb-20 select-none animate-in fade-in duration-300">
      
      {/* Page Title Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Meet the Team
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">
          Creative &amp; Innovative Cell in Robotics
        </p>
      </div>

      {/* KPH-style macOS Window Profile Card */}
      <article
        className="w-full rounded-3xl bg-white dark:bg-[#0c0918] border-2 border-slate-200 dark:border-[#222232] shadow-2xl shadow-slate-900/10 dark:shadow-black/60 overflow-hidden flex flex-col transition-all duration-300"
        aria-label={`Profile of ${currentMember.name}`}
      >
        {/* macOS Window Title Bar with 3 Colored Dots */}
        <div className="select-none bg-slate-100/80 dark:bg-[#141026]/90 border-b border-slate-200 dark:border-[#222232] px-5 sm:px-7 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] inline-block shadow-sm" />
          </div>

          <div className="font-mono text-xs font-semibold text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
            <span className="text-blue-600 dark:text-purple-400 font-bold">~</span>
            <span>{currentMember.filename}</span>
          </div>

          <div className="w-10" />
        </div>

        {/* Profile Body */}
        <div className="p-6 sm:p-10 md:p-14 flex flex-col md:flex-row items-center gap-8 md:gap-14">
          {/* Avatar with Radiant Gradient Glow Ring */}
          <div className="shrink-0 relative">
            <div className="w-36 h-36 sm:w-52 sm:h-52 md:w-64 md:h-64 rounded-full p-2 sm:p-2.5 bg-gradient-to-br from-white/60 via-white/10 to-emerald-400/30 dark:from-white/20 dark:via-white/5 dark:to-emerald-400/25 shadow-2xl">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-white/20 dark:border-white/10 shadow-inner">
                <img
                  src={currentMember.photoUrl}
                  alt={currentMember.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Profile Details (NO role badge tag below the name as requested) */}
          <div className="flex-1 text-center md:text-left space-y-3 min-w-0 w-full">
            <p className="text-sm sm:text-base font-semibold text-slate-500 dark:text-zinc-400">
              Hi, my name is
            </p>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 dark:from-emerald-400 dark:via-green-400 dark:to-lime-300">
              {currentMember.name}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 italic leading-relaxed max-w-xl mx-auto md:mx-0">
              &ldquo;{currentMember.quote}&rdquo;
            </p>

            {/* Social Links Row */}
            <div className="flex items-center justify-center md:justify-start gap-2.5 pt-3 flex-wrap">
              {/* LinkedIn */}
              {currentMember.linkedin && (
                <a
                  href={currentMember.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#16122a] dark:hover:bg-[#221c3e] border border-slate-300 dark:border-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-all shadow-sm active:scale-95 touch-manipulation cursor-pointer"
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
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-purple-950/40 dark:hover:bg-purple-950/70 border border-blue-200 dark:border-purple-500/30 text-xs font-bold text-blue-700 dark:text-purple-300 transition-all shadow-sm active:scale-95 touch-manipulation cursor-pointer"
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
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#16122a] dark:hover:bg-[#221c3e] border border-slate-300 dark:border-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-all shadow-sm active:scale-95 touch-manipulation cursor-pointer"
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

      {/* Role Navigation Tabs: Mentor | Developer */}
      <nav
        className="w-full max-w-md mx-auto flex items-center justify-center gap-8 border-b-2 border-slate-200 dark:border-zinc-800/80 pb-2.5 pt-2"
        aria-label="Role Navigation"
      >
        <button
          type="button"
          onClick={() => handleTabChange('mentor')}
          className={`relative pb-2 text-sm sm:text-base font-bold transition-all cursor-pointer ${
            activeTab === 'mentor'
              ? 'text-slate-900 dark:text-white after:content-[""] after:absolute after:bottom-[-12px] after:inset-x-0 after:h-[3px] after:rounded-full after:bg-emerald-500 shadow-emerald-500/40'
              : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
          }`}
        >
          Mentor
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('developer')}
          className={`relative pb-2 text-sm sm:text-base font-bold transition-all cursor-pointer ${
            activeTab === 'developer'
              ? 'text-slate-900 dark:text-white after:content-[""] after:absolute after:bottom-[-12px] after:inset-x-0 after:h-[3px] after:rounded-full after:bg-emerald-500 shadow-emerald-500/40'
              : 'text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
          }`}
        >
          Developer
        </button>
      </nav>

      {/* Member Avatar Selection Track with Circular Arrow Buttons */}
      <div
        className="flex items-center justify-center gap-3 sm:gap-6 pt-2 max-w-sm sm:max-w-md mx-auto px-2"
        aria-label="Member selection carousel"
      >
        {/* Left Arrow Button */}
        {activeCategoryMembers.length > 1 && (
          <button
            type="button"
            onClick={handlePrevMember}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-[#141026] text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border-2 border-slate-200 dark:border-zinc-800 flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 shrink-0 touch-manipulation"
            title="Previous member"
            aria-label="Previous member"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Circular Avatar Track */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 p-1">
          {activeCategoryMembers.map((member) => {
            const isSelected = member.id === currentMember.id;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedMemberId(member.id)}
                className={`relative rounded-full transition-all duration-300 cursor-pointer shrink-0 active:scale-95 touch-manipulation ${
                  isSelected
                    ? 'p-0.5 sm:p-1 ring-3 sm:ring-4 ring-emerald-400 shadow-xl shadow-emerald-400/30 opacity-100 scale-105'
                    : 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-105'
                }`}
                title={member.name}
                aria-label={`Select ${member.name}`}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-slate-900 border-2 border-slate-300 dark:border-zinc-700">
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        {activeCategoryMembers.length > 1 && (
          <button
            type="button"
            onClick={handleNextMember}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-[#141026] text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border-2 border-slate-200 dark:border-zinc-800 flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 shrink-0 touch-manipulation"
            title="Next member"
            aria-label="Next member"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
      </div>

    </div>
  );
};
