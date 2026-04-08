/**
 * RechargePage.jsx — 充值与会员
 *
 * 功能：
 *   • 全屏页面（不含底部导航），顶部返回商城按钮
 *   • 钻石充值区：4 个档位卡片，点击充值更新全局钻石余额
 *   • 会员等级区：心动会员 / 热恋会员 / 灵魂伴侣，点击开通更新全局会员等级
 *   • 从 AppContext 直接读取 & 更新状态（本页在 Layout 路由外）
 *
 * TODO: 接入真实支付宝 / 微信 / Stripe 支付（/api/payment/recharge）
 * TODO: 接入真实会员订阅 API（/api/membership/subscribe）
 * TODO: 接入真实钻石充值后端（/api/wallet/topup）
 */
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Diamond, Crown, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useL } from '../i18n/useL'

const PHONE_W = 'max-w-[430px]'

// ── 钻石充值档位 ──────────────────────────────────────────
// TODO: 替换为 /api/shop/recharge-tiers 的真实档位数据
const getDIAMOND_TIERS = (L) => [
  {
    id: 'd1', price: 6,   diamonds: 60,
    label: '60 💎', priceLabel: '$0.99',
    badge: null,
  },
  {
    id: 'd2', price: 30,  diamonds: 300,
    label: '300 💎', priceLabel: '$4.99',
    badge: L('热门', 'Popular'),
  },
  {
    id: 'd3', price: 68,  diamonds: 680,
    label: '680 💎', priceLabel: '$9.99',
    badge: L('超值', 'Best Value'),
  },
  {
    id: 'd4', price: 198, diamonds: 2000,
    label: '2000 💎', priceLabel: '$27.99',
    badge: L('最划算', 'Best Deal'),
  },
]

// ── 会员等级配置 ──────────────────────────────────────────
// TODO: 替换为 /api/membership/tiers 的真实配置数据
const getMEMBER_TIERS = (L) => [
  {
    id: 'm1',
    value: '心动会员',
    level: L('心动会员', 'Heart Member'),
    emoji: '💕',
    isFree: true,
    priceMonthly: null,
    priceYearly: null,
    priceLabel: L('永久免费', 'Free Forever'),
    gradient: 'from-[#1e1228] to-[#251840]',
    accentColor: '#B380FF',
    perks: [
      L('可购买普通模板', 'Purchase standard templates'),
      L('每日签到领金币', 'Daily check-in coins'),
      L('基础社区功能', 'Basic community features'),
    ],
  },
  {
    id: 'm2',
    value: '热恋会员',
    level: L('热恋会员', 'Passion Member'),
    emoji: '🔥',
    isFree: false,
    priceMonthly: 30,
    priceYearly: 198,
    priceLabel: L('$4.99/月 · $27.99/年', '$4.99/mo · $27.99/yr'),
    gradient: 'from-[#2a1020] to-[#4a1535]',
    accentColor: '#FF9ACB',
    perks: [
      L('所有模板 8 折优惠', '20% off all templates'),
      L('每月免费领 1 个热门模板', '1 free popular template/month'),
      L('专属"热恋"身份标签', 'Exclusive "Passion" badge'),
      L('优先客服支持', 'Priority customer support'),
    ],
    highlight: false,
  },
  {
    id: 'm3',
    value: '灵魂伴侣',
    level: L('灵魂伴侣', 'Soul Partner'),
    emoji: '👑',
    isFree: false,
    priceMonthly: 68,
    priceYearly: 488,
    priceLabel: L('$9.99/月 · $59.99/年', '$9.99/mo · $59.99/yr'),
    gradient: 'from-[#251840] to-[#3a2060]',
    accentColor: '#FFD700',
    perks: [
      L('全部模板永久免费', 'All templates free forever'),
      L('优先体验全新剧本', 'Early access to new scripts'),
      L('定制幻想生成加速 2×', '2× faster custom generation'),
      L('专属 AI 客服（模拟）', 'Exclusive AI support (simulated)'),
      L('独家"灵魂伴侣"金色标签', 'Exclusive "Soul Partner" gold badge'),
    ],
    highlight: true,
  },
]

function getLocalizedMemberLevel(level, L) {
  const memberMap = {
    '心动会员': L('心动会员', 'Heart Member'),
    '热恋会员': L('热恋会员', 'Passion Member'),
    '灵魂伴侣': L('灵魂伴侣', 'Soul Partner'),
    'Heart Member': L('心动会员', 'Heart Member'),
    'Passion Member': L('热恋会员', 'Passion Member'),
    'Soul Partner': L('灵魂伴侣', 'Soul Partner'),
  }
  return memberMap[level] || level
}

function getCanonicalMemberLevel(level) {
  const memberMap = {
    'Heart Member': '心动会员',
    'Passion Member': '热恋会员',
    'Soul Partner': '灵魂伴侣',
  }
  return memberMap[level] || level
}

// ═══════════════════════════════════════════════════════════
//  子组件
// ═══════════════════════════════════════════════════════════

