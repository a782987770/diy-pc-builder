import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: '壹米装机大师 - 电脑DIY装机配置平台 | 壹米说电脑',
  description: '壹米装机大师 — 由「壹米说电脑」公众号出品的专业电脑DIY装机配置平台，浏览用户分享的装机方案，获取灵感打造你的专属电脑，支持多平台比价和CPS佣金导购。',
  keywords: '电脑DIY,装机配置,硬件搭配,CPU主板内存显卡,壹米说电脑,电脑维修,装机方案,配件推荐',
  openGraph: {
    title: '壹米装机大师 - 电脑DIY装机配置平台',
    description: '由「壹米说电脑」出品的专业电脑DIY装机配置平台，浏览用户分享的装机方案，获取灵感打造你的专属电脑。',
    url: 'https://a782987770.github.io/diy-pc-builder/',
    siteName: '壹米装机大师',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '壹米装机大师 - 电脑DIY装机配置平台',
    description: '专业电脑DIY装机配置平台，浏览用户分享的装机方案，打造你的专属电脑。',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
