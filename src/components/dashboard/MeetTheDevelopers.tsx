import React, { useState } from 'react';
import {
  Code2,
  Github,
  Linkedin,
  Globe,
  GraduationCap,
  Sparkles,
  GitBranch,
  ArrowRight,
  CheckCircle2,
  Clock,
  History,
  Zap,
} from 'lucide-react';

export type TimelineFilter = 'all' | 'current' | 'earlier' | 'mentor';

export interface DeveloperInfo {
  id: string;
  name: string;
  role: string;
  era: 'earlier' | 'current' | 'mentor';
  eraLabel: string;
  photoUrl?: string;
  monogram: string;
  quote: string;
  contributions: string[];
  linkedin?: string;
  github?: string;
  githubUser?: string;
  portfolio?: string;
  highlight?: boolean;
}

// Mentor
const mentorMember: DeveloperInfo = {
  id: 'gunjan',
  name: 'Gunjan Pal',
  role: 'Project Mentor & Technical Advisor',
  era: 'mentor',
  eraLabel: 'Advisor & Guide',
  photoUrl: '/images/team/gunjan.jpg',
  monogram: 'GP',
  quote: 'Guiding technical innovation, hardware architecture, and robotics engineering.',
  contributions: [
    'System architecture and hardware-software strategy',
    'Robotics laboratory component standards',
    'Engineering mentorship and project advisory',
  ],
  linkedin: 'https://www.linkedin.com/in/gunjan-pal-796093284/',
  github: 'https://github.com/Gunjan00001',
  githubUser: 'Gunjan00001',
};

// Earlier Developers (V1 Genesis Era)
const earlierDevelopers: DeveloperInfo[] = [
  {
    id: 'vardaan-v1',
    name: 'Vardaan Saxena',
    role: 'Lead Developer & Core Architect',
    era: 'earlier',
    eraLabel: 'V1 Genesis Lead',
    photoUrl: '/images/team/vardaan.jpg',
    monogram: 'VS',
    quote: 'I always build something that I keep wishing someone would make for me.',
    contributions: [
      'Initial concept and data model prototyping',
      'Laboratory hardware requisition workflows',
      'Architectural evaluation and reboot leadership',
    ],
    linkedin: 'https://www.linkedin.com/in/simplyvardaan/',
    github: 'https://github.com/simplyvardaan',
    githubUser: 'simplyvardaan',
    portfolio: 'https://vardaansaxena.tech',
    highlight: true,
  },
  {
    id: 'divyam',
    name: 'Divyam',
    role: 'Developer (V1 Genesis)',
    era: 'earlier',
    eraLabel: 'V1 Developer',
    monogram: 'DV',
    quote: 'Laying the initial groundwork for digital asset tracking in the robotics laboratory.',
    contributions: [
      'Component categorization and initial schema design',
      'Hardware asset tagging prototypes',
      'V1 interface styling experiments',
    ],
  },
  {
    id: 'kushagra',
    name: 'Kushagra',
    role: 'Developer (V1 Genesis)',
    era: 'earlier',
    eraLabel: 'V1 Developer',
    monogram: 'KG',
    quote: 'Exploring initial inventory indexing and hardware requisition structures.',
    contributions: [
      'Inventory item schema drafting',
      'Laboratory storage cabinet mappings',
      'Early test data pipeline verification',
    ],
  },
  {
    id: 'mahak',
    name: 'Mahak',
    role: 'Developer (V1 Genesis)',
    era: 'earlier',
    eraLabel: 'V1 Developer',
    monogram: 'MK',
    quote: 'Building foundational layouts and early user onboarding flows for club members.',
    contributions: [
      'Initial member registration concepts',
      'Component catalog listing layouts',
      'Early design system explorations',
    ],
  },
];

