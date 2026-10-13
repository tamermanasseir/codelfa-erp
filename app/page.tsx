'use client';

import React, { useState } from 'react';

export default function Home() {
  const [role, setRole] = useState<'admin' | 'partner'>('admin');
  const [lang, setLang] = useState<'ar' | 'en' | 'tr'>('ar');
  const [activeTab, setActiveTab] = useState<'shipments' | 'invoice' | 'ashdod'>('shipments');

  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const t = {
    ar: {
      admin: "وضع المدير",
      partner: "وضع الشريك",
      bannerAdmin: "أنت في وضع المدير (صلاحيات كاملة للتعديل والإضافة).",
      bannerPartner: "أنت في وضع الشريك (عرض الحسابات والشحنات فقط).",
      tabShipments: "سجل الشحنات والحاويات",
      tabInvoice: "الفواتير الرسمية المختومة",
      tabAshdod: "مواعيد ميناء أشدود",
      addShipment: "إضافة شحنة",
      printBtn: "طباعة الفاتورة"
    },
    en: {
      admin: "Admin Mode",
      partner: "Partner Mode",
      bannerAdmin: "You are in Admin Mode (Full Access).",
      bannerPartner: "You are in Partner Mode (Read-Only).",
      tabShipments: "Shipments & Containers",
      tabInvoice: "Official Invoices",
      tabAshdod: "Ashdod Port Schedule",
      addShipment: "Add Shipment",
      printBtn: "Print Invoice"
    },
    tr: {
      admin: "Yönetici Modu",
      partner: "Ortak Modu",
      bannerAdmin: "Yönetici Modundasınız (Tam Yetki).",
      bannerPartner: "Ortak Modundasınız (Salt Okunur).",
      tabShipments: "Sevkiyatlar",
      tabInvoice: "Resmi Faturalar",
      tabAshdod: "Liman Takvimi",
      addShipment: "Sevkiyat Ekle",
      printBtn: "Yazdır"
    }
  }[lang];

  return (
    <div dir={dir} style={{ backgroundColor: '#F4F6F9', minHeight: '100vh', color: '#2C3E50', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header - Light & Clean */}
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#1E293B', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '20px' }}>
              C
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1E293B', margin: 0, letterSpacing: '1px' }}>CODELFA <span style={{ color: '#C59B27', fontSize: '12px' }}>ERP</span></h1>
              <p style={{ fontSize: '10px', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Italian Design & Marble Trade</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Role Buttons */}
            <div style={{ backgroundColor: '#EDF2F7', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setRole('admin')}
                style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', backgroundColor: role === 'admin' ? '#1E293B' : 'transparent', color: role === 'admin' ? '#FFFFFF' : '#4A5568', transition: '0.2s' }}
              >
                {t.admin}
              </button>
              <button
                onClick={() => setRole('partner')}
                style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', backgroundColor: role === 'partner' ? '#1E293B' : 'transparent', color: role === 'partner' ? '#FFFFFF' : '#4A5568', transition: '0.2s' }}
              >
                {t.partner}
              </button>
            </div>

            {/* Language */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'ar' | 'en' | 'tr')}
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E0', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: '#2D3748', cursor: 'pointer', outline: 'none' }}
            >
              <option value="ar">العربية (AR)</option>
              <option value="en">English (EN)</option>
              <option value="tr">Türkçe (TR)</option>
            </select>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        
        {/* Banner */}
        <div style={{ backgroundColor: '#FFFBEB', borderLeft: '4px solid #D4AF37', border: '1px solid #FEEBC8', padding: '14px 18px', borderRadius: '10px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#92400E', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '13px', fontWeight: '600' }}>{role === 'admin' ? t.bannerAdmin : t.bannerPartner}</span>
          <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#FEF3C7', color: '#92400E', padding: '4px 10px', borderRadius: '20px', border: '1px solid #FCD34D' }}>
            {role === 'admin' ? 'FULL ACCESS' : 'READ ONLY'}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', overflowX: 'auto' }}>
            <button
              onClick={() => setActiveTab('shipments')}
              style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'shipments' ? '3px solid #D4AF37' : '3px solid transparent', color: activeTab === 'shipments' ? '#1E293B' : '#64748B', whiteSpace: 'nowrap' }}
            >
              {t.tabShipments}
            </button>
            <button
              onClick={() => setActiveTab('invoice')}
              style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'invoice' ? '3px solid #D4AF37' : '3px solid transparent', color: activeTab === 'invoice' ? '#1E293B' : '#64748B', whiteSpace: 'nowrap' }}
            >
              {t.tabInvoice}
            </button>
            <button
              onClick={() => setActiveTab('ashdod')}
              style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'ashdod' ? '3px solid #D4AF37' : '3px solid transparent', color: activeTab === 'ashdod' ? '#1E293B' : '#64748B', whiteSpace: 'nowrap' }}
            >
              {t.tabAshdod}
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            
            {/* Tab 1: Shipments */}
            {activeTab === 'shipments' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1E293B', margin: 0 }}>سجل الحاويات والشحنات النشطة</h3>
                  {role === 'admin' && (
                    <button style={{ backgroundColor: '#1E293B', color: '#D4AF37', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      + {t.addShipment}
                    </button>
                  )}
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', color: '#475569', borderBottom: '2px solid #E2E8F0' }}>
                        <th style={{ padding: '12px' }}>رقم الحاوية</th>
                        <th style={{ padding: '12px' }}>الحجم</th>
                        <th style={{ padding: '12px' }}>الصنف</th>
                        <th style={{ padding: '12px' }}>الألواح (PCS)</th>
                        <th style={{ padding: '12px' }}>المساحة (m²)</th>
                        <th style={{ padding: '12px' }}>شراء ($)</th>
                        <th style={{ padding: '12px' }}>بيع ($)</th>
                        <th style={{ padding: '12px' }}>الوصول</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #EDF2F7' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#1E293B', fontFamily: 'monospace' }}>MSCU-901823</td>
                        <td style={{ padding: '12px' }}><span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>40ft HQ</span></td>
                        <td style={{ padding: '12px', fontWeight: '600', color: '#2D3748' }}>بورسلين Calacatta Gold</td>
                        <td style={{ padding: '12px', fontFamily: 'monospace' }}>784</td>
                        <td style={{ padding: '12px', fontFamily: 'monospace', color: '#0D9488', fontWeight: 'bold' }}>4,014.08 m²</td>
                        <td style={{ padding: '12px', color: '#718096', fontFamily: 'monospace' }}>$17.00</td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#16A34A', fontFamily: 'monospace' }}>$28.00</td>
                        <td style={{ padding: '12px', color: '#718096', fontSize: '12px' }}>2026-11-15</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: Invoice */}
            {activeTab === 'invoice' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1E293B', margin: 0 }}>الفاتورة الرسمية مع الختم الإيطالي</h3>
                  <button onClick={() => window.print()} style={{ backgroundColor: '#D4AF37', color: '#1E293B', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {t.printBtn}
                  </button>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', color: '#1E293B', padding: '36px', borderRadius: '10px', maxWidth: '650px', margin: '0 auto', border: '1px solid #CBD5E0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1E293B', paddingBottom: '16px', marginBottom: '24px' }}>
                    <div>
                      <h2 style={{ fontSize: '24px', fontWeight: '900', margin: 0, color: '#1E293B' }}>CODELFA</h2>
                      <p style={{ fontSize: '11px', color: '#718096', margin: '2px 0 0 0', textTransform: 'uppercase' }}>Italian Porcelain & Marble Trade Co.</p>
                    </div>
                    <div style={{ textAlign: isAr ? 'left' : 'right', fontSize: '12px', color: '#4A5568' }}>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>#INV-2026-089</p>
                      <p style={{ margin: '2px 0 0 0' }}>13/10/2026</p>
                    </div>
                  </div>

                  {/* Stamp */}
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '3px double #C59B27', margin: '30px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#92400E', transform: 'rotate(-5deg)', backgroundColor: '#FFFBEB' }}>
                    <span style={{ fontWeight: '900', fontSize: '11px' }}>CODELFA</span>
                    <span style={{ fontSize: '7px', letterSpacing: '1px', textTransform: 'uppercase' }}>Official Seal</span>
                    <span style={{ fontSize: '7px', color: '#718096' }}>ITALY 2026</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Ashdod Schedule */}
            {activeTab === 'ashdod' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1E293B', marginBottom: '16px' }}>عطلات وإغلاقات ميناء أشدود (2026-2027)</h3>
                <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #E2E8F0' }}>
                    <span style={{ color: '#4A5568' }}>رأس السنة العبرية (Rosh Hashanah)</span>
                    <span style={{ fontWeight: 'bold', color: '#D4AF37', fontFamily: 'monospace' }}>12-13 سبتمبر 2026</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                    <span style={{ color: '#4A5568' }}>يوم الغفران (Yom Kippur - إغلاق تام)</span>
                    <span style={{ fontWeight: 'bold', color: '#DC2626', fontFamily: 'monospace' }}>21-22 سبتمبر 2026</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '20px', textAlign: 'center', fontSize: '11px', color: '#718096', marginTop: '40px' }}>
        © 2026 CODELFA ERP System — All Rights Reserved
      </footer>

    </div>
  );
}
