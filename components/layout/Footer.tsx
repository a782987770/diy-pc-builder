import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">🖥️ 壹米装机大师</div>
        <p className="footer-desc">
          电脑DIY装机配置平台 — 由「壹米说电脑」公众号出品，帮你选对配件，省心装机
        </p>
        <div className="footer-links">
          <Link href="/">装配广场</Link>
          <Link href="/parts">配件列表</Link>
          <Link href="/diy">DIY装配</Link>
          <a href="https://mp.weixin.qq.com/s?__biz=MzIzNjEzMjAwMw==" target="_blank" rel="noopener noreferrer">
            公众号
          </a>
        </div>
        <div className="footer-copyright">
          © 2025-2026 壹米装机大师 · 本站为推广导购平台，不直接销售商品 · 价格仅供参考，以实际购买页面为准
        </div>
      </div>
    </footer>
  )
}
