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
    <div dir={dir} style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#1A202C', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header - Pure White & Gold Accents */}
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '2px solid #F3F4F6', padding: '18px 28px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#B8860B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '22px', boxShadow: '0 4px 10px rgba(184,134,11,0.2)' }}>
              C
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1A202C', margin: 0, letterSpacing: '1px' }}>CODELFA <span style={{ color: '#B8860B', fontSize: '13px' }}>ERP</span></h1>
              <p style={{ fontSize: '10px', color: '#718096', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>Italian Design & Marble Trade</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Role Buttons */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '4px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setRole('admin')}
                style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', backgroundColor: role === 'admin' ? '#B8860B' : 'transparent', color: role === 'admin' ? '#FFFFFF' : '#4A5568', transition: '0.2s' }}
              >
                {t.admin}
              </button>
              <button
                onClick={() => setRole('partner')}
                style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', backgroundColor: role === 'partner' ? '#2D3748' : 'transparent', color: role === 'partner' ? '#FFFFFF' : '#4A5568', transition: '0.2s' }}
              >
                {t.partner}
              </button>
            </div>

            {/* Language */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'ar' | 'en' | 'tr')}
              style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E0', padding: '7px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', color: '#2D3748', cursor: 'pointer', outline: 'none' }}
            >
              <option value="ar">العربية (AR)</option>
              <option value="en">English (EN)</option>
              <option value="tr">Türkçe (TR)</option>
            </select>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 16px' }}>
        
        {/* Banner */}
        <div style={{ backgroundColor: '#FFFAF0', borderLeft: '4px solid #B8860B', border: '1px solid #FEEBC8', padding: '16px 20px', borderRadius: '12px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#744210', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
          <span style={{ fontSize: '13px', fontWeight: '600' }}>{role === 'admin' ? t.bannerAdmin : t.bannerPartner}</span>
          <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#FEF3C7', color: '#92400E', padding: '4px 12px', borderRadius: '20px', border: '1px solid #FCD34D', letterSpacing: '0.5px' }}>
            {role === 'admin' ? 'FULL ACCESS' : 'READ ONLY'}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F9FAFB', overflowX: 'auto' }}>
            <button
              onClick={() => setActiveTab('shipments')}
              style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'shipments' ? '3px solid #B8860B' : '3px solid transparent', color: activeTab === 'shipments' ? '#B8860B' : '#4B5563', whiteSpace: 'nowrap' }}
            >
              {t.tabShipments}
            </button>
            <button
              onClick={() => setActiveTab('invoice')}
              style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'invoice' ? '3px solid #B8860B' : '3px solid transparent', color: activeTab === 'invoice' ? '#B8860B' : '#4B5563', whiteSpace: 'nowrap' }}
            >
              {t.tabInvoice}
            </button>
            <button
              onClick={() => setActiveTab('ashdod')}
              style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'ashdod' ? '3px solid #B8860B' : '3px solid transparent', color: activeTab === 'ashdod' ? '#B8860B' : '#4B5563', whiteSpace: 'nowrap' }}
            >
              {t.tabAshdod}
            </button>
          </div>

          <div style={{ padding: '28px' }}>
            
            {/* Tab 1: Shipments */}
            {activeTab === 'shipments' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1A202C', margin: 0 }}>سجل الحاويات والشحنات النشطة</h3>
                  {role === 'admin' && (
                    <button style={{ backgroundColor: '#B8860B', color: '#FFFFFF', border: 'none', padding: '9px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 6px rgba(184,134,11,0.2)' }}>
                      + {t.addShipment}
                    </button>
                  )}
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F9FAFB', color: '#4B5563', borderBottom: '2px solid #E5E7EB' }}>
                        <th style={{ padding: '14px' }}>رقم الحاوية</th>
                        <th style={{ padding: '14px' }}>الحجم</th>
                        <th style={{ padding: '14px' }}>الصنف</th>
                        <th style={{ padding: '14px' }}>الألواح (PCS)</th>
                        <th style={{ padding: '14px' }}>المساحة (m²)</th>
                        <th style={{ padding: '14px' }}>شراء ($)</th>
                        <th style={{ padding: '14px' }}>بيع ($)</th>
                        <th style={{ padding: '14px' }}>الوصول</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '14px', fontWeight: 'bold', color: '#1A202C', fontFamily: 'monospace' }}>MSCU-901823</td>
                        <td style={{ padding: '14px' }}><span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>40ft HQ</span></td>
                        <td style={{ padding: '14px', fontWeight: '600', color: '#2D3748' }}>بورسلين Calacatta Gold</td>
                        <td style={{ padding: '14px', fontFamily: 'monospace' }}>784</td>
                        <td style={{ padding: '14px', fontFamily: 'monospace', color: '#0D9488', fontWeight: 'bold' }}>4,014.08 m²</td>
                        <td style={{ padding: '14px', color: '#718096', fontFamily: 'monospace' }}>$17.00</td>
                        <td style={{ padding: '14px', fontWeight: 'bold', color: '#16A34A', fontFamily: 'monospace' }}>$28.00</td>
                        <td style={{ padding: '14px', color: '#718096', fontSize: '12px' }}>2026-11-15</td>
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
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1A202C', margin: 0 }}>الفاتورة الرسمية مع الختم الإيطالي</h3>
                  <button onClick={() => window.print()} style={{ backgroundColor: '#B8860B', color: '#FFFFFF', border: 'none', padding: '9px 22px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {t.printBtn}
                  </button>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', color: '#1A202C', padding: '40px', borderRadius: '12px', maxWidth: '650px', margin: '0 auto', border: '1px solid #E5E7EB', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1A202C', paddingBottom: '16px', marginBottom: '24px' }}>
                    <div>
                      <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0, color: '#1A202C' }}>CODELFA</h2>
                      <p style={{ fontSize: '11px', color: '#718096', margin: '2px 0 0 0', textTransform: 'uppercase' }}>Italian Porcelain & Marble Trade Co.</p>
                    </div>
                    <div style={{ textAlign: isAr ? 'left' : 'right', fontSize: '12px', color: '#4A5568' }}>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>#INV-2026-089</p>
                      <p style={{ margin: '2px 0 0 0' }}>13/10/2026</p>
                    </div>
                  </div>

                  {/* Stamp */}
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '3px double #B8860B', margin: '30px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#B8860B', transform: 'rotate(-5deg)', backgroundColor: '#FFFAF0' }}>
                    <span style={{ fontWeight: '900', fontSize: '11px', color: '#1A202C' }}>CODELFA</span>
                    <span style={{ fontSize: '7px', letterSpacing: '1px', textTransform: 'uppercase', color: '#B8860B' }}>Official Seal</span>
                    <span style={{ fontSize: '7px', color: '#718096' }}>ITALY 2026</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Ashdod Schedule */}
            {activeTab === 'ashdod' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1A202C', marginBottom: '16px' }}>عطلات وإغلاقات ميناء أشدود (2026-2027)</h3>
                <div style={{ backgroundColor: '#F9FAFB', padding: '18px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #E5E7EB' }}>
                    <span style={{ color: '#4B5563' }}>رأس السنة العبرية (Rosh Hashanah)</span>
                    <span style={{ fontWeight: 'bold', color: '#B8860B', fontFamily: 'monospace' }}>12-13 سبتمبر 2026</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                    <span style={{ color: '#4B5563' }}>يوم الغفران (Yom Kippur - إغلاق تام)</span>
                    <span style={{ fontWeight: 'bold', color: '#DC2626', fontFamily: 'monospace' }}>21-22 سبتمبر 2026</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E5E7EB', padding: '24px', textAlign: 'center', fontSize: '11px', color: '#718096', marginTop: '40px' }}>
        © 2026 CODELFA ERP System — All Rights Reserved
      </footer>

    </div>
  );
}
