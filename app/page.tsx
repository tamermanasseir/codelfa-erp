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
      partner: "وضع الشريك (عرض فقط)",
      bannerAdmin: "وضع المدير (Admin): يتيح لك إضافة البيانات، تعديل الأسعار، وإصدار الفواتير.",
      bannerPartner: "وضع الشريك (Partner): يتيح الاطلاع على كشوفات الحسابات والشحنات دون إمكانية التعديل.",
      tabShipments: "سجل الشحنات والحاويات",
      tabInvoice: "الفواتير الرسمية المختومة",
      tabAshdod: "مواعيد ميناء أشدود (2026-2027)",
      addShipment: "إضافة شحنة جديدة",
      printBtn: "طباعة الفاتورة"
    },
    en: {
      admin: "Admin Mode",
      partner: "Partner (Read-Only)",
      bannerAdmin: "Admin Mode: Full access to add data, edit prices, and issue invoices.",
      bannerPartner: "Partner Mode: View statements and shipments in read-only mode.",
      tabShipments: "Shipments & Containers",
      tabInvoice: "Official Stamped Invoices",
      tabAshdod: "Ashdod Port Schedule",
      addShipment: "Add Shipment",
      printBtn: "Print Invoice"
    },
    tr: {
      admin: "Yönetici Modu",
      partner: "Ortak (Salt Okunur)",
      bannerAdmin: "Yönetici Modu: Veri ekleme, fiyat düzenleme ve fatura oluşturma yetkisi.",
      bannerPartner: "Ortak Modu: Yalnızca hesap ve sevkiyat bilgilerini görüntüleme yetkisi.",
      tabShipments: "Sevkiyat ve Konteynerler",
      tabInvoice: "Mühürlü Fatura",
      tabAshdod: "Aşdod Liman Takvimi",
      addShipment: "Sevkiyat Ekle",
      printBtn: "Yazdır"
    }
  }[lang];

  return (
    <div dir={dir} style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', color: '#1E293B', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '2px solid #D4AF37', padding: '16px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', itemsCenter: 'center', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#0F172A', border: '2px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontWeight: 'bold', fontSize: '22px' }}>
              C
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '1px', color: '#0F172A', margin: 0 }}>CODELFA</h1>
              <p style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Italian Design & Porcelain Excellence</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Role Buttons */}
            <div style={{ backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setRole('admin')}
                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', backgroundColor: role === 'admin' ? '#D4AF37' : 'transparent', color: role === 'admin' ? '#FFFFFF' : '#64748B' }}
              >
                {t.admin}
              </button>
              <button
                onClick={() => setRole('partner')}
                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', backgroundColor: role === 'partner' ? '#0F172A' : 'transparent', color: role === 'partner' ? '#FFFFFF' : '#64748B' }}
              >
                {t.partner}
              </button>
            </div>

            {/* Language Dropdown */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'ar' | 'en' | 'tr')}
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: '#0F172A', cursor: 'pointer' }}
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
        <div style={{ backgroundColor: role === 'admin' ? '#FEF3C7' : '#E2E8F0', borderLeft: '4px solid #D4AF37', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', justify: 'space-between', alignItems: 'center', color: '#78350F' }}>
          <span style={{ fontSize: '13px', fontWeight: '600' }}>{role === 'admin' ? t.bannerAdmin : t.bannerPartner}</span>
          <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#FFFFFF', padding: '4px 10px', borderRadius: '20px', border: '1px solid #CBD5E1', color: '#0F172A' }}>
            {role === 'admin' ? 'FULL ACCESS' : 'READ ONLY'}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <button
              onClick={() => setActiveTab('shipments')}
              style={{ padding: '14px 24px', fontSize: '14px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'shipments' ? '3px solid #D4AF37' : '3px solid transparent', color: activeTab === 'shipments' ? '#0F172A' : '#64748B' }}
            >
              {t.tabShipments}
            </button>
            <button
              onClick={() => setActiveTab('invoice')}
              style={{ padding: '14px 24px', fontSize: '14px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'invoice' ? '3px solid #D4AF37' : '3px solid transparent', color: activeTab === 'invoice' ? '#0F172A' : '#64748B' }}
            >
              {t.tabInvoice}
            </button>
            <button
              onClick={() => setActiveTab('ashdod')}
              style={{ padding: '14px 24px', fontSize: '14px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'ashdod' ? '3px solid #D4AF37' : '3px solid transparent', color: activeTab === 'ashdod' ? '#0F172A' : '#64748B' }}
            >
              {t.tabAshdod}
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            
            {/* Tab 1: Shipments */}
            {activeTab === 'shipments' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0F172A', margin: 0 }}>ماتريكس تفاصيل الشحنات والمحتويات</h3>
                  {role === 'admin' && (
                    <button style={{ backgroundColor: '#0F172A', color: '#D4AF37', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      + {t.addShipment}
                    </button>
                  )}
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F1F5F9', color: '#475569', borderBottom: '2px solid #E2E8F0' }}>
                        <th style={{ padding: '12px' }}>رقم الحاوية</th>
                        <th style={{ padding: '12px' }}>الحجم</th>
                        <th style={{ padding: '12px' }}>اسم الصنف</th>
                        <th style={{ padding: '12px' }}>الألواح (PCS)</th>
                        <th style={{ padding: '12px' }}>المساحة (m²)</th>
                        <th style={{ padding: '12px' }}>سعر الشراء ($)</th>
                        <th style={{ padding: '12px' }}>سعر البيع ($)</th>
                        <th style={{ padding: '12px' }}>تاريخ الوصول</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#0F172A' }}>MSCU-901823</td>
                        <td style={{ padding: '12px' }}><span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>40ft HQ</span></td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>بورسلين إيطالي Calacatta Gold</td>
                        <td style={{ padding: '12px' }}>784 PCS</td>
                        <td style={{ padding: '12px' }}>4,014.08 m²</td>
                        <td style={{ padding: '12px', color: '#64748B' }}>$17.00</td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#15803D' }}>$28.00</td>
                        <td style={{ padding: '12px', color: '#64748B' }}>2026-11-15</td>
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
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0F172A', margin: 0 }}>معاينة الفاتورة الرسمية المختومة</h3>
                  <button onClick={() => window.print()} style={{ backgroundColor: '#D4AF37', color: '#FFFFFF', border: 'none', padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {t.printBtn}
                  </button>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '8px', border: '1px solid #CBD5E1', maxWidth: '700px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0F172A', paddingBottom: '16px', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', margin: 0 }}>CODELFA</h2>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>Italian Design & Porcelain Excellence</p>
                    </div>
                    <div style={{ textAlign: isAr ? 'left' : 'right', fontSize: '12px', color: '#475569' }}>
                      <p style={{ fontWeight: 'bold', color: '#0F172A', margin: 0 }}>#INV-2026-089</p>
                      <p style={{ margin: '4px 0 0 0' }}>التاريخ: 13/10/2026</p>
                    </div>
                  </div>

                  {/* Stamp Seal */}
                  <div style={{ width: '130px', height: '130px', borderRadius: '50%', border: '3px double #D4AF37', margin: '24px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', transform: 'rotate(-5deg)', backgroundColor: '#FFFBEB' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#0F172A' }}>CODELFA</span>
                    <span style={{ fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase', color: '#B45309' }}>Official Seal</span>
                    <span style={{ fontSize: '8px', color: '#64748B' }}>ITALY DESIGN 2026</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Ashdod Schedule */}
            {activeTab === 'ashdod' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0F172A', marginBottom: '16px' }}>جدول مواعيد وعطلات ميناء أشدود (2026-2027)</h3>
                <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #E2E8F0' }}>
                    <span>رأس السنة العبرية (Rosh Hashanah)</span>
                    <span style={{ fontWeight: 'bold', color: '#D4AF37' }}>12-13 سبتمبر 2026</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                    <span>يوم الغفران (Yom Kippur) - إغلاق تام</span>
                    <span style={{ fontWeight: 'bold', color: '#DC2626' }}>21-22 سبتمبر 2026</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '16px', textAlign: 'center', fontSize: '12px', color: '#94A3B8', marginTop: '40px' }}>
        © 2026 CODELFA ERP System — Designed for Italian Porcelain & Marble Trading
      </footer>

    </div>
  );
}
