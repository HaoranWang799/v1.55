/**
 * ShopPage.jsx — 商城 v4
 *
 * 变更（v4）：
 *   • 移除顶部会员等级文字，充值按钮加 👑 图标，点击进入充值/会员页
 *   • 各横向专区卡片扩展至 5-6 个
 *   • 删除"付费内容专区"整体区块（含普通模板/高级模板/订阅会员）
 *   • 新增"独家定制"专区：多模态角标（🎬🎙️）+ desc 强调语音/视频互动
 *
 * 变更（v3）：
 *   • 移除顶部分类标签；顶部货币 + 充值按钮
 *   • SectionCard (w-40)：原价/会员价对比 + 用户评价
 *   • 购买逻辑感知会员等级
 *
 * TODO: 替换为真实商品 API（/api/shop/templates）
 * TODO: 替换广告位为真实激励视频 SDK（AdMob / Unity Ads）
 * TODO: 接入真实支付宝 / 微信 / Stripe 支付
 */
import { useState, useRef, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { X, Play, Crown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useL } from '../i18n/useL'

// 卡片封面使用视频的剧本 ID（视频文件放于 public/videos/{id}.mp4）
// 包含：智能推荐区 'boss' + 官方更新区全部 6 张（o1–o6）
// 若对应视频文件不存在，会自动回退到图片/emoji，不报错
const CARD_VIDEO_IDS = ['boss', 'o1', 'o2']

// ═══════════════════════════════════════════════════════════
//  静态数据（未来替换为 API）
// ═══════════════════════════════════════════════════════════

// 智能推荐
// TODO: 替换为真实个性化算法 API（/api/shop/recommend）
const RECOMMENDED = [
  {
    // 视频封面：/videos/boss.mp4（放置于 public/videos/）
    id: 'boss', emoji: '👩‍💼', coverImage: '', bgFrom: '#2a1020', bgTo: '#4a1535',
    title: '深夜办公室·女上司', rating: 4.5, downloads: '2.3万',
    device: '适配 Toy X',
    price: { type: 'coins', amount: 1280, memberAmount: 1024, label: '💰 1,280' },
  },
  {
    id: 'r2', emoji: '🌸', coverImage: '', bgFrom: '#0f1a2a', bgTo: '#152040',
    title: '夏日宿舍·温柔学妹', rating: 4.8, downloads: '5.1万',
    device: '适配 Toy X / Pro',
    price: { type: 'free', label: '免费' },
  },
  {
    id: 'r3', emoji: '🌙', coverImage: '', bgFrom: '#12102a', bgTo: '#201848',
    title: '深夜阳台·神秘邻居', rating: 4.2, downloads: '1.8万',
    device: '适配 Toy Pro',
    price: { type: 'diamonds', amount: 50, memberAmount: 40, label: '💎 50' },
  },
]

// ── 官方更新专区（6 张）────────────────────────────────────
// TODO: 替换为 /api/shop/official?limit=10
const OFFICIAL_UPDATES = [
  {
    id: 'o1', emoji: '👩‍💼', bgFrom: '#2a1020', bgTo: '#4a1535',
    title: '冷感女上司·深夜版', desc: '沉浸式体验', rating: 4.9, reviews: '3.1k',
    originalPriceLabel: '💎 80', memberPriceLabel: '💎 64',
    review: '沉浸感拉满，剧情太真实！',
    price: { type: 'diamonds', amount: 80, memberAmount: 64, label: '💎 80' },
  },
  {
    id: 'o2', emoji: '🌸', bgFrom: '#0f1a2a', bgTo: '#152040',
    title: '温柔学妹·宿舍私语', desc: '多结局剧情', rating: 4.7, reviews: '2.4k',
    originalPriceLabel: null, memberPriceLabel: null,
    review: '每条结局都好惊喜！',
    price: { type: 'free', label: '免费' },
  },
  {
    id: 'o3', emoji: '👩‍🏫', bgFrom: '#1a1028', bgTo: '#2a1840',
    title: '知性女老师·放学后', desc: '全新语音包', rating: 4.6, reviews: '1.8k',
    originalPriceLabel: '💰 980', memberPriceLabel: '💰 784',
    review: '配音声线绝了，超温柔！',
    price: { type: 'coins', amount: 980, memberAmount: 784, label: '💰 980' },
  },
  {
    id: 'o4', emoji: '🌙', bgFrom: '#12102a', bgTo: '#201848',
    title: '神秘邻居·月夜偶遇', desc: '剧情新章', rating: 4.5, reviews: '1.2k',
    originalPriceLabel: '💎 60', memberPriceLabel: '💎 48',
    review: '每次结局都不同，太上头！',
    price: { type: 'diamonds', amount: 60, memberAmount: 48, label: '💎 60' },
  },
  {
    id: 'o5', emoji: '🦊', bgFrom: '#2a1520', bgTo: '#401028',
    title: '妖狐千年·今夜人间', desc: '古风新作', rating: 4.8, reviews: '2.0k',
    originalPriceLabel: '💰 1200', memberPriceLabel: '💰 960',
    review: '古风剧情一绝，BGM 超美！',
    price: { type: 'coins', amount: 1200, memberAmount: 960, label: '💰 1,200' },
  },
  {
    id: 'o6', emoji: '🏝️', bgFrom: '#0a2020', bgTo: '#103030',
    title: '热带岛屿·迷失假期', desc: '夏日限定', rating: 4.4, reviews: '987',
    originalPriceLabel: null, memberPriceLabel: null,
    review: '夏天就该看这个，氛围感绝！',
    price: { type: 'free', label: '免费' },
  },
]

// ── 免费专区（6 张）────────────────────────────────────────
// TODO: 替换为 /api/shop/free?limit=10
const FREE_SECTION_CARDS = [
  {
    id: 'fs1', emoji: '✨', bgFrom: '#181828', bgTo: '#141020',
    title: '初心模板', desc: '轻柔入门首选', rating: 4.3, reviews: '2.1k',
    originalPriceLabel: null, memberPriceLabel: null,
    review: '新手必备，超好上手！',
    price: { type: 'free', label: '免费' },
  },
  {
    id: 'fs2', emoji: '🌺', bgFrom: '#1a2818', bgTo: '#101810',
    title: '温柔基础版', desc: '放松氛围', rating: 4.4, reviews: '1.8k',
    originalPriceLabel: null, memberPriceLabel: null,
    review: '放松效果超好，每晚必用！',
    price: { type: 'free', label: '免费' },
  },
  {
    id: 'fs3', emoji: '💫', bgFrom: '#181828', bgTo: '#101020',
    title: '轻体验入门', desc: '渐进式互动', rating: 4.2, reviews: '1.5k',
    originalPriceLabel: null, memberPriceLabel: null,
    review: '节奏刚刚好，不会太快！',
    price: { type: 'free', label: '免费' },
  },
  {
    id: 'fs4', emoji: '🌊', bgFrom: '#0a1a2a', bgTo: '#0a1020',
    title: '海浪呼吸·冥想版', desc: '身心放松', rating: 4.5, reviews: '1.3k',
    originalPriceLabel: null, memberPriceLabel: null,
    review: '听着就很舒服，入睡神器！',
    price: { type: 'free', label: '免费' },
  },
  {
    id: 'fs5', emoji: '🌿', bgFrom: '#102018', bgTo: '#081410',
    title: '森林呼吸·自然版', desc: '环境音效', rating: 4.1, reviews: '980',
    originalPriceLabel: null, memberPriceLabel: null,
    review: '大自然的感觉，太解压了！',
    price: { type: 'free', label: '免费' },
  },
  {
    id: 'fs6', emoji: '🌙', bgFrom: '#101028', bgTo: '#080820',
    title: '深夜星空·静谧版', desc: '睡前陪伴', rating: 4.6, reviews: '2.3k',
    originalPriceLabel: null, memberPriceLabel: null,
    review: '每次用完秒睡，真的有用！',
    price: { type: 'free', label: '免费' },
  },
]

// ── 用户二创专区（6 张）────────────────────────────────────
// TODO: 替换为 /api/shop/user-creations?limit=10
const USER_CREATIONS = [
  {
    id: 'u1', emoji: '🧝‍♀️', bgFrom: '#1a0a30', bgTo: '#2a1040',
    title: '暗夜精灵·魅影森林', desc: '氛围感极强', rating: 4.5, reviews: '876',
    author: 'by 创作家Mia',
    originalPriceLabel: null, memberPriceLabel: null,
    review: '氛围感太绝了，强烈推荐！',
    price: { type: 'free', label: '免费' },
  },
  {
    id: 'u2', emoji: '🦊', bgFrom: '#2a1020', bgTo: '#1a0d16',
    title: '狐妖·千年等待', desc: '情感向', rating: 4.3, reviews: '512',
    author: 'by 夜行狐',
    originalPriceLabel: '💰 280', memberPriceLabel: '💰 224',
    review: '剧情感人，哭了好几次...',
    price: { type: 'coins', amount: 280, memberAmount: 224, label: '💰 280' },
  },
  {
    id: 'u3', emoji: '🌙', bgFrom: '#12102a', bgTo: '#0c0a1e',
    title: '月下神女·竹林幽境', desc: '古风沉浸', rating: 4.4, reviews: '634',
    author: 'by 小野猫',
    originalPriceLabel: null, memberPriceLabel: null,
    review: '背景音乐 yyds，古风绝！',
    price: { type: 'free', label: '免费' },
  },
  {
    id: 'u4', emoji: '🐉', bgFrom: '#0a1a2a', bgTo: '#152840',
    title: '龙族觉醒·星辰之约', desc: '史诗向', rating: 4.6, reviews: '723',
    author: 'by DragonFly',
    originalPriceLabel: '💎 40', memberPriceLabel: '💎 32',
    review: '史诗感十足，就像在演电影！',
    price: { type: 'diamonds', amount: 40, memberAmount: 32, label: '💎 40' },
  },
  {
    id: 'u5', emoji: '🌸', bgFrom: '#280a1a', bgTo: '#1a0810',
    title: '樱花物语·告白之春', desc: '青春校园', rating: 4.2, reviews: '398',
    author: 'by 春日绘',
    originalPriceLabel: null, memberPriceLabel: null,
    review: '好青春好甜！回到了高中时代。',
    price: { type: 'free', label: '免费' },
  },
  {
    id: 'u6', emoji: '🎭', bgFrom: '#1a1020', bgTo: '#281830',
    title: '面具舞会·午夜迷城', desc: '悬疑剧情', rating: 4.7, reviews: '1.1k',
    author: 'by 黑羽笔',
    originalPriceLabel: '💰 480', memberPriceLabel: '💰 384',
    review: '反转太多了，每次都猜不到！',
    price: { type: 'coins', amount: 480, memberAmount: 384, label: '💰 480' },
  },
]

// ── 热门榜单专区（6 张）────────────────────────────────────
// TODO: 替换为 /api/shop/hot?sortBy=downloads&limit=10
const HOT_LIST = [
  {
    id: 'h1', emoji: '🔥', bgFrom: '#2a1020', bgTo: '#3a0d28',
    title: '温柔学妹·周末宿舍', desc: '本月最热', rating: 4.9, reviews: '8.2k',
    downloads: '5.1万',
    originalPriceLabel: null, memberPriceLabel: null,
    review: '完全停不下来，反复回味！',
    price: { type: 'free', label: '免费' },
  },
  {
    id: 'h2', emoji: '👑', bgFrom: '#251840', bgTo: '#3a2060',
    title: '独家定制·女神降临', desc: '现象级体验', rating: 4.8, reviews: '5.6k',
    downloads: '3.8万',
    originalPriceLabel: '💎 120', memberPriceLabel: '💎 96',
    review: '值！完全超出预期的体验。',
    price: { type: 'diamonds', amount: 120, memberAmount: 96, label: '💎 120' },
  },
  {
    id: 'h3', emoji: '🌸', bgFrom: '#0f2a1a', bgTo: '#0a1a10',
    title: '阳台邂逅·月夜情话', desc: '情感共鸣', rating: 4.7, reviews: '4.1k',
    downloads: '2.9万',
    originalPriceLabel: '💰 680', memberPriceLabel: '💰 544',
    review: '每一句话都戳到心窝了。',
    price: { type: 'coins', amount: 680, memberAmount: 544, label: '💰 680' },
  },
  {
    id: 'h4', emoji: '⚡', bgFrom: '#1a1a08', bgTo: '#282810',
    title: '电竞女神·赛后独处', desc: '反差萌', rating: 4.6, reviews: '3.3k',
    downloads: '2.2万',
    originalPriceLabel: '💎 80', memberPriceLabel: '💎 64',
    review: '反差感真的心跳加速！',
    price: { type: 'diamonds', amount: 80, memberAmount: 64, label: '💎 80' },
  },
  {
    id: 'h5', emoji: '🍵', bgFrom: '#0a1a10', bgTo: '#0a120a',
    title: '茶馆掌柜·江南水乡', desc: '古风日常', rating: 4.5, reviews: '2.8k',
    downloads: '1.9万',
    originalPriceLabel: null, memberPriceLabel: null,
    review: '治愈感拉满，听完心情超好！',
    price: { type: 'free', label: '免费' },
  },
  {
    id: 'h6', emoji: '🎸', bgFrom: '#1a1008', bgTo: '#201808',
    title: '摇滚女孩·台下独白', desc: '酷飒风格', rating: 4.4, reviews: '1.9k',
    downloads: '1.4万',
    originalPriceLabel: '💰 580', memberPriceLabel: '💰 464',
    review: '她的声音真的炸了，超酷！',
    price: { type: 'coins', amount: 580, memberAmount: 464, label: '💰 580' },
  },
]

// ── 彩虹专区（6 张）────────────────────────────────────────
// TODO: 替换为 /api/shop/rainbow?limit=10
const RAINBOW_LIST = [
  {
    id: 'rb1', emoji: '🌈', bgFrom: '#1a1028', bgTo: '#201840',
    title: '彩虹之约·校园初恋', desc: '温暖治愈', rating: 4.6, reviews: '1.2k',
    originalPriceLabel: null, memberPriceLabel: null,
    review: '温暖到想哭，超级治愈！',
    price: { type: 'free', label: '免费' },
  },
  {
    id: 'rb2', emoji: '💜', bgFrom: '#1a0a30', bgTo: '#2a1040',
    title: '紫色星空·双人共舞', desc: '多元剧情', rating: 4.5, reviews: '967',
    originalPriceLabel: '💰 380', memberPriceLabel: '💰 304',
    review: '尊重每一种爱，很感动！',
    price: { type: 'coins', amount: 380, memberAmount: 304, label: '💰 380' },
  },
  {
    id: 'rb3', emoji: '🦋', bgFrom: '#101825', bgTo: '#0d0b1e',
    title: '蝴蝶花园·自由呼吸', desc: '包容·平等', rating: 4.7, reviews: '1.5k',
    originalPriceLabel: null, memberPriceLabel: null,
    review: '找到了久违的被接纳感。',
    price: { type: 'free', label: '免费' },
  },
  {
    id: 'rb4', emoji: '🌷', bgFrom: '#250a20', bgTo: '#180a18',
    title: '郁金香庭院·雨后', desc: 'BL 温情向', rating: 4.8, reviews: '2.1k',
    originalPriceLabel: '💎 50', memberPriceLabel: '💎 40',
    review: '两个男孩的故事，超级甜！',
    price: { type: 'diamonds', amount: 50, memberAmount: 40, label: '💎 50' },
  },
  {
    id: 'rb5', emoji: '🌻', bgFrom: '#1a1a08', bgTo: '#201808',
    title: '向日葵花田·GL 午后', desc: 'GL 阳光向', rating: 4.6, reviews: '1.8k',
    originalPriceLabel: null, memberPriceLabel: null,
    review: '女孩的友情与爱情，太美了！',
    price: { type: 'free', label: '免费' },
  },
  {
    id: 'rb6', emoji: '🎆', bgFrom: '#200820', bgTo: '#180818',
    title: '烟花夜空·无拘之爱', desc: '群像剧情', rating: 4.5, reviews: '1.1k',
    originalPriceLabel: '💰 480', memberPriceLabel: '💰 384',
    review: '每个角色都有自己的故事！',
    price: { type: 'coins', amount: 480, memberAmount: 384, label: '💰 480' },
  },
]

// ── 独家定制专区（多模态，5 张）─────────────────────────────
// TODO: 替换为 /api/shop/exclusive?multimodal=true
const EXCLUSIVE_CUSTOM = [
  {
    id: 'ex1', emoji: '👩‍💼', bgFrom: '#2a1020', bgTo: '#4a1535',
    title: 'AI 女上司·深度定制', desc: '支持语音 / 视频互动',
    rating: 4.9, reviews: '2.8k',
    originalPriceLabel: '💎 200', memberPriceLabel: '💎 160',
    review: '这才是真·沉浸！语音太真实了！',
    price: { type: 'diamonds', amount: 200, memberAmount: 160, label: '💎 200' },
  },
  {
    id: 'ex2', emoji: '🧝‍♀️', bgFrom: '#1a0a30', bgTo: '#3a1555',
    title: '暗夜精灵·AI 私人定制', desc: '支持语音 / 视频互动',
    rating: 4.8, reviews: '1.9k',
    originalPriceLabel: '💎 180', memberPriceLabel: '💎 144',
    review: '视频模式完全另一个档次！',
    price: { type: 'diamonds', amount: 180, memberAmount: 144, label: '💎 180' },
  },
  {
    id: 'ex3', emoji: '🏰', bgFrom: '#251840', bgTo: '#3a2560',
    title: '中世纪女王·御用专属', desc: '支持语音 / 视频互动',
    rating: 4.7, reviews: '1.5k',
    originalPriceLabel: '💰 2800', memberPriceLabel: '💰 2240',
    review: '真的以为自己在宫廷里，绝了！',
    price: { type: 'coins', amount: 2800, memberAmount: 2240, label: '💰 2,800' },
  },
  {
    id: 'ex4', emoji: '🦸‍♀️', bgFrom: '#0a1a30', bgTo: '#152545',
    title: '超能英雄·宇宙守护者', desc: '支持语音 / 视频互动',
    rating: 4.8, reviews: '2.1k',
    originalPriceLabel: '💎 220', memberPriceLabel: '💎 176',
    review: 'AI 能实时回应？太厉害了！',
    price: { type: 'diamonds', amount: 220, memberAmount: 176, label: '💎 220' },
  },
  {
    id: 'ex5', emoji: '🌙', bgFrom: '#1a1030', bgTo: '#2a1848',
    title: '月神使者·星辰之约', desc: '支持语音 / 视频互动',
    rating: 4.9, reviews: '3.2k',
    originalPriceLabel: '💎 250', memberPriceLabel: '💎 200',
    review: '定制感极强，每次对话都不同！',
    price: { type: 'diamonds', amount: 250, memberAmount: 200, label: '💎 250' },
  },
]

// 免费内容专区原有数据
const FREE_PACKS = [
  { id: 'f1', emoji: '🎁', title: '新用户礼包 Vol.1', sub: '3个入门场景', badge: '限免' },
  { id: 'f2', emoji: '🌟', title: '热门体验精选',    sub: '本月 TOP5 场景', badge: '限免' },
  { id: 'f3', emoji: '💝', title: '经典回忆录',      sub: '怀旧主题合集', badge: '限免' },
]

const DAILY_FREE = {
  id: 'd1', emoji: '🔥',
  title: '今日限免 · 高峰体验 Pro',
  originalLabel: '💎 80',
  device: '适配 Toy X / Pro',
  downloads: '4.7万',
}

const BASE_TEMPLATES = [
  { id: 'b1', emoji: '✨', title: '初心模板',   desc: '轻柔入门，适合新用户' },
  { id: 'b2', emoji: '💫', title: '轻体验入门', desc: '渐进式互动，温和节奏' },
  { id: 'b3', emoji: '🌺', title: '温柔基础版', desc: '柔和场景，放松首选' },
]

// ═══════════════════════════════════════════════════════════
//  English translations for data items
// ═══════════════════════════════════════════════════════════
const DATA_EN = {
  boss: { title: 'Late Night Office · Boss Lady', downloads: '23K', device: 'For Toy X' },
  r2: { title: 'Summer Dorm · Sweet Junior', downloads: '51K', device: 'For Toy X / Pro' },
  r3: { title: 'Midnight Balcony · Mystery Neighbor', downloads: '18K', device: 'For Toy Pro' },
  o1: { title: 'Cold Boss Lady · Midnight', desc: 'Immersive', review: 'So immersive and realistic!' },
  o2: { title: 'Sweet Junior · Dorm Whispers', desc: 'Multi-ending', review: 'Every ending is a surprise!' },
  o3: { title: 'Elegant Teacher · After School', desc: 'New Voice Pack', review: 'Amazing voice acting, so gentle!' },
  o4: { title: 'Mystery Neighbor · Moonlit Encounter', desc: 'New Chapter', review: 'Different ending every time!' },
  o5: { title: 'Fox Spirit · Tonight on Earth', desc: 'Period Drama', review: 'Stunning period drama, beautiful BGM!' },
  o6: { title: 'Tropical Island · Lost Holiday', desc: 'Summer Limited', review: 'Perfect for summer vibes!' },
  fs1: { title: 'Beginner Template', desc: 'Gentle first choice', review: 'A must for beginners!' },
  fs2: { title: 'Gentle Basic', desc: 'Relaxing vibe', review: 'Super relaxing, use it every night!' },
  fs3: { title: 'Light Experience', desc: 'Progressive', review: 'Perfect pace, not too fast!' },
  fs4: { title: 'Ocean Breath · Meditation', desc: 'Mind & body relax', review: 'So soothing, perfect for sleep!' },
  fs5: { title: 'Forest Breath · Nature', desc: 'Ambient sounds', review: 'Nature vibes, so stress-relieving!' },
  fs6: { title: 'Starry Night · Tranquil', desc: 'Bedtime companion', review: 'Fall asleep instantly, really works!' },
  u1: { title: 'Dark Elf · Shadow Forest', desc: 'Immersive', author: 'by Creator Mia', review: 'Amazing atmosphere, must try!' },
  u2: { title: 'Fox Spirit · Eternal Wait', desc: 'Emotional', author: 'by NightFox', review: 'So touching, cried many times...' },
  u3: { title: 'Moon Goddess · Bamboo Realm', desc: 'Period immersion', author: 'by KittyMeow', review: 'Beautiful BGM, period vibes!' },
  u4: { title: 'Dragon Clan · Starry Pact', desc: 'Epic', author: 'by DragonFly', review: 'So epic, like watching a movie!' },
  u5: { title: 'Cherry Blossom · Spring Confession', desc: 'Campus youth', author: 'by SpringPaint', review: 'So sweet and nostalgic!' },
  u6: { title: 'Masquerade · Midnight Maze', desc: 'Mystery', author: 'by DarkPen', review: 'So many twists, never predictable!' },
  h1: { title: 'Sweet Junior · Weekend Dorm', desc: 'Monthly Top', downloads: '51K', review: 'Absolutely addictive!' },
  h2: { title: 'Exclusive · Goddess Arrives', desc: 'Phenomenal', downloads: '38K', review: 'Worth it! Exceeded expectations.' },
  h3: { title: 'Balcony Meet · Moonlit Whispers', desc: 'Emotional', downloads: '29K', review: 'Every word hits the heart.' },
  h4: { title: 'Esports Queen · After Match', desc: 'Gap Moe', downloads: '22K', review: 'The contrast is heart-racing!' },
  h5: { title: 'Tea House · Jiangnan', desc: 'Period Daily', downloads: '19K', review: 'So healing, instant mood boost!' },
  h6: { title: 'Rock Girl · Backstage', desc: 'Cool Style', downloads: '14K', review: 'Her voice is incredible, so cool!' },
  rb1: { title: 'Rainbow Promise · First Love', desc: 'Warm & Healing', review: 'So warm it brings tears!' },
  rb2: { title: 'Purple Sky · Dance for Two', desc: 'Diverse Story', review: 'Respectful of all love, touching!' },
  rb3: { title: 'Butterfly Garden · Free Breath', desc: 'Inclusive & Equal', review: 'Finally felt accepted.' },
  rb4: { title: 'Tulip Garden · After Rain', desc: 'BL Heartwarming', review: 'Two boys\' story, super sweet!' },
  rb5: { title: 'Sunflower Field · GL Afternoon', desc: 'GL Sunny', review: 'Beautiful friendship and love!' },
  rb6: { title: 'Fireworks Night · Free Love', desc: 'Ensemble Cast', review: 'Every character has their story!' },
  ex1: { title: 'AI Boss Lady · Deep Custom', desc: 'Voice / Video interactive', review: 'True immersion! So realistic!' },
  ex2: { title: 'Dark Elf · AI Custom', desc: 'Voice / Video interactive', review: 'Video mode is next level!' },
  ex3: { title: 'Medieval Queen · Royal', desc: 'Voice / Video interactive', review: 'Felt like royalty, amazing!' },
  ex4: { title: 'Super Hero · Guardian', desc: 'Voice / Video interactive', review: 'Real-time AI response? Incredible!' },
  ex5: { title: 'Moon Emissary · Starry Pact', desc: 'Voice / Video interactive', review: 'Unique every time!' },
  f1: { title: 'New User Pack Vol.1', sub: '3 starter scenes', badge: 'Free' },
  f2: { title: 'Popular Picks', sub: 'Monthly TOP5', badge: 'Free' },
  f3: { title: 'Classic Memories', sub: 'Nostalgia collection', badge: 'Free' },
  d1: { title: 'Daily Free · Peak Experience Pro', device: 'For Toy X / Pro', downloads: '47K' },
  b1: { title: 'Beginner Template', desc: 'Gentle intro for new users' },
  b2: { title: 'Light Experience', desc: 'Progressive, gentle pace' },
  b3: { title: 'Gentle Basic', desc: 'Soft scenes, relaxation first' },
  s1: { title: 'Overtime · Boss\'s Discipline', badge: '🔥 Fire' },
  s2: { title: 'Late Night Dorm · Confession', badge: '💕 Sweet' },
  s3: { title: 'Escape Room · Bound Secrets', badge: '🔒 Restricted' },
  s4: { title: 'Fox Spirit · Soul Enchantment', badge: '🌶 Hot' },
  s5: { title: 'Pool Party · Bikini Trap', badge: '💦 Splash' },
  s6: { title: 'Luxury Hotel · CEO\'s Suite', badge: '👑 Noble' },
  s7: { title: 'Midnight Stream · Off Camera', badge: '🆕 Just In' },
  s8: { title: 'Underground Club · Contract', badge: '🔞 Extreme' },
  s9: { title: 'Queen\'s Throne · Submission', badge: '🔒 Exclusive' },
  s10: { title: 'Masquerade · Double Trap', badge: '🔒 Exclusive' },
  s11: { title: 'Courtesan · Palace Night', badge: '🌸 Period' },
  s12: { title: 'Esports Queen · Off Stage', badge: '🆕 Just In' },
}

// Helper: get English field for data items by id
function te(item, field, lang) {
  if (lang !== 'en') return item[field]
  return DATA_EN[item.id]?.[field] ?? item[field]
}

// ═══════════════════════════════════════════════════════════
//  子组件
// ═══════════════════════════════════════════════════════════

/** 货币 Pill */
function CurrencyPill({ icon, value }) {
  return (
    <div className="flex items-center gap-1 bg-[rgba(255,255,255,0.06)] rounded-full px-2.5 py-1">
      <span className="text-[11px]">{icon}</span>
      <span className="text-[11px] font-medium text-[rgba(245,240,242,0.85)] tabular-nums">
        {value.toLocaleString()}
      </span>
    </div>
  )
}

/** 星级评分（层叠法支持小数） */
function Stars({ rating }) {
  const pct = (rating / 5) * 100
  return (
    <div className="relative inline-flex text-[11px] leading-none">
      <span className="text-[rgba(255,255,255,0.2)]">★★★★★</span>
      <span
        className="absolute inset-0 overflow-hidden text-yellow-400 whitespace-nowrap"
        style={{ width: `${pct}%` }}
      >★★★★★</span>
    </div>
  )
}

/**
 * 推荐模板卡片（封面图 + 暗色蒙层 + 大 emoji 水印）
 * 封面图路径规则：/images/covers/{item.id}.jpg（放置于 public/images/covers/）
 * 图片加载失败时自动回退到渐变色背景 + 大 emoji 水印占位
 */
function RecommendedCard({ item, onBuy, onCardClick }) {
  const { lang } = useApp()
  const L = useL()
  const isVideo = CARD_VIDEO_IDS.includes(item.id)
  const [imgSrc, setImgSrc] = useState(`/images/covers/${item.id}.jpg`)
  const videoRef = useRef(null)

  useEffect(() => {
    if (!isVideo || !videoRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {})
        } else {
          videoRef.current?.pause()
        }
      },
      { threshold: 0.25 }
    )
    observer.observe(videoRef.current)
    return () => observer.disconnect()
  }, [isVideo])

  return (
    <div
      className="relative flex-shrink-0 w-44 h-44 rounded-2xl overflow-hidden card-glow cursor-pointer"
      style={{ background: `linear-gradient(145deg, ${item.bgFrom}, ${item.bgTo})` }}
      onClick={onCardClick}
    >
      {/* 视频封面（文件路径：public/videos/{id}.mp4） */}
      {isVideo && (
        <video
          ref={videoRef}
          loop muted playsInline
          preload="none"
          poster={`/images/covers/${item.id}.jpg`}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={`/videos/${item.id}.mp4`} type="video/mp4" />
        </video>
      )}

      {/* 普通封面图片（非视频卡片，jpg → png → emoji 链式回退） */}
      {!isVideo && imgSrc && (
        <img
          src={imgSrc}
          alt=""
          onError={() => {
            if (imgSrc.endsWith('.jpg')) setImgSrc(`/images/covers/${item.id}.png`)
            else setImgSrc(null)
          }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* 半透明黑色遮罩层（始终显示，提升文字可读性） */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 无封面时（非视频 + 图片加载失败）：大 emoji 水印 */}
      {!isVideo && !imgSrc && (
        <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-20 pointer-events-none select-none">
          {item.emoji}
        </div>
      )}

      {/* 内容层（底部对齐） */}
      <div className="relative z-10 p-3 flex flex-col justify-end h-full">
        <p className="text-xs font-semibold text-white leading-tight mb-1">{te(item, 'title', lang)}</p>
        <div className="flex items-center gap-1.5 mb-1">
          <Stars rating={item.rating} />
          <span className="text-[10px] text-[rgba(245,240,242,0.6)]">{item.rating}</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-[rgba(245,240,242,0.5)] mb-1.5">
          <span>{te(item, 'downloads', lang)} {L('下载', 'downloads')}</span>
          <span>·</span>
          <span>{te(item, 'device', lang)}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onBuy(item) }}
          className={`w-full py-1.5 rounded-lg text-[11px] font-medium transition-all ${
            item.price.type === 'free'
              ? 'bg-[rgba(255,255,255,0.15)] text-white'
              : 'btn-main text-white'
          }`}
        >
          {item.price.type === 'free' ? L('免费', 'Free') : item.price.label}
        </button>
      </div>
    </div>
  )
}

