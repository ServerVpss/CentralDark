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
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 px-6 max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-dark-text-muted">Everything you need to build the next big messaging platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: 'chat', title: 'Real-time Chat', desc: 'Secure one-to-one and group conversations with zero latency.' },
              { icon: 'videocam', title: 'Video Calls', desc: 'High-definition video and audio calling powered by modern tech.' },
              { icon: 'campaign', title: 'Channels', desc: 'Broadcast to unlimited subscribers with advanced admin tools.' },
              { icon: 'mood', title: 'Rich Media', desc: 'Enhanced file sharing, emojis, and message reactions.' },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div className="icon-box"><span className="material-symbols-outlined">{f.icon}</span></div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Extended */} 
        <section className="py-24 px-6 bg-[#0a0f0c]">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: 'lock', title: 'End-to-End Encryption', desc: 'Privacy is our priority. Every message is fully encrypted.' },
                { icon: 'cloud_done', title: 'Cloud Sync', desc: 'Access your chats from any device with seamless synchronization.' },
                { icon: 'speed', title: 'Lightning Fast', desc: 'Optimized performance for a smooth messaging experience.' },
                { icon: 'palette', title: 'Custom Template', desc: 'Multiple color schemes and dark/light modes support.' },
              ].map(feature => (
                <div key={feature.title} className="feature-card">
                  <div className="icon-box"><span className="material-symbols-outlined">{feature.icon}</span></div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section id="tech" className="py-24 px-6 border-t border-white/5">
          <div className="max-w-[1400px] mx-auto text-center">
            <h2 className="text-4xl font-bold mb-16">The Tech Stack</h2>
            <div className="flex flex-wrap justify-center gap-12 opacity-60">
              {['React', 'TypeScript', 'Sass', 'Vite', 'Lucide React', 'Framer Motion'].map(tech => (
                <span key={tech} className="text-2xl font-black">{tech}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Support/Footer */}
        <footer id="support" className="landing-footer">
          <div className="px-10 max-w-[1400px] mx-auto">
            <div className="footer-grid">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>chat_bubble</span>
                  <span className="text-xl font-bold">NexChat</span>
                </div>
                <p className="text-dark-text-muted">The ultimate communication template for modern web applications. Premium quality, production-ready.</p>
              </div>
              <div>
                <h4 className="font-bold mb-6">Product</h4>
                <ul className="space-y-4 text-dark-text-muted text-sm">
                  <li><a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-primary transition-colors">Features</a></li>
                  <li><button onClick={onOpenDocs} className="hover:text-primary transition-colors">Documentation</button></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-6">Company</h4>
                <ul className="space-y-4 text-dark-text-muted text-sm">
                  <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-6">Social</h4>
                <div className="flex gap-4">
                  <div className="size-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all pointer-events-auto cursor-pointer"><span className="material-symbols-outlined">public</span></div>
                  <div className="size-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all pointer-events-auto cursor-pointer"><span className="material-symbols-outlined">alternate_email</span></div>
                </div>
              </div>
            </div>
            <div className="mt-24 pt-8 border-t border-white/5 flex flex-wrap justify-between items-center gap-4 text-sm text-dark-text-muted">
              <p>© 2026 NexChat Messenger. All rights reserved.</p>
              <div className="flex gap-8">
                <a href="#" className="hover:text-white">Privacy Policy</a>
                <a href="#" className="hover:text-white">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
