import { HelpCircle, PhoneCall, Mail, FileQuestion, ExternalLink, Bot } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

export default function HelpSupport() {
  const { t, lang } = useLanguage()

  const faqs = [
    {
      q: 'How does AI assist in lodging a grievance?',
      a: 'The portal uses intelligent keyword matching and pattern detection to automatically recommend the appropriate department and priority for your issue, reducing dispatch delays.',
    },
    {
      q: 'What is the standard SLA for complaint resolution?',
      a: 'High priority complaints (e.g. fire hazard, major water burst) have a 48-hour SLA. Medium priority complaints are addressed within 120 hours (5 days), and low priority within 240 hours.',
    },
    {
      q: 'Can I upload photos of the issue?',
      a: 'Yes, you can upload on-site photographs directly from your phone or desktop during the registration step.',
    },
    {
      q: 'How do I track progress on my complaint?',
      a: 'You can check the Track Complaint tab anytime using your ticket ID (e.g. MIDC-1024) or view real-time updates directly on your dashboard.',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-900 tracking-tight">
          {t('nav.helpSupport')}
        </h1>
        <p className="text-xs text-ink-500 mt-1">
          Assistance, frequently asked questions, and official MIDC helpdesk contacts.
        </p>
      </div>

      {/* AI Helpdesk Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-slate-900 rounded-3xl p-6 text-white flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">Need Quick Guidance?</h3>
            <p className="text-xs text-slate-300">
              Our AI Assistant is available to help clarify complaint categories and routing.
            </p>
          </div>
        </div>

        <Link
          to="/citizen/register"
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-ink-950 font-bold text-xs rounded-xl transition shrink-0"
        >
          Try AI Guide
        </Link>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-cream-200/90 shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-ink-500 block font-medium">MIDC Toll Free Helpline</span>
            <span className="text-sm font-bold text-ink-900">1800-22-6432</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-cream-200/90 shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-ink-500 block font-medium">Grievance Support Email</span>
            <span className="text-sm font-bold text-ink-900">support.grievance@midcindia.org</span>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-3xl p-6 border border-cream-200/90 shadow-card space-y-4">
        <h3 className="font-display font-bold text-base text-ink-900 flex items-center gap-2">
          <FileQuestion className="w-4 h-4 text-brand-600" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="divide-y divide-cream-100">
          {faqs.map((faq, i) => (
            <div key={i} className="py-3.5 space-y-1">
              <h4 className="text-xs font-bold text-ink-900">{faq.q}</h4>
              <p className="text-xs text-ink-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