/**
 * 新专区横向滚动卡片 v4（封面图 + 渐变蒙层 + 大 emoji 水印）
 * 封面图路径规则：/images/covers/{item.id}.jpg（放置于 public/images/covers/）
 * 图片加载失败时自动回退到渐变色背景 + 大 emoji 水印占位
 * multimodal 属性：展示 🎬🎙️ 多模态角标
 */
function SectionCard({ item, onBuy, badge, badgeStyle, showAuthor, showDownloads, isMember, isVIP, multimodal }) {
  const { lang } = useApp()
  const L = useL()
  const isFree = item.price.type === 'free'
  const isVideo = CARD_VIDEO_IDS.includes(item.id)
  const [imgSrc, setImgSrc] = useState(`/images/covers/${item.id}.jpg`)
  const videoRef = useRef(null)

  useEffect(() => {
    if (!isVideo || !videoRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {})
        } else {
          videoRef.current?.pause()
        }
      },
      { threshold: 0.25 }
    )
    observer.observe(videoRef.current)
    return () => observer.disconnect()
  }, [isVideo])

  let btnLabel
  if (isFree) {
    btnLabel = L('免费获取', 'Get Free')
  } else if (isVIP) {
    btnLabel = L('会员免费', 'Member Free')
  } else if (isMember && item.memberPriceLabel) {
    btnLabel = item.memberPriceLabel
  } else {
    btnLabel = item.originalPriceLabel || item.price.label
  }

  const btnFree = isFree || isVIP

  return (
    <div
      className="relative flex-shrink-0 w-40 h-60 rounded-2xl overflow-hidden card-glow cursor-pointer"
      style={{ background: `linear-gradient(145deg, ${item.bgFrom}, ${item.bgTo})` }}
      onClick={() => onBuy(item)}
    >
      {/* 视频封面（文件路径：public/videos/{id}.mp4） */}
      {isVideo && (
        <video
          ref={videoRef}
          loop muted playsInline
          preload="none"
          poster={`/images/covers/${item.id}.jpg`}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={`/videos/${item.id}.mp4`} type="video/mp4" />
        </video>
      )}

      {/* 普通封面图片（非视频卡片，jpg → png → emoji 链式回退） */}
      {!isVideo && imgSrc && (
        <img
          src={imgSrc}
          alt=""
          onError={() => {
            if (imgSrc.endsWith('.jpg')) setImgSrc(`/images/covers/${item.id}.png`)
            else setImgSrc(null)
          }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* 半透明黑色遮罩层（始终显示，提升文字可读性） */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 无封面时（非视频 + 图片加载失败）：大 emoji 水印 */}
      {!isVideo && !imgSrc && (
        <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-20 pointer-events-none select-none">
          {item.emoji}
        </div>
      )}

      {/* 主角标（左上角） */}
      {badge && (
        <span className={`absolute top-2 left-2 text-[9px] font-bold rounded-full px-1.5 py-0.5 z-10 ${badgeStyle}`}>
          {badge}
        </span>
      )}

      {/* 多模态角标（右上角） */}
      {multimodal && (
        <span
          className="absolute top-2 right-2 text-[8px] font-bold rounded-full px-1.5 py-0.5 z-10"
          style={{
            background: 'rgba(179,128,255,0.28)',
            color: '#C9A0FF',
            border: '1px solid rgba(179,128,255,0.35)',
          }}
        >
          🎬🎙️
        </span>
      )}

      {/* 内容层（底部对齐） */}
      <div className="relative z-10 p-2.5 flex flex-col justify-end h-full">
        <p className="text-[11px] font-semibold text-white leading-tight line-clamp-2 mb-1">
          {te(item, 'title', lang)}
        </p>
        {item.desc && (
          <p className={`text-[9px] mb-1 ${multimodal ? 'text-[#C9A0FF]' : 'text-[rgba(245,240,242,0.65)]'}`}>
            {te(item, 'desc', lang)}
          </p>
        )}
        <div className="flex items-center gap-1 mb-1">
          <Stars rating={item.rating} />
          <span className="text-[9px] text-[rgba(245,240,242,0.5)]">{item.reviews}</span>
        </div>
        {showAuthor && item.author && (
          <p className="text-[9px] text-[rgba(179,128,255,0.8)] mb-0.5">{te(item, 'author', lang)}</p>
        )}
        {showDownloads && item.downloads && (
          <p className="text-[9px] text-[rgba(245,240,242,0.5)] mb-0.5">↓ {te(item, 'downloads', lang)}</p>
        )}

        {/* 价格对比（仅付费项目显示） */}
        {!isFree && item.originalPriceLabel && (
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[8px] text-[rgba(245,240,242,0.4)] line-through">
              {item.originalPriceLabel}
            </span>
            <div className="flex items-center gap-0.5">
              <Crown size={7} style={{ color: '#FFD700' }} />
              <span className="text-[8px] font-semibold text-[#FF9ACB]">
                {item.memberPriceLabel}
              </span>
            </div>
          </div>
        )}

        {/* 用户评价引用 */}
        {item.review && (
          <p className="text-[8px] italic text-[rgba(245,240,242,0.45)] line-clamp-1 mb-1">
            "{te(item, 'review', lang)}"
          </p>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onBuy(item) }}
          className={`w-full py-1 rounded-lg text-[10px] font-medium transition-all ${
            btnFree
              ? 'bg-[rgba(255,255,255,0.15)] text-white'
              : 'btn-main text-white'
          }`}
        >
          {btnLabel}
        </button>
      </div>
    </div>
  )
}

/** 免费礼包卡片 */
function FreePackCard({ item, onClick }) {
  const { lang } = useApp()
  const L = useL()
  return (
    <div
      className="relative flex-shrink-0 w-32 snap-start rounded-2xl p-3 cursor-pointer card-glow bg-[rgba(30,20,25,0.6)] hover:bg-[rgba(50,30,40,0.7)] transition-colors"
      onClick={onClick}
    >
      <span className="absolute top-2 right-2 bg-[#FF9ACB] text-[9px] font-bold text-[#1a0a12] rounded-full px-1.5 py-0.5">
        {te(item, 'badge', lang)}
      </span>
      <div className="text-2xl mb-2">{item.emoji}</div>
      <p className="text-[11px] font-semibold text-[rgba(245,240,242,0.9)] mb-0.5 leading-tight">{te(item, 'title', lang)}</p>
      <p className="text-[9px] text-[rgba(245,240,242,0.45)] mb-2">{te(item, 'sub', lang)}</p>
      <button className="w-full py-1 rounded-lg text-[10px] font-medium bg-[rgba(255,154,203,0.12)] text-[#FF9ACB] border border-[rgba(255,154,203,0.25)]">
        {L('免费领取', 'Get Free')}
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  沉浸内容库 数据 & 组件
// ═══════════════════════════════════════════════════════════

const SCRIPT_TABS = [
  { id: 'hot',     label: '💘 为你精选', labelEn: '💘 For You' },
  { id: 'popular', label: '💦 热门推荐', labelEn: '💦 Popular' },
  { id: 'new',     label: '🌶 官方上新', labelEn: '🌶 New Releases' },
  { id: 'vip',     label: '🔒 会员专享', labelEn: '🔒 VIP Only' },
]

const SCRIPT_PERSONA_FILTERS = [
  { id: 'all',       label: '全部风格', labelEn: 'All Styles' },
  { id: 'xuemei',    label: '清新陪伴', labelEn: 'Fresh Company' },
  { id: 'classmate', label: '校园氛围', labelEn: 'Campus Vibe' },
  { id: 'banhua',    label: '人气焦点', labelEn: 'Popular' },
  { id: 'boss',      label: '知性上司', labelEn: 'Smart Boss' },
  { id: 'secretary', label: '知性助理', labelEn: 'Smart Assistant' },
  { id: 'nurse',     label: '暖心陪伴', labelEn: 'Warm Care' },
  { id: 'shaofu',    label: '成熟知性', labelEn: 'Mature Elegant' },
  { id: 'neighbor',  label: '邻家妹妹', labelEn: 'Girl Next Door' },
  { id: 'ex',        label: '熟悉旧识', labelEn: 'Old Friend' },
  { id: 'teacher',   label: '气质导师', labelEn: 'Elegant Mentor' },
  { id: 'goddess',   label: '高冷魅力', labelEn: 'Cool Charm' },
  { id: 'wildcat',   label: '俏皮灵动', labelEn: 'Playful Spirit' },
]

const SCRIPT_INTENSITY_FILTERS = [
  { id: 'all',    label: '全部强度', labelEn: 'All Intensity' },
  { id: 'light',  label: '轻度体验', labelEn: 'Light' },
  { id: 'deep',   label: '中度体验', labelEn: 'Medium' },
  { id: 'max',    label: '高强体验', labelEn: 'Intense' },
]

const SCRIPT_DURATION_FILTERS = [
  { id: 'all',  label: '全部时长',  labelEn: 'All Duration' },
  { id: 's',    label: '5-10分钟',  labelEn: '5-10 min' },
  { id: 'm',    label: '10-20分钟', labelEn: '10-20 min' },
  { id: 'l',    label: '20分钟+',   labelEn: '20+ min' },
]

const SCRIPTS = [
  { id: 's1',  emoji: '👩‍💼', bgFrom: '#2a0c18', bgTo: '#4a1230', bgImage: '/images/scripts/s1.jpg',
    title: '深夜加班·女上司的惩罚', persona: 'boss',      intensity: 'deep',  duration: 'm', tab: 'hot',
    rating: 4.9, reviews: '6.3k', badge: '🔥 炸裂', badgeColor: 'bg-[#FF2A6D]/30 text-[#FF7DAF]',
    price: { type: 'diamonds', amount: 80, memberAmount: 64, label: '💎 80' } },
  { id: 's2',  emoji: '🌸', bgFrom: '#0f1a28', bgTo: '#182040', bgImage: '/images/scripts/s2.jpg',
    title: '宿舍深夜·学妹的告白', persona: 'xuemei',     intensity: 'light', duration: 's', tab: 'hot',
    rating: 4.8, reviews: '5.1k', badge: '💕 超甜', badgeColor: 'bg-[#A87CFF]/30 text-[#C9A0FF]',
    price: { type: 'free', label: '免费' } },
  { id: 's3',  emoji: '🔮', bgFrom: '#1a0a28', bgTo: '#2a1040', bgImage: '/images/scripts/s3.jpg?v=20260408b',
    title: '密室游戏·被绑缚的秘密', persona: 'wildcat',   intensity: 'max',   duration: 'l', tab: 'hot',
    rating: 4.9, reviews: '4.8k', badge: '🔒 限制级', badgeColor: 'bg-black/40 text-[#FF2A6D]',
    price: { type: 'diamonds', amount: 150, memberAmount: 120, label: '💎 150' } },
  { id: 's4',  emoji: '🦊', bgFrom: '#280a18', bgTo: '#3a1020',
    title: '狐狸精·千年勾魂术', persona: 'wildcat',   intensity: 'deep',  duration: 'm', tab: 'popular',
    rating: 4.7, reviews: '3.9k', badge: '🌶 高热', badgeColor: 'bg-orange-500/25 text-orange-300',
    price: { type: 'coins', amount: 680, memberAmount: 544, label: '💰 680' } },
  { id: 's5',  emoji: '👙', bgFrom: '#0a1a20', bgTo: '#102830',
    title: '泳池派对·比基尼陷阱', persona: 'classmate', intensity: 'deep',  duration: 'm', tab: 'popular',
    rating: 4.6, reviews: '3.2k', badge: '💦 湿透', badgeColor: 'bg-sky-500/25 text-sky-300',
    price: { type: 'free', label: '免费' } },
  { id: 's6',  emoji: '🏨', bgFrom: '#201020', bgTo: '#301830',
    title: '豪华酒店·总裁的专属', persona: 'shaofu',     intensity: 'max',   duration: 'l', tab: 'popular',
    rating: 4.8, reviews: '4.5k', badge: '👑 贵族', badgeColor: 'bg-yellow-400/20 text-yellow-300',
    price: { type: 'diamonds', amount: 200, memberAmount: 160, label: '💎 200' } },
  { id: 's7',  emoji: '🌙', bgFrom: '#10101e', bgTo: '#181830',
    title: '午夜直播·主播的私下', persona: 'goddess',   intensity: 'deep',  duration: 's', tab: 'new',
    rating: 4.5, reviews: '1.2k', badge: '🆕 刚上架', badgeColor: 'bg-[#66E699]/25 text-[#66E699]',
    price: { type: 'coins', amount: 480, memberAmount: 384, label: '💰 480' } },
  { id: 's8',  emoji: '⛓️', bgFrom: '#180808', bgTo: '#280a0a',
    title: '地下俱乐部·服从契约', persona: 'wildcat',   intensity: 'max',   duration: 'l', tab: 'new',
    rating: 4.7, reviews: '980',  badge: '🔞 极限', badgeColor: 'bg-[#FF2A6D]/30 text-[#FF7DAF]',
    price: { type: 'diamonds', amount: 120, memberAmount: 96, label: '💎 120' } },
  { id: 's9',  emoji: '👑', bgFrom: '#1a0830', bgTo: '#2a1048',
    title: '女王的御座·绝对臣服', persona: 'goddess',   intensity: 'max',   duration: 'l', tab: 'vip',
    rating: 5.0, reviews: '2.8k', badge: '🔒 专属', badgeColor: 'bg-[#A87CFF]/30 text-[#C9A0FF]',
    price: { type: 'diamonds', amount: 300, memberAmount: 0, label: '👑 会员专享' } },
  { id: 's10', emoji: '🎭', bgFrom: '#200820', bgTo: '#300a30',
    title: '面具舞会·双面陷阱', persona: 'teacher',   intensity: 'deep',  duration: 'm', tab: 'vip',
    rating: 4.9, reviews: '2.1k', badge: '🔒 专属', badgeColor: 'bg-[#A87CFF]/30 text-[#C9A0FF]',
    price: { type: 'diamonds', amount: 180, memberAmount: 0, label: '👑 会员专享' } },
  { id: 's11', emoji: '🌺', bgFrom: '#280a20', bgTo: '#380f30', bgImage: '/images/scripts/s11.jpg',
    title: '花魁·深宫独宠夜', persona: 'shaofu',     intensity: 'deep',  duration: 'm', tab: 'hot',
    rating: 4.8, reviews: '3.5k', badge: '🌸 古风', badgeColor: 'bg-pink-500/25 text-pink-300',
    price: { type: 'coins', amount: 880, memberAmount: 704, label: '💰 880' } },
  { id: 's12', emoji: '⚡', bgFrom: '#181a08', bgTo: '#282810',
    title: '电竞女神·赛后私下', persona: 'banhua',    intensity: 'light', duration: 's', tab: 'new',
    rating: 4.6, reviews: '1.5k', badge: '🆕 刚上架', badgeColor: 'bg-[#66E699]/25 text-[#66E699]',
    price: { type: 'free', label: '免费' } },
]

function ScriptCard({ item, onBuy }) {
  const { lang } = useApp()
  const L = useL()
  const isVIPOnly = item.price.memberAmount === 0 && item.price.type === 'diamonds'
  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.97] transition-transform"
      style={{
        background: item.bgImage
          ? `url(${item.bgImage}) center/cover no-repeat`
          : `linear-gradient(145deg, ${item.bgFrom}, ${item.bgTo})`,
        aspectRatio: '3/4'
      }}
      onClick={() => onBuy(item)}
    >
      <div className={`absolute inset-0 bg-gradient-to-t ${item.bgImage ? 'from-black/85 via-black/30 to-black/10' : 'from-black/70 via-transparent to-transparent'}`} />

      {/* 角标 */}
      <span className={`absolute top-2 left-2 text-[9px] font-bold rounded-full px-1.5 py-0.5 z-10 ${item.badgeColor}`}>
        {te(item, 'badge', lang)}
      </span>

      {/* 底部内容 */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
        <p className="text-[11px] font-bold text-white leading-tight line-clamp-2 mb-1.5">{te(item, 'title', lang)}</p>
        <div className="flex items-center gap-1 mb-2">
          <Stars rating={item.rating} />
          <span className="text-[9px] text-white/50">{item.reviews}</span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onBuy(item) }}
          className={`w-full py-1.5 rounded-lg text-[10px] font-bold ${
            item.price.type === 'free'
              ? 'bg-white/15 text-white'
              : isVIPOnly
                ? 'bg-[#A87CFF]/30 text-[#C9A0FF] border border-[#A87CFF]/40'
                : 'btn-main text-white'
          }`}
        >
          {item.price.type === 'free' ? L('免费', 'Free') : isVIPOnly ? L('👑 会员专享', '👑 VIP Only') : item.price.label}
        </button>
      </div>
    </div>
  )
}

