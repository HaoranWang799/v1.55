/**
 * CommunityPage.jsx — 社区 v2
 *
 * 新增（v2）：
 *   • 每个 Tab 扩充至 5-6 条帖子，涵盖男性 / 女性 / LGBT / 情侣等多元视角
 *   • 所有帖子均带图片占位块（渐变背景 + 中央 emoji）
 *   • 热门评论增加点赞数展示
 *
 * 保留（v1）：
 *   • 顶部 Tab 切换（体验分享 / 攻略教程 / 创作展示）
 *   • AI 主动关怀卡片（可删除记忆）
 *   • 帖子点赞（计数 +1 & 变红）、评论、收藏
 *   • 悬浮"发布新帖"按钮
 *   • 底部隐私提示
 *
 * TODO: 替换为真实社区 API（/api/community/posts）
 * TODO: AI 关怀消息接入真实硬件记忆模块（蓝牙数据分析）
 * TODO: 接入真实匿名身份系统与内容加密
 * TODO: 实现真实点赞 / 评论 / 收藏后端持久化
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, Heart, MessageCircle, Pause, Play, PlayCircle, Plus, Send, Sparkles, Trash2, Volume2 } from 'lucide-react'
import { useVirtualLover } from '../hooks/useVirtualLover'
import useCommunity from '../hooks/useCommunity'
import { useApp } from '../context/AppContext'
import { useL } from '../i18n/useL'
import { preparePresetVoiceAudio } from '../api/scripts'

// 遗留本地数据，当前页面已改为 useCommunity 实时数据流。
const LEGACY_POSTS_V2 = {
  '体验分享': [
    // ── 女性视角 ──────────────────────────────────────────
    {
      id: 1, templateId: 'boss', templateName: '冷感女上司·深夜版',
      avatar: '💋', name: '小野猫', time: '1小时前',
      gender: '女生',
      content: '剧本开头那一句话直接让我脸红心跳 >///<  她的声线带着那种克制的暧昧，整个人陷进去出不来了…被窝里偷偷听，听完又重听，根本停不下来。那种酥麻的感觉久久不散，这款真的要封神！',
      imgColor: 'from-[#2a1030] to-[#1a0d22]', imgEmoji: '💋',
      likes: 892, comments: 64, bookmarks: 178,
      tags: ['#今夜体验', '#女生向', '#好评如潮'],
      topComments: [
        { avatar: '🦊', name: '夜行狐', text: '同感！那个声线我真的绷不住了哈哈哈', likes: 34 },
        { avatar: '🌈', name: '彩虹下的他', text: '羞耻感正是精髓所在！', likes: 18 },
      ],
    },
    // ── 男性视角 ──────────────────────────────────────────
    {
      id: 2, templateId: 'junior', templateName: '温柔学妹·宿舍私语',
      avatar: '🏋️', name: '硬汉柔情', time: '3小时前',
      gender: '男生',
      content: '强劲模式开启那一刻，兄弟我直接升天了，温度涨到 80 整个人酥到动不了…配上学妹那个声线，比真人还真人。当时躺着一动不动，脑子已经空了。悔恨没早点买，强推给所有还在犹豫的兄弟们 💪',
      imgColor: 'from-[#1a1530] to-[#0f0d20]', imgEmoji: '🏋️',
      likes: 1247, comments: 89, bookmarks: 312,
      tags: ['#今夜体验', '#男生向', '#新人必看'],
      topComments: [
        { avatar: '🐯', name: '隐藏剧情猎人', text: '兄弟我也是这样入坑的！一入侯门深似海', likes: 67 },
        { avatar: '🐼', name: '熊猫不睡觉', text: '强劲版直接起飞，下次试极限版', likes: 29 },
      ],
    },
    // ── LGBT 视角 ─────────────────────────────────────────
    {
      id: 3, templateId: 'rb1', templateName: '彩虹之约·校园初恋',
      avatar: '🌈', name: '彩虹下的他', time: '5小时前',
      gender: 'LGBT',
      content: '和男友一起试了彩虹专区，太棒了！双人联动剧本在两个设备上同步震动，连接的瞬间我俩都笑出来了，笑完又觉得很感动…异地党福音，隔着屏幕也能感受到彼此 🌈',
      imgColor: 'from-[#1a1040] to-[#0d0d30]', imgEmoji: '🌈',
      likes: 2134, comments: 156, bookmarks: 489,
      tags: ['#今夜体验', '#LGBT', '#彩虹专区', '#异地恋'],
      topComments: [
        { avatar: '💋', name: '小野猫', text: '异地党直接泪目，这功能太暖了', likes: 112 },
        { avatar: '✏️', name: '写字的人', text: '双人联动是真的做到了情感连接！', likes: 78 },
      ],
    },
    // ── 情侣视角 ──────────────────────────────────────────
    {
      id: 4, templateId: 'h3', templateName: '阳台邂逅·月夜情话',
      avatar: '💑', name: '甜蜜小两口', time: '昨天',
      gender: '情侣',
      content: '和老公一起体验了双人剧本，互相控制对方的设备，刚开始一直在笑根本进不了状态哈哈哈…后来慢慢沉浸进去，感情好像又升温了不少。推荐所有情侣试试，是很新鲜的共同体验！',
      imgColor: 'from-[#2a1520] to-[#1a0d18]', imgEmoji: '💑',
      likes: 3458, comments: 203, bookmarks: 765,
      tags: ['#今夜体验', '#情侣向', '#双人互动'],
      topComments: [
        { avatar: '🏋️', name: '硬汉柔情', text: '这个必须安利给我对象！', likes: 145 },
        { avatar: '🌈', name: '彩虹下的他', text: '哈哈哈笑场那段太真实了，我俩也是', likes: 98 },
      ],
    },
    // ── 中性视角 ──────────────────────────────────────────
    {
      id: 5, templateId: 'neighbor', templateName: '阳台·神秘邻居',
      avatar: '🦊', name: '夜行狐', time: '昨天',
      gender: '中性',
      content: '深夜阳台配神秘邻居，温度涨到 100 那一刻整个人升天了…那段低沉的开场白让我心跳乱了节拍，之后他说的每一句话都像在贴着耳朵讲。城市灯光的氛围感绝了，简直就是我私人幻想的具象化！',
      imgColor: 'from-[#12102a] to-[#0d0b1e]', imgEmoji: '🌃',
      likes: 518, comments: 32, bookmarks: 87,
      tags: ['#今夜体验', '#神秘邻居', '#场景推荐'],
      topComments: [
        { avatar: '💋', name: '小野猫', text: '神秘邻居的亲密语句简直了…', likes: 45 },
        { avatar: '🎨', name: '创作家Mia', text: '阳台场景的灯光设计是真的用心', likes: 22 },
      ],
    },
    // ── 求助类 ────────────────────────────────────────────
    {
      id: 6, templateId: 'teacher', templateName: '知性女老师·放学后',
      avatar: '🐼', name: '熊猫不睡觉', time: '前天',
      gender: '中性',
      content: '知性女老师新出了一段隐藏对话，内容不敢说，反正让我耳根都红透了…温度 80-90 之间触发过一次就再也没复现，连续三晚了 QAQ 求大神告诉我触发条件，那段台词太要命了，必须再听一遍！',
      imgColor: 'from-[#1a1520] to-[#120f18]', imgEmoji: '🔍',
      likes: 123, comments: 56, bookmarks: 22,
      tags: ['#私房秘籍求助', '#知性女老师', '#我的幻想'],
      topComments: [
        { avatar: '🦁', name: '攻略达人', text: '语音按钮 + 主按钮交替触发，亲测有效！', likes: 31 },
        { avatar: '🐯', name: '隐藏剧情猎人', text: '还要保持温度在 82 以上，太低不触发', likes: 19 },
      ],
    },
  ],

  '攻略教程': [
    // ── 新手向 ────────────────────────────────────────────
    {
      id: 7, templateId: 'junior', templateName: '温柔学妹·宿舍私语',
      avatar: '🦁', name: '攻略达人', time: '2小时前',
      content: '【新手必看】温度快速提升攻略：先选"宿舍"场景 + 温柔学妹，先点 2 次主按钮，再用语音按钮，比纯点击快 3 倍！亲测有效，收藏备用。评论区有各角色详细适配表。',
      imgColor: 'from-[#0f2a1a] to-[#0a1a10]', imgEmoji: '📋',
      likes: 892, comments: 67, bookmarks: 234,
      tags: ['#私房秘籍', '#新手向', '#温度提升'],
      topComments: [
        { avatar: '🦊', name: '夜行狐', text: '照着做了，真的快了好多！感谢大佬', likes: 58 },
        { avatar: '🌈', name: '彩虹糖果', text: '已收藏，下次按图索骥', likes: 34 },
      ],
    },
    // ── 隐藏内容 ──────────────────────────────────────────
    {
      id: 8, templateId: 'neighbor', templateName: '深夜阳台·神秘邻居',
      avatar: '🐯', name: '隐藏剧情猎人', time: '1天前',
      content: '已解锁全部 4 个角色的隐藏结局！触发条件：温度在 60-80 之间，连续使用语音按钮 5 次，不点主按钮。不同角色的隐藏台词各有千秋，神秘邻居那条让我直接破防，详情见评论区👇',
      imgColor: 'from-[#2a1020] to-[#1a0d16]', imgEmoji: '🗝️',
      likes: 1205, comments: 134, bookmarks: 567,
      tags: ['#私房秘籍', '#隐藏内容', '#全角色'],
      topComments: [
        { avatar: '🐼', name: '熊猫不睡觉', text: '谢谢大神！女老师那条我终于解锁了！', likes: 89 },
        { avatar: '🦋', name: '蝴蝶效应', text: '神秘邻居的隐藏台词真的破防了', likes: 67 },
      ],
    },
    // ── 女性攻略 ──────────────────────────────────────────
    {
      id: 9, templateId: 'boss', templateName: '冷感女上司·深夜版',
      avatar: '🦋', name: '蝴蝶效应', time: '2天前',
      content: '冷感女上司触发亲密语句条件整理完毕～配合"办公室"场景有加成效果。主按钮点 5 次后切换语音，命中率最高达 87%。附：不同星期触发概率有差异，周五命中率最高（笑）',
      imgColor: 'from-[#251030] to-[#180d20]', imgEmoji: '💼',
      likes: 445, comments: 28, bookmarks: 189,
      tags: ['#私房秘籍', '#冷感女上司', '#命中率'],
      topComments: [
        { avatar: '💋', name: '小野猫', text: '感谢整理！书签了！周五专程去试', likes: 42 },
        { avatar: '🦁', name: '攻略达人', text: '周五概率差异是真的，有趣的发现', likes: 27 },
      ],
    },
    // ── 双人攻略 ──────────────────────────────────────────
    {
      id: 10, templateId: 'h3', templateName: '阳台邂逅·月夜情话',
      avatar: '💑', name: '甜蜜小两口', time: '3天前',
      content: '【情侣双人攻略】两台设备同时在线时，有专属的"共鸣"加成！一方达到高温时另一方震动频率自动提升。诀窍是保持两人节奏一致，可以语音通话同步操作，体验完全不同！',
      imgColor: 'from-[#2a1818] to-[#1a0f10]', imgEmoji: '🔗',
      likes: 2876, comments: 198, bookmarks: 934,
      tags: ['#私房秘籍', '#双人联动', '#情侣向'],
      topComments: [
        { avatar: '🌈', name: '彩虹下的他', text: '共鸣加成！这个机制我之前完全没注意到', likes: 134 },
        { avatar: '🏋️', name: '硬汉柔情', text: '拉着对象试了，确实不一样！', likes: 98 },
      ],
    },
    // ── 数据向攻略 ────────────────────────────────────────
    {
      id: 11, templateId: 'junior', templateName: '温柔学妹·宿舍私语',
      avatar: '📊', name: '数据控小明', time: '4天前',
      content: '做了个统计：体验过 20+ 次后发现，早上 8-10 点和晚上 10-12 点温度上升速率最快，可能跟服务器负载有关。另外男性角色的语音响应延迟普遍比女性角色低 0.3s，有点在意哈哈',
      imgColor: 'from-[#102530] to-[#0a1820]', imgEmoji: '📊',
      likes: 678, comments: 45, bookmarks: 267,
      tags: ['#私房秘籍', '#数据分析', '#硬核向'],
      topComments: [
        { avatar: '🐯', name: '隐藏剧情猎人', text: '服务器时段这个观察很有价值！', likes: 56 },
        { avatar: '🦁', name: '攻略达人', text: '延迟差异这个我要去验证一下', likes: 38 },
      ],
    },
  ],

  '创作展示': [
    // ── 场景文案创作 ──────────────────────────────────────
    {
      id: 12, templateId: 'neighbor', templateName: '神秘邻居·月夜偶遇',
      avatar: '🎨', name: '创作家Mia', time: '1小时前',
      content: '自制了一个"星空海边"场景文案，氛围感参考了冬日夜晚+潮声+微风的感觉，角色设定是"沉默的灯塔守望者"。如果官方能上架就好了…先分享给大家，欢迎二创和改编！',
      imgColor: 'from-[#101825] to-[#080d18]', imgEmoji: '🌊',
      likes: 678, comments: 89, bookmarks: 123,
      tags: ['#我的幻想', '#同人场景', '#星空海边'],
      topComments: [
        { avatar: '✏️', name: '写字的人', text: '氛围感绝了！"沉默的灯塔守望者"这个角色设定太戳我了', likes: 67 },
        { avatar: '🦁', name: '攻略达人', text: '建议官方直接采纳，质量完全够了', likes: 45 },
      ],
    },
    // ── 对话创作 ──────────────────────────────────────────
    {
      id: 13, templateId: 'neighbor', templateName: '深夜阳台·神秘邻居',
      avatar: '✏️', name: '写字的人', time: '6小时前',
      content: '给神秘邻居写了一段扩展对话，尽量模仿了官方语气风格——克制、暧昧、留白。大家来评评看～有没有违和感？完全没信心哈哈，真心求反馈！附全文在评论区。',
      imgColor: 'from-[#201028] to-[#150b1e]', imgEmoji: '✍️',
      likes: 345, comments: 45, bookmarks: 78,
      tags: ['#我的幻想', '#对话创作', '#神秘邻居'],
      topComments: [
        { avatar: '🎨', name: '创作家Mia', text: '完全感觉不出来！留白处理太妙了', likes: 38 },
        { avatar: '🦋', name: '蝴蝶效应', text: '第三句台词直接拿捏了，官方同款味道', likes: 29 },
      ],
    },
    // ── 文案结构分享 ──────────────────────────────────────
    {
      id: 14, templateId: 'junior', templateName: '温柔学妹·宿舍私语',
      avatar: '🌈', name: '彩虹糖果', time: '1天前',
      content: '整理了一套"渐进式互动"的文案搭配方案，从 IDLE → ACTIVE → AFTER_RESPONSE 三阶段过渡感极其丝滑。核心逻辑是情绪递进，不能跳层。大家可以参考这个结构做二创～',
      imgColor: 'from-[#1a2a10] to-[#0f1a08]', imgEmoji: '📐',
      likes: 234, comments: 19, bookmarks: 156,
      tags: ['#我的幻想', '#文案结构', '#方法论'],
      topComments: [
        { avatar: '🐯', name: '隐藏剧情猎人', text: '好用！情绪递进这个逻辑我直接拿去用了', likes: 34 },
        { avatar: '✏️', name: '写字的人', text: '"不能跳层"说得太对了，跳层感觉很出戏', likes: 21 },
      ],
    },
    // ── 插画/图像创作 ─────────────────────────────────────
    {
      id: 15, templateId: 'boss', templateName: '冷感女上司·深夜版',
      avatar: '🖼️', name: '插画师Leo', time: '2天前',
      content: '画了一组"角色·心境"的概念插图，用色彩温度来表达不同状态：冷色调=神秘邻居的疏离感，暖玫瑰色=温柔学妹的温存感。画风偏朦胧，欢迎大家参考用于二创封面～',
      imgColor: 'from-[#2a1535] to-[#1a0d28]', imgEmoji: '🖼️',
      likes: 1567, comments: 112, bookmarks: 445,
      tags: ['#我的幻想', '#插画', '#角色设计'],
      topComments: [
        { avatar: '🎨', name: '创作家Mia', text: '色彩和角色气质的对应太准了！', likes: 89 },
        { avatar: '🌈', name: '彩虹糖果', text: '朦胧感处理得很有美感，求完整版！', likes: 67 },
      ],
    },
    // ── LGBT 向创作 ───────────────────────────────────────
    {
      id: 16, templateId: 'rb4', templateName: '郁金香庭院·雨后',
      avatar: '🌈', name: '彩虹下的他', time: '3天前',
      content: '写了一个"男性 × 男性"的双人剧本文案，角色设定是"青梅竹马·多年后重逢"。官方彩虹专区目前同类内容还较少，希望能填补空白～欢迎同好取用，注明来源就好！',
      imgColor: 'from-[#1a1040] to-[#0d0d28]', imgEmoji: '🌈',
      likes: 3212, comments: 267, bookmarks: 891,
      tags: ['#我的幻想', '#LGBT', '#剧本创作', '#彩虹专区'],
      topComments: [
        { avatar: '💋', name: '小野猫', text: '青梅竹马重逢这个设定直接击中！期待正文！', likes: 178 },
        { avatar: '✏️', name: '写字的人', text: '这类内容太少了，感谢填补！写得很细腻', likes: 134 },
      ],
    },
  ],
}

// 英文翻译映射（按帖子 id）
const LEGACY_POSTS_EN = {
  1: {
    time: '1h ago',
    content: 'The opening line of the script made me blush instantly >//< Her voice carried this restrained allure that pulled me in completely… Listened secretly under the covers, replayed it again and again, just couldn\'t stop. That tingling sensation lingered on and on — this one is absolutely legendary!',
    tags: ['#TonightExp', '#ForHer', '#HighlyRated'],
    comments: ['Same here! That voice totally got me lol', 'The thrill of embarrassment is exactly the point!'],
  },
  2: {
    time: '3h ago',
    content: 'The moment intense mode kicked in, I literally ascended — temperature hit 80 and my whole body went numb… Paired with the gentle junior\'s voice, it felt more real than real. I just lay there motionless, mind completely blank. Regret not buying sooner, strongly recommend to all the bros still on the fence 💪',
    tags: ['#TonightExp', '#ForHim', '#MustRead'],
    comments: ['Bro that\'s exactly how I got hooked! No turning back', 'Intense mode is a blast, try extreme next time'],
  },
  3: {
    time: '5h ago',
    content: 'Tried the Rainbow section with my boyfriend, it was amazing! The duo script synced vibrations across two devices — we both burst out laughing the moment it connected, then felt really moved… A godsend for long-distance couples, feeling each other through the screen 🌈',
    tags: ['#TonightExp', '#LGBT', '#RainbowZone', '#LongDistance'],
    comments: ['Long-distance folks literally tearing up — this feature is so heartwarming', 'The duo sync truly achieves emotional connection!'],
  },
  4: {
    time: 'Yesterday',
    content: 'Tried the duo script with my husband — controlling each other\'s devices. We couldn\'t stop laughing at first lol… But as we settled in, it felt like our connection deepened. Recommend all couples to try it — a totally fresh shared experience!',
    tags: ['#TonightExp', '#ForCouples', '#DuoInteraction'],
    comments: ['Gotta share this with my partner!', 'Haha the laughing part is so real — same for us'],
  },
  5: {
    time: 'Yesterday',
    content: 'Late-night balcony with the mysterious neighbor — temperature hit 100 and I literally ascended… That deep opening line threw my heartbeat off rhythm, every word after felt whispered right into my ear. The city lights ambiance was perfect — like my private fantasy made real!',
    tags: ['#TonightExp', '#MysteriousNeighbor', '#ScenePick'],
    comments: ['The mysterious neighbor\'s intimate lines are just…', 'The lighting design for the balcony scene is truly thoughtful'],
  },
  6: {
    time: '2 days ago',
    content: 'The intellectual teacher has a new hidden dialogue — can\'t say what it is, but my ears turned completely red… Temperature 80–90 triggered it once but never again, three nights in a row QAQ. Please tell me the trigger conditions — those lines are killer, I MUST hear them again!',
    tags: ['#SecretsHelp', '#IntellectualTeacher', '#MyFantasy'],
    comments: ['Alternate voice button + main button — confirmed working!', 'Keep temperature above 82, too low won\'t trigger'],
  },
  7: {
    time: '2h ago',
    content: '[Beginner Must-Read] Quick temperature boost guide: Pick "Dorm" scene + Gentle Junior, press main button twice first, then use voice — 3x faster than just clicking! Tested and confirmed, save for later. Detailed character compatibility in comments.',
    tags: ['#Secrets', '#Beginner', '#TempBoost'],
    comments: ['Followed the guide, really way faster! Thanks!', 'Saved — following the map next time'],
  },
  8: {
    time: '1 day ago',
    content: 'Unlocked all 4 characters\' hidden endings! Trigger: temp 60–80, press voice button 5 times without pressing main. Each character has unique hidden lines — the mysterious neighbor one hit me hard. Details in comments 👇',
    tags: ['#Secrets', '#HiddenContent', '#AllCharacters'],
    comments: ['Thank you! Finally unlocked the teacher\'s one!', 'The mysterious neighbor\'s hidden line really got me'],
  },
  9: {
    time: '2 days ago',
    content: 'Compiled cold boss lady intimate line trigger conditions~ "Office" scene gives bonus effects. Press main button 5 times then switch to voice — highest hit rate reaches 87%. Note: different days have different rates, Friday is highest (lol)',
    tags: ['#Secrets', '#ColdBossLady', '#HitRate'],
    comments: ['Thanks for compiling! Bookmarked! Trying on Friday', 'The Friday rate difference is real — interesting finding'],
  },
  10: {
    time: '3 days ago',
    content: '[Couples Duo Guide] Two devices online simultaneously get an exclusive "Resonance" bonus! When one reaches high temp, the other\'s vibration auto-increases. Trick: keep both in sync — voice call while operating together for a completely different experience!',
    tags: ['#Secrets', '#DuoSync', '#ForCouples'],
    comments: ['Resonance bonus! I totally missed this mechanic', 'Tried it with my partner — definitely different!'],
  },
  11: {
    time: '4 days ago',
    content: 'Statistical analysis: after 20+ sessions, temp rises fastest 8–10 AM and 10 PM–12 AM — probably server load related. Also male character voice latency is consistently 0.3s lower than female characters — curious about that haha',
    tags: ['#Secrets', '#DataAnalysis', '#Hardcore'],
    comments: ['The server timing observation is really valuable!', 'Need to verify this latency difference'],
  },
  12: {
    time: '1h ago',
    content: 'Created a custom "Starry Seaside" scene script — ambiance inspired by winter night + waves + breeze, character is "The Silent Lighthouse Keeper." Would be amazing if devs published it… Sharing first, feel free to remix and adapt!',
    tags: ['#MyFantasy', '#FanScene', '#StarrySeaside'],
    comments: ['Atmosphere is incredible! "The Silent Lighthouse Keeper" speaks to my soul', 'Devs should just adopt this — quality is there'],
  },
  13: {
    time: '6h ago',
    content: 'Wrote an extended dialogue for the mysterious neighbor, tried to mimic official tone — restrained, alluring, leaving space. Let me know what you think~ Does it feel off? No confidence at all haha, genuinely want feedback! Full text in comments.',
    tags: ['#MyFantasy', '#DialogueCreation', '#MysteriousNeighbor'],
    comments: ['Can\'t even tell the difference! The use of space is brilliant', 'Third line totally nails it — official-quality feel'],
  },
  14: {
    time: '1 day ago',
    content: 'Compiled a "Progressive Interaction" script structure: IDLE → ACTIVE → AFTER_RESPONSE — ultra-smooth transitions. Core logic: emotional escalation, no skipping levels. Reference this structure for your own creations~',
    tags: ['#MyFantasy', '#ScriptStructure', '#Methodology'],
    comments: ['So useful! Directly applying this escalation logic', '"No skipping levels" is so right — skipping breaks immersion'],
  },
  15: {
    time: '2 days ago',
    content: 'Drew a "Character · Mood" concept illustration series, using color temperature for different states: cool tones = mysterious neighbor\'s detachment, warm rose = gentle junior\'s tenderness. Soft-focus style, feel free to use for fan creation covers~',
    tags: ['#MyFantasy', '#Illustration', '#CharacterDesign'],
    comments: ['Color-character mood matching is spot on!', 'Soft-focus treatment is beautiful — want the full version!'],
  },
  16: {
    time: '3 days ago',
    content: 'Wrote a "Male × Male" duo script — characters are "Childhood Friends · Reunion After Years." Official Rainbow section still has few similar content, hoping to fill the gap~ Fellow fans welcome, just credit the source!',
    tags: ['#MyFantasy', '#LGBT', '#ScriptCreation', '#RainbowZone'],
    comments: ['Childhood friends reunion hits right in the feels! Looking forward to full text!', 'So little of this content — thanks for filling the gap! Very delicately written'],
  },
}

const COMMUNITY_NAME_EN = {
  '小野猫': 'Kitten',
  '硬汉柔情': 'Soft-Hearted Tough Guy',
  '彩虹下的他': 'Under the Rainbow',
  '甜蜜小两口': 'Sweet Couple',
  '夜行狐': 'Night Fox',
  '熊猫不睡觉': 'Sleepless Panda',
  '攻略达人': 'Guide Master',
  '隐藏剧情猎人': 'Hidden Ending Hunter',
  '蝴蝶效应': 'Butterfly Effect',
  '数据控小明': 'Data Ming',
  '创作家Mia': 'Creator Mia',
  '写字的人': 'The Writer',
  '彩虹糖果': 'Rainbow Candy',
  '插画师Leo': 'Illustrator Leo',
}

const COMMUNITY_TEMPLATE_EN = {
  '冷感女上司·深夜版': 'Cold Boss Lady · Late Night',
  '温柔学妹·宿舍私语': 'Sweet Junior · Dorm Whisper',
  '彩虹之约·校园初恋': 'Rainbow Promise · Campus First Love',
  '阳台邂逅·月夜情话': 'Balcony Encounter · Moonlit Confession',
  '阳台·神秘邻居': 'Balcony · Mysterious Neighbor',
  '知性女老师·放学后': 'Intellectual Teacher · After Class',
  '深夜阳台·神秘邻居': 'Late-Night Balcony · Mysterious Neighbor',
  '神秘邻居·月夜偶遇': 'Mysterious Neighbor · Moonlit Encounter',
  '郁金香庭院·雨后': 'Tulip Courtyard · After Rain',
}

const EXPERIENCE_IMAGE_FALLBACKS = {
  1: 'boss',
  2: 'junior',
  3: 'rb1',
  4: 'h3',
  5: 'neighbor',
  6: 'boss',
}

function resolveExperienceImageId(post) {
  if (post.imageId) return post.imageId
  if (post.templateId && !String(post.templateId).startsWith('community-')) {
    return post.templateId
  }
  return EXPERIENCE_IMAGE_FALLBACKS[post.id] || 'boss'
}

const EXPERIENCE_LINES_ZH = {
  1: '别急，先听我说完这一句。',
  2: '把节奏交给我，慢慢来。',
  3: '现在，我们一起同步呼吸。',
  4: '靠近一点，今晚只看着我。',
  5: '风停下来的时候，我会更靠近你。',
  6: '保持这个温度，隐藏台词快来了。',
}

const EXPERIENCE_LINES_EN = {
  1: 'Wait, let me finish this line first.',
  2: 'Follow my rhythm and take it slowly.',
  3: 'Now breathe with me, together.',
  4: 'Come closer and keep your eyes on me.',
  5: 'When the wind settles, I move closer.',
  6: 'Hold this intensity. The hidden line is close.',
}

/** charId → 预设语音场景 ID 映射（取每个角色的第一个匹配场景） */
const CHAR_TO_PRESET_MAP = {
  'boss': 'hot_01',
  'junior': 'hot_02',
  'neighbor': 'hot_03',
  'teacher': 'fantasy_03',
  'witch': 'fantasy_02',
  'h3': 'fantasy_01',
  'rb1': 'campus_01',
  'rb4': 'campus_04',
  'hot_01': 'hot_01',
  'office_03': 'office_03',
  'campus_01': 'campus_01',
  'fantasy_02': 'fantasy_02',
}

