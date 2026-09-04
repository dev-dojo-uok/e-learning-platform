import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Layers,
  FileText,
  Video,
  CheckSquare,
  MessageSquare,
  BarChart3,
  Shield,
  Database,
  Server,
  Code,
  GraduationCap,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Clock,
  Lock,
  Terminal,
  ChevronRight,
  Download,
  PlayCircle,
  FileUp,
  Award,
  Users,
  CheckCircle2,
  FolderArchive,
  LayoutDashboard,
  Menu,
  X,
  ZoomIn,
  Maximize2
} from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';

// Team members data with real names and GitHub profile images
const teamMembers = [
  {
    id: "Member 01",
    name: "Divyaloshini Mohan",
    username: "DivyaMohan-18",
    avatar: "https://avatars.githubusercontent.com/u/198930103?v=4",
    profile: "https://github.com/DivyaMohan-18",
    role: "Course Shell & Materials Management Engine",
    description: "Architected course schema, Week/Topic divisions, and multi-format media handlers (PDF, File, Video Embed, Video Src).",
    deliverables: ["Course Catalog Shell", "Topic & Week Dividers", "Multi-format Material Uploads", "Student In-App Viewer Shell"],
    folder: "modules/courses & modules/materials",
    badge: "Course Shell & Media"
  },
  {
    id: "Member 02",
    name: "Akash Geethanjana",
    username: "geethakash",
    avatar: "https://avatars.githubusercontent.com/u/58387103?v=4",
    profile: "https://github.com/geethakash",
    role: "Quiz Material Activity & Assessments",
    description: "Engineered form-based assessments, server-side anti-cheat countdown timers, automated grading logic, and attempt scorecards.",
    deliverables: ["Quiz Builder Interface", "Countdown Timers Engine", "Automated Grading Logic", "Attempt Scorecards & Reviews"],
    folder: "modules/quizzes",
    badge: "Quiz & Assessment"
  },
  {
    id: "Member 03",
    name: "Abisekan",
    username: "Abisekan",
    avatar: "https://avatars.githubusercontent.com/u/118064108?v=4",
    profile: "https://github.com/Abisekan",
    role: "Course Discussion & Community Forums",
    description: "Implemented context-isolated module bulletin boards, instructor announcement broadcasts, and nested discussion reply trees.",
    deliverables: ["Module Bulletin Boards", "Announcement System", "Thread Reply Trees", "Forum Moderation Controls"],
    folder: "modules/forums",
    badge: "Forums & Discussion"
  },
  {
    id: "Member 04",
    name: "Kaveesha De Silva",
    username: "KMDS21",
    avatar: "https://avatars.githubusercontent.com/u/199824131?v=4",
    profile: "https://github.com/KMDS21",
    role: "Completion Tracking & Progress Analytics",
    description: "Built real-time viewing tracking, student completion state verification, course progress metrics, and teacher analytics dashboards.",
    deliverables: ["Completion State Engine", "Analytics Graphs & Charts", "Weighted Progress Calculation", "Teacher Dashboards"],
    folder: "modules/completion",
    badge: "Completion & Analytics"
  },
  {
    id: "Member 05",
    name: "Thanuka Sachith",
    username: "THANUKA021",
    avatar: "https://avatars.githubusercontent.com/u/167668032?v=4",
    profile: "https://github.com/THANUKA021",
    role: "Assignment Dropbox & Grading Material",
    description: "Developed assignment specification interface, student submission dropzone (file/link), deadline enforcement, and teacher grading evaluation queue.",
    deliverables: ["Assignment Specification", "File & Link Submission Portal", "Teacher Grading Queue", "Rubric Scoring & Feedback"],
    folder: "modules/assignments",
    badge: "Assignment & Grading"
  }
];