function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95 ${
        active
          ? 'bg-[#FF2A6D] text-white shadow-[0_0_10px_rgba(255,42,109,0.4)]'
          : 'bg-[#1A0E1E] border border-white/10 text-[#9B859D]'
      }`}
    >
      {label}
    </button>
  )
}

function DragScrollRow({ className = '', children }) {
  const ref = useRef(null)
  const drag = useRef({ active: false, startX: 0, startLeft: 0, dragged: false })

  const onMouseDown = e => {
    if (e.button !== 0) return
    const el = ref.current; if (!el) return
    drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, dragged: false }
  }
  const onMouseMove = e => {
    if (!drag.current.active) return
    const el = ref.current; if (!el) return
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) > 4) drag.current.dragged = true
    el.scrollLeft = drag.current.startLeft - dx
  }
  const onMouseUp = () => {
    drag.current.active = false
  }
  const onClickCapture = e => {
    if (drag.current.dragged) {
      e.preventDefault()
      e.stopPropagation()
      drag.current.dragged = false
    }
  }
  const onWheel = e => {
    const el = ref.current; if (!el) return
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
    el.scrollLeft += e.deltaY; e.preventDefault()
  }

  return (
    <div
      ref={ref}
      className={`flex gap-2 overflow-x-auto scrollbar-hide pb-1 select-none ${className}`}
      style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x', overscrollBehaviorX: 'contain' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClickCapture={onClickCapture}
      onWheel={onWheel}
    >
      {children}
    </div>
  )
}

function ScriptLibrarySection({ onBuy }) {
  const { lang } = useApp()
  const L = useL()
  const [activeTab,       setActiveTab]       = useState('hot')
  const [personaFilter,   setPersonaFilter]   = useState('all')
  const [intensityFilter, setIntensityFilter] = useState('all')
  const [durationFilter,  setDurationFilter]  = useState('all')
  const [searchVal,       setSearchVal]       = useState('')
  const [filterOpen,      setFilterOpen]      = useState(true)

  const filtered = SCRIPTS.filter(s => {
    if (activeTab !== 'all' && s.tab !== activeTab) return false
    if (personaFilter   !== 'all' && s.persona    !== personaFilter)   return false
    if (intensityFilter !== 'all' && s.intensity  !== intensityFilter) return false
    if (durationFilter  !== 'all' && s.duration   !== durationFilter)  return false
    if (searchVal && !s.title.includes(searchVal)) return false
    return true
  })

  return (
    <section className="page-section page-delay-4">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-[15px] font-black text-[#F9EDF5] tracking-wide">{L('沉浸内容库', 'Content Library')}</h2>
        <span className="text-[9px] rounded-full px-2 py-0.5 bg-[#FF2A6D]/20 text-[#FF7DAF] border border-[#FF2A6D]/30 ml-auto">
          {L('精选推荐', 'Curated')}
        </span>
      </div>

      {/* 搜索框 */}
      <div className="relative mb-4">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B859D]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          placeholder={L('搜索你想体验的内容…', 'Search experiences...')}
          className="w-full bg-[#1A0E1E] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-[#F9EDF5] placeholder-[#9B859D]/60 focus:outline-none focus:border-[#FF2A6D]/40"
        />
        <button
          onClick={() => setFilterOpen(v => !v)}
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all ${filterOpen ? 'bg-[#A87CFF]/30 border-[#A87CFF]/50' : 'bg-[#A87CFF]/20 border-[#A87CFF]/30'}`}
        >
          <svg className="w-3.5 h-3.5 text-[#A87CFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="21" y1="4" x2="14" y2="4"/><line x1="10" y1="4" x2="3" y2="4"/>
            <line x1="21" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="20" x2="16" y2="20"/><line x1="12" y1="20" x2="3" y2="20"/>
            <circle cx="12" cy="4" r="2" fill="currentColor" stroke="none"/>
            <circle cx="10" cy="12" r="2" fill="currentColor" stroke="none"/>
            <circle cx="14" cy="20" r="2" fill="currentColor" stroke="none"/>
          </svg>
          <svg className={`w-2.5 h-2.5 text-[#A87CFF] transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
      </div>

      {/* 顶部 Tabs */}
      <div className="relative mb-5">
        <DragScrollRow>
          {SCRIPT_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all active:scale-95 ${
                activeTab === tab.id
                  ? 'bg-[#A87CFF] text-white shadow-[0_0_12px_rgba(168,124,255,0.5)]'
                  : 'bg-[#1A0E1E] border border-white/10 text-[#9B859D]'
              }`}
            >
              {lang === 'en' ? tab.labelEn : tab.label}
            </button>
          ))}
        </DragScrollRow>
        <div className="absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-[#0D0612] to-transparent pointer-events-none" />
      </div>

      {/* 筛选组 */}
      {filterOpen && (
      <div className="space-y-3 mb-5">
        <div>
          <p className="text-[10px] text-[#9B859D] mb-2 tracking-widest">{L('角色风格', 'Character Style')}</p>
          <DragScrollRow>
            {SCRIPT_PERSONA_FILTERS.map(f => (
              <FilterPill key={f.id} label={lang === 'en' ? f.labelEn : f.label} active={personaFilter === f.id} onClick={() => setPersonaFilter(f.id)} />
            ))}
          </DragScrollRow>
        </div>
        <div>
          <p className="text-[10px] text-[#9B859D] mb-2 tracking-widest">{L('互动强度', 'Intensity')}</p>
          <DragScrollRow>
            {SCRIPT_INTENSITY_FILTERS.map(f => (
              <FilterPill key={f.id} label={lang === 'en' ? f.labelEn : f.label} active={intensityFilter === f.id} onClick={() => setIntensityFilter(f.id)} />
            ))}
          </DragScrollRow>
        </div>
        <div>
          <p className="text-[10px] text-[#9B859D] mb-2 tracking-widest">{L('体验时长', 'Duration')}</p>
          <DragScrollRow>
            {SCRIPT_DURATION_FILTERS.map(f => (
              <FilterPill key={f.id} label={lang === 'en' ? f.labelEn : f.label} active={durationFilter === f.id} onClick={() => setDurationFilter(f.id)} />
            ))}
          </DragScrollRow>
        </div>
      </div>
      )}

      {/* 剧本卡片网格 */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(item => (
            <ScriptCard key={item.id} item={item} onBuy={onBuy} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-[#9B859D] text-sm">
          <p className="text-2xl mb-2">💧</p>
          <p>{L('暂无符合条件的禁忌内容', 'No matching content found')}</p>
          <p className="text-xs mt-1 text-[#9B859D]/50">{L('换个条件再试试…', 'Try different filters...')}</p>
        </div>
      )}
    </section>
  )
}