const PRESET_EXPERIENCE_CARDS = [
  {
    id: 'preset-feed-hot-01',
    type: 'preset-audio',
    templateId: 'hot_01',
    templateName: '办公室·冷感女上司',
    imageId: 'boss',
    avatar: '🎧',
    name: '官方语音精选',
    time: '刚刚上新',
    gender: '预设',
    content: '把这条预设语音放进体验流里，用户不用离开社区就能直接试听。冷感办公室场景很适合做第一张“热门试听卡”。',
    previewLine: '办公室冷感女上司加班时突然变得温柔',
    previewLineEn: 'My cold boss suddenly gets tender during overtime',
    imgColor: 'from-[#351323] via-[#241026] to-[#110910]',
    imgEmoji: '🎧',
    likes: 2688,
    comments: 128,
    bookmarks: 711,
    tags: ['#预设语音', '#热门试听', '#官方推荐'],
    topComments: [
      { avatar: '🔥', name: '夜听党', text: '这种卡片插在体验流里很自然，不像硬广告。', likes: 66 },
      { avatar: '🎙️', name: '声控研究所', text: '建议每个分类都放一张试听入口。', likes: 41 },
    ],
  },
  {
    id: 'preset-feed-office-03',
    type: 'preset-audio',
    templateId: 'office_03',
    templateName: '职场·最后加班',
    imageId: 'h3',
    avatar: '💼',
    name: '加班体验官',
    time: '23分钟前',
    gender: '精选',
    content: '这条适合放在真实用户分享之间：它有明确场景、可直接试听，还能用“试用同款”把用户带回体验链路。',
    previewLine: '加班到最后一个，总裁关门前说「送你回去吧」',
    previewLineEn: 'Last one working late—the CEO says "Let me take you home"',
    imgColor: 'from-[#2b1622] via-[#1d111a] to-[#10090e]',
    imgEmoji: '💼',
    likes: 1496,
    comments: 82,
    bookmarks: 356,
    tags: ['#办公室', '#沉浸试听', '#可试用'],
    topComments: [
      { avatar: '🦊', name: '夜行狐', text: '作为中插内容刚好，滑到就能听。', likes: 29 },
      { avatar: '📌', name: '产品笔记', text: '内容流和语音资产终于连上了。', likes: 24 },
    ],
  },
  {
    id: 'preset-feed-fantasy-02',
    type: 'preset-audio',
    templateId: 'fantasy_02',
    templateName: '禁忌·女神赌局',
    imageId: 'witch',
    avatar: '✨',
    name: '幻想收藏夹',
    time: '1小时前',
    gender: '预设',
    content: '幻想类语音包可以更像“用户种草”：先给一句氛围描述，再让播放器承担真正的体验预览。',
    previewLine: '女神说只要赢了两局就可以直接带我回家',
    previewLineEn: 'The goddess says two wins can take me straight home',
    imgColor: 'from-[#24103a] via-[#1a0d2a] to-[#0b0712]',
    imgEmoji: '✨',
    likes: 3201,
    comments: 174,
    bookmarks: 902,
    tags: ['#幻想场景', '#语音包', '#收藏向'],
    topComments: [
      { avatar: '🦋', name: '蝴蝶效应', text: '这个更适合做晚间推荐位。', likes: 57 },
      { avatar: '🎨', name: '创作家Mia', text: '还可以开放二创同款脚本。', likes: 36 },
    ],
  },
]

