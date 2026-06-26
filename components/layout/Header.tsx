'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: '装配广场' },
  { href: '/parts', label: '配件列表' },
  { href: '/diy', label: 'DIY装配' },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo">
          <span className="logo-icon">🖥️</span>
          壹米装机大师
        </Link>

        <nav>
          <ul className="nav">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-right">
          <a
            href="https://mp.weixin.qq.com/s?__biz=MzIzNjEzMjAwMw=="
            target="_blank"
            rel="noopener noreferrer"
            className="btn-login"
          >
            📱 关注公众号
          </a>
        </div>
      </div>
    </header>
  )
}