/** 钻石充值卡片 */
function DiamondCard({ tier, onRecharge }) {
  const L = useL()
  const isBest = tier.id === 'd4'
  return (
    <div
      className={`relative rounded-2xl p-4 card-glow cursor-pointer active:scale-[0.97] transition-transform ${
        isBest
          ? 'bg-gradient-to-br from-[#2a1535] to-[#1a0d28]'
          : 'bg-[rgba(30,20,35,0.7)]'
      }`}
      style={isBest ? { border: '1px solid rgba(255,154,203,0.3)' } : {}}
      onClick={() => onRecharge(tier)}
    >
      {/* 角标 */}
      {tier.badge && (
        <span
          className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold rounded-full px-2 py-0.5 whitespace-nowrap"
          style={{
            background: isBest
              ? 'linear-gradient(90deg, #FF9ACB, #B380FF)'
              : 'rgba(179,128,255,0.25)',
            color: isBest ? '#fff' : '#B380FF',
          }}
        >
          {tier.badge}
        </span>
      )}
      {/* 钻石数量 */}
      <div className="flex flex-col items-center gap-1 pt-2">
        <span className="text-3xl">💎</span>
        <p className="text-base font-bold text-[rgba(245,240,242,0.95)]">{tier.label}</p>
        <p className="text-[10px] text-[rgba(245,240,242,0.4)]">{L('钻石到账', 'Diamonds credited')}</p>
      </div>
      {/* 充值按钮 */}
      <button
        className={`mt-3 w-full py-2 rounded-xl text-[12px] font-semibold transition-all ${
          isBest
            ? 'btn-main text-white'
            : 'bg-[rgba(179,128,255,0.15)] text-[#B380FF] border border-[rgba(179,128,255,0.3)]'
        }`}
      >
        {tier.priceLabel} {L('立即充值', 'Top Up Now')}
      </button>
    </div>
  )
}

