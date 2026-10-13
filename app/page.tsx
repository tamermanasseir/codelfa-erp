'use client';
import React, { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      direction: 'rtl',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#0f172a',
        color: '#fff',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Codelfa ERP</h1>
          <span style={{ backgroundColor: '#10b981', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>
            شغال وتفاعلي 🚀
          </span>
        </div>
        <div style={{ fontSize: '14px', color: '#94a3b8' }}>منطقة الخليل</div>
      </header>

      {/* Navigation Bar */}
      <nav style={{
        backgroundColor: '#1e293b',
        padding: '8px 16px',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            backgroundColor: activeTab === 'dashboard' ? '#3b82f6' : 'transparent',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}>
          🏠 الرئيسية
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          style={{
            backgroundColor: activeTab === 'sales' ? '#3b82f6' : 'transparent',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}>
          📊 المبيعات والحسابات
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            backgroundColor: activeTab === 'inventory' ? '#3b82f6' : 'transparent',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}>
          📦 المخزون والشحنات
        </button>
        <button
          onClick={() => setActiveTab('field')}
          style={{
            backgroundColor: activeTab === 'field' ? '#3b82f6' : 'transparent',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}>
          👥 العملاء والعمليات
        </button>
      </nav>

      {/* Content Area */}
      <main style={{ padding: '24px', flex: 1 }}>
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ color: '#0f172a', marginTop: 0 }}>نظرة عامة على لوحة التحكم</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', borderRight: '4px solid #3b82f6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ color: '#64748b', fontSize: '14px' }}>إجمالي المبيعات</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '8px' }}>$0.00</div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', borderRight: '4px solid #10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ color: '#64748b', fontSize: '14px' }}>الحاويات القادمة</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '8px' }}>0 حاوية</div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', borderRight: '4px solid #f59e0b', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ color: '#64748b', fontSize: '14px' }}>التنسيقات الميدانية</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '8px' }}>جاهز للمتابعة</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#0f172a', marginTop: 0 }}>📊 إدارة المبيعات والحسابات</h2>
            <p style={{ color: '#64748b' }}>هنا يمكنك إضافة الفواتير وتتبع الحسابات والتقارير المالية.</p>
            <button style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              + إضافة فاتورة جديدة
            </button>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#0f172a', marginTop: 0 }}>📦 إثبات المخزون وتتبع الحاويات</h2>
            <p style={{ color: '#64748b' }}>متابعة طلبات البورسلان، الرخام، الكوارتز والشحنات البحرية.</p>
            <button style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              + تسجيل حاوية شحن جديدة
            </button>
          </div>
        )}

        {activeTab === 'field' && (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#0f172a', marginTop: 0 }}>👥 إدارة العملاء والتنسيق الميداني</h2>
            <p style={{ color: '#64748b' }}>متابعة طلبات الزبائن وتنسيق العمليات الميدانية والإشراف مع أبو إيهاب.</p>
            <button style={{ backgroundColor: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              + إضافة عميل / مهمة جديدة
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
