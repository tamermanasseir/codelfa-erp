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
      admin: "المدير",
      partner: "الشركاء (قراءة فقط)",
      bannerAdmin: "أنت في وضع المدير (Admin): يتاح لك إضافة وتعديل البيانات وحفظها تلقائياً.",
      bannerPartner: "أنت في وضع الشريك (Partner): تصفح وقراءة الحسابات والأرصدة فقط.",
      tabShipments: "إدارة الشحنات والحاويات",
      tabInvoice: "إصدار الفواتير المختومة",
      tabAshdod: "عطلات ميناء أشدود (2026-2027)",
      addShipment: "إضافة شحنة جديدة",
      printBtn: "طباعة الفاتورة المختومة"
    },
    en: {
      admin: "Admin",
      partner: "Partners (Read-Only)",
      bannerAdmin: "You are in Admin Mode: Full access to edit and manage data.",
      bannerPartner: "You are in Partner Mode: Read-only access to view balances.",
      tabShipments: "Shipments & Containers",
      tabInvoice: "Stamped Invoices",
      tabAshdod: "Ashdod Port Holidays",
      addShipment: "Add New Shipment",
      printBtn: "Print Stamped Invoice"
    },
    tr: {
      admin: "Yönetici",
      partner: "Ortaklar (Salt Okunur)",
      bannerAdmin: "Yönetici Modundasınız: Verileri ekleme ve düzenleme yetkisi.",
      bannerPartner: "Ortak Modundasınız: Yalnızca hesap ve bakiyeleri görüntüleyebilirsiniz.",
      tabShipments: "Sevkiyat ve Konteyner Yönetimi",
      tabInvoice: "Mühürlü Fatura Oluşturma",
      tabAshdod: "Aşdod Limanı Tatil Takvimi",
      addShipment: "Yeni Sevkiyat Ekle",
      printBtn: "Mühürlü Faturayı Yazdır"
    }
  }[lang];

  return (
    <div dir={dir} className="min-h-screen bg-[#060B18] text-slate-200 font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="bg-[#0B1325] border-b border-[#D4AF37]/20 px-6 py-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37] bg-[#060B18] flex items-center justify-center font-bold text-[#D4AF37] text-2xl">
              C
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-wider text-[#E5C158]">CODELFA</h1>
              <p className="text-xs text-slate-400 uppercase tracking-widest">Italian Design & Luxury Porcelain ERP</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#060B18] border border-slate-700 rounded-lg p-1 flex text-xs">
              <button
                onClick={() => setRole('admin')}
                className={`px-3 py-1.5 rounded-md font-bold transition ${role === 'admin' ? 'bg-[#D4AF37] text-[#060B18]' : 'text-slate-400 hover:text-white'}`}
              >
                {t.admin}
              </button>
              <button
                onClick={() => setRole('partner')}
                className={`px-3 py-1.5 rounded-md font-bold transition ${role === 'partner' ? 'bg-[#D4AF37] text-[#060B18]' : 'text-slate-400 hover:text-white'}`}
              >
                {t.partner}
              </button>
            </div>

            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'ar' | 'en' | 'tr')}
              className="bg-[#060B18] border border-[#D4AF37]/30 text-[#E5C158] text-xs rounded-lg px-3 py-2 font-bold focus:outline-none"
            >
              <option value="ar">العربية (AR)</option>
              <option value="en">English (EN)</option>
              <option value="tr">Türkçe (TR)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-grow w-full">
        {/* Banner */}
        <div className="mb-6 p-3 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#E5C158] text-sm flex items-center justify-between">
          <span>{role === 'admin' ? t.bannerAdmin : t.bannerPartner}</span>
          <span className="text-xs bg-[#D4AF37]/20 px-2.5 py-1 rounded-full font-mono border border-[#D4AF37]/40">
            {role === 'admin' ? 'FULL ACCESS' : 'READ ONLY'}
          </span>
        </div>

        {/* Tabs */}
        <div className="bg-[#0B1325] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl mb-8">
          <div className="flex border-b border-slate-800 bg-[#060B18]/60 overflow-x-auto">
            <button
              onClick={() => setActiveTab('shipments')}
              className={`px-6 py-4 font-bold text-sm whitespace-nowrap border-b-2 ${activeTab === 'shipments' ? 'text-[#E5C158] border-[#D4AF37]' : 'text-slate-400 border-transparent'}`}
            >
              {t.tabShipments}
            </button>
            <button
              onClick={() => setActiveTab('invoice')}
              className={`px-6 py-4 font-bold text-sm whitespace-nowrap border-b-2 ${activeTab === 'invoice' ? 'text-[#E5C158] border-[#D4AF37]' : 'text-slate-400 border-transparent'}`}
            >
              {t.tabInvoice}
            </button>
            <button
              onClick={() => setActiveTab('ashdod')}
              className={`px-6 py-4 font-bold text-sm whitespace-nowrap border-b-2 ${activeTab === 'ashdod' ? 'text-[#E5C158] border-[#D4AF37]' : 'text-slate-400 border-transparent'}`}
            >
              {t.tabAshdod}
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'shipments' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-100">سجل الشحنات وماتريكس الأسعار</h3>
                  {role === 'admin' && (
                    <button className="bg-[#D4AF37] hover:bg-[#AA820A] text-[#060B18] font-bold px-4 py-2 rounded-lg text-sm transition">
                      {t.addShipment}
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right text-slate-300">
                    <thead className="text-xs uppercase bg-[#060B18] text-[#E5C158] border-b border-slate-700">
                      <tr>
                        <th className="py-3.5 px-4">رقم الحاوية</th>
                        <th className="py-3.5 px-4">الحجم</th>
                        <th className="py-3.5 px-4">الصنف</th>
                        <th className="py-3.5 px-4">الألواح (PCS)</th>
                        <th className="py-3.5 px-4">المساحة (m²)</th>
                        <th className="py-3.5 px-4">سعر الشراء</th>
                        <th className="py-3.5 px-4">سعر البيع</th>
                        <th className="py-3.5 px-4">تاريخ الوصول</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-200">MSCU-901823</td>
                        <td className="py-3.5 px-4"><span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs">40ft HQ</span></td>
                        <td className="py-3.5 px-4 font-bold">بورسلين إيطالي Calacatta</td>
                        <td className="py-3.5 px-4 font-mono">420</td>
                        <td className="py-3.5 px-4 font-mono">1,850 m²</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">$18.50</td>
                        <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">$28.00</td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-400">2026-10-20</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'invoice' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-100">معاينة الفاتورة المختومة</h3>
                  <button onClick={() => window.print()} className="bg-[#D4AF37] text-[#060B18] font-bold px-5 py-2 rounded-lg text-sm">
                    {t.printBtn}
                  </button>
                </div>
                <div className="bg-white text-slate-900 p-8 rounded-xl max-w-2xl mx-auto border border-slate-200">
                  <div className="flex justify-between border-b pb-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900">CODELFA</h2>
                      <p className="text-xs text-slate-500">Italian Porcelain & Marble Trade Co.</p>
                    </div>
                    <div className="text-left text-xs">
                      <p className="font-bold">#INV-2026-089</p>
                      <p>13/10/2026</p>
                    </div>
                  </div>
                  <div className="text-center my-6 border-2 border-dashed border-[#D4AF37] p-4 rounded-full w-32 h-32 mx-auto flex flex-col justify-center items-center text-[#D4AF37]">
                    <span className="font-bold text-xs text-slate-900">CODELFA</span>
                    <span className="text-[8px] uppercase tracking-widest text-[#AA820A]">Official Seal</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ashdod' && (
              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-4">عطلات ميناء أشدود (2026-2027)</h3>
                <div className="bg-[#060B18] p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <p className="flex justify-between py-2 border-b border-slate-800">
                    <span>رأس السنة العبرية</span>
                    <span className="font-mono text-[#E5C158]">12-13 سبتمبر 2026</span>
                  </p>
                  <p className="flex justify-between py-2">
                    <span>يوم الغفران (إغلاق تام)</span>
                    <span className="font-mono text-red-400">21-22 سبتمبر 2026</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#060B18] border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
        © 2026 CODELFA ERP System
      </footer>
    </div>
  );
}