export default function LandingPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activePreviewTab, setActivePreviewTab] = useState('materials');
  const [copiedRole, setCopiedRole] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);

  const copyCredentials = (role, email, pass) => {
    navigator.clipboard.writeText(`${email}\n${pass}`);
    setCopiedRole(role);
    setTimeout(() => setCopiedRole(null), 2000);
  };

  const handleQuickLogin = (email, pass) => {
    navigate(`/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(pass)}`);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      {/* 1. Header / Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-neutral-950 text-white flex items-center justify-center font-bold text-base shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-neutral-950">SAC E-Learning</span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                  SWST 32043
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
            <a href="#overview" className="hover:text-neutral-950 transition-colors">Overview</a>
            <a href="#architecture" className="hover:text-neutral-950 transition-colors">Architecture</a>
            <a href="#cloud-diagram" className="hover:text-neutral-950 transition-colors">AWS & CI/CD</a>
            <a href="#modules" className="hover:text-neutral-950 transition-colors">Team & Domains</a>
            <a href="#credentials" className="hover:text-neutral-950 transition-colors">Demo Logins</a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-semibold text-neutral-900">{user.name}</div>
                  <div className="text-[11px] font-mono text-neutral-500 capitalize">{user.role.toLowerCase()}</div>
                </div>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium rounded-lg text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  Register
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-neutral-200 bg-white px-4 pt-2 pb-4 space-y-2">
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Overview
            </a>
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Architecture
            </a>
            <a
              href="#cloud-diagram"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              AWS & CI/CD
            </a>
            <a
              href="#modules"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Team & Domains
            </a>
            <a
              href="#credentials"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Demo Logins
            </a>
            <div className="pt-2 border-t border-neutral-200 flex flex-col gap-2">
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold rounded-lg bg-neutral-950 text-white"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm font-semibold rounded-lg bg-neutral-950 text-white"
                  >
                    Register Account
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section with Animated Monochrome Grid Pattern & Dynamic Elements */}
      <section id="overview" className="relative pt-16 pb-20 md:pt-24 md:pb-28 border-b border-neutral-200 overflow-hidden bg-white">
        {/* Dynamic Animated Grid Pattern */}
        <div 
          className="absolute inset-0 bg-grid-animated opacity-75 pointer-events-none"
          style={{
            maskImage: 'radial-gradient(ellipse 75% 65% at 50% 45%, black 40%, transparent 95%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 45%, black 40%, transparent 95%)'
          }}
        />

        {/* Ambient Pulsing Radial Spotlight */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-neutral-200/50 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

        {/* Corner Blueprint Crosshairs */}
        <div className="absolute top-4 left-4 font-mono text-xs text-neutral-300 pointer-events-none select-none">+</div>
        <div className="absolute top-4 right-4 font-mono text-xs text-neutral-300 pointer-events-none select-none">+</div>
        <div className="absolute bottom-4 left-4 font-mono text-xs text-neutral-300 pointer-events-none select-none">+</div>
        <div className="absolute bottom-4 right-4 font-mono text-xs text-neutral-300 pointer-events-none select-none">+</div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Academic Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 bg-white/90 backdrop-blur-xs text-xs font-medium text-neutral-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-neutral-950 animate-pulse"></span>
              <span>Software Architecture and Concepts (SWST 32043)</span>
              <span className="text-neutral-300">|</span>
              <span className="text-neutral-500">Assignment 02</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-950 leading-[1.12]">
              Moodle-Style E-Learning Platform Built on Clean Architecture
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-neutral-600 max-w-3xl mx-auto font-normal leading-relaxed">
              A high-performance Learning Management System designed around a <strong className="text-neutral-900 font-semibold">Clean Layered (3-Tier) Monolithic Architecture</strong>. Built with strict domain isolation across 5 team modules and native orchestration for 6 distinct course material engines.
            </p>

            {/* Call to Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-neutral-950 text-white text-base font-semibold hover:bg-neutral-800 transition-all shadow-sm hover:shadow"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Launch Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-neutral-950 text-white text-base font-semibold hover:bg-neutral-800 transition-all shadow-sm hover:shadow"
                >
                  Sign In & Explore
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <a
                href="#architecture"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-neutral-300 bg-white text-neutral-800 text-base font-semibold hover:bg-neutral-50 hover:border-neutral-400 transition-all"
              >
                <Layers className="h-4 w-4 text-neutral-600" />
                System Architecture
              </a>
              <a
                href="#cloud-diagram"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-neutral-300 bg-white text-neutral-800 text-base font-semibold hover:bg-neutral-50 hover:border-neutral-400 transition-all"
              >
                <ExternalLink className="h-4 w-4 text-neutral-600" />
                AWS Infrastructure
              </a>
              <a
                href="#credentials"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-dashed border-neutral-300 text-neutral-600 text-sm font-medium hover:text-neutral-950 hover:border-neutral-500 transition-colors"
              >
                <Lock className="h-4 w-4" />
                Demo Logins
              </a>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="bg-white/95 backdrop-blur-xs border border-neutral-200 rounded-xl p-5 shadow-2xs hover:border-neutral-900 transition-colors">
              <div className="text-3xl font-extrabold text-neutral-950 tracking-tight">3 Tiers</div>
              <div className="text-sm font-medium text-neutral-500 mt-1">Clean Layered Monolith</div>
              <div className="text-xs text-neutral-400 mt-0.5">Presentation • Logic • Data</div>
            </div>
            <div className="bg-white/95 backdrop-blur-xs border border-neutral-200 rounded-xl p-5 shadow-2xs hover:border-neutral-900 transition-colors">
              <div className="text-3xl font-extrabold text-neutral-950 tracking-tight">5 Domains</div>
              <div className="text-sm font-medium text-neutral-500 mt-1">Feature Isolation</div>
              <div className="text-xs text-neutral-400 mt-0.5">1 Standalone Module per Member</div>
            </div>
            <div className="bg-white/95 backdrop-blur-xs border border-neutral-200 rounded-xl p-5 shadow-2xs hover:border-neutral-900 transition-colors">
              <div className="text-3xl font-extrabold text-neutral-950 tracking-tight">6 Engines</div>
              <div className="text-sm font-medium text-neutral-500 mt-1">Course Material Types</div>
              <div className="text-xs text-neutral-400 mt-0.5">PDF • Files • Embeds • Quizzes</div>
            </div>
            <div className="bg-white/95 backdrop-blur-xs border border-neutral-200 rounded-xl p-5 shadow-2xs hover:border-neutral-900 transition-colors">
              <div className="text-3xl font-extrabold text-neutral-950 tracking-tight">100%</div>
              <div className="text-sm font-medium text-neutral-500 mt-1">Relational Integrity</div>
              <div className="text-xs text-neutral-400 mt-0.5">Prisma ORM on PostgreSQL</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Platform Preview Simulator */}
      <section id="preview" className="py-20 border-b border-neutral-200 bg-neutral-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-neutral-500">Interactive Walkthrough</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight mt-1">
              Explore the Unified Learning Environment
            </h2>
            <p className="text-neutral-600 mt-3 text-base">
              Click through the interactive module tabs below to inspect how students and educators experience the platform's core functional subsystems.
            </p>
          </div>

          {/* Browser Window Mockup */}
          <div className="max-w-5xl mx-auto bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden">
            {/* Window Chrome Header */}
            <div className="bg-neutral-100/90 border-b border-neutral-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-neutral-300"></span>
                <span className="w-3 h-3 rounded-full bg-neutral-300"></span>
                <span className="w-3 h-3 rounded-full bg-neutral-300"></span>
                <a
                  href="https://learn-sac.akaigen.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-neutral-600 hover:text-neutral-950 hover:underline ml-2 flex items-center gap-1.5"
                >
                  <Lock className="h-3 w-3 text-neutral-400" />
                  <span>https://learn-sac.akaigen.com/courses/swst-32043</span>
                  <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                </a>
              </div>
              <a
                href="https://learn-sac.akaigen.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-950 px-2 py-0.5 rounded bg-white border border-neutral-200 shadow-2xs transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live AWS Deployment: learn-sac.akaigen.com</span>
                <ExternalLink className="h-3 w-3 text-neutral-400 ml-0.5" />
              </a>
            </div>

            {/* Interactive Subsystem Switcher Tabs */}
            <div className="border-b border-neutral-200 bg-white px-4 py-2 flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'materials', label: 'Course Materials Shell', icon: BookOpen },
                { id: 'quizzes', label: 'Timed Quiz Engine', icon: CheckSquare },
                { id: 'forums', label: 'Discussion Board', icon: MessageSquare },
                { id: 'analytics', label: 'Progress & Completion', icon: BarChart3 },
                { id: 'assignments', label: 'Assignment Dropbox', icon: FileUp },
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activePreviewTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActivePreviewTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-neutral-950 text-white shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Preview Content */}
            <div className="p-6 md:p-8 min-h-[380px] bg-white">
              {activePreviewTab === 'materials' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                    <div>
                      <span className="text-xs font-mono uppercase text-neutral-500">Course Shell Module</span>
                      <h3 className="text-xl font-bold text-neutral-950">Introduction to Software Architecture</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">Topic & Week-based curriculum organization with native media viewers.</p>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded border border-neutral-200">
                      Member 01 Domain
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Week 1: Fundamentals of Software Architecture</div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 hover:border-neutral-900 transition-colors flex items-start gap-3.5">
                        <div className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-900">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-neutral-900">Architectural Style Overview PDF</div>
                          <div className="text-xs text-neutral-500 mt-1">Document viewer with in-line zoom and page jump</div>
                          <div className="mt-2.5 flex items-center gap-2 text-[11px] font-mono text-neutral-600">
                            <span className="px-1.5 py-0.5 rounded bg-white border border-neutral-200">Type: PDF</span>
                            <span>•</span>
                            <span>Direct In-App Reader</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 hover:border-neutral-900 transition-colors flex items-start gap-3.5">
                        <div className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-900">
                          <PlayCircle className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-neutral-900">Introduction to Clean Architecture Video</div>
                          <div className="text-xs text-neutral-500 mt-1">HTML5 hardware-accelerated video streaming</div>
                          <div className="mt-2.5 flex items-center gap-2 text-[11px] font-mono text-neutral-600">
                            <span className="px-1.5 py-0.5 rounded bg-white border border-neutral-200">Type: VIDEO_SRC</span>
                            <span>•</span>
                            <span>1080p Stream</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 hover:border-neutral-900 transition-colors flex items-start gap-3.5">
                      <div className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-900">
                        <Video className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-neutral-900">Design Principles & SOLID (Embedded)</div>
                        <div className="text-xs text-neutral-500 mt-1">Interactive responsive iframe lecture player</div>
                        <div className="mt-2.5 flex items-center gap-2 text-[11px] font-mono text-neutral-600">
                          <span className="px-1.5 py-0.5 rounded bg-white border border-neutral-200">Type: VIDEO_EMBED</span>
                          <span>•</span>
                          <span>YouTube / Vimeo Player</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'quizzes' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                    <div>
                      <span className="text-xs font-mono uppercase text-neutral-500">Quiz Material Subsystem</span>
                      <h3 className="text-xl font-bold text-neutral-950">Architecture Patterns & SOLID Quiz</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">Form-based assessments, countdown timers, and server-side automated scoring.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2.5 py-1 bg-neutral-950 text-white rounded font-semibold flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        14:48 Left
                      </span>
                    </div>
                  </div>

                  <div className="border border-neutral-200 rounded-xl p-5 bg-neutral-50 space-y-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
                      <span>QUESTION 01 OF 05</span>
                      <span className="font-mono">Weight: 20 Marks</span>
                    </div>
                    <p className="text-sm font-bold text-neutral-900">
                      Which architectural principle states that software entities should be open for extension, but closed for modification?
                    </p>
                    <div className="space-y-2 pt-1">
                      {[
                        'Single Responsibility Principle (SRP)',
                        'Open/Closed Principle (OCP) - [Selected]',
                        'Liskov Substitution Principle (LSP)',
                        'Dependency Inversion Principle (DIP)'
                      ].map((opt, i) => (
                        <div
                          key={i}
                          className={`px-4 py-2.5 rounded-lg text-xs font-medium border transition-colors flex items-center justify-between ${
                            i === 1
                              ? 'bg-neutral-950 text-white border-neutral-950'
                              : 'bg-white text-neutral-800 border-neutral-200'
                          }`}
                        >
                          <span>{opt}</span>
                          {i === 1 && <Check className="h-4 w-4" />}
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-200">
                      <span>Auto-saving response to server...</span>
                      <span className="font-semibold text-neutral-900">Member 02 Domain</span>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'forums' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                    <div>
                      <span className="text-xs font-mono uppercase text-neutral-500">Discussion Forum Subsystem</span>
                      <h3 className="text-xl font-bold text-neutral-950">Week 2: Clean Architecture Discussion Board</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">Context-isolated course forums for Q&A, instructor announcements, and peer collaboration.</p>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded border border-neutral-200">
                      Member 03 Domain
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-neutral-950 text-white">Instructor Post</span>
                          <span className="text-xs font-semibold text-neutral-900">Prof. Test Teacher</span>
                        </div>
                        <span className="text-xs text-neutral-400 font-mono">Yesterday at 14:15</span>
                      </div>
                      <div className="text-sm font-bold text-neutral-950">Clarification on Dependency Inversion in 3-Tier Layers</div>
                      <p className="text-xs text-neutral-600">
                        Notice how the Presentation Tier communicates only with the Service/Logic Tier without touching Prisma ORM models directly.
                      </p>
                      <div className="pt-2 border-t border-neutral-100 flex items-center gap-4 text-xs font-medium text-neutral-500">
                        <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> 8 Replies</span>
                        <span>•</span>
                        <span>Latest by Student Test</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                    <div>
                      <span className="text-xs font-mono uppercase text-neutral-500">Analytics & Completion Engine</span>
                      <h3 className="text-xl font-bold text-neutral-950">Student Completion & Performance Dashboard</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">Real-time viewing tracking, completion state verification, and course analytics.</p>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded border border-neutral-200">
                      Member 04 Domain
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50">
                      <div className="text-xs font-mono text-neutral-500">OVERALL PROGRESS</div>
                      <div className="text-2xl font-extrabold text-neutral-950 mt-1">75% Completed</div>
                      <div className="w-full bg-neutral-200 h-2 rounded-full mt-3 overflow-hidden">
                        <div className="bg-neutral-950 h-full rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50">
                      <div className="text-xs font-mono text-neutral-500">MATERIALS VIEWED</div>
                      <div className="text-2xl font-extrabold text-neutral-950 mt-1">3 of 4 Done</div>
                      <div className="text-xs text-neutral-500 mt-2">1 Video Embed remaining</div>
                    </div>
                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50">
                      <div className="text-xs font-mono text-neutral-500">ASSESSMENT SCORE</div>
                      <div className="text-2xl font-extrabold text-neutral-950 mt-1">92.5 / 100</div>
                      <div className="text-xs text-emerald-600 font-semibold mt-2">All passing thresholds met</div>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'assignments' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                    <div>
                      <span className="text-xs font-mono uppercase text-neutral-500">Assignment Dropbox Subsystem</span>
                      <h3 className="text-xl font-bold text-neutral-950">Assignment 02: Architecture Specification & Code</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">Task evaluation console, file submission dropzone, and instructor grading queue.</p>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded border border-neutral-200">
                      Member 05 Domain
                    </span>
                  </div>

                  <div className="border border-neutral-200 rounded-xl p-5 bg-neutral-50 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-neutral-400 font-mono">DUE DATE</span>
                        <div className="font-bold text-neutral-900 mt-0.5">Friday, 18 September 2026, 23:59 PM</div>
                      </div>
                      <div>
                        <span className="text-neutral-400 font-mono">GRADING STATUS</span>
                        <div className="font-bold text-emerald-700 mt-0.5">Graded: 95 / 100 Marks</div>
                      </div>
                    </div>

                    <div className="border border-dashed border-neutral-300 rounded-xl p-6 text-center bg-white">
                      <FileUp className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
                      <div className="text-sm font-bold text-neutral-900">Submitted File: group-02-architecture.pdf</div>
                      <div className="text-xs text-neutral-500 mt-1">Submitted 2 days early • Feedback: "Excellent architectural separation."</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Architectural Blueprint: Clean 3-Tier Layered Monolith */}
      <section id="architecture" className="py-20 border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-neutral-500">Core Engineering Design</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight mt-1">
              Strict 3-Tier Monolithic Architecture
            </h2>
            <p className="text-neutral-600 mt-3 text-base">
              The platform enforces absolute separation of concerns across presentation, business logic, and data tiers, ensuring reliable individual grading traceability and maintainability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Tier 1: Presentation Layer */}
            <div className="border border-neutral-200 rounded-2xl p-6 bg-neutral-50/50 hover:border-neutral-900 transition-all shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-neutral-200 text-neutral-800">
                  TIER 01
                </span>
                <Code className="h-5 w-5 text-neutral-700" />
              </div>
              <h3 className="text-xl font-bold text-neutral-950 mt-4">Presentation Layer</h3>
              <p className="text-xs font-mono text-neutral-500 mt-0.5">Frontend Client</p>
              <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
                React 19 single-page application bundled with Vite and styled via Tailwind CSS v4. Uses modular layouts, shared Zustand session stores, and Radix UI components.
              </p>
              <div className="mt-6 pt-4 border-t border-neutral-200 space-y-2">
                <div className="text-xs font-semibold text-neutral-500 uppercase font-mono">Tech Stack:</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-800 font-medium">React 19</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-800 font-medium">Tailwind v4</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-800 font-medium">Zustand</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-800 font-medium">Vite</span>
                </div>
              </div>
            </div>

            {/* Tier 2: Business Logic Layer */}
            <div className="border border-neutral-950 rounded-2xl p-6 bg-neutral-950 text-white transition-all shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-neutral-800 text-white">
                  TIER 02
                </span>
                <Server className="h-5 w-5 text-neutral-300" />
              </div>
              <h3 className="text-xl font-bold text-white mt-4">Business Logic Layer</h3>
              <p className="text-xs font-mono text-neutral-400 mt-0.5">Backend REST APIs</p>
              <p className="text-sm text-neutral-300 mt-3 leading-relaxed">
                Node.js and Express.js routing engine organized by feature modules. Enforces role-based guards (Student, Teacher, Admin), cookie-based HttpOnly JWT authentication, and automatic quiz grading.
              </p>
              <div className="mt-6 pt-4 border-t border-neutral-800 space-y-2">
                <div className="text-xs font-semibold text-neutral-400 uppercase font-mono">Tech Stack:</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-200 font-medium">Node.js</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-200 font-medium">Express.js</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-200 font-medium">JWT HttpOnly</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-200 font-medium">Bcrypt</span>
                </div>
              </div>
            </div>

            {/* Tier 3: Data Access Layer */}
            <div className="border border-neutral-200 rounded-2xl p-6 bg-neutral-50/50 hover:border-neutral-900 transition-all shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-neutral-200 text-neutral-800">
                  TIER 03
                </span>
                <Database className="h-5 w-5 text-neutral-700" />
              </div>
              <h3 className="text-xl font-bold text-neutral-950 mt-4">Data Access Layer</h3>
              <p className="text-xs font-mono text-neutral-500 mt-0.5">Relational Persistence</p>
              <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
                PostgreSQL database engine governed by Prisma ORM. Guarantees relational integrity, cascading rules, automatic migrations, and strictly typed entity schemas across all 5 member domains.
              </p>
              <div className="mt-6 pt-4 border-t border-neutral-200 space-y-2">
                <div className="text-xs font-semibold text-neutral-500 uppercase font-mono">Tech Stack:</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-800 font-medium">PostgreSQL</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-800 font-medium">Prisma ORM</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-800 font-medium">Relational Schema</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4B. Attached Cloud Architecture Diagram & CI/CD Pipeline Section */}
      <section id="cloud-diagram" className="py-20 border-b border-neutral-200 bg-neutral-50/50 relative overflow-hidden">
        {/* Subtle grid pattern for diagram section */}
        <div 
          className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none"
          style={{
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 95%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 95%)'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 bg-white text-xs font-mono font-semibold text-neutral-800 shadow-2xs mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              AWS CLOUD & CI/CD BLUEPRINT
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
              Production Architecture & CI/CD Pipeline
            </h2>
            <p className="text-neutral-600 mt-3 text-base">
              Detailed blueprint illustrating our GitHub Actions automation, frontend static deployment to Amazon S3 & CloudFront, backend container hosting on AWS EC2 behind Application Load Balancer, and Cloudflare edge delivery.
            </p>
          </div>

          {/* Diagram Container */}
          <div className="max-w-5xl mx-auto bg-white border border-neutral-200 rounded-2xl shadow-lg overflow-hidden transition-all hover:border-neutral-900">
            {/* Diagram Header Bar */}
            <div className="bg-neutral-100/90 border-b border-neutral-200 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-neutral-300"></span>
                  <span className="w-3 h-3 rounded-full bg-neutral-300"></span>
                  <span className="w-3 h-3 rounded-full bg-neutral-300"></span>
                </div>
                <span className="text-xs font-mono font-medium text-neutral-700">architecture-diagram.png • System Topology</span>
              </div>
              <button
                onClick={() => setIsDiagramModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 transition-colors"
                title="View Full Resolution"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Expand Diagram</span>
              </button>
            </div>

            {/* Clickable Image Viewer */}
            <div 
              onClick={() => setIsDiagramModalOpen(true)}
              className="p-4 sm:p-6 md:p-8 bg-white cursor-zoom-in flex items-center justify-center group"
            >
              <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50/50 p-2 sm:p-4">
                <img
                  src="/architecture-diagram.png"
                  alt="Full System AWS Cloud Architecture and CI/CD Pipeline Diagram"
                  className="w-full h-auto object-contain max-h-[550px] mx-auto rounded-lg group-hover:scale-[1.01] transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-neutral-950/0 group-hover:bg-neutral-950/5 transition-colors flex items-center justify-center pointer-events-none">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg bg-neutral-950/85 text-white text-xs font-medium shadow-sm flex items-center gap-1.5">
                    <ZoomIn className="h-3.5 w-3.5" />
                    Click to inspect full resolution
                  </span>
                </div>
              </div>
            </div>

            {/* Architectural Flow Highlights */}
            <div className="border-t border-neutral-200 bg-neutral-50/60 p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200">
                <div className="font-bold text-neutral-950 font-mono uppercase">1. GitHub Monorepo</div>
                <p className="text-neutral-600 mt-1">Unified repository housing React frontend and Express backend modules with automated branch protection.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200">
                <div className="font-bold text-neutral-950 font-mono uppercase">2. CI/CD Workflows</div>
                <p className="text-neutral-600 mt-1">GitHub Actions pipelines executing test suites, static Vite compilation, and SSH/S3 deployment actions.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200">
                <div className="font-bold text-neutral-950 font-mono uppercase">3. AWS Infrastructure</div>
                <p className="text-neutral-600 mt-1">Amazon S3 for static assets & LMS media, EC2 instance under ALB, and CloudFront CDN distribution.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-neutral-200">
                <div className="font-bold text-neutral-950 font-mono uppercase">4. Edge & Data Tier</div>
                <p className="text-neutral-600 mt-1">Cloudflare SSL & DDoS edge mitigation, routing traffic to ALB and persistent PostgreSQL relational DB.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 5-Member Engineering Team & Domain Segregation Matrix */}
      <section id="modules" className="py-20 border-b border-neutral-200 bg-neutral-50/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-neutral-500">Engineering Team & Domain Owners</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight mt-1">
              5-Member Domain Segregation & Contributors
            </h2>
            <p className="text-neutral-600 mt-3 text-base">
              The project is cleanly structured into 5 isolated feature domains across presentation, logic, and data tiers to guarantee individual academic grading traceability and seamless parallel development.
            </p>
          </div>

          <div className="space-y-5 max-w-5xl mx-auto">
            {teamMembers.map((member) => (
              <div 
                key={member.username}
                className="border border-neutral-200 rounded-2xl p-6 bg-white hover:border-neutral-950 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Member Profile Avatar & Info */}
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://github.com/identicons/" + member.username + ".png";
                      }}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-neutral-200 object-cover shadow-2xs shrink-0"
                    />
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-neutral-950 tracking-tight">{member.name}</h3>
                      <a
                        href={member.profile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-neutral-500 hover:text-neutral-950 hover:underline px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 transition-colors"
                      >
                        <GitHubIcon className="h-3 w-3" />
                        <span>@{member.username}</span>
                        <ExternalLink className="h-2.5 w-2.5 ml-0.5 opacity-60" />
                      </a>
                    </div>

                    <div className="text-sm font-semibold text-neutral-800">
                      {member.role}
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed max-w-2xl">
                      {member.description}
                    </p>

                    {/* Deliverables Tags */}
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {member.deliverables.map((item, idx) => (
                        <span 
                          key={idx} 
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200"
                        >
                          ✓ {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Code Workspace Tag */}
                <div className="md:text-right shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-100">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase">Isolated Workspace</div>
                  <div className="text-xs font-mono font-semibold text-neutral-800 mt-0.5 px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 inline-block">
                    {member.folder}
                  </div>
                  <div className="mt-2 hidden md:block">
                    <a
                      href={member.profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:underline"
                    >
                      <span>View GitHub Profile</span>
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Quick Evaluator / Demo Access Panel */}
      <section id="credentials" className="py-20 border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-neutral-500">Instant Evaluation & Grading</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight mt-1">
              Test Accounts & Demo Access
            </h2>
            <p className="text-neutral-600 mt-3 text-base">
              Use these pre-configured seeded accounts to immediately test the platform from both educator and student perspectives.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Teacher Account Card */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:border-neutral-950 transition-all space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-neutral-950 text-white flex items-center justify-center font-bold text-sm">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-neutral-950">Teacher Account</h3>
                    <p className="text-xs text-neutral-500">Instructor & Course Admin</p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                  Role: TEACHER
                </span>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Email:</span>
                  <span className="text-neutral-950 font-bold select-all">teacher@test.com</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Password:</span>
                  <span className="text-neutral-950 font-bold select-all">password123</span>
                </div>
              </div>

              <div className="text-xs text-neutral-600 space-y-1">
                <div className="font-semibold text-neutral-900">Access Capabilities:</div>
                <ul className="list-disc list-inside space-y-0.5 text-neutral-500">
                  <li>Create and edit course shells & topics</li>
                  <li>Upload & link all 6 material types</li>
                  <li>Review student assignment submissions & grade</li>
                  <li>Inspect class progress analytics</li>
                </ul>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => handleQuickLogin('teacher@test.com', 'password123')}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-neutral-950 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Quick Login as Teacher</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => copyCredentials('teacher', 'teacher@test.com', 'password123')}
                  className="py-2.5 px-3 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors text-xs font-medium text-neutral-700 flex items-center gap-1"
                  title="Copy Credentials"
                >
                  {copiedRole === 'teacher' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Student Account Card */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:border-neutral-950 transition-all space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-neutral-100 text-neutral-950 border border-neutral-200 flex items-center justify-center font-bold text-sm">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-neutral-950">Student Account</h3>
                    <p className="text-xs text-neutral-500">Learner & Participant</p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                  Role: STUDENT
                </span>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Email:</span>
                  <span className="text-neutral-950 font-bold select-all">student@test.com</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Password:</span>
                  <span className="text-neutral-950 font-bold select-all">password123</span>
                </div>
              </div>

              <div className="text-xs text-neutral-600 space-y-1">
                <div className="font-semibold text-neutral-900">Access Capabilities:</div>
                <ul className="list-disc list-inside space-y-0.5 text-neutral-500">
                  <li>Browse & self-enroll in available courses</li>
                  <li>Inspect PDF slides and stream lecture videos</li>
                  <li>Participate in timed assessment quizzes</li>
                  <li>Submit assignments and view grade scorecards</li>
                </ul>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => handleQuickLogin('student@test.com', 'password123')}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-neutral-950 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Quick Login as Student</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => copyCredentials('student', 'student@test.com', 'password123')}
                  className="py-2.5 px-3 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors text-xs font-medium text-neutral-700 flex items-center gap-1"
                  title="Copy Credentials"
                >
                  {copiedRole === 'student' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Technical Stack Summary */}
      <section className="py-16 border-b border-neutral-200 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <div className="text-xs font-mono uppercase text-neutral-500">Enterprise Stack</div>
              <h3 className="text-2xl font-bold text-neutral-950 mt-1">Engineered for Performance & Scalability</h3>
              <p className="text-sm text-neutral-600 mt-2">
                Unified under the PERN stack with type-safe database queries and a modular component design system.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 max-w-xl">
              {[
                'PostgreSQL',
                'Express.js',
                'React 19',
                'Node.js',
                'Prisma ORM',
                'Tailwind CSS v4',
                'Zustand Store',
                'JWT HttpOnly',
                'AWS Cloud',
                'Docker',
                'Radix UI',
                'Recharts',
                'Lucide Icons'
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-semibold text-neutral-800 shadow-2xs hover:border-neutral-900 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="py-12 bg-white text-neutral-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-neutral-950 text-white flex items-center justify-center font-bold text-sm">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-neutral-950">SAC E-Learning Platform</span>
                <p className="text-neutral-500 text-xs">SWST 32043 • Software Architecture and Concepts</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-neutral-600 font-medium">
              <a href="#overview" className="hover:text-neutral-950">Overview</a>
              <a href="#architecture" className="hover:text-neutral-950">Architecture</a>
              <a href="#cloud-diagram" className="hover:text-neutral-950">AWS Blueprint</a>
              <a href="#modules" className="hover:text-neutral-950">Team & Domains</a>
              <a 
                href="https://learn-sac.akaigen.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-neutral-950 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Live App</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <Link to="/login" className="hover:text-neutral-950">Sign In</Link>
              <Link to="/register" className="hover:text-neutral-950">Register</Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500">
            <p>
              Department of Software Engineering • Faculty of Computing & Technology • University of Kelaniya
            </p>
            <p className="font-mono">
              PERN Monolith Architecture • 5-Member Team Project
            </p>
          </div>
        </div>
      </footer>

      {/* 10. Diagram Fullscreen Modal / Lightbox */}
      {isDiagramModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-200"
          onClick={() => setIsDiagramModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-neutral-200 bg-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-950 text-white">
                  AWS & CI/CD BLUEPRINT
                </span>
                <span className="text-xs font-semibold text-neutral-800 hidden sm:inline">
                  System Architecture & Production Cloud Infrastructure
                </span>
              </div>
              <button
                onClick={() => setIsDiagramModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-600 hover:text-neutral-950 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-auto bg-neutral-50 flex items-center justify-center min-h-[400px]">
              <img
                src="/architecture-diagram.png"
                alt="System Architecture Diagram"
                className="max-w-full max-h-[75vh] object-contain rounded-lg border border-neutral-200 bg-white p-2"
              />
            </div>

            <div className="px-5 py-3 border-t border-neutral-200 bg-white text-xs text-neutral-500 flex items-center justify-between">
              <span>GitHub Actions CI/CD • AWS S3 • EC2 • CloudFront CDN • Cloudflare • ALB • PostgreSQL</span>
              <button
                onClick={() => setIsDiagramModalOpen(false)}
                className="px-3 py-1 bg-neutral-950 text-white rounded text-xs font-medium hover:bg-neutral-800"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GitHubIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}
