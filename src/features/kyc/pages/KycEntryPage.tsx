import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useL } from '../../../i18n/useL'
import KycProgress, { KycTopBar } from '../components/KycProgress'

export default function KycEntryPage() {
  const navigate = useNavigate()
  const L = useL()
  const [showWhy, setShowWhy] = useState(false)

  return (
    <div className="relative mx-auto min-h-screen max-w-[480px] overflow-hidden bg-background font-body-sm text-on-surface shadow-2xl shadow-black/50">
      <KycTopBar onBack={() => navigate('/kyc')} />
      <KycProgress currentStep={1} />

      <main className="flex flex-col gap-stack-lg px-container-margin py-stack-lg pb-28">
        <div className="flex flex-col gap-stack-sm text-center">
          <div className="mb-2 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-high px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-primary-container shadow-[0_0_6px_rgba(255,71,155,0.6)]" />
              <span className="font-label-caps text-label-caps text-on-surface-variant">{L('第 1 步 / 共 3 步 · 资格确认', 'Step 1 of 3 · Eligibility')}</span>
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface">{L('成人访问验证', 'Adult Access Verification')}</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            {L('进入沉浸式功能前，我们需要确认您已年满 18 岁且符合使用资格。', 'Before entering immersive features, we need to confirm you are 18+ and legally eligible to use this service.')}
          </p>
          <p className="mt-2 font-chinese-sub text-chinese-sub text-outline-variant">{L('进入沉浸式功能前，请先完成成人身份验证。', 'Please complete identity verification before accessing immersive features.')}</p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center space-y-stack-md rounded-xl border border-white/10 bg-cyber-gradient p-8 shadow-[0_0_20px_0_rgba(255,45,149,0.3)]">
          <div className="absolute -top-6 rounded-full border border-white/10 bg-[#0D0118] p-3 shadow-lg">
            <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              security
            </span>
          </div>
          <div className="mt-4 flex h-24 w-24 items-center justify-center rounded-full border border-primary/30 bg-primary-container/10">
            <span className="font-display-lg text-display-lg font-black tracking-tighter text-primary">18+</span>
          </div>
          <div className="mt-4 w-full space-y-stack-sm">
            <div className="flex items-start space-x-3 rounded-lg border border-white/5 bg-surface-container-low p-3">
              <span className="material-symbols-outlined text-secondary">verified_user</span>
              <div>
                <p className="font-headline-md text-body-sm font-semibold text-on-surface">{L('仅限 18+', '18+ Only')}</p>
                <p className="font-body-sm text-chinese-sub text-on-surface-variant">{L('限制级内容访问', 'Restricted access content')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 rounded-lg border border-white/5 bg-surface-container-low p-3">
              <span className="material-symbols-outlined text-secondary">lock</span>
              <div>
                <p className="font-headline-md text-body-sm font-semibold text-on-surface">{L('私密 & 安全', 'Private & Secure')}</p>
                <p className="font-body-sm text-chinese-sub text-on-surface-variant">{L('数据本地加密', 'Data encrypted locally')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 rounded-lg border border-white/5 bg-surface-container-low p-3">
              <span className="material-symbols-outlined text-secondary">gavel</span>
              <div>
                <p className="font-headline-md text-body-sm font-semibold text-on-surface">{L('合规要求', 'Compliance Required')}</p>
                <p className="font-body-sm text-chinese-sub text-on-surface-variant">{L('严格遵守准则', 'Adherence to strict guidelines')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col space-y-stack-sm">
          <button
            type="button"
            onClick={() => navigate('/kyc/identity')}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-[#FF2D95] to-[#9D50BB] py-4 font-headline-md text-headline-md text-on-primary transition-all hover:opacity-90 hover:shadow-[0_0_15px_rgba(255,45,149,0.5)] active:scale-95"
          >
            <span>{L('我年满 18 岁 · 开始验证', 'I am 18+ · Start Verification')}</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>

          <div className="flex items-center justify-center gap-4 rounded-xl border border-white/5 bg-surface-container-low px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-secondary">encrypted</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant">{L('加密审核', 'Encrypted review')}</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-secondary">schedule</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant">{L('2–5 分钟', '2–5 min')}</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-secondary">auto_delete</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant">{L('审核后删除文件', 'Files deleted after review')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowWhy(!showWhy)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/50 bg-transparent py-2.5 font-body-sm text-body-sm text-secondary transition-all hover:bg-white/5 active:scale-95"
          >
            <span>{L('了解为何需要验证', 'Learn Why Verification Is Required')}</span>
            <span className={`material-symbols-outlined text-[16px] transition-transform ${showWhy ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
        </div>

        {showWhy && (
          <div className="w-full space-y-stack-sm rounded-xl border border-outline-variant/20 bg-surface-container-low p-5 animate-fadeUp">
            <h3 className="font-headline-md text-body-lg text-on-surface">{L('为什么需要验证', 'Why verification matters')}</h3>
            <ul className="space-y-stack-sm">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined mt-0.5 text-[16px] text-primary">gavel</span>
                <div>
                  <p className="font-body-sm text-body-sm font-semibold text-on-surface">{L('法律合规', 'Legal Compliance')}</p>
                  <p className="font-body-sm text-chinese-sub text-on-surface-variant">{L('许多司法管辖区要求面向成人的平台进行年龄验证。', 'Many jurisdictions require age verification for adult-oriented platforms.')}</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined mt-0.5 text-[16px] text-primary">security</span>
                <div>
                  <p className="font-body-sm text-body-sm font-semibold text-on-surface">{L('社区安全', 'Community Safety')}</p>
                  <p className="font-body-sm text-chinese-sub text-on-surface-variant">{L('保护未成年人免受不当内容侵害是我们的首要任务。', 'Protecting minors from accessing inappropriate content is our top priority.')}</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined mt-0.5 text-[16px] text-primary">verified_user</span>
                <div>
                  <p className="font-body-sm text-body-sm font-semibold text-on-surface">{L('完整功能访问', 'Full Feature Access')}</p>
                  <p className="font-body-sm text-chinese-sub text-on-surface-variant">{L('已验证账户可解锁所有沉浸式 AI 伴侣功能。', 'Verified accounts unlock all immersive AI companion capabilities.')}</p>
                </div>
              </li>
            </ul>
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-[80%] py-4 text-center">
        <p className="font-chinese-sub text-chinese-sub text-outline-variant">
          {L('继续即表示您同意我们的', 'By proceeding, you agree to our')}{' '}
          <a href="#" className="text-secondary/70 underline hover:text-secondary">{L('服务条款', 'Terms of Service')}</a>{' '}
          {L('并确认已知晓我们的', 'and acknowledge our')}{' '}
          <a href="#" className="text-secondary/70 underline hover:text-secondary">{L('隐私政策', 'Privacy Policy')}</a>
          {L('。验证数据将安全处理。', '. Verification data is handled securely.')}
        </p>
      </footer>
    </div>
  )
}