/** 区块标题 */
function SectionTitle({ icon, title, sub }) {
  return (
    <div className="flex items-baseline gap-2 mb-3">
      {icon && <span className="text-base">{icon}</span>}
      <span className="text-sm font-semibold text-[rgba(245,240,242,0.85)]">{title}</span>
      {sub && <span className="text-[10px] text-[rgba(245,240,242,0.4)]">{sub}</span>}
    </div>
  )
}

/** 横向滚动行（移动端滑动 + 桌面端鼠标拖拽） */
function HorizontalScrollRow({ children, className = '', style }) {
  const rowRef = useRef(null)
  const dragRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    startLeft: 0,
    moved: false,
    axis: null,
  })

  const onPointerDown = (event) => {
    // Touch uses native momentum scrolling; custom drag is desktop-only.
    if (event.pointerType !== 'mouse') return
    if (event.button !== 0) return
    const el = rowRef.current
    if (!el) return
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: el.scrollLeft,
      moved: false,
      axis: null,
    }
    el.setPointerCapture?.(event.pointerId)
  }

  const onPointerMove = (event) => {
    if (event.pointerType !== 'mouse') return
    const el = rowRef.current
    if (!el || dragRef.current.pointerId !== event.pointerId) return

    const dx = event.clientX - dragRef.current.startX
    const dy = event.clientY - dragRef.current.startY

    if (!dragRef.current.axis) {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return
      dragRef.current.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    }

    if (dragRef.current.axis !== 'x') return
    if (Math.abs(dx) > 4) dragRef.current.moved = true

    el.scrollLeft = dragRef.current.startLeft - dx
    event.preventDefault()
  }

  const stopDragging = (event) => {
    if (event && event.pointerType && event.pointerType !== 'mouse') return
    const el = rowRef.current
    if (dragRef.current.pointerId == null) return
    if (event && dragRef.current.pointerId !== event.pointerId) return
    el?.releasePointerCapture?.(dragRef.current.pointerId)
    window.setTimeout(() => {
      dragRef.current.moved = false
    }, 0)
    dragRef.current.pointerId = null
    dragRef.current.axis = null
  }

  const onClickCapture = (event) => {
    if (!dragRef.current.moved) return
    event.preventDefault()
    event.stopPropagation()
  }

  const onWheel = (event) => {
    const el = rowRef.current
    if (!el) return
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
    el.scrollLeft += event.deltaY
    event.preventDefault()
  }

  return (
    <div
      ref={rowRef}
      className={`flex gap-3 overflow-x-auto scrollbar-hide pb-1 select-none cursor-grab active:cursor-grabbing ${className}`}
      style={{
        WebkitOverflowScrolling: 'touch',
        touchAction: 'manipulation',
        overscrollBehaviorX: 'contain',
        ...style,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onClickCapture={onClickCapture}
      onWheel={onWheel}
    >
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  主组件
// ═══════════════════════════════════════════════════════════

export default function ShopPage() {
  const navigate = useNavigate()
  const { lang } = useApp()
  const L = useL()

  // ── 从 Layout 获取全局货币与会员状态 ─────────────────────
  const { coins, setCoins, diamonds, setDiamonds, userLevel } = useOutletContext()

  // 会员判断
  const isMember = userLevel !== '心动会员'
  const isVIP    = userLevel === '灵魂伴侣'

  // ── 广告 & 插屏状态 ──────────────────────────────────────
  const [showInterstitial, setShowInterstitial] = useState(false)
  const clickCountRef = useRef(0)

  // ── 记录模板点击（插屏广告逻辑） ─────────────────────────
  const recordTemplateClick = () => {
    clickCountRef.current += 1
    if (clickCountRef.current % 3 === 0) setShowInterstitial(true)
  }

  // ── 购买逻辑（会员折扣感知） ──────────────────────────────
  // TODO: 接入真实支付 API（/api/shop/purchase）
  const handleBuy = (item) => {
    recordTemplateClick()
    const { type, amount, memberAmount, label } = item.price

    if (type === 'free') {
      alert('🎉 已加入您的资料库！')
      return
    }

    // 灵魂伴侣：所有模板免费
    if (isVIP) {
      alert(`🎉 「${item.title}」已以灵魂伴侣权益免费领取！`)
      return
    }

    // 实际扣除金额（热恋会员享折扣）
    const actualAmount = (isMember && memberAmount) ? memberAmount : amount
    const actualLabel  = (isMember && item.memberPriceLabel) ? item.memberPriceLabel : label
    const discountNote = isMember ? '（会员折扣）' : ''

    if (type === 'coins') {
      if (coins >= actualAmount) {
        setCoins(coins - actualAmount)
        alert(`✅ 购买成功！消耗 ${actualLabel}${discountNote}，余额已更新。`)
      } else {
        alert(`❌ 金币不足！\n需要 ${actualLabel}，当前余额 💰 ${coins.toLocaleString()}\n可前往充值页面补充金币。`)
      }
      return
    }
    if (type === 'diamonds') {
      if (diamonds >= actualAmount) {
        setDiamonds(diamonds - actualAmount)
        alert(`✅ 购买成功！消耗 ${actualLabel}${discountNote}，余额已更新。`)
      } else {
        alert(`❌ 钻石不足！\n需要 ${actualLabel}，当前余额 💎 ${diamonds}\n可前往充值页面补充钻石。`)
      }
      return
    }
    if (type === 'usd') {
      alert(`💳 即将跳转支付页面…\n（演示模式，实际支付未接入）`)
    }
  }

  // ── 激励广告 ─────────────────────────────────────────────
  // TODO: 替换为真实激励视频 SDK（AdMob / Unity Ads）
  const handleWatchAd = () => {
    alert('📺 广告观看模拟…\n🎉 金币 +50 已到账！')
    setCoins((prev) => prev + 50)
  }

  return (
    <div className="px-4 pt-4 pb-8 space-y-6 page-enter">

      {/* ═══ 顶部：货币余额 + 充值按钮 ════════════════════════ */}
      {/* 已移除会员等级文字，充值/会员入口统一由充值按钮（👑）进入 */}
      <section className="flex items-center gap-2 page-section page-delay-1">
        <div className="flex-1" />

        {/* 货币余额 */}
        <CurrencyPill icon="💰" value={coins} />
        <CurrencyPill icon="💎" value={diamonds} />

        {/* 充值按钮（含 👑 图标，点击进入充值与会员页） */}
        <button
          onClick={() => navigate('/recharge')}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold text-white active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(90deg, #FF9ACB, #B380FF)' }}
        >
          <Crown size={11} />
          {L('充值', 'Top Up')}
        </button>
      </section>

      {/* ═══ 禁忌剧本库 ════════════════════════════════════ */}
      <ScriptLibrarySection onBuy={handleBuy} isMember={isMember} isVIP={isVIP} />

      {/* ═══ 智能推荐 ════════════════════════════════════════ */}
      <section className="page-section page-delay-1">
        <SectionTitle icon="🎯" title={L('智能推荐为你', 'Recommended')} sub={L('根据你的偏好', 'Based on your taste')} />
        {/* TODO: 替换推荐列表为真实个性化算法 API */}
        <HorizontalScrollRow>
          {RECOMMENDED.map((item) => (
            <RecommendedCard
              key={item.id}
              item={item}
              onBuy={handleBuy}
              onCardClick={recordTemplateClick}
            />
          ))}
        </HorizontalScrollRow>
      </section>

      {/* ═══ 官方更新专区 ════════════════════════════════════ */}
      {/* TODO: 替换为 /api/shop/official 的真实数据 */}
      <section className="page-section page-delay-2">
        <SectionTitle icon="🏅" title={L('官方更新', 'Official Updates')} sub={L('品质保障', 'Quality assured')} />
        <HorizontalScrollRow>
          {OFFICIAL_UPDATES.map((item) => (
            <SectionCard
              key={item.id}
              item={item}
              onBuy={handleBuy}
              badge={L('官方', 'Official')}
              badgeStyle="bg-[rgba(255,215,0,0.25)] text-yellow-300"
              isMember={isMember}
              isVIP={isVIP}
            />
          ))}
        </HorizontalScrollRow>
      </section>

      {/* ═══ 激励视频广告横幅 ════════════════════════════════ */}
      {/* TODO: 替换为真实激励视频 SDK（AdMob / Unity Ads / AppLovin） */}
      <button
        onClick={handleWatchAd}
        className="w-full rounded-2xl p-3.5 flex items-center gap-3 transition-opacity hover:opacity-90 page-section page-delay-2"
        style={{ background: 'linear-gradient(135deg, #1a2240 0%, #251840 100%)', border: '1px solid rgba(179,128,255,0.2)' }}
      >
        <div className="w-10 h-10 rounded-xl bg-[rgba(179,128,255,0.2)] flex items-center justify-center flex-shrink-0">
          <Play size={18} className="text-[#B380FF]" fill="#B380FF" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-xs font-semibold text-[rgba(245,240,242,0.9)]">{L('观看视频得 50 金币', 'Watch video for 50 coins')}</p>
          <p className="text-[10px] text-[rgba(245,240,242,0.45)]">{L('每日可观看 5 次 · 广告时长约 15 秒', '5 times daily · ~15 sec')}</p>
        </div>
        <span className="text-xs font-bold text-[#B380FF]">💰+50</span>
      </button>

      {/* ═══ 免费专区 ════════════════════════════════════════ */}
      {/* TODO: 替换为 /api/shop/free 的真实数据 */}
      <section className="page-section page-delay-2">
        <SectionTitle icon="🆓" title={L('免费专区', 'Free Zone')} sub={L('永久免费', 'Free forever')} />
        <HorizontalScrollRow>
          {FREE_SECTION_CARDS.map((item) => (
            <SectionCard
              key={item.id}
              item={item}
              onBuy={handleBuy}
              badge={L('免费', 'Free')}
              badgeStyle="bg-[rgba(255,154,203,0.25)] text-[#FF9ACB]"
              isMember={isMember}
              isVIP={isVIP}
            />
          ))}
        </HorizontalScrollRow>
      </section>

      {/* ═══ 免费内容专区（礼包 + 每日限免 + 基础库）════════ */}
      <section className="page-section page-delay-3">
        <SectionTitle icon="🎁" title={L('免费内容专区', 'Free Content Zone')} />

        {/* 新用户礼包 */}
        <p className="text-[10px] text-[rgba(245,240,242,0.4)] mb-2 tracking-wider">{L('新用户礼包', 'New User Gifts')}</p>
        <HorizontalScrollRow
          className="pb-2 mb-4 px-1"
        >
          {FREE_PACKS.map((item) => (
            <FreePackCard
              key={item.id}
              item={item}
              onClick={() => { recordTemplateClick(); handleBuy({ ...item, price: { type: 'free' } }) }}
            />
          ))}
        </HorizontalScrollRow>

        {/* 每日限免 */}
        <p className="text-[10px] text-[rgba(245,240,242,0.4)] mb-2 tracking-wider">{L('每日限免', 'Daily Free')}</p>
        <div
          className="relative overflow-hidden rounded-[24px] p-4 mb-4 card-glow cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #231033 0%, #31194c 58%, #24112f 100%)' }}
          onClick={() => { recordTemplateClick(); handleBuy({ ...DAILY_FREE, price: { type: 'free' } }) }}
        >
          <div
            className="absolute -top-8 -right-6 w-28 h-28 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,154,203,0.22) 0%, rgba(255,154,203,0.03) 62%, transparent 72%)' }}
          />
          <div
            className="absolute bottom-[-22px] right-10 w-20 h-20 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(179,128,255,0.18) 0%, rgba(179,128,255,0.03) 60%, transparent 72%)' }}
          />

          <div className="relative flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: 'linear-gradient(145deg, rgba(255,154,203,0.16), rgba(255,255,255,0.04))', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >
              <span>{DAILY_FREE.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="inline-flex items-center rounded-full px-2 py-1 text-[9px] font-bold tracking-wide text-[#2a1020] bg-[#FF9ACB] shadow-[0_4px_12px_rgba(255,154,203,0.25)]">
                  {L('今日限免', 'Free Today')}
                </span>
                <span className="text-[9px] text-[rgba(245,240,242,0.42)] tracking-wider">{L('24H 福利', '24H Deal')}</span>
              </div>
              <p className="text-[15px] leading-tight font-bold text-[rgba(250,244,247,0.96)] mb-1">
                {te(DAILY_FREE, 'title', lang)}
              </p>
              <p className="text-[11px] text-[rgba(245,240,242,0.5)]">
                {te(DAILY_FREE, 'device', lang)} · {te(DAILY_FREE, 'downloads', lang)} {L('下载', 'downloads')}
              </p>
              <div className="flex items-end justify-between gap-3 mt-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] line-through text-[rgba(245,240,242,0.28)]">
                    {L('原价', 'Was')} {DAILY_FREE.originalLabel}
                  </span>
                  <span className="text-[12px] font-bold text-[#FF9ACB]">
                    {L('今日免费', 'Free Today')}
                  </span>
                </div>
                <button className="rounded-full px-4 py-2 text-[11px] font-semibold text-[#2a1020] bg-[linear-gradient(135deg,#ffb2d6,#ff8cc8)] shadow-[0_10px_24px_rgba(255,154,203,0.28)] active:scale-[0.98] transition-transform">
                  {L('免费领取', 'Get Free')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 基础模板库 */}
        <p className="text-[10px] text-[rgba(245,240,242,0.4)] mb-2 tracking-wider">{L('基础模板库（永久免费）', 'Basic Templates (Free forever)')}</p>
        <div className="space-y-2">
          {BASE_TEMPLATES.map((item) => (
            <div
              key={item.id}
              className="rounded-xl px-4 py-3 flex items-center gap-3 card-glow bg-[rgba(30,20,25,0.6)] cursor-pointer hover:bg-[rgba(50,30,40,0.6)] transition-colors"
              onClick={() => { recordTemplateClick(); alert(`🎉 「${item.title}」已加入资料库！`) }}
            >
              <span className="text-xl">{item.emoji}</span>
              <div className="flex-1">
                <p className="text-xs font-medium text-[rgba(245,240,242,0.85)]">{te(item, 'title', lang)}</p>
                <p className="text-[10px] text-[rgba(245,240,242,0.4)]">{te(item, 'desc', lang)}</p>
              </div>
              <span className="text-[11px] font-semibold text-[#FF9ACB]">{L('免费', 'Free')}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 用户二创专区 ════════════════════════════════════ */}
      {/* TODO: 替换为 /api/shop/user-creations 的真实数据 */}
      <section className="page-section page-delay-3">
        <SectionTitle icon="✏️" title={L('用户二创', 'User Created')} sub={L('社区精选', 'Community picks')} />
        <HorizontalScrollRow>
          {USER_CREATIONS.map((item) => (
            <SectionCard
              key={item.id}
              item={item}
              onBuy={handleBuy}
              badge={L('二创', 'Fan-made')}
              badgeStyle="bg-[rgba(179,128,255,0.25)] text-[#B380FF]"
              showAuthor
              isMember={isMember}
              isVIP={isVIP}
            />
          ))}
        </HorizontalScrollRow>
      </section>

      {/* ═══ 热门榜单 ════════════════════════════════════════ */}
      {/* TODO: 替换为 /api/shop/hot?sortBy=downloads 的真实数据 */}
      <section className="page-section page-delay-4">
        <SectionTitle icon="🔥" title={L('热门榜单', 'Trending')} sub={L('下载最多', 'Most downloaded')} />
        <HorizontalScrollRow>
          {HOT_LIST.map((item) => (
            <SectionCard
              key={item.id}
              item={item}
              onBuy={handleBuy}
              badge={L('🔥 热门', '🔥 Hot')}
              badgeStyle="bg-[rgba(255,120,50,0.25)] text-orange-300"
              showDownloads
              isMember={isMember}
              isVIP={isVIP}
            />
          ))}
        </HorizontalScrollRow>
      </section>

      {/* ═══ 彩虹专区（LGBTQ+）══════════════════════════════ */}
      {/* TODO: 替换为 /api/shop/rainbow 的真实数据 */}
      <section className="page-section page-delay-4">
        <SectionTitle icon="🌈" title={L('彩虹专区', 'Rainbow Zone')} sub={L('多元 · 包容 · 平等', 'Diverse · Inclusive · Equal')} />
        <HorizontalScrollRow>
          {RAINBOW_LIST.map((item) => (
            <SectionCard
              key={item.id}
              item={item}
              onBuy={handleBuy}
              badge="🌈"
              badgeStyle="bg-[rgba(150,100,255,0.25)] text-purple-300"
              isMember={isMember}
              isVIP={isVIP}
            />
          ))}
        </HorizontalScrollRow>
      </section>

      {/* ═══ 独家定制专区（多模态）══════════════════════════ */}
      {/* TODO: 替换为 /api/shop/exclusive?multimodal=true 的真实数据 */}
      <section className="page-section page-delay-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">👑</span>
          <span className="text-sm font-semibold text-[rgba(245,240,242,0.85)]">{L('独家定制', 'Exclusive Custom')}</span>
          <span
            className="text-[9px] rounded-full px-2 py-0.5 flex items-center gap-0.5"
            style={{ background: 'rgba(179,128,255,0.2)', color: '#C9A0FF', border: '1px solid rgba(179,128,255,0.3)' }}
          >
            🎬🎙️ {L('多模态', 'Multi-modal')}
          </span>
          <span className="text-[10px] text-[rgba(245,240,242,0.4)] ml-auto">{L('语音 / 视频互动', 'Voice / Video')}</span>
        </div>
        <HorizontalScrollRow>
          {EXCLUSIVE_CUSTOM.map((item) => (
            <SectionCard
              key={item.id}
              item={item}
              onBuy={handleBuy}
              badge={L('独家', 'Exclusive')}
              badgeStyle="bg-[rgba(255,215,0,0.25)] text-yellow-300"
              multimodal
              isMember={isMember}
              isVIP={isVIP}
            />
          ))}
        </HorizontalScrollRow>
        <p className="text-[9px] text-[rgba(245,240,242,0.25)] text-center mt-2">
          {L('· 独家定制支持实时语音 / 视频互动，体验全面升级 ·', '· Exclusive custom supports real-time voice/video interaction ·')}
        </p>
      </section>

      {/* 底部留白 */}
      <div className="h-2" />

      {/* ═══ 插屏广告 Modal ══════════════════════════════════ */}
      {/* TODO: 替换为真实插屏广告 SDK */}
      {showInterstitial && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowInterstitial(false)}
        >
          <div
            className="w-full max-w-[360px] rounded-3xl p-6 card-glow animate-fadeUp"
            style={{ background: 'linear-gradient(145deg, #1e1028, #2a1840)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] bg-[rgba(255,154,203,0.2)] text-[#FF9ACB] rounded-full px-2 py-0.5">{L('限时推荐', 'Limited Offer')}</span>
                <h3 className="text-base font-semibold text-[rgba(245,240,242,0.95)] mt-2">{L('独家剧情包 · 限时特惠', 'Exclusive Bundle · Flash Sale')}</h3>
                <p className="text-[11px] text-[rgba(245,240,242,0.5)] mt-0.5">{L('今日 8 折，仅剩 2 小时', '20% off today, 2 hours left')}</p>
              </div>
              <button onClick={() => setShowInterstitial(false)} className="p-1">
                <X size={18} className="text-[rgba(245,240,242,0.4)]" />
              </button>
            </div>
            <div className="h-28 rounded-2xl mb-4 flex items-center justify-center text-5xl"
              style={{ background: 'linear-gradient(135deg, #2a1020, #4a1535)' }}>
              🎭
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowInterstitial(false); alert('💳 即将跳转支付…（演示模式）') }}
                className="flex-1 py-2.5 rounded-xl btn-main text-white text-sm font-medium"
              >
                {L('立即抢购', 'Buy Now')} $3.99
              </button>
              <button
                onClick={() => setShowInterstitial(false)}
                className="px-4 py-2.5 rounded-xl text-xs text-[rgba(245,240,242,0.4)]"
              >
                {L('稍后', 'Later')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
