import { useState } from 'react'
import { Settings, Shield, Bell, Database, RefreshCw, Save } from 'lucide-react'
import { storage } from '../../services/storage'

export default function AdminSettings() {
  const [resetSuccess, setResetSuccess] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [settings, setSettings] = useState({
    autoAssignAI: true,
    slaAlertHours: 12,
    enableMarathiDefault: false,
    emailAlerts: true,
  })

  const handleResetData = () => {
    if (window.confirm('Reset all mock grievances, users, and notifications back to initial defaults?')) {
      storage.reset()
      setResetSuccess(true)
      setTimeout(() => {
        setResetSuccess(false)
        window.location.reload()
      }, 1500)
    }
  }

  const handleSave = (e) => {
    e.preventDefault()
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-ink-900 tracking-tight">
          System Settings &amp; Configuration
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1">
          Portal runtime parameters, automated SLA escalation rules, and demo data controls.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-2xl font-medium">
          Mock data has been reset to defaults. Reloading workspace...
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl font-medium">
          Settings saved successfully.
        </div>
      )}

      {/* Main Settings Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200/90 shadow-card space-y-6">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* AI Automation */}
          <div className="space-y-3 pb-6 border-b border-cream-100">
            <h3 className="font-display font-bold text-sm text-ink-900">
              AI Routing &amp; Automation
            </h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoAssignAI}
                onChange={(e) => setSettings({ ...settings, autoAssignAI: e.target.checked })}
                className="w-4 h-4 rounded accent-brand-600"
              />
              <div>
                <span className="font-bold text-ink-900 block">Auto-Suggest Handling Department</span>
                <span className="text-ink-500 text-[11px]">
                  Use keyword pattern matching to recommend departments during citizen intake.
                </span>
              </div>
            </label>
          </div>

          {/* SLA Thresholds */}
          <div className="space-y-3 pb-6 border-b border-cream-100">
            <h3 className="font-display font-bold text-sm text-ink-900">
              SLA &amp; Escalation Thresholds
            </h3>
            <div className="max-w-xs space-y-1">
              <label className="font-semibold text-ink-700 block">Officer Reminder Lead Time (Hours)</label>
              <input
                type="number"
                value={settings.slaAlertHours}
                onChange={(e) => setSettings({ ...settings, slaAlertHours: +e.target.value })}
                className="w-full p-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-xs text-ink-900"
              />
              <span className="text-[10px] text-ink-400 block">
                Trigger overdue warning notification before deadline expiration.
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-brand transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Demo Controls: Reset Database */}
      <div className="bg-red-50/60 rounded-3xl p-6 border border-red-200 space-y-3">
        <h3 className="font-display font-bold text-sm text-red-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-red-600" />
          <span>Demo Data Reset</span>
        </h3>
        <p className="text-xs text-red-700">
          Reset all browser localStorage state (restores Rahul's original 5 grievances, ~168 generated tickets, initial notifications, and cleans test data).
        </p>
        <button
          onClick={handleResetData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Demo Data to Factory State</span>
        </button>
      </div>
    </div>
  )
}
