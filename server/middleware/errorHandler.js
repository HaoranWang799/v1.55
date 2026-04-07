/**
 * server/middleware/errorHandler.js — 统一错误处理中间件
 */

import { AppError } from '../config/errors.js'

/**
 * 统一错误处理中间件
 * 必须在所有其他中间件之后使用
 */
export function errorHandler(err, req, res, next) {
  // 日志
  console.error('❌ [Error]', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  })

  // 如果是 AppError，直接返回
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      ok: false,
      error: {
        message: err.message,
        code: err.code,
        statusCode: err.statusCode,
        timestamp: err.timestamp,
        ...(err.details && { details: err.details }),
        ...(err.providerName && { provider: err.providerName }),
      },
    })
  }

  // JSON 解析错误
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      ok: false,
      error: {
        message: 'Invalid JSON',
        code: 'JSON_PARSE_ERROR',
        statusCode: 400,
      },
    })
  }

  if (Number.isInteger(err.statusCode) && err.statusCode >= 400 && err.statusCode < 600) {
    return res.status(err.statusCode).json({
      ok: false,
      error: {
        message: err.message,
        code: err.code || 'REQUEST_ERROR',
        statusCode: err.statusCode,
        timestamp: new Date().toISOString(),
      },
    })
  }

  // 未知错误
  res.status(500).json({
    ok: false,
    error: {
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    },
  })
}

/**
 * 异步路由包装器 - 自动捕获中间件异常
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export default {
  errorHandler,
  asyncHandler,
}
