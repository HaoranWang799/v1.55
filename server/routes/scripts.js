/**
 * server/routes/scripts.js — 脚本生成路由
 */

import { Router } from 'express'
import {
  generateScriptHandler,
  generateTextHandler,
  generateAudioHandler,
  prepareCustomPromptAudioHandler,
  preparePresetAudioHandler,
  streamCustomPromptAudioHandler,
  streamPresetAudioHandler,
} from '../controllers/scriptController.js'

const router = Router()

router.post('/generate', generateScriptHandler)
router.post('/generate-text', generateTextHandler)
router.post('/generate-audio', generateAudioHandler)
router.post('/custom-prompt-audio', prepareCustomPromptAudioHandler)
router.get('/custom-prompt-audio/:promptHash/stream', streamCustomPromptAudioHandler)
router.post('/preset-audio', preparePresetAudioHandler)
router.get('/preset-audio/:presetId/stream', streamPresetAudioHandler)

export default router
