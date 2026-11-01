import React, { useState, useCallback, useEffect } from 'react';
import {
  Github,
  Linkedin,
  Globe,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type TeamPhase = 'phase1' | 'phase2';
export type TeamSubRole = 'mentor' | 'developer';

export interface TeamMember {
  id: string;
  name: string;
  category: 'mentor' | 'developer';
  filename: string;
  photoUrl?: string;
  monogram: string;
  quote: string;
  linkedin?: string;
  github?: string;
  githubUser?: string;
  portfolio?: string;
}

/**
 * Team Rosters for Phase 1 and Phase 2
 * Phase 1:
 *   Mentor: Gunjan Pal
 *   Developers: Vardaan Saxena, Kushagra Garg, Divyam Jain, Mahak Katahara
 * Phase 2:
 *   Mentor: Gunjan Pal
 *   Developers: Vardaan Saxena, Samiksha Jhunjhunwala, Mohammad Arsh
 */
const teamRosters: Record<TeamPhase, { mentor: TeamMember; developers: TeamMember[] }> = {
  phase1: {
    mentor: {
      id: 'gunjan-p1',
      name: 'Gunjan Pal',
      category: 'mentor',
      filename: 'gunjan_pal.tsx',
      photoUrl: '/images/team/gunjan.jpg',
      monogram: 'GP',
      quote: 'Guiding technical innovation, hardware architecture, and robotics engineering.',
      linkedin: 'https://www.linkedin.com/in/gunjan-pal-796093284/',
      github: 'https://github.com/Gunjan00001',
      githubUser: 'Gunjan00001',
    },
    developers: [
      {
        id: 'vardaan-p1',
        name: 'Vardaan Saxena',
        category: 'developer',
        filename: 'vardaan_saxena.tsx',
        photoUrl: '/images/team/vardaan.jpg',
        monogram: 'VS',
        quote: 'I always build something that I keep wishing someone would make for me.',
        linkedin: 'https://www.linkedin.com/in/simplyvardaan/',
        github: 'https://github.com/simplyvardaan',
        githubUser: 'simplyvardaan',
        portfolio: 'https://vardaansaxena.tech',
      },
      {
        id: 'divyam',
        name: 'Divyam Jain',
        category: 'developer',
        filename: 'divyam_jain.tsx',
        photoUrl: '/images/team/divyam.jpg',
        monogram: 'DJ',
        quote: 'Laying the initial groundwork for digital asset tracking in the robotics laboratory.',
      },
      {
        id: 'kushagra',
        name: 'Kushagra Garg',
        category: 'developer',
        filename: 'kushagra_garg.tsx',
        photoUrl: '/images/team/kushagra.jpg',
        monogram: 'KG',
        quote: 'Exploring initial inventory indexing and hardware requisition structures.',
      },
      {
        id: 'mahak',
        name: 'Mahak Katahara',
        category: 'developer',
        filename: 'mahak_katahara.tsx',
        photoUrl: '/images/team/mahak.jpg',
        monogram: 'MK',
        quote: 'Building foundational layouts and early user onboarding flows for club members.',
      },
    ],
  },
  phase2: {
    mentor: {
      id: 'gunjan-p2',
      name: 'Gunjan Pal',
      category: 'mentor',
      filename: 'gunjan_pal.tsx',
      photoUrl: '/images/team/gunjan.jpg',
      monogram: 'GP',
      quote: 'Guiding technical innovation, hardware architecture, and robotics engineering.',
      linkedin: 'https://www.linkedin.com/in/gunjan-pal-796093284/',
      github: 'https://github.com/Gunjan00001',
      githubUser: 'Gunjan00001',
    },
    developers: [
      {
        id: 'vardaan-p2',
        name: 'Vardaan Saxena',
        category: 'developer',
        filename: 'vardaan_saxena.tsx',
        photoUrl: '/images/team/vardaan.jpg',
        monogram: 'VS',
        quote: 'I always build something that I keep wishing someone would make for me.',
        linkedin: 'https://www.linkedin.com/in/simplyvardaan/',
        github: 'https://github.com/simplyvardaan',
        githubUser: 'simplyvardaan',
        portfolio: 'https://vardaansaxena.tech',
      },
      {
        id: 'samiksha',
        name: 'Samiksha Jhunjhunwala',
        category: 'developer',
        filename: 'samiksha_jhunjhunwala.tsx',
        photoUrl: '/images/team/samiksha.jpg',
        monogram: 'SJ',
        quote: 'Crafting intuitive, high-performance web dashboards and robotics interfaces.',
        linkedin: 'https://www.linkedin.com/in/samiksha-jhunjhunwala-9343b02b3/',
        github: 'https://github.com/Samikshajjw',
        githubUser: 'Samikshajjw',
      },
      {
        id: 'arsh',
        name: 'Mohammad Arsh',
        category: 'developer',
        filename: 'mohammad_arsh.tsx',
        photoUrl: '/images/team/arsh.jpg',
        monogram: 'MA',
        quote: 'Engineering autonomous robotics systems, hardware-software integration, and scalable digital platforms.',
        linkedin: 'https://www.linkedin.com/in/mohammad-arsh-1792008-hd/',
        github: 'https://github.com/HybridzDynamics',
        githubUser: 'HybridzDynamics',
      },
    ],
  },
};

export const MeetTheDevelopers: React.FC = () => {
  // By default show Phase 2 when user reaches developer page
  const [activePhase, setActivePhase] = useState<TeamPhase>('phase2');
  // Sub buttons: Mentor and Developers (default: Developers)
  const [activeSubRole, setActiveSubRole] = useState<TeamSubRole>('developer');

  const currentRoster = teamRosters[activePhase];

  // List of members for currently active sub-role
  const activeMembers: TeamMember[] =
    activeSubRole === 'mentor'
      ? [currentRoster.mentor]
      : currentRoster.developers;

  // Selected member state: Vardaan Saxena is visible by default in both Phase 1 and Phase 2
  const [selectedMemberId, setSelectedMemberId] = useState<string>('vardaan-p2');

  // Switch phase: ensures Vardaan Saxena is visible by default in both Phase 1 and Phase 2
  const handlePhaseChange = (phase: TeamPhase) => {
    setActivePhase(phase);
    if (activeSubRole === 'developer') {
      setSelectedMemberId(phase === 'phase1' ? 'vardaan-p1' : 'vardaan-p2');
    } else {
      setSelectedMemberId(teamRosters[phase].mentor.id);
    }
  };

  // Switch sub-role (Mentor vs Developers): default to Vardaan Saxena when viewing developers
  const handleSubRoleChange = (subRole: TeamSubRole) => {
    setActiveSubRole(subRole);
    if (subRole === 'developer') {
      setSelectedMemberId(activePhase === 'phase1' ? 'vardaan-p1' : 'vardaan-p2');
    } else {
      setSelectedMemberId(currentRoster.mentor.id);
    }
  };

  const currentMember =
    activeMembers.find((m) => m.id === selectedMemberId) ||
    activeMembers[0] ||
    currentRoster.developers[0];

  const handlePrevMember = useCallback(() => {
    if (activeMembers.length <= 1) return;
    const currentIndex = activeMembers.findIndex((m) => m.id === currentMember.id);
    const prevIndex = (currentIndex - 1 + activeMembers.length) % activeMembers.length;
    setSelectedMemberId(activeMembers[prevIndex].id);
  }, [activeMembers, currentMember]);

  const handleNextMember = useCallback(() => {
    if (activeMembers.length <= 1) return;
    const currentIndex = activeMembers.findIndex((m) => m.id === currentMember.id);
    const nextIndex = (currentIndex + 1) % activeMembers.length;
    setSelectedMemberId(activeMembers[nextIndex].id);
  }, [activeMembers, currentMember]);

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
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 -mt-3 sm:-mt-5 md:-mt-6 space-y-3 sm:space-y-4 pb-20 select-none animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Meet the Team
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">
          Creative &amp; Innovative Cell in Robotics &bull; JIIT Noida
        </p>
      </div>

      {/* Primary Phase 1 and Phase 2 Buttons */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-[#120d22] border-2 border-slate-200 dark:border-zinc-800 shadow-sm">
          <button
            type="button"
            onClick={() => handlePhaseChange('phase1')}
            className={`px-6 sm:px-8 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activePhase === 'phase1'
                ? 'bg-blue-600 dark:bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Phase 1
          </button>
          <button
            type="button"
            onClick={() => handlePhaseChange('phase2')}
            className={`px-6 sm:px-8 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activePhase === 'phase2'
                ? 'bg-blue-600 dark:bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Phase 2
          </button>
        </div>
      </div>

      {/* Big Screen Profile Showcase Card (macOS Window) */}
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

          <div className="w-12" />
        </div>

        {/* Profile Card Body with Big Screen Photo */}
        <div className="p-5 sm:p-7 md:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8 md:gap-9">
          {/* Big Screen Photo with Radiant Glow Ring */}
          <div className="shrink-0 relative">
            <div className={`w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-full p-2 bg-gradient-to-br shadow-2xl ${
              currentMember.category === 'mentor'
                ? 'from-amber-400/40 via-yellow-500/20 to-orange-500/30 ring-2 ring-amber-400/50'
                : 'from-blue-500/40 via-purple-500/20 to-pink-500/30 ring-2 ring-purple-400/50'
            }`}>
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-white/30 dark:border-white/10 shadow-inner flex items-center justify-center relative">
                {currentMember.photoUrl ? (
                  <img
                    src={currentMember.photoUrl}
                    alt={currentMember.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      const fallback = (e.target as HTMLElement).parentElement?.querySelector('.avatar-main-fallback');
                      if (fallback) (fallback as HTMLElement).style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="avatar-main-fallback w-full h-full flex items-center justify-center font-black text-3xl sm:text-5xl text-blue-600 dark:text-purple-400 bg-slate-100 dark:bg-[#1a172e]"
                  style={{ display: currentMember.photoUrl ? 'none' : 'flex' }}
                >
                  {currentMember.monogram}
                </div>
              </div>
            </div>
          </div>

          {/* Member Details */}
          <div className="flex-1 text-center md:text-left space-y-3 min-w-0 w-full">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">
                Hi, my name is
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {currentMember.name}
            </h2>

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

              {/* Portfolio */}
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

      {/* Sub Buttons Below Big Screen Photo: Mentor and Developers */}
      <div className="flex items-center justify-center pt-2">
        <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100/90 dark:bg-[#151124] border-2 border-slate-200 dark:border-zinc-800 text-xs sm:text-sm font-bold shadow-sm">
          <button
            type="button"
            onClick={() => handleSubRoleChange('mentor')}
            className={`px-6 sm:px-8 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubRole === 'mentor'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mentor
          </button>
          <button
            type="button"
            onClick={() => handleSubRoleChange('developer')}
            className={`px-6 sm:px-8 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubRole === 'developer'
                ? 'bg-blue-600 dark:bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Developers
          </button>
        </div>
      </div>

      {/* Member Avatar Selection Track with Carousel Controls */}
      <div
        className="flex items-center justify-center gap-2 sm:gap-4 pt-1 max-w-lg mx-auto px-2"
        aria-label="Member selection carousel"
      >
        {/* Left Arrow Button */}
        {activeMembers.length > 1 && (
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
          {activeMembers.map((member) => {
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
                title={member.name}
                aria-label={`Select ${member.name}`}
              >
                <div className={`w-[52px] h-[52px] sm:w-[58px] sm:h-[58px] rounded-full overflow-hidden bg-slate-900 border-2 transition-all flex items-center justify-center relative ${
                  isSelected
                    ? member.category === 'mentor'
                      ? 'ring-3 ring-amber-400 border-amber-400 shadow-lg shadow-amber-400/30'
                      : 'ring-3 ring-purple-500 border-purple-500 shadow-lg shadow-purple-500/30'
                    : 'border-slate-300 dark:border-zinc-700'
                }`}>
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                        const fallback = (e.target as HTMLElement).parentElement?.querySelector('.avatar-thumb-fallback');
                        if (fallback) (fallback as HTMLElement).style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="avatar-thumb-fallback w-full h-full flex items-center justify-center font-bold text-xs text-blue-600 dark:text-purple-400 bg-slate-100 dark:bg-[#1a172e]"
                    style={{ display: member.photoUrl ? 'none' : 'flex' }}
                  >
                    {member.monogram}
                  </div>
                </div>
                <span className={`text-[10px] font-bold truncate max-w-[62px] transition-colors ${
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
        {activeMembers.length > 1 && (
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
