import React from 'react';
import { useApp } from '../context/AppContext';
import { spatialAudio } from '../utils/spatialAudio';
import { triggerHaptic } from '../utils/haptics';
import {
  Film,
  Code2,
  Camera,
  Mail,
  Heart,
  ShieldCheck
} from 'lucide-react';

export default function Footer() {
  const { setActiveTab } = useApp();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Quick Links',
      links: [
        { label: 'Home', onClick: () => setActiveTab('home') },
        { label: 'Movies', onClick: () => setActiveTab('movies') },
        { label: 'TV Series', onClick: () => setActiveTab('series') },
        { label: 'Bollywood', onClick: () => setActiveTab('bollywood') }
      ]
    },
    {
      title: 'Features',
      links: [
        { label: 'Cloudstream 3', onClick: () => setActiveTab('cloudstream') },
        { label: 'My Watchlist', onClick: () => setActiveTab('watchlist') },
        { label: 'Downloads', onClick: () => setActiveTab('downloads') },
        { label: 'Settings', onClick: () => setActiveTab('settings') }
      ]
    },
    {
      title: 'Information',
      links: [
        { label: 'About Us', onClick: () => setActiveTab('about') },
        { label: 'Privacy Policy', onClick: () => setActiveTab('about') },
        { label: 'Terms of Service', onClick: () => setActiveTab('about') },
        { label: 'FAQ', onClick: () => setActiveTab('about') }
      ]
    }
  ];

  const socialLinks = [
    { icon: Code2, label: 'GitHub', href: 'https://github.com/PARTH-XEN' },
    { icon: Camera, label: 'Instagram', href: 'https://www.instagram.com/parth__11p__?dlrf=dGM0anZhaTl6d3Fx' },
    { icon: Mail, label: 'Email', href: 'mailto:parthxen09@gmail.com' }
  ];

  return (
    <footer className="relative z-10 mt-20 border-t border-white/10 bg-[#050609]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 group cursor-pointer select-none"
                 onClick={() => {
                   spatialAudio.playClick();
                   triggerHaptic('light');
                   setActiveTab('home');
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                 }}
                 onMouseEnter={() => spatialAudio.playHover(-0.3)}>
              <div className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-800 p-2 shadow-lg flex items-center justify-center group-hover:border-[var(--color-accent)] transition-all duration-300">
                <Film className="w-6 h-6 text-[var(--color-accent)] group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex items-center font-bold text-2xl tracking-tight leading-tight">
                  <span className="text-white">XEN</span>
                  <span className="text-[var(--color-accent)] ml-1 font-semibold transition-colors duration-300">
                    MOVIES
                  </span>
                </div>
                <div className="text-[10px] tracking-widest text-neutral-400 uppercase font-medium">
                  Spatial Cinema Platform
                </div>
              </div>
            </div>

            <p className="text-sm text-neutral-400 leading-relaxed max-w-md">
              Experience the future of free streaming with zero ads, spatial audio, and TV-optimized navigation. Watch movies and shows in 4K HDR with direct downloads.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    spatialAudio.playClick();
                    triggerHaptic('light');
                  }}
                  onMouseEnter={() => spatialAudio.playHover(0.2)}
                  className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-[var(--color-accent)] text-neutral-400 hover:text-[var(--color-accent)] transition-all cursor-pointer group"
                  title={social.label}
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Link Columns */}
          {footerLinks.map((column) => (
            <div key={column.title} className="space-y-3 min-w-0">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => {
                        spatialAudio.playClick();
                        triggerHaptic('light');
                        link.onClick();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      onMouseEnter={() => spatialAudio.playHover(0.3)}
                      className="text-sm text-neutral-400 hover:text-[var(--color-accent)] transition-colors cursor-pointer text-left truncate block"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclaimer Banner */}
        <div className="mt-12 p-4 rounded-2xl bg-black/40 border border-white/10 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Content Disclaimer
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              XENMOVIES does not host or store any video files. All content is indexed from publicly available third-party sources. We are not responsible for the accuracy, compliance, copyright, legality, or any other aspect of the content. Contact the appropriate media providers for any concerns.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-2 text-sm text-slate-500">
            <span>© {currentYear} XENMOVIES</span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Developed by</span>
              <a
                href="https://github.com/PARTH-XEN"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-cyan-300 transition-all"
              >
                Parth Patni
              </a>
              <span className="text-slate-500">aka</span>
              <span className="font-bold text-purple-400">PARTH-XEN</span>
            </div>
            <span className="flex items-center gap-1 text-xs">
              Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for cinema lovers worldwide
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <button
              onClick={() => {
                spatialAudio.playClick();
                setActiveTab('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => {
                spatialAudio.playClick();
                setActiveTab('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => {
                spatialAudio.playClick();
                setActiveTab('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
