
import React from 'react';

interface HelpSettingsProps {
  onClose: () => void;
}

const HelpSettings: React.FC<HelpSettingsProps> = ({ onClose }) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-0 bg-background-dark">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0"></div>
      <div className="z-10 p-6 md:p-10 lg:px-16">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm font-medium">
            <a className="text-text-secondary hover:text-white transition-colors" href="#">Settings</a>
            <span className="text-text-secondary/40">/</span>
            <span className="text-white">Help Center</span>
          </div>

          {/* Page Heading */}
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">How can we help?</h1>
            <p className="text-lg text-text-secondary max-w-xl">Search for answers, browse FAQs, or contact our support team directly.</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-text-secondary">search</span>
            </div>
            <input className="block w-full pl-12 pr-4 py-4 bg-surface-dark border border-white/5 rounded-xl text-white placeholder-text-secondary focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-[#15231b] transition-all outline-none" placeholder="Ask a question..." type="text"/>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {[
              { icon: 'support_agent', title: 'Contact Support', desc: 'Chat with our team for help.' },
              { icon: 'bug_report', title: 'Report a Bug', desc: 'Found something broken?' },
              { icon: 'security', title: 'Privacy & Security', desc: 'Protecting your data.' },
            ].map((card) => (
              <button key={card.title} className="flex flex-col items-start gap-4 p-6 rounded-2xl bg-surface-dark border border-white/5 hover:border-primary/30 hover:bg-surface-hover transition-all group text-left">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-background-dark transition-colors text-primary">
                  <span className="material-symbols-outlined">{card.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{card.title}</h3>
                  <p className="text-sm text-text-secondary">{card.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="flex flex-col gap-6 mt-4">
            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
            <div className="flex flex-col rounded-2xl border border-white/5 divide-y divide-white/5 bg-surface-dark overflow-hidden">
              {[
                { q: 'How do I backup my chats?', a: 'Go to Settings > Chats > Chat Backup.' },
                { q: 'Can I change my phone number?', a: 'Yes, navigate to Settings > Account > Change Number.' },
                { q: 'How do block a contact?', a: 'Open the contact chat, tap name, and select Block Contact.' },
                { q: 'Where can I find privacy settings?', a: 'Located under Settings > Privacy.' },
              ].map((faq, i) => (
                <details key={i} className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-surface-hover transition-colors list-none">
                    <span className="text-base font-medium text-white">{faq.q}</span>
                    <span className="material-symbols-outlined text-text-secondary group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <div className="px-6 pb-6 text-text-secondary text-sm leading-relaxed">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSettings;
