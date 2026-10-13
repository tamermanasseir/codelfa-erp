'use client';

import React, { useState } from 'react';

export default function Home() {
  const [role, setRole] = useState<'admin' | 'partner'>('admin');
  const [lang, setLang] = useState<'ar' | 'en' | 'tr'>('ar');
  const [activeTab, setActiveTab] = useState<'shipments' | 'purchases' | 'warehouse' | 'customers' | 'checks' | 'invoice' | 'ashdod'>('shipments');

  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const t = {
    ar: {
      admin: "المدير (تحكم كامل)",
      partner: "الشريك (عرض فقط)",
      bannerAdmin: "وضع المدير: يمكنك إضافة وتعديل الحاويات، الشحنات، والمشتريات.",
      bannerPartner: "وضع الشريك: تصفح الأرصدة، الحاويات، والتقارير بصلاحية القراءة فقط.",
      tabShipments: "📦 الحاويات والشحنات",
      tabPurchases: "🛒 المشتريات والموردين",
      tabWarehouse: "🏭 المخازن والمستودعات",
      tabCustomers: "👥 الزبائن والعملاء",
      tabChecks: "💰 الشيكات والمالية",
      tabInvoice: "📄 الفواتير المختومة",
      tabAshdod: "⚓ ميناء أشدود",
      addBtn: "إضافة جديدة",
      printBtn: "طباعة الفاتورة الرسمية"
    },
    en: {
      admin: "Admin (Full Access)",
      partner: "Partner (Read-Only)",
      bannerAdmin: "Admin Mode: Manage containers, shipments, and purchases.",
      bannerPartner: "Partner Mode: View balances and reports (Read-only).",
      tabShipments: "📦 Containers & Shipments",
      tabPurchases: "🛒 Purchases & Suppliers",
      tabWarehouse: "🏭 Warehouse & Inventory",
      tabCustomers: "👥 Customers",
      tabChecks: "💰 Checks & Finance",
      tabInvoice: "📄 Stamped Invoices",
      tabAshdod: "⚓ Ashdod Port",
      addBtn: "Add New",
      printBtn: "Print Official Invoice"
    },
    tr: {
      admin: "Yönetici (Tam Yetki)",
      partner: "Ortak (Salt Okunur)",
      bannerAdmin: "Yönetici Modu: Konteyner ve sevkiyat yönetimi.",
      bannerPartner: "Ortak Modu: Bakiye ve raporları görüntüleme.",
      tabShipments: "📦 Konteynerler",
      tabPurchases: "🛒 Satın Alma",
      tabWarehouse: "🏭 Depo",
      tabCustomers: "👥 Müşteriler",
      tabChecks: "💰 Çekler & Finans",
      tabInvoice: "📄 Mühürlü Faturalar",
      tabAshdod: "⚓ Aşdod Limanı",
      addBtn: "Yeni Ekle",
      printBtn: "Faturayı Yazdır"
    }
  }[lang];

  return (
    <div dir={dir} style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', color: '#1E293B', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Header - Clean White & Professional */}
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#0F172A', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>
              C
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '0.5px' }}>CODELFA <span style={{ color: '#D4AF37', fontSize: '12px' }}>ERP</span></h1>
              <p style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Italian Porcelain & Marble Trade</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Role Switcher */}
            <div style={{ backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setRole('admin')}
                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', border: 'none', cursor: 'pointer', backgroundColor: role === 'admin' ? '#0F172A' : 'transparent', color: role === 'admin' ? '#FFFFFF' : '#64748B', transition: 'all 0.2s' }}
              >
                {t.admin}
              </button>
              <button
                onClick={() => setRole('partner')}
                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', border: 'none', cursor: 'pointer', backgroundColor: role === 'partner' ? '#0F172A' : 'transparent', color: role === 'partner' ? '#FFFFFF' : '#64748B', transition: 'all 0.2s' }}
              >
                {t.partner}
              </button>
            </div>

            {/* Language Selector */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'ar' | 'en' | 'tr')}
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', color: '#0F172A', cursor: 'pointer', outline: 'none' }}
            >
              <option value="ar">العربية (AR)</option>
              <option value="en">English (EN)</option>
              <option value="tr">Türkçe (TR)</option>
            </select>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px' }}>
        
        {/* Notice Banner */}
        <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderLeft: '4px solid #3B82F6', padding: '14px 20px', borderRadius: '10px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#1E40AF', fontSize: '13px' }}>
          <span style={{ fontWeight: '500' }}>{role === 'admin' ? t.bannerAdmin : t.bannerPartner}</span>
          <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#DBEAFE', color: '#1D4ED8', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
            {role === 'admin' ? 'FULL ACCESS' : 'READ ONLY'}
          </span>
        </div>

        {/* Dashboard Box */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', overflow: 'hidden' }}>
          
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', overflowX: 'auto' }}>
            {[
              { id: 'shipments', label: t.tabShipments },
              { id: 'purchases', label: t.tabPurchases },
              { id: 'warehouse', label: t.tabWarehouse },
              { id: 'customers', label: t.tabCustomers },
              { id: 'checks', label: t.tabChecks },
              { id: 'invoice', label: t.tabInvoice },
              { id: 'ashdod', label: t.tabAshdod },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === tab.id ? '3px solid #0F172A' : '3px solid transparent', color: activeTab === tab.id ? '#0F172A' : '#64748B', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '28px' }}>
            
            {/* Tab 1: Shipments */}
            {activeTab === 'shipments' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0F172A', margin: 0 }}>ماتريكس الحاويات والشحنات النشطة</h3>
                  {role === 'admin' && (
                    <button style={{ backgroundColor: '#0F172A', color: '#D4AF37', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      + {t.addBtn}
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
                        <th style={{ padding: '12px' }}>سعر الشراء</th>
                        <th style={{ padding: '12px' }}>سعر البيع</th>
                        <th style={{ padding: '12px' }}>تاريخ الوصول</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#0F172A', fontFamily: 'monospace' }}>MSCU-901823</td>
                        <td style={{ padding: '12px' }}><span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>40ft HQ</span></td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>بورسلين Calacatta Gold (إيطالي)</td>
                        <td style={{ padding: '12px', fontFamily: 'monospace' }}>784 PCS</td>
                        <td style={{ padding: '12px', fontFamily: 'monospace', color: '#0D9488', fontWeight: 'bold' }}>4,014.08 m²</td>
                        <td style={{ padding: '12px', color: '#64748B', fontFamily: 'monospace' }}>$17.00</td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#16A34A', fontFamily: 'monospace' }}>$28.00</td>
                        <td style={{ padding: '12px', color: '#64748B', fontSize: '12px' }}>2026-11-15</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: Purchases */}
            {activeTab === 'purchases' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0F172A', margin: 0 }}>سجل المشتريات وعقود المصانع (Xiamen Sofiko)</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', color: '#475569', borderBottom: '2px solid #E2E8F0' }}>
                        <th style={{ padding: '12px' }}>رقم الطلبية (PO)</th>
                        <th style={{ padding: '12px' }}>المورد</th>
                        <th style={{ padding: '12px' }}>عدد الحاويات</th>
                        <th style={{ padding: '12px' }}>إجمالي المبلغ</th>
                        <th style={{ padding: '12px' }}>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#0F172A', fontFamily: 'monospace' }}>WA2639</td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>Xiamen Sofiko Stone Co.</td>
                        <td style={{ padding: '12px', fontFamily: 'monospace' }}>4 x 40' HQ</td>
                        <td style={{ padding: '12px', fontFamily: 'monospace', color: '#D4AF37', fontWeight: 'bold' }}>$68,473.92</td>
                        <td style={{ padding: '12px' }}><span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>معتمد</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Warehouse */}
            {activeTab === 'warehouse' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0F172A', marginBottom: '20px' }}>المخازن والمستودعات (أرصدة البورسلين والرخام)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>إجمالي المساحة بالمخازن</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#0F172A', fontFamily: 'monospace', margin: '6px 0 0 0' }}>4,961.28 m²</p>
                  </div>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>إجمالي الألواح المتوفرة</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#16A34A', fontFamily: 'monospace', margin: '6px 0 0 0' }}>969 PCS</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Customers */}
            {activeTab === 'customers' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0F172A', marginBottom: '20px' }}>سجل الزبائن والعملاء</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', color: '#475569', borderBottom: '2px solid #E2E8F0' }}>
                        <th style={{ padding: '12px' }}>اسم الشركة / العميل</th>
                        <th style={{ padding: '12px' }}>المنطقة</th>
                        <th style={{ padding: '12px' }}>الرقم الضريبي (VAT)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>Selimoglu Stone Company</td>
                        <td style={{ padding: '12px', color: '#64748B' }}>Qalqilya / فلسطين</td>
                        <td style={{ padding: '12px', fontFamily: 'monospace' }}>562338103</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>Kamel Abu Al-Rub Stone Co.</td>
                        <td style={{ padding: '12px', color: '#64748B' }}>Qabatia - Jenin</td>
                        <td style={{ padding: '12px', fontFamily: 'monospace' }}>562350439</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 5: Checks & Finance */}
            {activeTab === 'checks' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0F172A', marginBottom: '20px' }}>إدارة الشيكات والمالية</h3>
                <div style={{ backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#475569' }}>
                  <p style={{ margin: 0 }}>لا توجد شيكات مستحقة حالياً. يمكنك متابعة تواريخ الاستحقاق والدفعات النقدية بدقة وسهولة.</p>
                </div>
              </div>
            )}

            {/* Tab 6: Invoice */}
            {activeTab === 'invoice' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0F172A', margin: 0 }}>الفاتورة الرسمية مع الختم الإيطالي</h3>
                  <button onClick={() => window.print()} style={{ backgroundColor: '#0F172A', color: '#D4AF37', border: 'none', padding: '8px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {t.printBtn}
                  </button>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', color: '#1E293B', padding: '36px', borderRadius: '10px', maxWidth: '650px', margin: '0 auto', border: '1px solid #CBD5E1', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0F172A', paddingBottom: '16px', marginBottom: '24px' }}>
                    <div>
                      <h2 style={{ fontSize: '24px', fontWeight: '900', margin: 0, color: '#0F172A' }}>CODELFA</h2>
                      <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0', textTransform: 'uppercase' }}>Italian Porcelain & Marble Trade Co.</p>
                    </div>
                    <div style={{ textAlign: isAr ? 'left' : 'right', fontSize: '12px', color: '#475569' }}>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>#INV-2026-089</p>
                      <p style={{ margin: '2px 0 0 0' }}>13/10/2026</p>
                    </div>
                  </div>

                  {/* Stamp */}
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '3px double #B45309', margin: '30px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#B45309', transform: 'rotate(-5deg)', backgroundColor: '#FFFBEB' }}>
                    <span style={{ fontWeight: '900', fontSize: '11px', color: '#0F172A' }}>CODELFA</span>
                    <span style={{ fontSize: '7px', letterSpacing: '1px', textTransform: 'uppercase' }}>Official Seal</span>
                    <span style={{ fontSize: '7px', color: '#64748B' }}>ITALY 2026</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 7: Ashdod */}
            {activeTab === 'ashdod' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0F172A', marginBottom: '20px' }}>عطلات وإغلاقات ميناء أشدود (2026-2027)</h3>
                <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #E2E8F0' }}>
                    <span style={{ color: '#475569' }}>رأس السنة العبرية (Rosh Hashanah)</span>
                    <span style={{ fontWeight: 'bold', color: '#D4AF37', fontFamily: 'monospace' }}>12-13 سبتمبر 2026</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                    <span style={{ color: '#475569' }}>يوم الغفران (Yom Kippur - إغلاق تام)</span>
                    <span style={{ fontWeight: 'bold', color: '#DC2626', fontFamily: 'monospace' }}>21-22 سبتمبر 2026</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '20px', textAlign: 'center', fontSize: '11px', color: '#64748B', marginTop: '40px' }}>
        © 2026 CODELFA ERP System — All Rights Reserved
      </footer>

    </div>
  );
}
