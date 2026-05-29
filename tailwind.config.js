import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    resolve(__dirname, 'index.html'),
    resolve(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        // 品牌强调色
        rose: {
          accent: '#FF9ACB',
          soft: 'rgba(255,154,203,0.15)',
        },
        purple: {
          accent: '#B380FF',
          soft: 'rgba(179,128,255,0.15)',
        },
        // 深色背景层次
        dark: {
          900: '#0C0A0C',
          800: '#1A1318',
          700: '#231B20',
          card: 'rgba(30,20,25,0.6)',
        },
        background: '#131313',
        surface: '#131313',
        'surface-dim': '#131313',
        'surface-bright': '#393939',
        'surface-container-low': '#1b1b1b',
        'surface-container-lowest': '#0e0e0e',
        'surface-container': '#1f1f1f',
        'surface-container-high': '#2a2a2a',
        'surface-container-highest': '#353535',
        'surface-variant': '#353535',
        'surface-tint': '#ffb0ca',
        primary: '#ffb0ca',
        'primary-container': '#ff479b',
        'primary-fixed': '#ffd9e3',
        'primary-fixed-dim': '#ffb0ca',
        secondary: '#edb1ff',
        'secondary-container': '#6e208c',
        'secondary-fixed': '#f9d8ff',
        'secondary-fixed-dim': '#edb1ff',
        tertiary: '#d7bee2',
        'tertiary-container': '#9f89aa',
        outline: '#a98892',
        'outline-variant': '#5a3f48',
        error: '#ffb4ab',
        'error-container': '#93000a',
        'on-background': '#e2e2e2',
        'on-surface': '#e2e2e2',
        'on-surface-variant': '#e2bdc7',
        'on-primary': '#640035',
        'on-primary-container': '#58002e',
        'on-secondary': '#520070',
        'on-secondary-container': '#e498ff',
        'on-error': '#690005',
        'on-error-container': '#ffdad6',
      },
      fontFamily: {
        'display-lg': ['Inter', 'sans-serif'],
        'chinese-sub': ['Inter', 'sans-serif'],
        'body-sm': ['Inter', 'sans-serif'],
        'body-lg': ['Inter', 'sans-serif'],
        'headline-md': ['Inter', 'sans-serif'],
        'label-caps': ['Inter', 'sans-serif'],
      },
      spacing: {
        'stack-lg': '32px',
        'stack-md': '16px',
        'stack-sm': '8px',
        gutter: '16px',
        'container-margin': '24px',
        'section-gap': '48px',
      },
      fontSize: {
        'display-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      keyframes: {
        // 角色头像呼吸动画
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.95' },
          '50%':       { transform: 'scale(1.03)', opacity: '1' },
        },
        // 点击头像脉冲放大
        avatarPop: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
        // 淡入上移
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        // 设备通知浮现
        notifIn: {
          '0%':   { opacity: '0', transform: 'translateY(6px) scale(0.95)' },
          '20%':  { opacity: '1', transform: 'translateY(0) scale(1)' },
          '80%':  { opacity: '1' },
          '100%': { opacity: '0' },
        },
        // 语音波形跳动
        waveBar: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%':      { transform: 'scaleY(1)' },
        },
        // 心形飘落
        heartFall: {
          '0%':   { transform: 'translateY(-20px) rotate(var(--rot, 0deg))', opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(var(--rot, 30deg))', opacity: '0' },
        },
        // 温度条填充
        barGlow: {
          '0%, 100%': { boxShadow: '0 0 6px rgba(255,154,203,0.4)' },
          '50%':      { boxShadow: '0 0 14px rgba(255,154,203,0.8)' },
        },
        subtlePulse: {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.85' },
        },
        neonPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255, 71, 155, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 71, 155, 0.5)' },
        },
        scan: {
          '0%': { top: '10%', opacity: '0' },
          '20%': { opacity: '1' },
          '80%': { opacity: '1' },
          '100%': { top: '90%', opacity: '0' },
        },
      },
      animation: {
        breathe:     'breathe 3s ease-in-out infinite',
        avatarPop:   'avatarPop 0.3s ease-out',
        fadeUp:      'fadeUp 0.35s ease-out',
        notifIn:     'notifIn 1.2s ease-out forwards',
        waveBar1:    'waveBar 0.7s ease-in-out infinite',
        waveBar2:    'waveBar 0.7s ease-in-out 0.12s infinite',
        waveBar3:    'waveBar 0.7s ease-in-out 0.24s infinite',
        waveBar4:    'waveBar 0.7s ease-in-out 0.36s infinite',
        waveBar5:    'waveBar 0.7s ease-in-out 0.48s infinite',
        heartFall:   'heartFall var(--dur, 3s) ease-in forwards',
        barGlow:     'barGlow 2s ease-in-out infinite',
        subtlePulse: 'subtlePulse 3s infinite ease-in-out',
        neonPulse:   'neonPulse 3s infinite ease-in-out',
        scan:        'scan 3s infinite linear',
      },
      backgroundImage: {
        // App 主背景
        'app-bg': 'radial-gradient(ellipse at 60% 20%, #2a1422 0%, #0C0A0C 60%, #0e0c14 100%)',
        'cyber-gradient': 'linear-gradient(135deg, #0D0118 0%, #000000 100%)',
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
}
