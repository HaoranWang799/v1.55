import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import HeaderBar from '../components/ui/HeaderBar'
import { useApp } from '../context/AppContext'
import { Gift, Copy, Check, Share2, Sparkles } from 'lucide-react'
import { useL } from '../i18n/useL'

const REFERRAL_CODE = 'LUNA2024'
const REFERRAL_LINK = 'https://app.luna.com/ref/LUNA2024'

const getRECENT_INVITES = (L) => [
  { name: 'Emma W.', time: L('2天前', '2 days ago'),   reward: '$50', status: L('已加入', 'Joined'), statusColor: 'text-[#FF2A6D]' },
  { name: 'Chris Z.', time: L('5天前', '5 days ago'),  reward: '$50', status: L('已加入', 'Joined'), statusColor: 'text-[#FF2A6D]' },
  { name: 'Alex K.',  time: L('1周前', '1 week ago'),  reward: '$50', status: L('体验中', 'Trying'), statusColor: 'text-[#A87CFF]' },
]

const getRULES = (L) => [
  L('成功邀请一位新用户注册并完成首次体验', 'Successfully invite a new user to register and complete their first experience'),
  L('您将获得 $50 邀请奖励，可直接用于站内消费', 'You will receive a $50 referral reward for in-app use'),
  L('邀请人数不限，分享越多奖励越多', 'No limit on invites — the more you share, the more you earn'),
  L('累计满 10 人可解锁隐藏限定剧情', 'Invite 10 people to unlock exclusive hidden content'),
]

