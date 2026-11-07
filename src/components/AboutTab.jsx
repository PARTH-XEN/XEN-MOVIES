import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { spatialAudio } from '../utils/spatialAudio';
import { triggerHaptic } from '../utils/haptics';
import {
  Film,
  Sparkles,
  Tv,
  ShieldCheck,
  Zap,
  Smartphone,
  Globe,
  Heart,
  Code2,
  Cpu,
  ExternalLink,
  Volume2,
  ChevronDown,
  ChevronUp,
  Lock,
  FileText,
  HelpCircle,
  Users,
  Rocket,
  Eye,
  Server,
  CheckCircle,
  Mail,
  MessageCircle
} from 'lucide-react';

// FAQ Accordion Component
function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/60 hover:border-neutral-700 transition-colors">
      <button
        onClick={() => {
          spatialAudio.playClick();
          triggerHaptic('light');
          onClick();
        }}
        className="w-full px-5 py-4 flex items-center justify-between text-left group cursor-pointer"
      >
        <span className="text-sm font-semibold text-neutral-100 group-hover:text-white transition-colors pr-4">
          {question}
        </span>
        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      <div className={`px-5 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-xs text-neutral-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

// Section Header Component
function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[var(--color-accent)]">
        <Icon className="w-4 h-4" />
      </div>
      <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{title}</h2>
    </div>
  );
}

export default function AboutTab() {
  const { setActiveTab } = useApp();
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqData = [
    {
      question: "Is XENMOVIES completely free to use?",
      answer: "Yes! XENMOVIES is 100% free with zero subscription fees, no hidden charges, and absolutely no intrusive ads. We believe entertainment should be accessible to everyone without paywalls or predatory advertising."
    },
    {
      question: "How does XENMOVIES work without hosting content?",
      answer: "XENMOVIES is an aggregator platform. We index metadata from public APIs like Stremio Cinemeta and TVMaze, and provide links to third-party streaming sources. We don't host, store, or distribute any video files ourselves."
    },
    {
      question: "What is Cloudstream 3 and how do I use it?",
      answer: "Cloudstream 3 is a free Android app for streaming movies and shows. You can add XENMOVIES as a provider repository to access our content library directly in the app with hardware-accelerated playback and Chromecast support."
    },
    {
      question: "Is my data and viewing history private?",
      answer: "Absolutely. Your watchlist and history are stored locally or in your private encrypted account. We don't sell user data, run tracking scripts, or inject analytics. Your viewing habits are yours alone."
    },
    {
      question: "Can I download movies for offline viewing?",
      answer: "Yes! Authenticated users can access direct download links and batch ZIP downloads for entire TV seasons. Downloads are provided by third-party mirrors and are available in multiple quality options including 4K HDR."
    },
    {
      question: "Does XENMOVIES work on Smart TVs?",
      answer: "Yes! Our interface is optimized for 10-foot TV viewing with D-pad navigation support for Samsung Tizen, LG WebOS, Android TV, and Amazon Fire TV. Use your remote's directional pad to navigate."
    },
    {
      question: "What are the 8 Spatial Sound Profiles?",
      answer: "We've engineered 8 unique UI feedback sounds using Web Audio API synthesis. Each interaction (hover, click, modal, drawer) produces spatial audio cues that enhance the futuristic experience without loading external audio files."
    },
    {
      question: "How do I report issues or request features?",
      answer: "You can reach us through our GitHub repository (github.com/PARTH-XEN), email us at parthxen09@gmail.com, or connect via Instagram. We actively develop and improve the platform based on community feedback."
    }
  ];

  const privacyPoints = [
    { icon: Lock, title: "No Data Selling", desc: "We never sell, trade, or monetize your personal information" },
    { icon: Eye, title: "Zero Tracking", desc: "No analytics scripts, fingerprinting, or behavioral tracking" },
    { icon: Server, title: "Local-First Storage", desc: "Your watchlist and history stay on your device by default" },
    { icon: ShieldCheck, title: "Encrypted Sync", desc: "Optional account sync uses secure JWT authentication" }
  ];

  const termsPoints = [
    "XENMOVIES provides an indexing service and does not host copyrighted content",
    "Users are responsible for complying with their local copyright laws",
    "We reserve the right to modify, suspend, or discontinue services at any time",
    "Third-party content sources are not affiliated with XENMOVIES",
    "By using our service, you agree to use it for lawful purposes only",
    "We are not liable for content accuracy, availability, or legality of third-party sources",
    "Accounts may be terminated for abuse, spam, or violations of our terms"
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10 select-none pb-20 animate-in fade-in duration-300">

      {/* Hero Showcase */}
      <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-neutral-800 text-[var(--color-accent)] border border-neutral-700">
            <Sparkles className="w-3 h-3 text-[var(--color-accent)]" />
            <span>Open Cinema Platform</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            Cinematic Vision. Zero Compromise.
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            <strong className="text-white">XENMOVIES</strong> is an ad-free open cinema index designed for seamless discovery across Desktop, Mobile, and Smart TVs. Fast streaming mirrors, instant batch downloads, and responsive spatial navigation.
          </p>

          <div className="flex items-center gap-2.5 pt-2 flex-wrap">
            <button
              onClick={() => {
                spatialAudio.playClick();
                triggerHaptic('medium');
                setActiveTab('cloudstream');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Get Cloudstream 3 Repo</span>
            </button>

            <button
              onClick={() => {
                spatialAudio.playClick();
                triggerHaptic('light');
                setActiveTab('home');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200 font-medium text-xs transition-colors cursor-pointer"
            >
              <Film className="w-4 h-4 text-neutral-400" />
              <span>Explore Discover Feed</span>
            </button>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="space-y-5">
        <SectionHeader icon={Users} title="About XENMOVIES" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2.5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Rocket className="w-4 h-4 text-[var(--color-accent)]" />
              Our Mission
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              XENMOVIES was built with a simple goal: movie streaming without deceptive popups, malware redirects, or bloated paywalls. Clean, accessible cinema with high quality streams.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2.5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[var(--color-accent)]" />
              Open Architecture
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Powered by React, Vite, and SQLite/PostgreSQL. Metadata is indexed from public open standards with zero invasive tracking or script fingerprinting.
            </p>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[var(--color-accent)]">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Zero Invasive Ads</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              No predatory popups, countdowns, or deceptive links.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[var(--color-accent)]">
              <Tv className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Smart TV & Remote Ready</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              10-foot D-pad layout for Tizen, WebOS, Fire TV, and Android TV.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[var(--color-accent)]">
              <Volume2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">8 Spatial Sound Profiles</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Web Audio synthesis for pleasant interaction feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Policy Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-5">
        <SectionHeader icon={ShieldCheck} title="Privacy Policy" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {privacyPoints.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center flex-shrink-0 text-emerald-400">
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{item.title}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terms of Service Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-5">
        <SectionHeader icon={FileText} title="Terms of Service" />

        <div className="space-y-2">
          {termsPoints.map((term, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 mt-1.5 flex-shrink-0" />
              <span>{term}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="space-y-4">
        <SectionHeader icon={HelpCircle} title="Frequently Asked Questions" />

        <div className="space-y-2">
          {faqData.map((faq, idx) => (
            <FAQItem
              key={idx}
              question={faq.question}
              answer={faq.answer}
              isOpen={openFAQ === idx}
              onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
            />
          ))}
        </div>
      </div>

      {/* Contact & Community Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-4">
        <SectionHeader icon={MessageCircle} title="Contact & Community" />

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://github.com/PARTH-XEN"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-xs font-semibold text-white transition-colors"
          >
            <Code2 className="w-4 h-4 text-neutral-300" />
            <span>GitHub @PARTH-XEN</span>
            <ExternalLink className="w-3 h-3 text-neutral-400 ml-1" />
          </a>

          <a
            href="mailto:parthxen09@gmail.com"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-xs font-semibold text-white transition-colors"
          >
            <Mail className="w-4 h-4 text-neutral-300" />
            <span>parthxen09@gmail.com</span>
          </a>
        </div>
      </div>

    </div>
  );
}
