import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Activity, Pause, Play, ChevronDown } from 'lucide-react'
import { useL } from '../i18n/useL'

// 全屏播放器，无底部导航
export default function PlayerPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const L = useL()
  const [isPlaying, setIsPlaying] = useState(true)

  const routeScript = location.state?.script
  const title = routeScript?.title || L('午夜调教：主人的失控', 'Midnight Session: Losing Control')
  const modeLabel = routeScript?.intensity || L('默认模式', 'Default Mode')

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0B060C] text-white flex flex-col justify-between overflow-hidden"
      onDoubleClick={() => navigate(-1)}
    >
      {/* 顶部信息 */}
      <div className="p-6 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <div className="text-[10px] text-[#FF7DAF] font-mono tracking-widest animate-pulse">
            {location.state?.randomGenerated ? 'RANDOM_READY' : 'LINK_ACTIVE'}
          </div>
          <h2 className="text-sm font-bold text-[#F9EDF5] mt-1">{title}</h2>
          <p className="text-[11px] text-[#9B859D] mt-1">{modeLabel}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-white/50 bg-black/50 p-2 rounded-full active:scale-90 transition-transform"
        >
          <ChevronDown size={20} />
        </button>
      </div>

      {/* 中心可视化 */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className={`w-48 h-48 rounded-full border border-[#FF7DAF]/30 flex items-center justify-center ${
            isPlaying ? 'animate-pulse' : ''
          }`}
        >
          <Activity size={60} className="text-[#FF7DAF]" />
        </div>
      </div>

      {/* 控制区（双击整屏也可返回，提示文字） */}
      <div className="p-8 pb-12 bg-black/50">
        <p className="text-center text-[10px] text-white/20 mb-6">{L('双击屏幕退出', 'Double-tap to Exit')}</p>
        <div className="flex items-center justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying) }}
            className="w-20 h-20 bg-gradient-to-r from-[#FF7DAF] to-[#A87CFF] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,125,175,0.4)] active:scale-90 transition-transform"
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </button>
        </div>
      </div>
    </div>
  )
}
