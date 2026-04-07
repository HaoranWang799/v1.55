/**
 * Layout.jsx — 底部导航布局容器 v4
 *
 * 变更（v4）：
 *   • 货币与会员状态从 AppContext 读取（不再使用本地 useState）
 *   • Outlet context 新增 userLevel / setUserLevel，供商城等子页面使用
 *
 * 变更（v3）：
 *   • 移除顶部通栏中的货币显示（💰💎）
 *
 * TODO: 替换为全局状态管理（Zustand / Redux）
 * TODO: 添加设备蓝牙连接状态到顶部栏右侧
 * TODO: 接入用户账户 API 实现真实余额同步
 */
import { useEffect, useLayoutEffect, useRef } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Home, ShoppingBag, MessageCircle, BarChart2, User } from 'lucide-react'
import { useApp } from '../context/AppContext'

const NAV_ITEMS = {
  zh: [
    { to: '/community', Icon: MessageCircle, label: '社区'    },
    { to: '/shop',      Icon: ShoppingBag,   label: '商城'    },
    { to: '/home',      Icon: Home,          label: '首页'    },
    { to: '/health',    Icon: BarChart2,     label: '健康数据' },
    { to: '/profile',   Icon: User,          label: '我的'    },
  ],
  en: [
    { to: '/community', Icon: MessageCircle, label: 'Community' },
    { to: '/shop',      Icon: ShoppingBag,   label: 'Shop'      },
    { to: '/home',      Icon: Home,          label: 'Home'      },
    { to: '/health',    Icon: BarChart2,     label: 'Health'    },
    { to: '/profile',   Icon: User,          label: 'Me'        },
  ],
}

const PHONE_W = 'max-w-[430px]'
const ROUTE_SCROLL_STORAGE_KEY = 'app_route_scroll_positions'

function readStoredScrollPositions() {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.sessionStorage.getItem(ROUTE_SCROLL_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeStoredScrollPositions(positions) {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(ROUTE_SCROLL_STORAGE_KEY, JSON.stringify(positions))
  } catch {
    // ignore storage failures
  }
}

export default function Layout() {
  // ── 从全局 AppContext 读取货币与会员状态 ─────────────────
  // TODO: AppContext 内部已标注真实 API 接入位置
  const { coins, setCoins, diamonds, setDiamonds, userLevel, setUserLevel, lang } = useApp()
  const location = useLocation()
  const mainRef = useRef(null)
  const scrollPositionsRef = useRef(readStoredScrollPositions())

  useEffect(() => {
    const mainEl = mainRef.current
    if (!mainEl) return undefined

    const handleScroll = () => {
      scrollPositionsRef.current = {
        ...scrollPositionsRef.current,
        [location.pathname]: mainEl.scrollTop,
      }
      writeStoredScrollPositions(scrollPositionsRef.current)
    }

    handleScroll()
    mainEl.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      mainEl.removeEventListener('scroll', handleScroll)
      handleScroll()
    }
  }, [location.pathname])

  useLayoutEffect(() => {
    const mainEl = mainRef.current
    if (!mainEl) return

    const nextTop = scrollPositionsRef.current[location.pathname] ?? 0
    mainEl.scrollTop = nextTop
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[#050305] flex justify-center">
      <div className={`relative flex flex-col w-full ${PHONE_W} bg-app-bg min-h-screen`}>

        {/* ── 固定顶部通栏（仅 App 名称） ── */}
        <header
          className={`
            fixed top-0 left-1/2 -translate-x-1/2
            w-full ${PHONE_W} z-40 h-14
            bg-[rgba(12,10,12,0.88)] backdrop-blur-md
            border-b border-[rgba(255,154,203,0.08)]
            flex items-center px-4
          `}
        >
          {/* App 名称 — 玫瑰色渐变 */}
          <span
            className="text-[15px] font-light tracking-[0.18em] select-none"
            style={{
              background: 'linear-gradient(90deg, #FF9ACB 0%, #B380FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {lang === 'en' ? 'YourHer' : '你的她'}
          </span>
        </header>

        {/* ── 内容区 ── */}
        <main ref={mainRef} className="flex-1 overflow-y-auto pt-14 pb-16">
          {/*
           * 将货币与会员状态下发给所有子页面
           * 商城 / 充值页面通过 useOutletContext() 接收
           */}
          <Outlet context={{ coins, setCoins, diamonds, setDiamonds, userLevel, setUserLevel }} />
        </main>

        {/* ── 固定底部导航栏 ── */}
        <nav
          className={`
            fixed bottom-0 left-1/2 -translate-x-1/2
            w-full ${PHONE_W}
            bg-[rgba(14,10,12,0.92)] backdrop-blur-md
            border-t border-[rgba(255,154,203,0.12)]
            z-50
          `}
        >
          <ul className="flex items-center justify-around h-16 px-2">
            {(NAV_ITEMS[lang] || NAV_ITEMS.zh).map(({ to, Icon, label }) => (
              <li key={to} className="flex-1">
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-0.5 py-2 w-full transition-colors duration-200 ${
                      isActive
                        ? 'text-[#FF9ACB]'
                        : 'text-[rgba(245,240,242,0.45)] hover:text-[rgba(245,240,242,0.75)]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={22}
                        strokeWidth={isActive ? 2.2 : 1.6}
                        className="transition-all duration-200"
                      />
                      <span className="text-[9px] sm:text-[10px] font-medium tracking-wide max-w-full truncate px-0.5">
                        {label}
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

      </div>
    </div>
  )
}