function buildExperienceFeed(posts) {
  if (!Array.isArray(posts) || posts.length === 0) return PRESET_EXPERIENCE_CARDS

  const feed = []
  posts.forEach((post, index) => {
    feed.push(post)
    if (index === 0) feed.push(PRESET_EXPERIENCE_CARDS[0])
    if (index === 2) feed.push(PRESET_EXPERIENCE_CARDS[1])
  })
  feed.push(PRESET_EXPERIENCE_CARDS[2])
  return feed
}

/**
 * 使用预设语音音频 — 为体验分享帖加载真实 TTS 音频
 * @param {string|null} templateId 帖子的 templateId / charId
 * @returns {{ audioUrl: string|null, loading: boolean, error: string|null, openingLine: string, characterName: string }}
 */
function useExperienceAudio(templateId) {
  const presetId = templateId ? CHAR_TO_PRESET_MAP[templateId] : null
  const [audioUrl, setAudioUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [openingLine, setOpeningLine] = useState('')
  const [characterName, setCharacterName] = useState('')
  const mountedRef = useRef(true)
  const fetchedRef = useRef(false)
  const lastPresetRef = useRef(null)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (lastPresetRef.current !== presetId) {
      lastPresetRef.current = presetId
      fetchedRef.current = false
      setAudioUrl(null)
      setOpeningLine('')
      setCharacterName('')
      setError(null)
    }
    if (!presetId || fetchedRef.current) return
    fetchedRef.current = true
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await preparePresetVoiceAudio(presetId)
        if (cancelled || !mountedRef.current) return
        if (result?.script?.audioUrl) {
          setAudioUrl(result.script.audioUrl)
          setOpeningLine(result.script.openingLine || '')
          setCharacterName(result.script.name || '')
        }
      } catch (err) {
        if (cancelled || !mountedRef.current) return
        console.warn(`预设音频加载失败 [${presetId}]:`, err.message)
        setError(err.message)
      } finally {
        if (!cancelled && mountedRef.current) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [presetId])

  return { audioUrl, loading, error, openingLine, characterName, hasPreset: Boolean(presetId) }
}

