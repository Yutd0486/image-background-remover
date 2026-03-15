/** @type {import('next').NextConfig} */
const nextConfig = {
  // 先降级为静态导出，确保页面能访问
  output: 'export',
  // 后续恢复 API 时改成 'standalone'
}

module.exports = nextConfig
