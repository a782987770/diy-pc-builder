import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ fontSize: '80px', marginBottom: '16px' }}>🔍</div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#303133', marginBottom: '12px' }}>
        页面未找到
      </h1>
      <p style={{ fontSize: '15px', color: '#909399', maxWidth: '480px', lineHeight: 1.7, marginBottom: '32px' }}>
        抱歉，您访问的页面不存在或已被移除。
        <br />
        请检查链接是否正确，或返回首页浏览装机方案。
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          className="btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
          }}
        >
          🖥️ 返回装配广场
        </Link>
        <Link
          href="/parts"
          className="btn-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
          }}
        >
          🛒 浏览配件列表
        </Link>
        <Link
          href="/diy"
          className="btn-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
          }}
        >
          🔧 DIY 装配
        </Link>
      </div>

      <div style={{
        marginTop: '48px',
        padding: '16px 24px',
        background: '#f5f7fa',
        borderRadius: '12px',
        fontSize: '13px',
        color: '#909399',
        maxWidth: '400px',
      }}>
        <p style={{ margin: 0 }}>💡 <strong>提示：</strong>所有装机方案均可在装配广场中找到</p>
      </div>
    </div>
  )
}