/** 会员等级卡片 */
function MemberCard({ tier, currentLevel, onActivate }) {
  const L = useL()
  const isActive  = getCanonicalMemberLevel(currentLevel) === tier.value
  const isCurrent = isActive
  return (
    <div
      className={`relative rounded-2xl p-4 card-glow bg-gradient-to-br ${tier.gradient} ${
        tier.highlight ? 'ring-1 ring-[rgba(255,215,0,0.3)]' : ''
      }`}
    >
      {/* "最强" 角标 */}
      {tier.highlight && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold rounded-full px-2.5 py-0.5 whitespace-nowrap"
          style={{ background: 'linear-gradient(90deg, #FFD700, #FF9ACB)', color: '#1a0a12' }}
        >
          ✦ {L('最强权益', 'Best Benefits')}
        </span>
      )}

      {/* 标题行 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{tier.emoji}</span>
        <div className="flex-1">
          <p className="text-sm font-bold" style={{ color: tier.accentColor }}>{tier.level}</p>
          <p className="text-[11px] text-[rgba(245,240,242,0.5)]">{tier.priceLabel}</p>
        </div>
        {/* 当前等级徽章 */}
        {isCurrent && (
          <span className="text-[9px] bg-[rgba(255,154,203,0.2)] text-[#FF9ACB] rounded-full px-2 py-0.5 border border-[rgba(255,154,203,0.3)]">
            {L('当前等级', 'Current')}
          </span>
        )}
      </div>

      {/* 权益列表 */}
      <ul className="space-y-1.5 mb-4">
        {tier.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-[11px] text-[rgba(245,240,242,0.7)]">
            <Check size={11} className="flex-shrink-0 mt-0.5" style={{ color: tier.accentColor }} />
            {perk}
          </li>
        ))}
      </ul>

      {/* 开通按钮 */}
      {tier.isFree ? (
        <div className="w-full py-2 rounded-xl text-[11px] font-medium text-center text-[rgba(245,240,242,0.4)] bg-[rgba(255,255,255,0.04)]">
          {isCurrent ? L('✓ 当前使用中', '✓ Current Plan') : L('免费使用', 'Free')}
        </div>
      ) : (
        <button
          onClick={() => onActivate(tier)}
          disabled={isCurrent}
          className={`w-full py-2.5 rounded-xl text-[12px] font-semibold transition-all active:scale-[0.97] ${
            isCurrent
              ? 'bg-[rgba(255,255,255,0.06)] text-[rgba(245,240,242,0.3)] cursor-not-allowed'
              : 'btn-main text-white'
          }`}
        >
          {isCurrent ? L('✓ 已开通', '✓ Active') : L('立即开通', 'Activate')}
        </button>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  主组件
// ═══════════════════════════════════════════════════════════

export default function RechargePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromProfile = location.state?.from === 'profile'

  // ── 从全局 AppContext 读取（本页在 Layout 路由外）────────
  // TODO: 接入真实用户账户 API 后，此处改为 API 请求状态
  const { diamonds, setDiamonds, userLevel, setUserLevel } = useApp()
  const L = useL()
  const DIAMOND_TIERS = getDIAMOND_TIERS(L)
  const MEMBER_TIERS = getMEMBER_TIERS(L)
  const localizedUserLevel = getLocalizedMemberLevel(userLevel, L)

  // ── 充值处理 ─────────────────────────────────────────────
  // TODO: 替换为真实支付 API（/api/payment/recharge）
  const handleRecharge = (tier) => {
    setDiamonds((prev) => prev + tier.diamonds)
    alert(L(`✅ 充值成功！\n+${tier.label} 已到账，当前余额 💎 ${diamonds + tier.diamonds}`, `✅ Top up successful!\n+${tier.label} credited, balance: 💎 ${diamonds + tier.diamonds}`))
  }

  // ── 开通会员 ─────────────────────────────────────────────
  // TODO: 替换为真实订阅 API（/api/membership/subscribe）
  const handleActivate = (tier) => {
    setUserLevel(tier.value)
    alert(L(`🎉 恭喜开通「${tier.level}」！\n权益已立即生效，享受你的专属体验～`, `🎉 ${tier.level} activated!\nBenefits are now active. Enjoy your exclusive experience!`))
  }

  return (
    <div className="min-h-screen bg-[#050305] flex justify-center">
      <div className={`w-full ${PHONE_W} bg-app-bg min-h-screen flex flex-col`}>

        {/* ── 顶部栏 ── */}
        <header
          className="sticky top-0 z-40 h-14 px-4 flex items-center gap-3"
          style={{ background: 'rgba(12,10,12,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,154,203,0.08)' }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[rgba(245,240,242,0.6)] hover:text-[#FF9ACB] transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-[13px]">{L('返回', 'Back')}</span>
          </button>
          {/* 居中标题 */}
          <h1
            className="absolute left-1/2 -translate-x-1/2 text-[15px] font-light tracking-[0.1em] select-none"
            style={{
              background: 'linear-gradient(90deg, #FF9ACB 0%, #B380FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {L('充值与会员', 'Top Up & Membership')}
          </h1>
        </header>

        {/* ── 页面内容 ── */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-10 space-y-6">

          {/* 当前余额概览 */}
          <div className="rounded-2xl p-4 card-glow flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg, #1a1028, #251840)' }}
          >
            <div className="flex-1 flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.06)] rounded-full px-3 py-1.5">
                <span className="text-sm">💎</span>
                <span className="text-sm font-bold text-[rgba(245,240,242,0.9)] tabular-nums">{diamonds.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Crown size={13} style={{ color: '#FFD700' }} />
              <span className="text-[11px] font-medium text-[rgba(245,240,242,0.7)]">{localizedUserLevel}</span>
            </div>
          </div>

          {/* ═══ 钻石充值（仅商城入口显示）════════════════════ */}
          {!fromProfile && <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">💎</span>
              <h2 className="text-sm font-semibold text-[rgba(245,240,242,0.85)]">{L('钻石充值', 'Diamond Top Up')}</h2>
              <span className="text-[10px] text-[rgba(245,240,242,0.4)]">{L('实时到账', 'Instant')}</span>
            </div>
            {/* TODO: 接入真实充值 API 后，每个档位价格从后端获取 */}
            <div className="grid grid-cols-2 gap-3">
              {DIAMOND_TIERS.map((tier) => (
                <DiamondCard key={tier.id} tier={tier} onRecharge={handleRecharge} />
              ))}
            </div>
            <p className="text-center text-[10px] text-[rgba(245,240,242,0.25)] mt-3">
              {L('· 钻石为虚拟货币，充值后不支持退款 · 仅供平台内消费使用 ·', '· Diamonds are virtual currency, non-refundable · For in-app use only ·')}
            </p>
          </section>}

          {/* ═══ 会员等级 ════════════════════════════════════ */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Crown size={15} style={{ color: '#FFD700' }} />
              <h2 className="text-sm font-semibold text-[rgba(245,240,242,0.85)]">{L('会员等级', 'Membership Tier')}</h2>
              <span className="text-[10px] text-[rgba(245,240,242,0.4)]">{L('当前：', 'Current: ')}{localizedUserLevel}</span>
            </div>
            {/* TODO: 接入真实会员订阅 API（/api/membership/subscribe） */}
            <div className="space-y-4">
              {MEMBER_TIERS.map((tier) => (
                <MemberCard
                  key={tier.id}
                  tier={tier}
                  currentLevel={userLevel}
                  onActivate={handleActivate}
                />
              ))}
            </div>
            <p className="text-center text-[10px] text-[rgba(245,240,242,0.25)] mt-4 leading-relaxed">
              {L('· 会员功能为演示模式，支付系统尚未接入 ·', '· Membership features are in demo mode ·')}<br />
              {L('· 开通后权益立即生效，随时可取消 ·', '· Benefits activate immediately, cancel anytime ·')}
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