// ═══════════════════════════════════════════════════════════
//  子组件
// ═══════════════════════════════════════════════════════════

/**
 * 单条热门评论
 * 新增 likes 数显示
 */
function TopComment({ comment }) {
  const L = useL()
  const [liked, setLiked] = useState(false)
  const displayLikes = liked ? comment.likes + 1 : comment.likes
  const displayName = L(comment.name, COMMUNITY_NAME_EN[comment.name] || comment.name)
  return (
    <div className="flex items-start gap-2 pt-2 border-t border-[rgba(255,255,255,0.04)]">
      <span className="text-sm mt-0.5 flex-shrink-0">{comment.avatar}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[rgba(245,240,242,0.5)] leading-relaxed">
          <span className="text-[rgba(245,240,242,0.65)] font-medium">{displayName}{L('：', ': ')}</span>
          {comment.text}
        </p>
      </div>
      {/* 评论点赞 */}
      <button
        onClick={() => setLiked((v) => !v)}
        className="flex-shrink-0 flex items-center gap-1 transition-all active:scale-90 ml-1"
      >
        <Heart
          size={11}
          className={`transition-colors ${liked ? 'fill-[#FF9ACB] text-[#FF9ACB]' : 'text-[rgba(245,240,242,0.3)]'}`}
        />
        <span className={`text-[9px] tabular-nums ${liked ? 'text-[#FF9ACB]' : 'text-[rgba(245,240,242,0.3)]'}`}>
          {displayLikes}
        </span>
      </button>
    </div>
  )
}

/** 性别/视角角标 */
function GenderBadge({ gender }) {
  const L = useL()
  if (!gender) return null
  const GENDER_EN = { '女生': 'Female', '男生': 'Male', 'LGBT': 'LGBT', '情侣': 'Couple', '中性': 'Neutral' }
  const styles = {
    '女生':  'bg-[rgba(255,154,203,0.15)] text-[#FF9ACB]',
    '男生':  'bg-[rgba(100,180,255,0.15)] text-[#64b4ff]',
    'LGBT':  'bg-[rgba(179,128,255,0.15)] text-[#B380FF]',
    '情侣':  'bg-[rgba(255,200,100,0.15)] text-[#ffc864]',
    '中性':  'bg-[rgba(255,255,255,0.08)] text-[rgba(245,240,242,0.5)]',
  }
  return (
    <span className={`text-[8px] rounded-full px-1.5 py-0.5 font-medium ${styles[gender] ?? styles['中性']}`}>
      {L(gender, GENDER_EN[gender] || gender)}
    </span>
  )
}

