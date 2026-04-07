const loverCache = {
  latestByLang: {},
  refreshingByLang: {},
}

function resolveLang(lang) {
  return lang === 'en' ? 'en' : 'zh'
}

function getCachedLoverMessage(ttlMs, lang = 'zh') {
  const entry = loverCache.latestByLang[resolveLang(lang)]
  if (!entry?.message) return null
  if (Date.now() - entry.latestAt >= ttlMs) return null
  return entry.message
}

function setCachedLoverMessage(message, lang = message?.lang || 'zh') {
  const activeLang = resolveLang(lang)
  loverCache.latestByLang[activeLang] = {
    message: {
      ...message,
      lang: activeLang,
    },
    latestAt: Date.now(),
  }
}

function getLatestLoverMessage(lang = 'zh') {
  return loverCache.latestByLang[resolveLang(lang)]?.message || null
}

function isLoverRefreshRunning(lang = 'zh') {
  return Boolean(loverCache.refreshingByLang[resolveLang(lang)])
}

function setLoverRefreshRunning(refreshing, lang = 'zh') {
  loverCache.refreshingByLang[resolveLang(lang)] = Boolean(refreshing)
}

function clearLoverCache() {
  loverCache.latestByLang = {}
  loverCache.refreshingByLang = {}
}

export {
  clearLoverCache,
  getCachedLoverMessage,
  getLatestLoverMessage,
  isLoverRefreshRunning,
  setCachedLoverMessage,
  setLoverRefreshRunning,
}