export default function ReferralPage() {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const L = useL()
  const RECENT_INVITES = getRECENT_INVITES(L)
  const RULES = getRULES(L)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // 模拟进度
  const invitedCount = 7
  const targetCount = 10
  const progressPercent = (invitedCount / targetCount) * 100

  const copy = (text, type) => {
    navigator.clipboard.writeText(text).catch(() => {})
    if (type === 'code') {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } else {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
    showToast(L('邀请码已复制成功', 'Referral code copied'))
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0A0509] text-[#F9EDF5]">
      <HeaderBar title={L("邀请与共享", "Invite & Share")} onBack={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">

        {/* 英雄卡片 */}
        <div className="mx-4 mt-2 relative rounded-3xl overflow-hidden bg-[#1E0914] border border-[#FF2A6D]/30 shadow-[0_8px_40px_rgba(255,42,109,0.2)]">
          {/* 背景动画特效 */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay" />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -right-20 w-64 h-64 bg-[#FF2A6D]/30 rounded-full blur-3xl pointer-events-none" 
          />

          <div className="relative z-10 p-6 flex flex-col items-center text-center">
            <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_24px_rgba(255,42,109,0.55)] bg-gradient-to-br from-[#FF2A6D]/30 via-[#7B1844]/35 to-[#A87CFF]/25 border border-[#FF7DAF]/25 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_38%)]" />
              <Gift size={30} className="relative z-10 text-[#FFE5F0]" strokeWidth={1.9} />
              <Sparkles size={14} className="absolute right-3 top-3 text-[#FFD1E3]" strokeWidth={2.4} />
            </div>
            <h2 className="text-xl font-black text-[#F9EDF5] tracking-widest drop-shadow-[0_0_5px_#FF2A6D]">{L('专属邀请计划', 'Exclusive Referral Program')}</h2>
            <p className="text-sm text-[#FF2A6D]/80 mt-2 font-medium">{L('每成功邀请一位新朋友加入体验', 'For each friend who joins')}</p>

            <div className="bg-[#0C060B]/80 backdrop-blur-sm rounded-2xl px-8 py-5 mt-6 w-full border border-[#FF2A6D]/20">
              <p className="text-xs text-[#9B859D] mb-1">{L('即可获得专属邀请奖励', 'Earn exclusive referral rewards')}</p>
              <p className="text-5xl font-black text-[#FF2A6D] drop-shadow-[0_0_15px_rgba(255,42,109,0.5)]">$50</p>
            </div>
          </div>
        </div>

        {/* 邀请进度 */}
        <div className="mx-4 mt-6">
          <div className="flex justify-between items-end mb-2 px-1">
            <span className="text-xs font-bold text-[#FF2A6D]">{L('限定剧情解锁进度', 'Exclusive Content Progress')}</span>
            <span className="text-[10px] text-[#9B859D]"><span className="text-[#FF2A6D] font-bold text-sm">{invitedCount}</span> / {targetCount} 人</span>
          </div>
          <div className="relative h-6 bg-[#1A0E1E] rounded-full border border-white/5 overflow-hidden">
            {/* 动态水波纹进度条 */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#A87CFF] to-[#FF2A6D] rounded-full overflow-hidden"
            >
              <motion.div 
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              />
            </motion.div>
          </div>
          <p className="text-[10px] text-[#A87CFF] mt-2 text-center">{L('进度达成后，立即解锁限时隐藏剧情', 'Unlock hidden content when goal is reached')}</p>
        </div>
        <div className="mx-4 mt-4 bg-[#1A0E1E] border border-white/5 rounded-2xl px-5 py-4 grid grid-cols-3 divide-x divide-white/5">
          {[
            { label: L('已邀请好友', 'Friends Invited'),  value: '7',      color: 'text-white' },
            { label: L('获得奖励', 'Rewards Earned'),    value: '$350',   color: 'text-[#66E699]' },
            { label: L('待领取', 'Pending'),      value: '$50',    color: 'text-[#FFC266]' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col items-center px-3">
              <span className={`text-xl font-black ${color}`}>{value}</span>
              <span className="text-[10px] text-[#9B859D] mt-0.5">{label}</span>
            </div>
          ))}
        </div>

        {/* 专属邀请码 */}
        <div className="mx-4 mt-4 bg-[#1A0E1E] border border-white/5 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Gift size={13} className="text-[#A87CFF]" />
            <span className="text-xs font-semibold text-[#A87CFF]">{L('您的专属邀请码', 'Your Referral Code')}</span>
          </div>

          <div>
            <p className="text-[10px] text-[#9B859D] mb-1.5">{L('邀请码', 'Referral Code')}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#0A0509] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white tracking-widest">
                {REFERRAL_CODE}
              </div>
              <button
                onClick={() => copy(REFERRAL_CODE, 'code')}
                className="w-10 h-10 bg-[#A87CFF]/15 border border-[#A87CFF]/30 rounded-xl flex items-center justify-center shrink-0 active:scale-90 transition-transform"
              >
                {copiedCode ? <Check size={16} className="text-[#66E699]" /> : <Copy size={16} className="text-[#A87CFF]" />}
              </button>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-[#9B859D] mb-1.5">{L('邀请链接', 'Referral Link')}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#0A0509] border border-white/10 rounded-xl px-4 py-3 text-xs text-[#9B859D] truncate">
                {REFERRAL_LINK}
              </div>
              <button
                onClick={() => copy(REFERRAL_LINK, 'link')}
                className="w-10 h-10 bg-[#A87CFF]/15 border border-[#A87CFF]/30 rounded-xl flex items-center justify-center shrink-0 active:scale-90 transition-transform"
              >
                {copiedLink ? <Check size={16} className="text-[#66E699]" /> : <Copy size={16} className="text-[#A87CFF]" />}
              </button>
            </div>
          </div>
        </div>

        {/* 活动规则 */}
        <div className="mx-4 mt-4 bg-[#1A0E1E] border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[#F9EDF5] mb-3">{L('活动规则', 'Rules')}</h3>
          <ul className="space-y-2">
            {RULES.map((rule, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-[#9B859D] leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A87CFF]/60 mt-1.5 shrink-0" />
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* 最近邀请 */}
        <div className="mx-4 mt-4 bg-[#1A0E1E] border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-[#F9EDF5] mb-3">{L('最近邀请', 'Recent Invites')}</h3>
          <div className="space-y-3">
            {RECENT_INVITES.map((inv) => (
              <div key={inv.name} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#F9EDF5]">{inv.name}</p>
                  <p className="text-[11px] text-[#9B859D] mt-0.5">{inv.time}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold text-[#66E699]`}>{inv.reward}</p>
                  <p className={`text-[11px] mt-0.5 ${inv.statusColor}`}>{inv.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 底部固定按钮 */}
      <div className="shrink-0 px-4 py-4 bg-gradient-to-t from-[#0A0509] via-[#0A0509]/95 to-transparent">
        <button
          onClick={() => showToast(L('已唤起系统分享', 'Share dialog opened'))}
          className="w-full bg-gradient-to-r from-[#8B1CF5] to-[#A87CFF] text-white py-4 rounded-2xl text-sm font-bold shadow-[0_4px_24px_rgba(139,28,245,0.5)] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Share2 size={16} />
          {L('立即邀请好友', 'Invite Friends Now')}
        </button>
      </div>
    </div>
  )
}
