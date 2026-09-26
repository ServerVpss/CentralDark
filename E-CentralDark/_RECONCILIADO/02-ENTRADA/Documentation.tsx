import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';

interface DocumentationProps {

}

const Documentation: FC = () => {
  const navigate = useNavigate();
  const onBack = () => navigate('/');
  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const FEATURES_LIST = [
    { title: 'One-to-One / Many Chat', desc: 'Seamless private and broadcast messages.' },
    { title: 'Audio & Video Calls', desc: 'Crystal clear calls with screen sharing.' },
    { title: 'Group Chat', desc: 'Create communities with admin controls.' },
    { title: 'Status Updates', desc: 'Share ephemeral moments.' },
    { title: 'Profile Management', desc: 'Customizable user profiles.' },
    { title: 'Advanced Settings', desc: 'Privacy and notification controls.' },
    { title: 'File Upload', desc: 'Share images and documents.' },
    { title: 'Channels', desc: 'Broadcast to unlimited subscribers.' }
  ];

  return (
    <div className="docs-page">
      <aside className="docs-sidebar">
        <div className="docs-logo">
          <span className="material-symbols-outlined">chat_bubble</span>
          <h2>NexChat</h2>
        </div>

        <nav>
          <h3 className="text-[10px] uppercase tracking-widest text-primary font-bold mb-4 ml-4">Getting Started</h3>
          <ul>
            {['Introduction', 'System Requirements', 'Quick Start'].map(item => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  onClick={(e) => scrollToSection(e, item.toLowerCase().replace(/ /g, '-'))}
                  className="flex items-center gap-2"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>

          <h3 className="text-[10px] uppercase tracking-widest text-primary font-bold mb-4 mt-8 ml-4">Development</h3>
          <ul>
            {['Environment Config', 'Features', 'Screenshots'].map(item => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  onClick={(e) => scrollToSection(e, item.toLowerCase().replace(/ /g, '-'))}
                  className="flex items-center gap-2"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto">
          <button onClick={onBack} className="btn btn-ghost w-full justify-start gap-3">
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Back to App</span>
          </button>
        </div>
      </aside>

      <main className="docs-content">
        <div className="breadcrumb">
          <span>Docs</span>
          <span>/</span>
          <span className="text-white">Getting Started</span>
        </div>

        <section id="introduction">
          <h1>Introduction</h1>
          <p>
            NexChat is a modern, high-performance chat template built for developers who want to launch a full-featured communication platform quickly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-dark-surface-light border border-white/5">
              <span className="material-symbols-outlined text-primary mb-3">bolt</span>
              <h4 className="font-bold">Ultra Fast</h4>
              <p className="text-sm opacity-60">Optimized bundle size and lightning quick response times.</p>
            </div>
            <div className="p-6 rounded-2xl bg-dark-surface-light border border-white/5">
              <span className="material-symbols-outlined text-primary mb-3">security</span>
              <h4 className="font-bold">Secure</h4>
              <p className="text-sm opacity-60">End-to-end encryption for all your conversations.</p>
            </div>
          </div>
        </section>

        <section id="system-requirements">
          <h2>System Requirements</h2>
          <div className="space-y-4">
            <div className="flex justify-between p-4 bg-dark-surface-light rounded-xl border border-white/5">
              <span className="font-bold">Node.js</span>
              <span className="text-primary font-mono">v18+</span>
            </div>
            <div className="flex justify-between p-4 bg-dark-surface-light rounded-xl border border-white/5">
              <span className="font-bold">Package Manager</span>
              <span className="text-primary font-mono">NPM / Yarn</span>
            </div>
          </div>
        </section>

        <section id="quick-start">
          <h2>Quick Start</h2>
          <h3>1. Install Dependencies</h3>
          <pre><code>npm install</code></pre>

          <h3>2. Run Development Server</h3>
          <pre><code>npm run dev</code></pre>

          <h3>3. Build for Production</h3>
          <pre><code>npm run build</code></pre>
        </section>

        <section id="environment-config">
          <h2>Environment Configuration</h2>
          <p>Create a .env file in the root directory:</p>
          <pre><code>VITE_APP_NAME=NexChat
            VITE_API_BASE_URL=https://api.nexchat.com</code></pre>
        </section>

        <footer className="py-20 border-t border-white/5 text-center">
          <p className="text-sm text-dark-text-muted">© 2026 NexChat Messenger. Documentation licensed under MIT.</p>
        </footer>
      </main>
    </div>
  );
};

export default Documentation;
