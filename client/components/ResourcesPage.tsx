import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Video,
  FileText,
  Users,
  Search,
  ChevronRight,
  Zap,
  Sparkles,
  Calendar,
  Clock,
  User,
  ThumbsUp,
  ThumbsDown,
  Share2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { blogs } from '../data/blogs';

interface ResourcesPageProps {
  onBack: () => void;
  onGetStarted: () => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ onBack, onGetStarted }) => {
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);

  const selectedBlog = selectedBlogId ? blogs.find(b => b.id === selectedBlogId) : null;

  const handleFeedback = (isHelpful: boolean) => {
    setFeedbackGiven(true);
    // In a real app, send this to an analytics backend
    console.log(`Feedback recorded: ${isHelpful ? 'Helpful' : 'Not Helpful'}`);
  };

  if (selectedBlog) {
    const schemaMarkup = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://signalz.com/resources/${selectedBlog.id}`
      },
      "headline": selectedBlog.title,
      "image": [
        selectedBlog.image
      ],
      "datePublished": new Date(selectedBlog.date).toISOString(),
      "author": {
        "@type": "Person",
        "name": selectedBlog.author
      },
      "publisher": {
        "@type": "Organization",
        "name": "Signalz",
        "logo": {
          "@type": "ImageObject",
          "url": "https://signalz.com/logo.png"
        }
      },
      "description": selectedBlog.content.substring(0, 150) + "..."
    };

    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
        <Helmet>
          <title>{selectedBlog.title} | Signalz Resources</title>
          <meta name="description" content={selectedBlog.content.substring(0, 150) + "..."} />
          <meta name="keywords" content={`${selectedBlog.category}, B2B sales, intent data, sales intelligence, AI outreach`} />
          <script type="application/ld+json">
            {JSON.stringify(schemaMarkup)}
          </script>
        </Helmet>
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <button 
              onClick={() => {
                setSelectedBlogId(null);
                setFeedbackGiven(false);
              }}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors font-bold"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Resources
            </button>
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button 
                onClick={onGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2 rounded-full transition-all shadow-lg shadow-blue-500/20"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </header>

        <main className="pt-32 pb-24">
          <article className="max-w-3xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full">
                  {selectedBlog.category}
                </span>
                <span className="text-slate-500 text-sm flex items-center gap-1"><Calendar className="w-4 h-4"/> {selectedBlog.date}</span>
                <span className="text-slate-500 text-sm flex items-center gap-1"><Clock className="w-4 h-4"/> {selectedBlog.readTime}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 dark:text-white mb-8 leading-tight tracking-tight">
                {selectedBlog.title}
              </h1>
              
              <div className="flex items-center gap-4 mb-12 pb-8 border-b border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedBlog.author}`} alt={selectedBlog.author} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedBlog.author}</p>
                  <p className="text-sm text-slate-500">Sales Strategy Expert at Signalz</p>
                </div>
              </div>

              <div className="w-full h-[400px] rounded-3xl overflow-hidden mb-12 shadow-xl">
                <img src={selectedBlog.image} alt={selectedBlog.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>

              <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-700">
                <ReactMarkdown>{selectedBlog.content}</ReactMarkdown>
              </div>

              {/* Helpful Widget */}
              <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-100 dark:border-slate-800">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Was this article helpful to you?</h3>
                  {feedbackGiven ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Thank you for your feedback! It helps us improve our content.
                    </motion.div>
                  ) : (
                    <div className="flex items-center justify-center gap-4">
                      <button 
                        onClick={() => handleFeedback(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:border-blue-500 hover:text-blue-600 transition-all font-medium shadow-sm"
                      >
                        <ThumbsUp className="w-5 h-5" /> Yes, very helpful
                      </button>
                      <button 
                        onClick={() => handleFeedback(false)}
                        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:border-red-500 hover:text-red-600 transition-all font-medium shadow-sm"
                      >
                        <ThumbsDown className="w-5 h-5" /> Not really
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </article>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <Helmet>
        <title>Resources & Insights | Signalz</title>
        <meta name="description" content="Explore our library of sales intelligence resources, including guides, case studies, and blog posts on AI outreach and intent data." />
        <meta name="keywords" content="sales resources, B2B sales blog, intent data guides, AI outreach strategies" />
      </Helmet>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={onGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2 rounded-full transition-all shadow-lg shadow-blue-500/20"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-display font-black tracking-tight mb-6 text-slate-900 dark:text-white"
            >
              Signalz <br /><span className="text-blue-600">Resources & Insights</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto"
            >
              Everything you need to master AI-driven sales intelligence, optimize your outbound strategy, and close more enterprise deals.
            </motion.p>
          </div>

          {/* Resource Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
            {[
              {
                icon: BookOpen,
                title: "Documentation",
                desc: "Comprehensive guides on how to set up and use Signalz to its full potential.",
                link: "Explore Docs"
              },
              {
                icon: Video,
                title: "Video Tutorials",
                desc: "Watch step-by-step videos on how to integrate Signalz with your CRM and other tools.",
                link: "Watch Now"
              },
              {
                icon: FileText,
                title: "Case Studies",
                desc: "Read how other high-growth companies are using Signalz to transform their sales pipeline.",
                link: "Read Stories"
              },
              {
                icon: Users,
                title: "Community",
                desc: "Join our community of sales professionals and share best practices and insights.",
                link: "Join Community"
              },
              {
                icon: Zap,
                title: "API Reference",
                desc: "Detailed documentation for developers on how to integrate Signalz with your own applications.",
                link: "View API"
              },
              {
                icon: Sparkles,
                title: "Webinars",
                desc: "Register for upcoming live sessions with industry experts on modern sales tactics.",
                link: "Register Now"
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  {item.desc}
                </p>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm group-hover:underline">
                  {item.link}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Featured Resource */}
          <div className="mb-32">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-16 overflow-hidden relative shadow-2xl">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 text-sm font-bold mb-8 border border-blue-500/30">
                    <Sparkles className="w-4 h-4" />
                    Featured Guide
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-6 leading-tight">
                    The 2026 State of AI in B2B Sales
                  </h2>
                  <p className="text-xl text-slate-300 mb-10 leading-relaxed">
                    We surveyed 1,000+ revenue leaders to understand how artificial intelligence is reshaping outbound strategies, intent data usage, and team structures.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group">
                      Download Full Report
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-lg transition-all border border-white/20 backdrop-blur-sm">
                      Read Executive Summary
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl relative group">
                    <img 
                      src="https://picsum.photos/seed/report2026/800/600" 
                      alt="State of AI in B2B Sales Report Cover" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-white/80 text-sm font-medium">
                        <FileText className="w-5 h-5" />
                        45-Page PDF
                      </div>
                      <div className="flex items-center gap-3 text-white/80 text-sm font-medium">
                        <Clock className="w-5 h-5" />
                        Updated March 2026
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Blog Section */}
          <div className="mb-32">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">Latest Insights & Strategies</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">Deep dives into sales intelligence, AI outreach, and revenue growth.</p>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button className="px-4 py-2 bg-white dark:bg-slate-700 rounded-md shadow-sm text-sm font-bold text-slate-900 dark:text-white">All</button>
                <button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors">Strategy</button>
                <button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors">Technology</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, i) => (
                <motion.article 
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.1 }}
                  onClick={() => setSelectedBlogId(blog.id)}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={blog.image} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full">
                      {blog.category}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {blog.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {blog.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                      {blog.content.substring(0, 150).replace(/#/g, '')}...
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-200 rounded-full overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${blog.author}`} alt={blog.author} />
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{blog.author}</span>
                      </div>
                      <span className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Read <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <button className="px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-full font-bold hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">
                Load More Articles
              </button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-32 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">Quick answers to common questions about Signalz and our resources.</p>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: "How often are new resources added?",
                  a: "We publish new blog posts, guides, and case studies weekly. Our major industry reports, like the State of AI in B2B Sales, are updated annually."
                },
                {
                  q: "Can I contribute to the Signalz blog?",
                  a: "Yes! We welcome guest posts from industry experts, sales leaders, and revenue operations professionals. Please contact our content team to pitch your idea."
                },
                {
                  q: "Are the webinars recorded?",
                  a: "Absolutely. All our live webinars are recorded and made available in our Video Tutorials section within 24 hours of the live event."
                },
                {
                  q: "How do I access the API documentation?",
                  a: "Our API documentation is publicly available. You can access it by clicking the 'API Reference' card above. You will need an active API key to make requests."
                }
              ].map((faq, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{faq.q}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-50 pointer-events-none" />
            <h2 className="text-4xl md:text-6xl font-display font-black mb-8 relative z-10 tracking-tight">Experience the future of sales today</h2>
            <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto relative z-10">Stop reading about it and start closing more deals with AI-driven intelligence.</p>
            <button 
              onClick={onGetStarted}
              className="bg-white text-blue-600 hover:bg-slate-50 text-lg font-black px-10 py-5 rounded-full transition-all hover:scale-105 active:scale-95 relative z-10 shadow-xl"
            >
              Start Your Free Trial
            </button>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500 text-sm font-medium">© 2026 Signalz. All rights reserved.</p>
      </footer>
    </div>
  );
};
