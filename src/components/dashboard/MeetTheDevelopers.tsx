import React, { useState, useCallback, useEffect } from 'react';
import {
  Github,
  Linkedin,
  Globe,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bug,
  ExternalLink,
} from 'lucide-react';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
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
    role: 'Project Mentor & Technical Advisor',
    photoUrl: '/images/team/gunjan.jpg',
    quote: 'Guiding technical innovation, hardware architecture, and robotics engineering.',
    linkedin: 'https://www.linkedin.com/in/gunjan-pal-796093284/',
    github: 'https://github.com/Gunjan00001',
    githubUser: 'Gunjan00001',
  },
  {
    id: 'vardaan',
    name: 'Vardaan Saxena',
    role: 'Lead Full-Stack Developer & System Architect',
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
    role: 'Developer & UI Specialist',
    photoUrl: '/images/team/samiksha.jpg',
    quote: 'Crafting intuitive, high-performance web dashboards and robotics interfaces.',
    linkedin: 'https://www.linkedin.com/in/samiksha-jhunjhunwala-9343b02b3/',
    github: 'https://github.com/Samikshajjw',
    githubUser: 'Samikshajjw',
  },
  {
    id: 'arsh',
    name: 'Mohammad Arsh',
    role: 'Developer & Hardware Integration',
    photoUrl: '/images/team/arsh.jpg',
    quote: 'Engineering autonomous robotics systems, hardware-software integration, and scalable digital platforms.',
    linkedin: 'https://www.linkedin.com/in/mohammad-arsh-1792008-hd/',
    github: 'https://github.com/HybridzDynamics',
    githubUser: 'HybridzDynamics',
  },
];

export const MeetTheDevelopers: React.FC = () => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('vardaan');

  const currentMember =
    teamMembers.find((m) => m.id === selectedMemberId) || teamMembers[1] || teamMembers[0];

  const handlePrevMember = useCallback(() => {
    const currentIndex = teamMembers.findIndex((m) => m.id === currentMember.id);
    const prevIndex = (currentIndex - 1 + teamMembers.length) % teamMembers.length;
    setSelectedMemberId(teamMembers[prevIndex].id);
  }, [currentMember]);

  const handleNextMember = useCallback(() => {
    const currentIndex = teamMembers.findIndex((m) => m.id === currentMember.id);
    const nextIndex = (currentIndex + 1) % teamMembers.length;
    setSelectedMemberId(teamMembers[nextIndex].id);
  }, [currentMember]);

  // Keyboard arrow navigation support
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
      
      {/* Title Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Meet the Team
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">
          Creative &amp; Innovative Cell in Robotics
        </p>
      </div>

      {/* Main Profile Showcase Card - Generous max-w-4xl/5xl box */}
      <div className="rounded-3xl bg-white dark:bg-[#0f0f16] border-2 border-slate-200 dark:border-[#222232] shadow-xl p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-center gap-6 sm:gap-8 md:gap-10 transition-all">
        {/* Photo Container (NO role badge below the photo as requested) */}
        <div className="shrink-0">
          <div className="w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-blue-500 dark:border-purple-500 shadow-xl shadow-blue-500/20 dark:shadow-purple-500/20 bg-slate-900">
            <img
              src={currentMember.photoUrl}
              alt={currentMember.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>

        {/* Member Details */}
        <div className="flex-1 text-center md:text-left space-y-3 min-w-0 w-full">
          <div>
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-purple-400 block mb-1">
              {currentMember.role}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {currentMember.name}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 italic leading-relaxed max-w-xl mx-auto md:mx-0">
            &ldquo;{currentMember.quote}&rdquo;
          </p>

          {/* Social Links Row - Fully Interactive on Mobile & Desktop */}
          <div className="flex items-center justify-center md:justify-start gap-2.5 pt-2 flex-wrap">
            {/* LinkedIn */}
            {currentMember.linkedin && (
              <a
                href={currentMember.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#161622] dark:hover:bg-[#202030] border border-slate-300 dark:border-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-all shadow-sm active:scale-95 touch-manipulation cursor-pointer"
                title={`LinkedIn: ${currentMember.name}`}
              >
                <Linkedin className="w-3.5 h-3.5 text-[#0077b5] shrink-0" />
                <span>LinkedIn</span>
              </a>
            )}

            {/* Portfolio / Website */}
            {currentMember.portfolio && (
              <a
                href={currentMember.portfolio}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-purple-950/40 dark:hover:bg-purple-950/70 border border-blue-200 dark:border-purple-500/30 text-xs font-bold text-blue-700 dark:text-purple-300 transition-all shadow-sm active:scale-95 touch-manipulation cursor-pointer"
                title="Personal Portfolio"
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
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#161622] dark:hover:bg-[#202030] border border-slate-300 dark:border-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-all shadow-sm active:scale-95 touch-manipulation cursor-pointer"
                title={`GitHub: ${currentMember.githubUser}`}
              >
                <Github className="w-3.5 h-3.5 text-slate-800 dark:text-zinc-200 shrink-0" />
                <span>{currentMember.githubUser}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Carousel Control Bar (Fits cleanly on ALL screen sizes) */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 pt-2 max-w-sm sm:max-w-md mx-auto px-2">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={handlePrevMember}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#14141f] dark:hover:bg-[#1f1f2e] text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border-2 border-slate-200 dark:border-zinc-800 flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 active:scale-90 touch-manipulation"
          title="Previous Member"
          aria-label="Previous member"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Member Avatar Dots / Buttons */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-4 p-1">
          {teamMembers.map((member) => {
            const isSelected = member.id === currentMember.id;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedMemberId(member.id)}
                className={`relative rounded-full transition-all duration-200 cursor-pointer shrink-0 active:scale-95 touch-manipulation ${
                  isSelected
                    ? 'p-0.5 sm:p-1 ring-3 sm:ring-4 ring-blue-600 dark:ring-purple-600 shadow-lg shadow-blue-600/30 dark:shadow-purple-600/30 opacity-100 scale-105'
                    : 'opacity-50 hover:opacity-100 hover:scale-105'
                }`}
                title={`${member.name} (${member.role})`}
                aria-label={`Select ${member.name}`}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-slate-900 border-2 border-slate-300 dark:border-zinc-700">
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
        <button
          type="button"
          onClick={handleNextMember}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#14141f] dark:hover:bg-[#1f1f2e] text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border-2 border-slate-200 dark:border-zinc-800 flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 active:scale-90 touch-manipulation"
          title="Next Member"
          aria-label="Next member"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Bug Report Link Pill */}
      <div className="flex justify-center pt-4">
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLScF-vaE7NEi-teLfHsB3FkIkW2ggAzRLV3nr7jM0rp1pP5w8g/viewform"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#12121a] dark:hover:bg-[#1a1a24] border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-all shadow-sm active:scale-95"
        >
          <Bug className="w-3.5 h-3.5 text-rose-500" />
          <span>Found an issue? Submit a bug report</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>

    </div>
  );
};
