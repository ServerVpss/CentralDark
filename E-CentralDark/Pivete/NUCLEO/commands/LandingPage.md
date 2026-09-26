# COMANDO - LandingPage.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-local\apps\crm\design-references\nexchat-original\code\src\components\LandingPage.tsx
**SHA:** c84c2525c61ed374
**Timestamp:** 2026-08-26T19:33:40.000613
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const navigate = useNavigate();

### Ouro Bruto (primeiros 5000 chars)
```
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const onEnterApp = () => navigate('/auth');
  const onOpenDocs = () => navigate('/docs');

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-background-dark scroll-smooth overflow-x-hidden">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-[#233026] bg-[#0a0f0c]/80 backdrop-blur-md">
        <div className="px-6 md:px-12 py-4 flex items-center justify-between mx-auto max-w-[1400px]">
          <div className="flex items-center gap-3 text-white">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '36px' }}>chat_bubble</span>
            <h2 className="text-2xl font-black tracking-tighter">NexChat</h2>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            <nav className="flex items-center gap-8 text-sm font-bold text-dark-text-muted">
              <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-primary transition-colors">Features</a>
              <a href="#tech" onClick={(e) => scrollToSection(e, 'tech')} className="hover:text-primary transition-colors">Technology</a>
              <button onClick={onOpenDocs} className="hover:text-primary transition-colors">Documentation</button>
            </nav>
            <button
              onClick={onEnterApp}
              className="bg-primary text-background-dark h-11 px-8 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20"
            >
              Get Started
            </button>
          </div>

          <button className="lg:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-[#111813] border-b border-[#233026] p-6 flex flex-col gap-4">
            <a href="#features" onClick={(e) => { setIsMenuOpen(false); scrollToSection(e, 'features'); }} className="text-lg font-bold">Features</a>
            <a href="#tech" onClick={(e) => { setIsMenuOpen(false); scrollToSection(e, 'tech'); }} className="text-lg font-bold">Technology</a>
            <button onClick={onOpenDocs} className="text-left text-lg font-bold">Documentation</button>
            <button onClick={onEnterApp} className="bg-primary text-background-dark h-12 rounded-xl font-bold">Get Started</button>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="hero-section">
          <div className="max-w-[1400px] mx-auto px-6">
            <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700">Connect Instantly. <br className="hidden md:block" />Experience Premium.</h1>
            <p className="animate-in fade-in slide-in-from-bottom-8 duration-1000">A production-ready communication suite built for the modern web. Real-time messaging, HD calls, and broadcast channels in a pixel-perfect design.</p>
            <div className="flex flex-wrap justify-center gap-4 mt-12">
              <button onClick={onEnterApp} className="bg-primary text-background-dark h-14 px-10 rounded-2xl font-bold text-lg hover:shadow-glow transition-all">Live Preview</button>
              <button onClick={onOpenDocs} className="bg-white/5 text-white h-14 px-10 rounded-2xl font-bold text-lg border border-white/10 hover:bg-white/10 transition-all">Documentation</button>
            </div>
          </div>
        </section>

        {/* Demo */}
        <section className="px-6 mb-24">
          <div className="demo-container">
            <div className="browser-header">
              <div className="dot red"></div>
              <div className="dot yellow"></div>
              <div className="dot green"></div>
            </div> 
            <div className="aspect-video bg-[#0a0f0c] flex items-center justify-center p-12">
              <div className="text-center group cursor-pointer" onClick={onEnterApp}>
                <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined fill" style={{ fontSize: '48px' }}>play_arrow</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Launch Demo Application</h3>
                <p className="text-dark-text-muted">Explore all features in a simulated environment</p>
              </div>
       
```