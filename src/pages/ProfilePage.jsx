import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/ui/Modal'
import { useApp } from '../context/AppContext'
import {
  Crown, Settings, Shield, Flame, Headphones, Smartphone,
  CreditCard, ShoppingBag, Sparkles, ChevronRight, LogOut,
  Moon, Battery, Wifi, Gift,
} from 'lucide-react'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { showToast, lang, setLang } = useApp()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const T = lang === 'zh' ? {
    temp: '体温 38.5°C，心动升温中...',
    deviceTitle: '已连接: 专属互动设备',
    deviceSub: '状态稳定在线 · 同步度 95%',
    deviceActivity: '设备活跃度',
    syncStatus: '默契在线',
    syncRate: '连接同步率',
    lastSession: '距上次互动',
    justNow: '刚刚',
    inviteTitle: '邀友共享 · 解锁',
    inviteHighlight: '专属礼遇',
    inviteDesc: { prefix: '送TA ', days: '7天', mid: '，您获 ', reward: '$50', suffix: ' 邀请奖励' },
    shareBtn: '去分享',
    menu: [
      { title: '会员服务', items: [
        { label: '专属订阅管理', value: '高级版' },
        { label: '个人偏好设置' },
        { label: '隐私与安全锁' },
      ]},
      { title: '专属内容', items: [
        { label: '沉浸式剧情', value: '3部' },
        { label: '专属声线互动', value: '已激活' },
      ]},
      { title: '感官互联', items: [{ label: '硬件连接与控制' }] },
      { title: '账单', items: [{ label: '钱包与支付' }] },
      { title: '探索', items: [
        { label: '购买AI智能飞机杯', value: '全新发售' },
        { label: '沉浸使用指南' },
      ]},
    ],
    vipTitle: '会员尊享服务',
    vipDesc: '解锁更细腻的互动反馈、专属剧情与优先响应',
    vipSub: '今晚，也可以和她更近一点',
    vipBtn: '去开通会员',
    logoutBtn: '断开连接，结束本次互动',
    version: '版本 2.5.0 · 私密守护',
    versionSub: '您的每一次心动与选择，都会被妥善保护。',
    modalTitle: '离开当前空间？',
    modalContent: '退出后将暂停与专属伴侣的互动连接，确定现在离开吗？',
    modalConfirm: '确认离开',
    modalCancel: '继续停留',
    logoutToast: '已安全退出，欢迎下次再来',
    comingSoon: '刺激功能即将上线',
    premiumBadge: '高级版',
    newBadge: '全新发售',
    activeBadge: '已激活',
  } : {
    temp: 'Heart warming up · 38.5°C',
    deviceTitle: 'Connected Device',
    deviceSub: 'Online · 95% Sync',
    deviceActivity: 'Device Activity',
    syncStatus: 'In Sync',
    syncRate: 'Sync Rate',
    lastSession: 'Last Session',
    justNow: 'Just now',
    inviteTitle: 'Invite & Earn',
    inviteHighlight: 'Rewards',
    inviteDesc: { prefix: 'Give ', days: '7 Days', mid: ' · Earn ', reward: '$50', suffix: '' },
    shareBtn: 'Share',
    menu: [
      { title: 'Membership', items: [
        { label: 'Subscription', value: 'Premium' },
        { label: 'Preferences' },
        { label: 'Privacy & Security' },
      ]},
      { title: 'Exclusive Content', items: [
        { label: 'Immersive Stories', value: '3' },
        { label: 'AI Voice Interaction', value: 'Active' },
      ]},
      { title: 'Sensory Connect', items: [{ label: 'Device Control' }] },
      { title: 'Billing', items: [{ label: 'Wallet & Payment' }] },
      { title: 'Explore', items: [
        { label: 'Buy AI Device', value: 'New' },
        { label: 'User Guide' },
      ]},
    ],
    vipTitle: 'Premium Membership',
    vipDesc: 'Unlock richer interactions and priority response',
    vipSub: 'Tonight, get a little closer to her',
    vipBtn: 'Activate Membership',
    logoutBtn: 'Disconnect & End Session',
    version: 'Version 2.5.0 · Privacy Protected',
    versionSub: 'Every heartbeat and choice you make is carefully protected.',
    modalTitle: 'Leave this space?',
    modalContent: 'Leaving will pause your connection with your companion. Are you sure?',
    modalConfirm: 'Confirm',
    modalCancel: 'Stay',
    logoutToast: 'Safely logged out. See you next time!',
    comingSoon: 'Exciting features coming soon',
    premiumBadge: 'Premium',
    newBadge: 'New',
    activeBadge: 'Active',
  }

  const menuSections = [
    {
      title: T.menu[0].title,
      items: [
        { icon: Crown,    label: T.menu[0].items[0].label, value: T.menu[0].items[0].value, onClick: () => navigate('/recharge', { state: { from: 'profile' } }) },
        { icon: Settings, label: T.menu[0].items[1].label,                                  onClick: () => navigate('/settings')     },
        { icon: Shield,   label: T.menu[0].items[2].label,                                  onClick: () => navigate('/privacy')      },
      ],
    },
    {
      title: T.menu[1].title,
      items: [
        { icon: Flame,      label: T.menu[1].items[0].label, value: T.menu[1].items[0].value, onClick: () => navigate('/scripts')   },
        { icon: Headphones, label: T.menu[1].items[1].label, value: T.menu[1].items[1].value, onClick: () => navigate('/ai-voice') },
      ],
    },
    {
      title: T.menu[2].title,
      items: [{ icon: Smartphone, label: T.menu[2].items[0].label, onClick: () => navigate('/devices') }],
    },
    {
      title: T.menu[3].title,
      items: [{ icon: CreditCard, label: T.menu[3].items[0].label, onClick: () => navigate('/payment') }],
    },
    {
      title: T.menu[4].title,
      items: [
        { icon: ShoppingBag, label: T.menu[4].items[0].label, value: T.menu[4].items[0].value, onClick: () => navigate('/hardware-store') },
        { icon: Sparkles,    label: T.menu[4].items[1].label,                                   onClick: () => navigate('/help')          },
      ],
    },
  ]

  return (
    <div className="flex-1 overflow-y-auto pb-8 no-scrollbar relative z-10">

      {/* 语言切换按钮 */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
          className="w-7 h-7 rounded-full bg-[#1E1324]/80 border border-[#A87CFF]/30 flex items-center justify-center text-[10px] font-bold text-[#A87CFF] backdrop-blur-md active:scale-90 transition-transform shadow-[0_0_12px_rgba(168,124,255,0.2)]"
        >
          {lang === 'zh' ? 'EN' : '中'}
        </button>
      </div>

      {/* 头像 */}
      <div className="px-6 pt-12 pb-6 flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF2A6D] to-[#A87CFF] flex items-center justify-center text-xl font-bold text-white shadow-[0_0_25px_rgba(255,42,109,0.6)] border-2 border-[#FF2A6D]/30 shrink-0 relative animate-[breathe_3s_ease-in-out_infinite]">
          <div className="absolute inset-0 rounded-full bg-[#FF2A6D] blur-md opacity-20 animate-pulse" />
          AR
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[#F9EDF5] tracking-wide truncate">Alex Rivera</h1>
          <p className="text-sm flex items-center mt-0.5 text-[#FF2A6D]/90 animate-pulse font-medium min-w-0">
            <Flame size={13} className="mr-1" />
            <span className="truncate">{T.temp}</span>
          </p>
        </div>
      </div>

      {/* 设备状态卡 */}
      <div className="px-4 mb-6">
        <div className="bg-[#1E1324]/80 backdrop-blur-md border border-[#FF2A6D]/30 rounded-2xl p-4 shadow-[0_8px_30px_rgba(255,42,109,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF2A6D]/5 to-transparent opacity-50" />
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#FF2A6D]/20 relative z-10">
            <div className="flex items-center space-x-3 text-sm min-w-0">
              <div className="p-2 bg-[#FF2A6D]/20 rounded-xl text-[#FF2A6D] shadow-[0_0_15px_rgba(255,42,109,0.3)]">
                <Flame size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-[#F9EDF5] font-semibold truncate">{T.deviceTitle}</div>
                <div className="text-[11px] text-[#FF2A6D] mt-0.5 animate-pulse drop-shadow-[0_0_5px_#FF2A6D] truncate">{T.deviceSub}</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#9B859D]" />
          </div>
          <div className="flex justify-between text-center px-2 relative z-10">
            <div className="min-w-0">
              <div className="text-lg font-bold text-[#FF2A6D] mb-1">87%</div>
              <div className="text-[11px] text-[#9B859D] flex items-center justify-center min-w-0">
                <Battery size={11} className="mr-1" />{T.deviceActivity}
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold text-[#A87CFF] mb-1 drop-shadow-[0_0_8px_rgba(168,124,255,0.6)] truncate">{T.syncStatus}</div>
              <div className="text-[11px] text-[#9B859D] flex items-center justify-center min-w-0">
                <Wifi size={11} className="mr-1" />{T.syncRate}
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold text-[#F9EDF5] mb-1 truncate">{T.justNow}</div>
              <div className="text-[11px] text-[#9B859D] truncate">{T.lastSession}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 邀请 Banner */}
      <div className="px-4 mb-6" onClick={() => navigate('/referral')}>
        <div className="bg-gradient-to-r from-[#291515] to-[#1A0B0E] border border-[#FFB03A]/40 rounded-2xl p-4 flex items-center justify-between cursor-pointer active:scale-95 transition-transform shadow-[0_5px_25px_rgba(255,107,0,0.2)] relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-[#FFB03A]/10 to-transparent pointer-events-none" />
          <div className="flex items-center space-x-3 relative z-10 min-w-0">
            <div className="p-2.5 bg-gradient-to-br from-[#FFD700] to-[#FF6B00] rounded-xl text-white shadow-[0_0_15px_rgba(255,107,0,0.5)] shrink-0">
              <Gift size={20} className="fill-current" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-[#F9EDF5] mb-0.5 flex items-center gap-1 min-w-0">
                <span className="truncate">{T.inviteTitle}</span>
                <span className="text-[#FFD700] shrink-0">{T.inviteHighlight}</span>
              </div>
              <div className="text-[10px] text-[#9B859D] truncate">
                {T.inviteDesc.prefix}<span className="text-[#FFD700]">{T.inviteDesc.days}</span>{T.inviteDesc.mid}<span className="text-[#FFD700]">{T.inviteDesc.reward}</span>{T.inviteDesc.suffix}
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-[#FFD700] to-[#FF6B00] text-[#1A0A00] text-xs px-3 py-1.5 rounded-full font-extrabold shrink-0 relative z-10 whitespace-nowrap">
            {T.shareBtn}
          </div>
        </div>
      </div>

      {/* 菜单 */}
      <div className="px-4 space-y-6">
        {menuSections.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-xs font-semibold text-[#FF7DAF]/70 tracking-wider mb-2 px-2">
              {section.title}
            </h3>
            <div className="bg-[#1E1324]/80 backdrop-blur-md border border-[#FF7DAF]/10 rounded-2xl overflow-hidden shadow-lg">
              {section.items.map((item, i) => (
                <div
                  key={i}
                  onClick={item.onClick ?? (() => showToast(T.comingSoon))}
                  className={`flex items-center justify-between p-4 cursor-pointer active:bg-[#FF7DAF]/10 transition-colors ${
                    i !== section.items.length - 1 ? 'border-b border-[#FF7DAF]/5' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 text-sm text-[#F9EDF5] min-w-0">
                    <div className="text-[#FF7DAF] shrink-0"><item.icon size={18} /></div>
                    <span className="font-medium truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    {item.value === T.premiumBadge && (
                      <span className="bg-gradient-to-r from-[#FF7DAF] to-[#A87CFF] text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-[0_0_8px_rgba(255,125,175,0.5)]">
                        {T.premiumBadge}
                      </span>
                    )}
                    {item.value === T.newBadge && (
                      <span className="bg-gradient-to-r from-[#FFD700] to-[#FF6B00] text-[10px] font-bold px-2 py-0.5 rounded-full text-[#1A0A00] animate-pulse">
                        {T.newBadge}
                      </span>
                    )}
                    {item.value && item.value !== T.premiumBadge && item.value !== T.newBadge && (
                      <span className="text-[#FF7DAF]/80 text-sm font-medium">{item.value}</span>
                    )}
                    <ChevronRight size={16} className="text-[#9B859D]/50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 升级 Banner */}
      <div className="px-4 mt-8 mb-8">
        <div className="bg-[#160D1A] border border-[#FF2A6D]/20 rounded-2xl p-6 text-center relative overflow-hidden shadow-[0_10px_30px_rgba(168,124,255,0.15)]">
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#A87CFF]/15 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#FF2A6D]/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />
          <Crown size={28} className="text-[#A87CFF] mx-auto mb-3 relative z-10" />
          <h3 className="text-[#F9EDF5] text-lg font-bold mb-1 relative z-10">{T.vipTitle}</h3>
          <p className="text-xs text-[#9B859D] mb-2 relative z-10">{T.vipDesc}</p>
          <p className="text-[11px] text-[#FF7DAF] mb-5 relative z-10">{T.vipSub}</p>
          <button
            onClick={() => navigate('/recharge', { state: { from: 'profile' } })}
            className="w-full bg-gradient-to-r from-[#FF2A6D] to-[#A87CFF] text-white text-sm font-bold py-3.5 rounded-full active:scale-95 transition-transform shadow-[0_4px_20px_rgba(255,42,109,0.4)] relative z-10"
          >
            {T.vipBtn}
          </button>
        </div>
      </div>

      {/* 退出 */}
      <div className="px-4 pb-8">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full py-4 text-[#FF4D6D] text-sm font-bold border border-[#FF4D6D]/30 bg-[#FF4D6D]/10 rounded-2xl flex items-center justify-center space-x-2 active:bg-[#FF4D6D]/20 transition-colors"
        >
          <LogOut size={16} />
          <span>{T.logoutBtn}</span>
        </button>
        <div className="text-center mt-6 text-[#9B859D]/50 text-[10px] leading-relaxed">
          {T.version}<br />
          {T.versionSub}
        </div>
      </div>

      <Modal
        isOpen={showLogoutModal}
        title={T.modalTitle}
        content={T.modalContent}
        confirmText={T.modalConfirm}
        cancelText={T.modalCancel}
        isDanger={true}
        onConfirm={() => {
          setShowLogoutModal(false)
          showToast(T.logoutToast)
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  )
}
