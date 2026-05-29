/**
 * App.jsx — 路由入口 v2
 *
 * 变更（v2）：
 *   • 引入 AppProvider（全局货币 + 会员等级状态）
 *   • 新增 /recharge 路由（位于 Layout 外，无底部导航）
 *
 * TODO: 添加用户账户系统与亲密度持久化（localStorage / 后端 API）
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Toast           from './components/ui/Toast'
import Layout          from './components/Layout'
import HomePage        from './pages/HomePage'
import ShopPage        from './pages/ShopPage'
import CommunityPage   from './pages/CommunityPage'
import HealthPage      from './pages/HealthPage'
import RechargePage    from './pages/RechargePage'
// ── 新增页面（来自 Demo 工程化拆解） ──────────────────────
import ProfilePage       from './pages/ProfilePage'
import DevicePage        from './pages/DevicePage'
import HardwareStorePage from './pages/HardwareStorePage'
import SubscriptionPage  from './pages/SubscriptionPage'
import SettingsPage      from './pages/SettingsPage'
import PrivacyPage       from './pages/PrivacyPage'
import PaymentPage       from './pages/PaymentPage'
import ScriptsPage       from './pages/ScriptsPage'
import AIVoicePage       from './pages/AIVoicePage'
import PlayerPage        from './pages/PlayerPage'
import ChatPage          from './pages/ChatPage'
import HelpCenterPage    from './pages/HelpCenterPage'
import ReferralPage      from './pages/ReferralPage'
import KycEntryPage      from './features/kyc/pages/KycEntryPage'
import KycIdentityPage   from './features/kyc/pages/KycIdentityPage'
import KycTermsPage      from './features/kyc/pages/KycTermsPage'
import KycSuccessPage    from './features/kyc/pages/KycSuccessPage'
import KycRejectedPage   from './features/kyc/pages/KycRejectedPage'

/** 手机宽度约束壳 — 用于 Layout 外的全屏子页面 */
function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-[#050305] flex justify-center">
      <div className="relative w-full max-w-[430px] min-h-screen overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function KycShell({ children }) {
  return (
    <div className="min-h-screen bg-[#050305] flex justify-center">
      <div className="relative w-full max-w-[480px] min-h-screen overflow-hidden">
        {children}
      </div>
    </div>
  )
}

/** 全局 Toast 挂载在 AppProvider 内 */
function GlobalToast() {
  const { toastMessage, clearToast } = useApp()
  if (!toastMessage) return null
  return <Toast message={toastMessage} onClose={clearToast} />
}

export default function App() {
  return (
    <AppProvider>
      <GlobalToast />
      <Routes>
        {/* ── 带底部导航的主布局 ── */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home"      element={<HomePage />} />
          <Route path="shop"      element={<ShopPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="health"    element={<HealthPage />} />
          <Route path="profile"   element={<ProfilePage />} />
        </Route>

        {/* ── 全屏独立页面（无底部导航，手机宽度约束） ── */}
        <Route path="/recharge"       element={<PageShell><RechargePage /></PageShell>} />
        <Route path="/devices"        element={<PageShell><DevicePage /></PageShell>} />
        <Route path="/hardware-store" element={<PageShell><HardwareStorePage /></PageShell>} />
        <Route path="/subscription"   element={<PageShell><SubscriptionPage /></PageShell>} />
        <Route path="/settings"       element={<PageShell><SettingsPage /></PageShell>} />
        <Route path="/privacy"        element={<PageShell><PrivacyPage /></PageShell>} />
        <Route path="/payment"        element={<PageShell><PaymentPage /></PageShell>} />
        <Route path="/scripts"        element={<PageShell><ScriptsPage /></PageShell>} />
        <Route path="/ai-voice"       element={<PageShell><AIVoicePage /></PageShell>} />
        <Route path="/player"         element={<PageShell><PlayerPage /></PageShell>} />
        <Route path="/chat"           element={<PageShell><ChatPage /></PageShell>} />
        <Route path="ai-lover/chat"  element={<PageShell><ChatPage /></PageShell>} />
        <Route path="/help"           element={<PageShell><HelpCenterPage /></PageShell>} />
        <Route path="/referral"       element={<PageShell><ReferralPage /></PageShell>} />
        <Route path="/kyc"            element={<KycShell><KycEntryPage /></KycShell>} />
        <Route path="/kyc/identity"   element={<KycShell><KycIdentityPage /></KycShell>} />
        <Route path="/kyc/terms"      element={<KycShell><KycTermsPage /></KycShell>} />
        <Route path="/kyc/success"    element={<KycShell><KycSuccessPage /></KycShell>} />
        <Route path="/kyc/rejected"   element={<KycShell><KycRejectedPage /></KycShell>} />

        {/* 兜底 */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AppProvider>
  )
}