/** 帖子卡片 */
function PostCard({ post, likeState, onLike }) {
  const L = useL()
  const { liked, count } = likeState
  const [imgSrc, setImgSrc] = useState(`/images/posts/${post.templateId}.jpg`)
  const en = LEGACY_POSTS_EN[post.id]
  const tags = Array.isArray(post.tags) ? post.tags : []
  const displayTags = en?.tags ? tags.map((t, i) => L(t, en.tags[i] || t)) : tags
  const topComments = Array.isArray(post.topComments) ? post.topComments : []
  const displayComments = en?.comments ? topComments.map((c, i) => ({ ...c, text: L(c.text, en.comments[i] || c.text) })) : topComments
  const comments = Number(post.comments || 0)
  const bookmarks = Number(post.bookmarks || 0)
  const imgColor = post.imgColor || 'from-[#1a1028] to-[#251840]'
  const imgEmoji = post.imgEmoji || post.avatar || '✨'
  const displayName = L(post.name, COMMUNITY_NAME_EN[post.name] || post.name)
  const displayTemplateName = L(post.templateName, COMMUNITY_TEMPLATE_EN[post.templateName] || post.templateName)

  return (
    <div className="rounded-2xl p-4 card-glow bg-[rgba(30,20,25,0.6)] space-y-3">
      {/* 头部：头像 + 昵称 + 时间 + 视角角标 */}
      <div className="flex items-center gap-2.5">
        <span className="text-2xl leading-none">{post.avatar}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-[rgba(245,240,242,0.9)] truncate">{displayName}</p>
            <GenderBadge gender={post.gender} />
          </div>
          <p className="text-[10px] text-[rgba(245,240,242,0.4)]">{L(post.time, en?.time || post.time)}</p>
        </div>
      </div>

      {/* 正文 */}
      <p className="text-[12px] text-[rgba(245,240,242,0.75)] leading-relaxed">{L(post.content, en?.content || post.content)}</p>

      {/* 图片区（jpg → png → emoji+渐变 链式回退） */}
      <div className={`relative h-48 rounded-xl overflow-hidden bg-gradient-to-br ${imgColor} flex items-center justify-center`}>
        {imgSrc && (
          <img
            src={imgSrc}
            alt=""
            onError={() => {
              if (imgSrc.endsWith('.jpg')) setImgSrc(`/images/posts/${post.templateId}.png`)
              else setImgSrc(null)
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {!imgSrc && (
          <span className="text-3xl select-none opacity-40">{imgEmoji}</span>
        )}
      </div>

      {/* 标签 */}
      <div className="flex gap-1.5 flex-wrap">
        {displayTags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] bg-[rgba(179,128,255,0.12)] text-[rgba(179,128,255,0.7)] rounded-full px-2 py-0.5"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* 试用模板按钮 */}
      {post.templateName && (
        <button
          onClick={() => alert(L('试用模板：', 'Try template: ') + displayTemplateName)}
          className="inline-flex items-center gap-1 text-xs bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition mt-2"
        >
          🔗 {L('试用同款：', 'Try: ')}{displayTemplateName}
        </button>
      )}

      {/* 互动区 */}
      <div className="flex items-center gap-4 pt-1">
        {/* 点赞 */}
        <button
          onClick={onLike}
          className="flex items-center gap-1.5 transition-all active:scale-90"
        >
          <Heart
            size={14}
            className={`transition-colors ${liked ? 'fill-[#FF9ACB] text-[#FF9ACB]' : 'text-[rgba(245,240,242,0.4)]'}`}
          />
          <span className={`text-[11px] tabular-nums ${liked ? 'text-[#FF9ACB]' : 'text-[rgba(245,240,242,0.45)]'}`}>
            {count.toLocaleString()}
          </span>
        </button>
        {/* 评论 */}
        <button
          className="flex items-center gap-1.5"
          onClick={() => alert(L('💬 评论功能即将开放', '💬 Comments coming soon'))}
        >
          <MessageCircle size={14} className="text-[rgba(245,240,242,0.4)]" />
          <span className="text-[11px] text-[rgba(245,240,242,0.45)]">{comments}</span>
        </button>
        {/* 收藏 */}
        <button
          className="flex items-center gap-1.5"
          onClick={() => alert(L('🔖 已收藏（演示）', '🔖 Saved (demo)'))}
        >
          <Bookmark size={14} className="text-[rgba(245,240,242,0.4)]" />
          <span className="text-[11px] text-[rgba(245,240,242,0.45)]">{bookmarks}</span>
        </button>
      </div>

      {/* 热门评论（带点赞数） */}
      {topComments.length > 0 && (
        <div className="space-y-1.5">
          {displayComments.map((c, i) => (
            <TopComment key={i} comment={c} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReelAction({ icon: Icon, label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex flex-col items-center gap-1 text-white/80 transition-all active:scale-90 disabled:opacity-45 disabled:active:scale-100"
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md ${
        active
          ? 'border-[#FF9ACB]/55 bg-[#FF4FA3]/35 text-[#FFB8D7] shadow-[0_0_18px_rgba(255,79,163,0.35)]'
          : 'border-white/15 bg-black/35 text-white hover:bg-white/15'
      }`}>
        <Icon size={21} fill={active ? 'currentColor' : 'none'} strokeWidth={2.1} />
      </span>
      <span className="max-w-[54px] truncate text-[10px] font-medium text-white/70">{label}</span>
    </button>
  )
}

function formatAudioTime(seconds) {
  if (!seconds || !isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function FloatingLoverBar({ onChatWithLover, isChatDisabled }) {
  const L = useL()
  const { loading, refreshMessage, text } = useVirtualLover()
  const displayText = loading && !text
    ? L('正在靠近你…', 'Coming closer…')
    : text || L('想让你知道，你一直被惦记着。', 'You are being thought of.')

  return (
    <div
      className="absolute left-5 right-[92px] top-[54px] z-10 flex items-center gap-2 rounded-2xl border border-white/12 bg-black/30 px-2.5 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-md transition-all active:scale-[0.99]"
      onClick={(event) => {
        event.stopPropagation()
        refreshMessage()
      }}
    >
      <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[rgba(179,128,255,0.22)] text-base">
        🤖
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#B380FF] shadow-[0_0_8px_#B380FF]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-bold leading-none text-white">{L('Luna 在线', 'Luna online')}</p>
          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[8px] leading-none text-white/50">{L('固定陪伴', 'Pinned')}</span>
        </div>
        <p className="mt-1 truncate text-[10px] leading-none text-white/58">{displayText}</p>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onChatWithLover()
        }}
        disabled={isChatDisabled}
        className="flex-shrink-0 rounded-full bg-gradient-to-r from-[#FF7DAF] to-[#A87CFF] px-3 py-1.5 text-[10px] font-semibold text-white shadow-[0_0_12px_rgba(179,128,255,0.35)] disabled:opacity-45"
      >
        {L('聊聊', 'Chat')}
      </button>
    </div>
  )
}

function ReelSlide({ post, likeState, onLike, onTryTemplate, onComment, onSave, onChatWithLover, isChatDisabled }) {
  const L = useL()
  const { liked, count } = likeState
  const [saved, setSaved] = useState(false)
  const isPresetAudioCard = post.type === 'preset-audio'
  const imageId = resolveExperienceImageId(post)
  const [imgSrc, setImgSrc] = useState(`/images/posts/${imageId}.jpg`)
  const en = LEGACY_POSTS_EN[post.id]
  const tags = Array.isArray(post.tags) ? post.tags : []
  const displayTags = en?.tags ? tags.map((t, i) => L(t, en.tags[i] || t)) : tags
  const imgColor = post.imgColor || 'from-[#1a1028] to-[#251840]'
  const imgEmoji = post.imgEmoji || post.avatar || '✨'
  const displayName = L(post.name, COMMUNITY_NAME_EN[post.name] || post.name)
  const displayTemplateName = L(post.templateName, COMMUNITY_TEMPLATE_EN[post.templateName] || post.templateName)
  const content = L(post.content, en?.content || post.content)
  const comments = Number(post.comments || 0)

  // ── 预设语音音频 ──────────────────────────────────────────
  const { audioUrl, loading: audioLoading, error: audioError, openingLine, hasPreset } = useExperienceAudio(post.templateId)

  // ── 音频播放状态 ──────────────────────────────────────────
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioCurrent, setAudioCurrent] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioLoaded, setAudioLoaded] = useState(false)
  const progressBarRef = useRef(null)

  // 切换 posts 时重置
  useEffect(() => {
    setIsPlaying(false)
    setAudioCurrent(0)
    setAudioDuration(0)
    setAudioLoaded(false)
  }, [post.id])

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !audioLoaded) return
    if (audio.paused) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [audioLoaded])

  const handleSeek = useCallback((event) => {
    const audio = audioRef.current
    const bar = progressBarRef.current
    if (!audio || !audioLoaded || !bar) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
    audio.currentTime = ratio * audio.duration
  }, [audioLoaded])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTimeUpdate = () => setAudioCurrent(audio.currentTime)
    const onDuration = () => { if (audio.duration && isFinite(audio.duration)) { setAudioDuration(audio.duration); setAudioLoaded(true) } }
    const onEnded = () => setIsPlaying(false)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onLoaded = () => { if (audio.duration && isFinite(audio.duration)) { setAudioDuration(audio.duration); setAudioLoaded(true) } }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDuration)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('loadedmetadata', onLoaded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDuration)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('loadedmetadata', onLoaded)
    }
  }, [audioUrl])

  // ── 播放器文案 ────────────────────────────────────────────
  const progress = audioDuration > 0 ? (audioCurrent / audioDuration) * 100 : 0
  const fallbackLine = L(
    post.previewLine || EXPERIENCE_LINES_ZH[post.id] || EXPERIENCE_LINES_ZH[1],
    post.previewLineEn || EXPERIENCE_LINES_EN[post.id] || EXPERIENCE_LINES_EN[1]
  )
  const displayLine = hasPreset
    ? (audioLoading ? L('语音准备中…', 'Preparing voice…') : audioError ? fallbackLine : (openingLine || fallbackLine))
    : fallbackLine
  const showRealPlayer = hasPreset && audioUrl && !audioError
  const currentTimeStr = showRealPlayer ? formatAudioTime(audioCurrent) : `0:${String(8 + ((Number(post.id) || 1) * 7) % 48).padStart(2, '0')}`
  const totalTimeStr = showRealPlayer ? formatAudioTime(audioDuration) : `1:${String(18 + ((Number(post.id) || 1) * 5) % 38).padStart(2, '0')}`

  return (
    <article className={`relative h-full overflow-hidden rounded-[28px] bg-gradient-to-br ${imgColor} shadow-[0_24px_80px_rgba(0,0,0,0.45)]`}>
      {/* 隐藏的真实 audio 元素 */}
      {showRealPlayer && (
        <audio ref={audioRef} src={audioUrl} preload="auto" />
      )}

      {imgSrc && (
        <img
          src={imgSrc}
          alt=""
          onError={() => {
            if (imgSrc.endsWith('.jpg')) setImgSrc(`/images/posts/${imageId}.png`)
            else setImgSrc(null)
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {!imgSrc && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="select-none text-7xl opacity-35">{imgEmoji}</span>
        </div>
      )}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.1)_35%,rgba(0,0,0,0.82)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent" />
      <FloatingLoverBar onChatWithLover={onChatWithLover} isChatDisabled={isChatDisabled} />

      <div className="absolute bottom-5 left-4 right-[82px] space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/35 text-xl backdrop-blur-md">
            {post.avatar}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-bold text-white">{displayName}</p>
              <GenderBadge gender={post.gender} />
            </div>
            <p className="text-[10px] text-white/55">{L(post.time, en?.time || post.time)}</p>
          </div>
          {isPresetAudioCard && (
            <span className="ml-auto rounded-full border border-[#FFB8D7]/25 bg-[#FF4FA3]/18 px-2 py-1 text-[9px] font-semibold text-[#FFD5E7] shadow-[0_0_14px_rgba(255,79,163,0.18)]">
              {L('预设语音包', 'Preset Pack')}
            </span>
          )}
        </div>

        <p className="line-clamp-3 text-[13px] leading-relaxed text-white/88 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
          {content}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {displayTags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-white/12 px-2 py-1 text-[10px] font-medium text-white/78 backdrop-blur-md">
              {tag}
            </span>
          ))}
        </div>

        {/* ── 音频播放器 ──────────────────────────────────── */}
        <div className={`space-y-2 rounded-2xl border backdrop-blur-md p-3 transition-all ${
          audioLoading ? 'border-[#B380FF]/25 bg-[#B380FF]/8 animate-pulse' :
          audioError ? 'border-[rgba(255,100,100,0.2)] bg-[rgba(255,100,100,0.06)]' :
          showRealPlayer ? 'border-[#FF9ACB]/20 bg-black/28' :
          'border-white/12 bg-black/28'
        }`}>
          <div className="flex items-center gap-2">
            {/* 播放/暂停按钮 */}
            {showRealPlayer ? (
              <button
                onClick={handlePlayPause}
                disabled={!audioLoaded}
                className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#FF4FA3]/25 text-[#FFB8D7] transition-all active:scale-90 disabled:opacity-40"
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
              </button>
            ) : hasPreset ? (
              <PlayCircle size={15} className={`flex-shrink-0 ${audioLoading ? 'text-[#B380FF] animate-pulse' : 'text-[#FFB8D7]'}`} />
            ) : (
              <Volume2 size={15} className="flex-shrink-0 text-white/38" />
            )}
            {post.templateName ? (
              <button
                type="button"
                onClick={onTryTemplate}
                className="inline-flex min-w-0 flex-1 items-center gap-1 rounded-full border border-[#FF9ACB]/25 bg-[#FF4FA3]/12 px-3 py-1.5 text-[11px] font-semibold text-[#FFD5E7] transition-all hover:bg-[#FF4FA3]/22 active:scale-[0.98]"
              >
                <Sparkles size={12} className="flex-shrink-0" />
                <span className="truncate">{L('试用同款：', 'Try: ')}{displayTemplateName}</span>
                <span className="flex-shrink-0 text-[#FFD5E7]/70">›</span>
              </button>
            ) : (
              <span className={`min-w-0 flex-1 truncate text-[12px] font-semibold ${
                audioLoading ? 'text-[#B380FF]' : audioError ? 'text-[rgba(255,150,150,0.7)]' : 'text-white'
              }`}>
                {displayLine}
              </span>
            )}
            {/* 音频加载指示器 */}
            {audioLoading && (
              <span className="flex-shrink-0 h-3 w-3 rounded-full border-2 border-[#B380FF] border-t-transparent animate-spin" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="w-8 text-[9px] tabular-nums text-white/55">{currentTimeStr}</span>
            {/* 进度条 */}
            {showRealPlayer ? (
              <div
                ref={progressBarRef}
                className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/18 cursor-pointer"
                onClick={handleSeek}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#FF7DAF] to-[#B380FF] shadow-[0_0_10px_rgba(255,125,175,0.55)] transition-[width] duration-150"
                  style={{ width: `${progress}%` }}
                />
                <span
                  className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.75)]"
                  style={{ left: `calc(${progress}% - 5px)` }}
                />
              </div>
            ) : (
              <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/18">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#FF7DAF] to-[#B380FF] shadow-[0_0_10px_rgba(255,125,175,0.55)]"
                  style={{ width: `${18 + ((Number(post.id) || 1) * 13) % 64}%` }}
                />
                <span
                  className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.75)]"
                  style={{ left: `calc(${18 + ((Number(post.id) || 1) * 13) % 64}% - 5px)` }}
                />
              </div>
            )}
            <span className="w-8 text-right text-[9px] tabular-nums text-white/55">{totalTimeStr}</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-7 right-4 flex flex-col items-center gap-3">
        <ReelAction icon={Heart} label={count.toLocaleString()} active={liked} onClick={onLike} />
        <ReelAction icon={MessageCircle} label={comments.toString()} onClick={onComment} />
        <ReelAction
          icon={Bookmark}
          label={saved ? L('已收藏', 'Saved') : L('收藏', 'Save')}
          active={saved}
          onClick={() => {
            setSaved((v) => !v)
            onSave()
          }}
        />
        <ReelAction icon={Send} label={L('分享', 'Share')} onClick={() => alert(L('分享功能即将开放', 'Share coming soon'))} />
        <ReelAction icon={Volume2} label={showRealPlayer ? L('试听', 'Audio') : L('准备中', 'Loading')} onClick={showRealPlayer ? handlePlayPause : undefined} />
      </div>
    </article>
  )
}

function ExperienceReel({ posts, loading, likesMap, onLike, onTryTemplate, onComment, onSave, onChatWithLover, isChatDisabled }) {
  const L = useL()
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartY = useRef(null)
  const wheelLocked = useRef(false)
  const feedPosts = buildExperienceFeed(posts)

  useEffect(() => {
    setActiveIndex(0)
  }, [posts])

  const move = (direction) => {
    setActiveIndex((idx) => {
      const next = idx + direction
      if (next < 0) return 0
      if (next >= feedPosts.length) return feedPosts.length - 1
      return next
    })
  }

  const handleWheel = (event) => {
    if (Math.abs(event.deltaY) < 18 || wheelLocked.current) return
    wheelLocked.current = true
    move(event.deltaY > 0 ? 1 : -1)
    window.setTimeout(() => {
      wheelLocked.current = false
    }, 520)
  }

  if (loading && posts.length === 0) {
    return (
      <div className="flex h-[calc(100dvh-10rem)] min-h-[560px] items-center justify-center rounded-[28px] bg-black/30">
        <p className="text-[12px] text-white/45 animate-pulse">{L('加载体验流中…', 'Loading experience feed…')}</p>
      </div>
    )
  }

  if (!feedPosts.length) return null

  const activePost = feedPosts[activeIndex] || feedPosts[0]
  return (
    <section
      className="-mx-4 mt-1 min-h-0 flex-1 px-3"
      onWheel={handleWheel}
      onTouchStart={(event) => {
        touchStartY.current = event.touches[0]?.clientY ?? null
      }}
      onTouchEnd={(event) => {
        if (touchStartY.current == null) return
        const endY = event.changedTouches[0]?.clientY ?? touchStartY.current
        const delta = touchStartY.current - endY
        touchStartY.current = null
        if (Math.abs(delta) > 44) move(delta > 0 ? 1 : -1)
      }}
    >
      <div className="relative h-full min-h-[360px] overflow-hidden">
        <div className="h-full transition-all duration-300 ease-out" key={activePost.id}>
          <ReelSlide
            post={activePost}
            likeState={likesMap[activePost.id] || { liked: false, count: activePost.likes || 0 }}
            onLike={() => onLike(activePost.id)}
            onTryTemplate={() => onTryTemplate(activePost)}
            onComment={() => onComment(activePost)}
            onSave={() => onSave(activePost)}
            onChatWithLover={onChatWithLover}
            isChatDisabled={isChatDisabled}
          />
        </div>

      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════
//  AI 虚拟恋人卡片（接入 Grok）
// ═══════════════════════════════════════════════════════════

const MOOD_STYLES = {
  '暧昧': { bg: 'rgba(255,154,203,0.12)', border: 'rgba(255,154,203,0.18)' },
  '温柔': { bg: 'rgba(179,128,255,0.12)', border: 'rgba(179,128,255,0.15)' },
  '调皮': { bg: 'rgba(255,200,100,0.12)', border: 'rgba(255,200,100,0.18)' },
}

const RANDOM_LOADING_LINES = [
  '正在随机匹配体验内容…',
  '正在生成语音剧本…',
  '正在同步控制参数…',
]

const RANDOM_LOADING_LINES_EN = [
  'Matching random experiences…',
  'Generating voice script…',
  'Syncing control parameters…',
]

const RANDOM_SCRIPT_POOL = [
  {
    id: 'rand-01',
    title: '随机体验：夜色耳语',
    openingLine: '今晚的风很轻，我只想把声音贴近你。',
    mood: '温柔',
    intensity: '中度体验',
  },
  {
    id: 'rand-02',
    title: '随机体验：心跳加速',
    openingLine: '别急，先闭上眼，跟着我的节奏呼吸。',
    mood: '暧昧',
    intensity: '高强体验',
  },
  {
    id: 'rand-03',
    title: '随机体验：温柔试探',
    openingLine: '我会慢一点靠近，直到你也愿意靠近我。',
    mood: '温柔',
    intensity: '轻度体验',
  },
]

function randomGenerateScript() {
  return new Promise((resolve, reject) => {
    const delay = 1200 + Math.floor(Math.random() * 800)
    window.setTimeout(() => {
      // 小概率失败，验证异常分支
      if (Math.random() < 0.08) {
        reject(new Error('random generate failed'))
        return
      }
      const picked = RANDOM_SCRIPT_POOL[Math.floor(Math.random() * RANDOM_SCRIPT_POOL.length)]
      resolve({
        ...picked,
        generatedAt: Date.now(),
        source: 'community-random',
      })
    }, delay)
  })
}

function LoverActionButtons({
  onChatWithLover,
  onRandomExperience,
  isRandomLoading,
  randomLoadingText,
  isChatDisabled,
}) {
  const L = useL()
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <button
        onClick={onChatWithLover}
        disabled={isChatDisabled || isRandomLoading}
        className="rounded-full py-2 text-[11px] font-semibold text-white bg-gradient-to-r from-[#FF7DAF] to-[#A87CFF] shadow-[0_0_12px_rgba(179,128,255,0.35)] disabled:opacity-45 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
      >
        {L('关心一下你的AI恋人', 'Check on your AI Lover')}
      </button>
      <button
        onClick={onRandomExperience}
        disabled={isRandomLoading}
        className="rounded-full py-2 text-[11px] font-semibold text-[#E8DDF1] border border-[#B380FF]/35 bg-[rgba(179,128,255,0.12)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
      >
        {isRandomLoading ? randomLoadingText : L('随机体验', 'Random')}
      </button>
    </div>
  )
}

function AiLoverCard({
  aiMemoryDeleted,
  onDeleteMemory,
  onResetMemory,
  onChatWithLover,
  onRandomExperience,
  isRandomLoading,
  randomLoadingText,
  isChatDisabled,
}) {
  const L = useL()
  const { clearMemory, fadeIn, fallback, loading, metaText, mood, provider, refreshMessage, text, timestamp } = useVirtualLover()
  const [expanded, setExpanded] = useState(false)

  const moodStyle = MOOD_STYLES[mood] || MOOD_STYLES['温柔']
  const displayText = aiMemoryDeleted
    ? L('记忆已清除，点开重新开始。', 'Memory cleared. Tap to restart.')
    : loading && !text
      ? L('思念加载中…', 'Loading thoughts…')
      : text

  if (!expanded) {
    return (
      <div
        className="flex items-center gap-3 rounded-2xl border border-[#B380FF]/20 bg-[linear-gradient(135deg,rgba(26,16,40,0.92),rgba(37,24,64,0.78))] px-3.5 py-3 shadow-[0_14px_38px_rgba(0,0,0,0.24)] backdrop-blur-md transition-all active:scale-[0.99]"
        onClick={() => {
          if (aiMemoryDeleted) onResetMemory()
          setExpanded(true)
        }}
      >
        <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(179,128,255,0.2)] text-xl">
          🤖
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#B380FF] shadow-[0_0_8px_#B380FF]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[12px] font-semibold text-[rgba(245,240,242,0.92)]">{L('Luna 在线', 'Luna online')}</p>
            <span className="rounded-full bg-white/8 px-1.5 py-0.5 text-[8px] text-white/42">{L('可展开', 'Tap')}</span>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-[rgba(245,240,242,0.56)]">{displayText || L('点开看看她想说什么。', 'Tap to see what she says.')}</p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onChatWithLover()
            }}
            disabled={isChatDisabled || isRandomLoading}
            className="rounded-full bg-gradient-to-r from-[#FF7DAF] to-[#A87CFF] px-3 py-1.5 text-[10px] font-semibold text-white shadow-[0_0_12px_rgba(179,128,255,0.28)] disabled:opacity-45"
          >
            {L('聊聊', 'Chat')}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onRandomExperience()
            }}
            disabled={isRandomLoading}
            className="rounded-full border border-[#B380FF]/28 bg-[rgba(179,128,255,0.1)] px-3 py-1.5 text-[10px] font-semibold text-[#E8DDF1] disabled:opacity-50"
          >
            {isRandomLoading ? randomLoadingText : L('随机', 'Random')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl p-4 card-glow cursor-pointer transition-all active:scale-[0.98]"
      style={{ background: 'linear-gradient(135deg, #1a1028, #251840)' }}
      onClick={() => {
        if (aiMemoryDeleted) {
          onResetMemory()
          refreshMessage()
        } else {
          refreshMessage()
        }
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-2xl bg-[rgba(179,128,255,0.2)] flex items-center justify-center text-xl flex-shrink-0">
          🤖
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-[rgba(245,240,242,0.9)]">{L('你的虚拟恋人', 'Your AI Lover')}</p>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            setExpanded(false)
          }}
          className="rounded-full border border-white/10 bg-white/8 px-2 py-1 text-[10px] font-medium text-white/50 transition-colors hover:text-white/75"
        >
          {L('收起', 'Collapse')}
        </button>
        {/* 呼吸点 */}
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            background: '#B380FF',
            boxShadow: '0 0 6px #B380FF',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      </div>

      {/* 消息气泡 */}
      {!aiMemoryDeleted ? (
        <div className="ml-13 space-y-3">
          <div
            className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[12px] text-[rgba(245,240,242,0.85)] leading-relaxed min-h-[40px]"
            style={{
              background: moodStyle.bg,
              border: `1px solid ${moodStyle.border}`,
              opacity: fadeIn ? 1 : 0,
              transform: fadeIn ? 'translateY(0)' : 'translateY(4px)',
              transition: 'opacity 0.06s ease, transform 0.06s ease',
            }}
          >
            {loading && !text ? (
              <span className="inline-block text-[rgba(245,240,242,0.4)] animate-pulse">{L('思念加载中…', 'Loading thoughts…')}</span>
            ) : text}
          </div>

          <LoverActionButtons
            onChatWithLover={(e) => {
              e.stopPropagation()
              onChatWithLover()
            }}
            onRandomExperience={(e) => {
              e.stopPropagation()
              onRandomExperience()
            }}
            isRandomLoading={isRandomLoading}
            randomLoadingText={randomLoadingText}
            isChatDisabled={isChatDisabled}
          />

          {/* 底部操作 */}
          <div className="flex items-center justify-between">
            <button
              onClick={async (e) => {
                e.stopPropagation()
                await clearMemory()
                onDeleteMemory()
              }}
              className="flex items-center gap-1.5 text-[10px] text-[rgba(245,240,242,0.35)] hover:text-[rgba(255,100,100,0.6)] transition-colors"
            >
              <Trash2 size={11} />
              {L('删除今晚的记忆', "Delete tonight's memory")}
            </button>
            <span className="text-[9px] text-[rgba(245,240,242,0.25)]">{loading ? L('更新中…', 'Updating…') : L('点击卡片换一句', 'Tap for new message')}</span>
          </div>
        </div>
      ) : (
        <div className="ml-13">
          <p className="text-[11px] text-[rgba(245,240,242,0.3)] italic">{L('记忆已清除，这段时光只存在于当时。', 'Memory cleared. That moment exists only in the past.')}</p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  主组件
// ═══════════════════════════════════════════════════════════

export default function CommunityPage() {
  const TABS = ['体验分享', '攻略教程', '创作展示']
  const TAB_EN = { '体验分享': 'Experiences', '攻略教程': 'Guides', '创作展示': 'Creations' }
  const navigate = useNavigate()
  const { showToast } = useApp()
  const L = useL()

  // ── 社区数据 Hook ────────────────────────────────────────
  const { posts, currentTab, loading, hasMore, error, switchTab, refresh } = useCommunity()

  // ── 点赞状态（每个帖子独立）────────────────────────────
  // TODO: 替换为后端持久化点赞状态（/api/community/like）
  const [likesMap, setLikesMap] = useState(() => {
    const map = {}
    posts.forEach((post) => {
      map[post.id] = { liked: false, count: post.likes || 0 }
    })
    return map
  })

  // ── AI 记忆状态 ──────────────────────────────────────────
  const [aiMemoryDeleted, setAiMemoryDeleted] = useState(false)
  const [isRandomLoading, setIsRandomLoading] = useState(false)
  const [loadingLineIdx, setLoadingLineIdx] = useState(0)

  const currentLover = {
    id: 'default-lover-luna',
    name: 'Luna',
    avatar: 'L',
  }

  const handleChatWithLover = () => {
    if (!currentLover?.id || aiMemoryDeleted) {
      showToast(L('当前恋人暂不可对话', 'Current lover unavailable for chat'))
      return
    }
    navigate('/ai-lover/chat', {
      state: {
        lover: currentLover,
        from: 'community-ai-lover-card',
      },
    })
  }

  const handleRandomExperience = async () => {
    if (isRandomLoading) return
    setIsRandomLoading(true)
    setLoadingLineIdx(0)

    const ticker = window.setInterval(() => {
      setLoadingLineIdx((idx) => (idx + 1) % RANDOM_LOADING_LINES.length)
    }, 900)

    try {
      const generated = await randomGenerateScript()
      window.clearInterval(ticker)
      navigate('/player', {
        state: {
          autoStart: true,
          randomGenerated: true,
          script: generated,
        },
      })
    } catch {
      window.clearInterval(ticker)
      showToast(L('生成失败，请稍后重试', 'Generation failed, please try again'))
    } finally {
      setIsRandomLoading(false)
      setLoadingLineIdx(0)
    }
  }

  // ── 点赞切换 ─────────────────────────────────────────────
  const toggleLike = (postId) => {
    setLikesMap((prev) => {
      const cur = prev[postId] || { liked: false, count: 0 }
      return {
        ...prev,
        [postId]: {
          liked: !cur.liked,
          count: cur.liked ? cur.count - 1 : cur.count + 1,
        },
      }
    })
  }

  const handleTryTemplate = (post) => {
    const displayTemplateName = L(post.templateName, COMMUNITY_TEMPLATE_EN[post.templateName] || post.templateName || '')
    showToast(L('正在打开同款体验：', 'Opening experience: ') + displayTemplateName)
    navigate('/player', {
      state: {
        templateId: post.templateId,
        templateName: post.templateName,
        source: 'community-experience-reel',
      },
    })
  }

  const handleComment = () => {
    showToast(L('评论功能即将开放', 'Comments coming soon'))
  }

  const handleSave = () => {
    showToast(L('已更新收藏状态', 'Saved state updated'))
  }

  const isExperienceTab = currentTab === '体验分享'

  return (
    <div
      className={
        isExperienceTab
          ? 'relative flex h-[calc(100dvh-7.5rem)] flex-col gap-3 overflow-hidden px-4 pb-2 pt-3 page-enter'
          : 'relative space-y-4 px-4 pb-24 pt-4 page-enter'
      }
    >

      {/* ═══ 顶部 Tab ════════════════════════════════════════ */}
      <div className="sticky top-0 z-20 flex flex-shrink-0 rounded-2xl border border-white/5 bg-[rgba(20,14,18,0.82)] p-1 shadow-[0_12px_28px_rgba(0,0,0,0.22)] backdrop-blur-md page-section page-delay-1">
        {/* 滑动高亮块 */}
        <div
          className="absolute top-1 bottom-1 rounded-xl bg-[rgba(255,154,203,0.15)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            width: `calc(${100 / TABS.length}% - 2px)`,
            transform: `translateX(calc(${TABS.indexOf(currentTab)} * (100% + 2px)))`,
          }}
        />
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => switchTab(tab)}
            className={`
              relative flex-1 py-2 rounded-xl text-[11px] font-medium transition-colors duration-200
              ${currentTab === tab
                ? 'text-[#FF9ACB]'
                : 'text-[rgba(245,240,242,0.45)]'
              }
            `}
          >
            {L(tab, TAB_EN[tab])}
          </button>
        ))}
      </div>

      {/* ═══ 加载状态 ════════════════════════════════════════ */}
      {loading && posts.length === 0 && !isExperienceTab && (
        <div className="flex justify-center items-center py-12 page-section page-delay-3">
          <div className="text-center">
            <p className="text-[12px] text-[rgba(245,240,242,0.4)] animate-pulse">{L('加载社区帖子中…', 'Loading community posts…')}</p>
          </div>
        </div>
      )}

      {/* ═══ 错误显示 ════════════════════════════════════════ */}
      {error && (
        <div className="rounded-2xl p-4 bg-[rgba(255,100,100,0.1)] border border-[rgba(255,100,100,0.2)] page-section page-delay-3">
          <p className="text-[12px] text-[rgba(255,100,100,0.8)]">⚠️ {error}</p>
          <button
            onClick={() => refresh()}
            className="mt-2 text-[11px] text-[#FF9ACB] hover:opacity-80"
          >
            {L('🔄 重试', '🔄 Retry')}
          </button>
        </div>
      )}

      {/* ═══ AI 主动关怀卡片：普通列表 tab 保留旧版入口 ═════════════ */}
      {!isExperienceTab && (
        <div className="flex-shrink-0 page-section page-delay-2">
          <AiLoverCard
            aiMemoryDeleted={aiMemoryDeleted}
            onResetMemory={() => setAiMemoryDeleted(false)}
            onDeleteMemory={() => {
              setAiMemoryDeleted(true)
              showToast(L('已删除今晚的记忆', "Tonight's memory deleted"))
            }}
            onChatWithLover={handleChatWithLover}
            isChatDisabled={!currentLover?.id}
          />
        </div>
      )}

      {/* ═══ 帖子列表 ════════════════════════════════════════ */}
      {posts.length > 0 && isExperienceTab && (
        <ExperienceReel
          posts={posts}
          loading={loading}
          likesMap={likesMap}
          onLike={toggleLike}
          onTryTemplate={handleTryTemplate}
          onComment={handleComment}
          onSave={handleSave}
          onChatWithLover={handleChatWithLover}
          isChatDisabled={aiMemoryDeleted || !currentLover?.id}
        />
      )}

      {posts.length > 0 && !isExperienceTab && (
        <div className={`space-y-3 transition-opacity duration-150 page-section page-delay-3 ${loading ? 'opacity-72' : 'opacity-100'}`}>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              likeState={likesMap[post.id] || { liked: false, count: 0 }}
              onLike={() => toggleLike(post.id)}
            />
          ))}
        </div>
      )}

      {/* ═══ 空状态 ══════════════════════════════════════════ */}
      {!loading && posts.length === 0 && !error && (
        <div className="flex justify-center items-center py-12 page-section page-delay-3">
          <p className="text-[12px] text-[rgba(245,240,242,0.4)]">{L('暂无帖子，敬请期待', 'No posts yet, stay tuned')}</p>
        </div>
      )}

      {/* ═══ 隐私提示 ════════════════════════════════════════ */}
      {!isExperienceTab && (
      <div className="pt-2 pb-4 text-center page-section page-delay-4">
        <p className="text-[10px] text-[rgba(245,240,242,0.25)] leading-relaxed">
          {L('所有内容匿名发布，本地加密。可随时清除记忆。', 'All content posted anonymously with local encryption. Memory can be cleared anytime.')}
        </p>
      </div>
      )}

      {/* ═══ 悬浮"发布新帖"按钮 ══════════════════════════════ */}
      {/*
       * fixed 定位，计算公式确保按钮始终在手机容器（max-w-430px）右下角
       * 在宽屏上：right = (viewport - 430) / 2 + 16
       * 在窄屏上：right = max(16px, 上面公式结果)
       * TODO: 实现真实发帖功能（文本/图片上传 + 匿名加密）
       */}
      {!isExperienceTab && (
      <button
        onClick={() => alert(L('✍️ 创作功能即将开放！\n期待你的精彩内容~', '✍️ Creation feature coming soon!\nStay tuned for your amazing content~'))}
        className="
          fixed z-30
          w-12 h-12 rounded-2xl
          flex items-center justify-center
          btn-main text-white shadow-lg
          transition-all active:scale-90
        "
        style={{
          bottom: '88px',
          right: 'max(16px, calc((100vw - 430px) / 2 + 16px))',
        }}
        aria-label={L('发布新帖', 'New Post')}
      >
        <Plus size={22} />
      </button>
      )}
    </div>
  )
}
