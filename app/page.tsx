import React from 'react';

export default function Home() {
  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      direction: 'rtl',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '24px'
    }}>
      <header style={{
        backgroundColor: '#0f172a',
        color: '#fff',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '700' }}>نظام Codelfa ERP</h1>
          <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>لوحة التحكم والعمليات المتكاملة</p>
        </div>
        <span style={{ backgroundColor: '#10b981', color: '#fff', padding: '8px 16px', borderRadius: '30px', fontSize: '14px', fontWeight: '600' }}>
          متصل وجاهز 🚀
        </span>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '18px' }}>📊 المبيعات والحسابات</h3>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>إدارة الفواتير، وحسابات الشركاء، والتقارير المالية اليومية.</p>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '18px' }}>📦 المخزون والبورسلان</h3>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>متابعة الحاويات، الأصناف، وتتبع الشحنات القادمة.</p>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '18px' }}>👥 العملاء والعمليات</h3>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>سجل العملاء وإدارة التنسيق الميداني مع أبو إيهاب.</p>
        </div>
      </main>
    </div>
  );
}