// Current Developers (V2 Modern Vault Era - Present)
const currentDevelopers: DeveloperInfo[] = [
  {
    id: 'vardaan',
    name: 'Vardaan Saxena',
    role: 'Lead Full-Stack Developer & System Architect',
    era: 'current',
    eraLabel: 'Lead Architect',
    photoUrl: '/images/team/vardaan.jpg',
    monogram: 'VS',
    quote: 'I always build something that I keep wishing someone would make for me.',
    contributions: [
      'Complete full-stack re-architecture with Supabase Realtime & RBAC',
      'Airport matrix live clock, responsive density, and dual theme engine',
      'Zero-loss audit logging, requisitions clearance, and easyui interactions',
    ],
    linkedin: 'https://www.linkedin.com/in/simplyvardaan/',
    github: 'https://github.com/simplyvardaan',
    githubUser: 'simplyvardaan',
    portfolio: 'https://vardaansaxena.tech',
    highlight: true,
  },
  {
    id: 'samiksha',
    name: 'Samiksha Jhunjhunwala',
    role: 'Full-Stack Developer & UI/UX Specialist',
    era: 'current',
    eraLabel: 'Current Developer',
    photoUrl: '/images/team/samiksha.jpg',
    monogram: 'SJ',
    quote: 'Crafting intuitive, high-performance web dashboards and robotics interfaces.',
    contributions: [
      'Component vault card layouts, search filtration, and modal ergonomics',
      'Animated file upload integration and interactive member verification',
      'Cross-device responsiveness and accessibility optimization',
    ],
    linkedin: 'https://www.linkedin.com/in/samiksha-jhunjhunwala-9343b02b3/',
    github: 'https://github.com/Samikshajjw',
    githubUser: 'Samikshajjw',
  },
  {
    id: 'arsh',
    name: 'Mohammad Arsh',
    role: 'Developer & Hardware-Software Engineer',
    era: 'current',
    eraLabel: 'Current Developer',
    photoUrl: '/images/team/arsh.jpg',
    monogram: 'MA',
    quote: 'Engineering autonomous robotics systems, hardware-software integration, and scalable digital platforms.',
    contributions: [
      'Hardware loan clearance lifecycle and gate pass verification',
      'Storage cabinet inventory sync and low-reserve safety alerts',
      'Laboratory hardware testing and system deployment testing',
    ],
    linkedin: 'https://www.linkedin.com/in/mohammad-arsh-1792008-hd/',
    github: 'https://github.com/HybridzDynamics',
    githubUser: 'HybridzDynamics',
  },
];

