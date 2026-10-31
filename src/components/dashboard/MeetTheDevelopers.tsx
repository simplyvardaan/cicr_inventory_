import React, { useState } from 'react';
import {
  Code2,
  Github,
  Linkedin,
  Globe,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

export type TeamTab = 'mentor' | 'developer';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: TeamTab;
  photoUrl: string;
  quote: string;
  linkedin: string;
  github: string;
  githubUser: string;
  portfolio?: string;
}

// Exactly ordered as requested: Gunjan (Mentor) -> Vardaan (Developer) -> Samiksha (Developer) -> Mohammad Arsh (Developer)
const teamMembers: TeamMember[] = [
  {
    id: 'gunjan',
    name: 'Gunjan Pal',
    role: 'Mentor',
    category: 'mentor',
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
    photoUrl: '/images/team/arsh.jpg',
    quote: 'Engineering autonomous robotics systems, hardware-software integration, and scalable digital platforms.',
    linkedin: 'https://www.linkedin.com/in/mohammad-arsh-1792008-hd/',
    github: 'https://github.com/HybridzDynamics',
    githubUser: 'HybridzDynamics',
  },
];

export const MeetTheDevelopers: React.FC = () => {
  // Vardaan Saxena is visible first by default in the Developer tab
  const [activeTab, setActiveTab] = useState<TeamTab>('developer');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('vardaan');

  // Filter members strictly based on the active tab
  const filteredMembers = teamMembers.filter((m) => m.category === activeTab);

  const currentMember =
    filteredMembers.find((m) => m.id === selectedMemberId) || filteredMembers[0];

  const handleTabChange = (tab: TeamTab) => {
    setActiveTab(tab);
    if (tab === 'mentor') {
      setSelectedMemberId('gunjan');
    } else {
      setSelectedMemberId('vardaan');
    }
  };

  const handlePrevMember = () => {
    if (filteredMembers.length <= 1) return;
    const currentIndex = filteredMembers.findIndex((m) => m.id === currentMember.id);
    const prevIndex = (currentIndex - 1 + filteredMembers.length) % filteredMembers.length;
    setSelectedMemberId(filteredMembers[prevIndex].id);
  };

  const handleNextMember = () => {
    if (filteredMembers.length <= 1) return;
    const currentIndex = filteredMembers.findIndex((m) => m.id === currentMember.id);
    const nextIndex = (currentIndex + 1) % filteredMembers.length;
    setSelectedMemberId(filteredMembers[nextIndex].id);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto text-slate-100 animate-in fade-in duration-300 pb-16">
      
      {/* Centered Meet the Team Title (Matching Screenshot 1) */}
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Meet the Team
        </h1>
      </div>

      {/* Tabs: Mentor button FIRST, then Developer button */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center p-1.5 rounded-full bg-slate-100 dark:bg-[#0e0e16] border-2 border-slate-200 dark:border-[#232332] shadow-sm">
          {/* Tab 1: Mentor (FIRST) */}
          <button
            type="button"
            onClick={() => handleTabChange('mentor')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'mentor'
                ? 'bg-blue-600 text-white shadow-md font-bold'
                : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white border border-transparent font-medium'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>Mentor</span>
          </button>

          {/* Tab 2: Developer (SECOND) */}
          <button
            type="button"
            onClick={() => handleTabChange('developer')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'developer'
                ? 'bg-blue-600 text-white shadow-md font-bold'
                : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white border border-transparent font-medium'
            }`}
          >
            <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Developer</span>
          </button>
        </div>
      </div>

      {/* Main Profile Card (Matching Screenshot 5 exactly with our theme) */}
      <div className="p-7 sm:p-12 rounded-3xl bg-white dark:bg-[#121217] border-2 border-slate-200 dark:border-[#242436] shadow-xl shadow-slate-900/5 dark:shadow-black/80 flex flex-col sm:flex-row items-center sm:items-center gap-8 sm:gap-12 transition-all text-slate-900 dark:text-white">
        
        {/* Left: Circular Avatar Photo with Emerald Rim */}
        <div className="shrink-0">
          <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full overflow-hidden border-2 border-emerald-500/70 shadow-2xl shadow-emerald-950/40 bg-black">
            <img
              src={currentMember.photoUrl}
              alt={currentMember.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex-1 text-center sm:text-left space-y-3 sm:space-y-4">
          <p className="text-base sm:text-xl font-bold text-white">
            Hi, my name is
          </p>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
            <span className="text-[#22c55e]">
              {currentMember.name}
            </span>
          </h2>

          {/* Quote in Italics */}
          <p className="text-xs sm:text-sm text-zinc-400 italic leading-relaxed max-w-xl">
            "{currentMember.quote}"
          </p>

          {/* Social Pills Row (matching Screenshot 5) */}
          <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-2 flex-wrap">
            {/* LinkedIn Pill */}
            {currentMember.linkedin && (
              <a
                href={currentMember.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#09090d] hover:bg-[#151520] border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white transition-all shadow-md"
              >
                <div className="w-4 h-4 rounded bg-[#0077b5] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  in
                </div>
                <span>{currentMember.name}</span>
              </a>
            )}

            {/* Portfolio Pill (for Vardaan or any member with portfolio) */}
            {currentMember.portfolio && (
              <a
                href={currentMember.portfolio}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#09090d] hover:bg-[#151520] border border-emerald-500/30 hover:border-emerald-500/60 text-xs font-semibold text-emerald-300 hover:text-emerald-200 transition-all shadow-md group"
              >
                <Globe className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                <span>vardaansaxena.tech</span>
              </a>
            )}

            {/* GitHub Pill */}
            {currentMember.github && (
              <a
                href={currentMember.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#09090d] hover:bg-[#151520] border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white transition-all shadow-md"
              >
                <Github className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{currentMember.githubUser}</span>
              </a>
            )}
          </div>

        </div>
      </div>

      {/* Avatar Track Carousel (Strictly filtered by active tab - Fix arrow clipping with ample spacing & overflow-visible) */}
      <div className="flex items-center justify-center gap-6 sm:gap-10 pt-4 overflow-visible">
        {/* Left Arrow Button */}
        {filteredMembers.length > 1 && (
          <button
            type="button"
            onClick={handlePrevMember}
            className="w-12 h-12 rounded-full bg-[#161622] hover:bg-[#202030] text-zinc-300 hover:text-white border border-zinc-800 flex items-center justify-center transition-all cursor-pointer shadow-lg shrink-0 z-10"
            title="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Circular Member Track: in Developer tab ONLY Vardaan & Samiksha */}
        <div className="flex items-center gap-6 sm:gap-8 overflow-visible p-3">
          {filteredMembers.map((member) => {
            const isSelected = member.id === currentMember.id;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedMemberId(member.id)}
                className={`relative rounded-full transition-all duration-300 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'p-1.5 ring-4 ring-blue-600 shadow-xl shadow-blue-600/30 opacity-100 scale-105'
                    : 'opacity-40 grayscale hover:opacity-90 hover:grayscale-0 hover:scale-105'
                }`}
                title={`${member.name} (${member.role})`}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-black border border-zinc-700/80">
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
        {filteredMembers.length > 1 && (
          <button
            type="button"
            onClick={handleNextMember}
            className="w-12 h-12 rounded-full bg-[#161622] hover:bg-[#202030] text-zinc-300 hover:text-white border border-zinc-800 flex items-center justify-center transition-all cursor-pointer shadow-lg shrink-0 z-10"
            title="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

    </div>
  );
};
