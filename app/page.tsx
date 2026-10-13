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
    <div dir={dir} style={{ backgroundColor: '#090D16', minHeight: '100vh', color: '#E2E8F0', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <header style={{ backgroundColor: '#0F172A', borderBottom: '1px solid rgba(212, 175, 55, 0.3)', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#090D16', fontWeight: '900', fontSize: '22px', boxShadow: '0 0 15px rgba(212,175,55,0.3)' }}>
              C
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '1.5px', color: '#F8FAFC', margin: 0 }}>CODELFA <span style={{ color: '#D4AF37', fontSize: '12px', fontWeight: '600' }}>ERP</span></h1>
              <p style={{ fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>Italian Design & Marble Trade</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Role Buttons */}
            <div style={{ backgroundColor: '#1E293B', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setRole('admin')}
                style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', backgroundColor: role === 'admin' ? '#D4AF37' : 'transparent', color: role === 'admin' ? '#090D16' : '#94A3B8', transition: '0.2s' }}
              >
                {t.admin}
              </button>
              <button
                onClick={() => setRole('partner')}
                style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', backgroundColor: role === 'partner' ? '#334155' : 'transparent', color: role === 'partner' ? '#F8FAFC' : '#94A3B8', transition: '0.2s' }}
              >
                {t.partner}
              </button>
            </div>

            {/* Language */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'ar' | 'en' | 'tr')}
              style={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: '7px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', color: '#D4AF37', cursor: 'pointer', outline: 'none' }}
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
        <div style={{ backgroundColor: '#131C31', borderLeft: '4px solid #D4AF37', borderRight: '1px solid rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '14px 18px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#CBD5E1' }}>{role === 'admin' ? t.bannerAdmin : t.bannerPartner}</span>
          <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: 'rgba(212,175,55,0.1)', color: '#D4AF37', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.3)', letterSpacing: '1px' }}>
            {role === 'admin' ? 'FULL ACCESS' : 'READ ONLY'}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div style={{ backgroundColor: '#0F172A', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#090D16', overflowX: 'auto' }}>
            <button
              onClick={() => setActiveTab('shipments')}
              style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'shipments' ? '2px solid #D4AF37' : '2px solid transparent', color: activeTab === 'shipments' ? '#D4AF37' : '#94A3B8', transition: '0.2s', whiteSpace: 'nowrap' }}
            >
              {t.tabShipments}
            </button>
            <button
              onClick={() => setActiveTab('invoice')}
              style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'invoice' ? '2px solid #D4AF37' : '2px solid transparent', color: activeTab === 'invoice' ? '#D4AF37' : '#94A3B8', transition: '0.2s', whiteSpace: 'nowrap' }}
            >
              {t.tabInvoice}
            </button>
            <button
              onClick={() => setActiveTab('ashdod')}
              style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'ashdod' ? '2px solid #D4AF37' : '2px solid transparent', color: activeTab === 'ashdod' ? '#D4AF37' : '#94A3B8', transition: '0.2s', whiteSpace: 'nowrap' }}
            >
              {t.tabAshdod}
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            
            {/* Tab 1: Shipments */}
            {activeTab === 'shipments' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#F8FAFC', margin: 0 }}>ماتريكس الحاويات والشحنات النشطة</h3>
                  {role === 'admin' && (
                    <button style={{ backgroundColor: '#D4AF37', color: '#090D16', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,175,55,0.2)' }}>
                      + {t.addShipment}
                    </button>
                  )}
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#131C31', color: '#94A3B8', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
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
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '14px', fontWeight: 'bold', color: '#F8FAFC', fontFamily: 'monospace' }}>MSCU-901823</td>
                        <td style={{ padding: '14px' }}><span style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>40ft HQ</span></td>
                        <td style={{ padding: '14px', fontWeight: '600', color: '#E2E8F0' }}>بورسلين Calacatta Gold</td>
                        <td style={{ padding: '14px', fontFamily: 'monospace' }}>784</td>
                        <td style={{ padding: '14px', fontFamily: 'monospace', color: '#34D399' }}>4,014.08 m²</td>
                        <td style={{ padding: '14px', color: '#94A3B8', fontFamily: 'monospace' }}>$17.00</td>
                        <td style={{ padding: '14px', fontWeight: 'bold', color: '#34D399', fontFamily: 'monospace' }}>$28.00</td>
                        <td style={{ padding: '14px', color: '#94A3B8', fontSize: '12px' }}>2026-11-15</td>
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
                  <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#F8FAFC', margin: 0 }}>الفاتورة الرسمية مع الختم الإيطالي</h3>
                  <button onClick={() => window.print()} style={{ backgroundColor: '#D4AF37', color: '#090D16', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {t.printBtn}
                  </button>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', color: '#0F172A', padding: '36px', borderRadius: '12px', maxWidth: '650px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0F172A', paddingBottom: '16px', marginBottom: '24px' }}>
                    <div>
                      <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0, color: '#0F172A' }}>CODELFA</h2>
                      <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0', textTransform: 'uppercase' }}>Italian Porcelain & Marble Trade Co.</p>
                    </div>
                    <div style={{ textAlign: isAr ? 'left' : 'right', fontSize: '12px', color: '#475569' }}>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>#INV-2026-089</p>
                      <p style={{ margin: '2px 0 0 0' }}>13/10/2026</p>
                    </div>
                  </div>

                  {/* Stamp */}
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '3px double #B45309', margin: '30px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#B45309', transform: 'rotate(-5deg)', backgroundColor: '#FFFBEB' }}>
                    <span style={{ fontWeight: '900', fontSize: '11px' }}>CODELFA</span>
                    <span style={{ fontSize: '7px', letterSpacing: '1px', textTransform: 'uppercase' }}>Official Seal</span>
                    <span style={{ fontSize: '7px', color: '#475569' }}>ITALY 2026</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Ashdod Schedule */}
            {activeTab === 'ashdod' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#F8FAFC', marginBottom: '16px' }}>عطلات وإغلاقات ميناء أشدود (2026-2027)</h3>
                <div style={{ backgroundColor: '#131C31', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#CBD5E1' }}>رأس السنة العبرية (Rosh Hashanah)</span>
                    <span style={{ fontWeight: 'bold', color: '#D4AF37', fontFamily: 'monospace' }}>12-13 سبتمبر 2026</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                    <span style={{ color: '#CBD5E1' }}>يوم الغفران (Yom Kippur - إغلاق تام)</span>
                    <span style={{ fontWeight: 'bold', color: '#EF4444', fontFamily: 'monospace' }}>21-22 سبتمبر 2026</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#090D16', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px', textAlign: 'center', fontSize: '11px', color: '#64748B', marginTop: '40px' }}>
        © 2026 CODELFA ERP System — All Rights Reserved
      </footer>

    </div>
  );
}