export const MeetTheDevelopers: React.FC = () => {
  const [filter, setFilter] = useState<TimelineFilter>('all');
  const [selectedMember, setSelectedMember] = useState<DeveloperInfo>(currentDevelopers[0]);

  return (
    <div className="space-y-10 max-w-5xl mx-auto text-slate-900 dark:text-slate-100 animate-in fade-in duration-300 pb-20">
      
      {/* ============================================================== */}
      {/* 1. HEADER SECTION */}
      {/* ============================================================== */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-purple-950/60 border-2 border-blue-200 dark:border-purple-600/40 text-blue-700 dark:text-purple-300 text-xs font-bold tracking-wide uppercase">
          <History className="w-3.5 h-3.5" />
          <span>CICR Engineering Timeline &amp; Team Chronicles</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Meet The Team &amp; Development Journey
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          The development of the CICR Inventory Vault was undertaken in two distinct engineering phases: an initial prototype that paved the way, followed by a complete architectural overhaul delivering the modern real-time cloud platform operating today.
        </p>

        {/* Filter Navigation Tabs */}
        <div className="pt-3 flex items-center justify-center">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100 dark:bg-[#0e0e16] border-2 border-slate-200 dark:border-[#232332] shadow-sm flex-wrap gap-1">
            {[
              { key: 'all', label: 'Full Timeline Story', icon: History },
              { key: 'current', label: 'Now: Modern Team', icon: Zap },
              { key: 'earlier', label: 'Earlier: Genesis V1', icon: GitBranch },
              { key: 'mentor', label: 'Mentor: Gunjan', icon: GraduationCap },
            ].map((tab) => {
              const active = filter === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setFilter(tab.key as TimelineFilter);
                    if (tab.key === 'mentor') setSelectedMember(mentorMember);
                    if (tab.key === 'earlier') setSelectedMember(earlierDevelopers[0]);
                    if (tab.key === 'current') setSelectedMember(currentDevelopers[0]);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600 dark:bg-purple-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. EXECUTIVE MENTOR SPOTLIGHT (Gunjan Pal) */}
      {/* ============================================================== */}
      {(filter === 'all' || filter === 'mentor') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121217] border-2 border-slate-200 dark:border-[#242436] shadow-md flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          {/* Avatar Photo with Amber/Emerald Rim */}
          <div className="shrink-0 relative">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-amber-500 shadow-xl shadow-amber-500/20 bg-black">
              <img
                src={mentorMember.photoUrl}
                alt={mentorMember.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-1 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />
              <span>Mentor</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left space-y-2.5">
            <div className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
                  Project Mentor &amp; Technical Guide
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {mentorMember.name}
                </h2>
              </div>

              {/* Social Links */}
              <div className="flex items-center justify-center md:justify-end gap-2 pt-1 md:pt-0">
                {mentorMember.linkedin && (
                  <a
                    href={mentorMember.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {mentorMember.github && (
                  <a
                    href={mentorMember.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition-colors"
                  >
                    <Github className="w-3.5 h-3.5 text-blue-600 dark:text-purple-400" />
                    <span>Gunjan00001</span>
                  </a>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 italic">
              &quot;{mentorMember.quote}&quot;
            </p>

            {/* Contributions Chips */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
              {mentorMember.contributions.map((c, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#1a1a24] border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-700 dark:text-zinc-300 font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. TIMELINE JOURNEY (V1 GENESIS -> REBOOT -> V2 MODERN STACK) */}
      {/* ============================================================== */}
      <div className="relative space-y-12">

        {/* Central connecting line for timeline */}
        {filter === 'all' && (
          <div className="hidden md:block absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-amber-500 via-blue-500 dark:via-purple-500 to-emerald-500 z-0" />
        )}

        {/* ------------------------------------------------------------ */}
        {/* MILESTONE 1: THE V1 GENESIS PROTOTYPE (Earlier Developers) */}
        {/* ------------------------------------------------------------ */}
        {(filter === 'all' || filter === 'earlier') && (
          <div className="relative z-10 space-y-4">
            {/* Timeline Era Header Card */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-600/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-md">
                <GitBranch className="w-7 h-7" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] font-mono font-bold uppercase">
                    Phase 1 • Genesis Build
                  </span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                    Initial Prototype
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  V1 Prototype: Earlier Engineering Team
                </h3>

                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-3xl leading-relaxed">
                  The initial release was built by the founding team to test digital inventory management. While it validated the need for hardware tracking, foundational code debt, architectural hurdles, and interface bottlenecks led to the decision to archive the prototype and start fresh.
                </p>

                <div className="mt-2 inline-flex items-center gap-2 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  <span>Earlier Developers: Vardaan, Divyam, Kushagra &amp; Mahak</span>
                </div>
              </div>
            </div>

            {/* Earlier Developers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 md:pl-20">
              {earlierDevelopers.map((dev) => {
                const isSelected = selectedMember.id === dev.id;
                return (
                  <div
                    key={dev.id}
                    onClick={() => setSelectedMember(dev)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500 shadow-md scale-[1.02]'
                        : 'bg-white dark:bg-[#121217] border-slate-200 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-600/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {dev.photoUrl ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500 shrink-0 bg-black">
                          <img src={dev.photoUrl} alt={dev.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#1a1a26] border-2 border-amber-400/60 text-amber-600 dark:text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                          {dev.monogram}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {dev.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate">
                          {dev.role}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 italic line-clamp-2">
                      &quot;{dev.quote}&quot;
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                      <span className="font-mono">Phase 1</span>
                      {dev.portfolio && (
                        <a
                          href={dev.portfolio}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-amber-500 transition-colors"
                        >
                          Portfolio
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* THE PIVOT / REBOOT CONNECTOR (Why V2 was built) */}
        {/* ------------------------------------------------------------ */}
        {filter === 'all' && (
          <div className="relative z-10 md:pl-20 py-2">
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 border-2 border-dashed border-blue-400/40 dark:border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    The Complete Ground-Up Reboot &amp; Re-Architecture
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                    Discarded legacy prototype architecture. Rebuilt with real-time Supabase synchronization, Apple-grade EasyUI motion, military-grade RBAC, dual themes, and resilient hardware custody.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 text-xs font-black text-blue-600 dark:text-purple-400">
                <span>Transition to V2</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* MILESTONE 2: THE MODERN VAULT (Current Developers - Now) */}
        {/* ------------------------------------------------------------ */}
        {(filter === 'all' || filter === 'current') && (
          <div className="relative z-10 space-y-4">
            {/* Timeline Era Header Card */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-600/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-7 h-7" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Phase 2 • Active Production</span>
                  </span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                    Now Active • Live
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  V2 Modern Vault: Current Engineering Team
                </h3>

                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-3xl leading-relaxed">
                  Engineered completely from scratch for extreme speed, live audit visibility, multi-user concurrency, responsive wide-screen layout, and zero-loss lab asset tracking.
                </p>

                <div className="mt-2 inline-flex items-center gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Current Developers: Vardaan, Samiksha &amp; Arsh</span>
                </div>
              </div>
            </div>

            {/* Current Developers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 md:pl-20">
              {currentDevelopers.map((dev) => {
                const isSelected = selectedMember.id === dev.id;
                return (
                  <div
                    key={dev.id}
                    onClick={() => setSelectedMember(dev)}
                    className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                      isSelected
                        ? 'bg-blue-50/50 dark:bg-purple-950/20 border-blue-600 dark:border-purple-600 shadow-xl scale-[1.02]'
                        : 'bg-white dark:bg-[#121217] border-slate-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-purple-500'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 shadow-lg shrink-0 bg-black">
                          <img src={dev.photoUrl} alt={dev.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                              {dev.name}
                            </h4>
                          </div>
                          <span className="text-xs text-blue-600 dark:text-purple-400 font-semibold block truncate">
                            {dev.role}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-zinc-300 italic leading-relaxed">
                        &quot;{dev.quote}&quot;
                      </p>

                      {/* Contributions list preview */}
                      <ul className="space-y-1 pt-1">
                        {dev.contributions.map((c, i) => (
                          <li key={i} className="text-[11px] text-slate-600 dark:text-zinc-400 flex items-start gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Social Row */}
                    <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {dev.linkedin && (
                          <a
                            href={dev.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors"
                            title="LinkedIn"
                          >
                            <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" />
                          </a>
                        )}
                        {dev.github && (
                          <a
                            href={dev.github}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors"
                            title="GitHub"
                          >
                            <Github className="w-3.5 h-3.5 text-blue-600 dark:text-purple-400" />
                          </a>
                        )}
                        {dev.portfolio && (
                          <a
                            href={dev.portfolio}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-600/40 transition-colors"
                            title="Portfolio Website"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        V2 Active
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* 4. FEATURED MEMBER INSPECTOR MODAL / SPOTLIGHT CARD */}
      {/* ============================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-[#0c0c12] border-2 border-slate-200 dark:border-[#20202c] shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-blue-600 dark:border-purple-600 bg-black shrink-0 shadow-lg">
          {selectedMember.photoUrl ? (
            <img src={selectedMember.photoUrl} alt={selectedMember.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-black text-2xl text-blue-600 dark:text-purple-400">
              {selectedMember.monogram}
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-purple-400">
                Selected Engineer Showcase • {selectedMember.eraLabel}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {selectedMember.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                {selectedMember.role}
              </p>
            </div>

            {/* Direct Link Buttons */}
            <div className="flex items-center justify-center md:justify-end gap-2">
              {selectedMember.linkedin && (
                <a
                  href={selectedMember.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                >
                  <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" />
                  <span>LinkedIn</span>
                </a>
              )}
              {selectedMember.github && (
                <a
                  href={selectedMember.github}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                >
                  <Github className="w-3.5 h-3.5 text-blue-600 dark:text-purple-400" />
                  <span>{selectedMember.githubUser || 'GitHub'}</span>
                </a>
              )}
              {selectedMember.portfolio && (
                <a
                  href={selectedMember.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-500 transition-colors flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Portfolio</span>
                </a>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-700 dark:text-zinc-300 italic pt-1">
            &quot;{selectedMember.quote}&quot;
          </p>

          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
              Key Contributions &amp; Architectural Focus:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedMember.contributions.map((c, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#151520] border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-700 dark:text-zinc-300"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
