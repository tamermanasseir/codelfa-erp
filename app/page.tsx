'use client';
import React, { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('sales');

  // 1. الفواتير والمبيعات
  const [invoices, setInvoices] = useState([
    { id: 1, client: 'شركة الأمل للمقاولات', amount: 4500, date: '2026-10-12', status: 'مدفوع' }
  ]);
  const [newClient, setNewClient] = useState('');
  const [newAmount, setNewAmount] = useState('');

  // 2. الحاويات والشحن والاستيراد
  const [containers, setContainers] = useState([
    {
      id: 1,
      code: 'MSKU-98231',
      country: 'الصين',
      supplier: 'مصنع غوانغدونغ',
      itemType: 'بورسلان 60x120',
      sqm: 1440,
      slabsCount: 720,
      totalCost: 18500,
      paidAmount: 12000,
      remainingCost: 6500,
      daysLeft: 12,
      status: 'في الطريق'
    }
  ]);

  const [cCode, setCCode] = useState('');
  const [cCountry, setCCountry] = useState('الصين');
  const [cSupplier, setCSupplier] = useState('');
  const [cItemType, setCItemType] = useState('');
  const [cSqm, setCSqm] = useState('');
  const [cSlabsCount, setCSlabsCount] = useState('');
  const [cTotalCost, setCTotalCost] = useState('');
  const [cPaidAmount, setCPaidAmount] = useState('');
  const [cDaysLeft, setCDaysLeft] = useState('');

  // 3. العملاء
  const [clients, setClients] = useState([
    { id: 1, name: 'أبو إيهاب (الميداني)', phone: '0590000000', city: 'الخليل', notes: 'التنسيق الميداني والخدمات' }
  ]);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  // دالة إضافة فاتورة
  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim() || !newAmount) return;
    const numAmount = parseFloat(newAmount) || 0;
    
    setInvoices((prev) => [
      ...prev,
      {
        id: Date.now(),
        client: newClient,
        amount: numAmount,
        date: new Date().toISOString().split('T')[0],
        status: 'مُسجل'
      }
    ]);
    setNewClient('');
    setNewAmount('');
  };

  // دالة إضافة حاوية
  const handleAddContainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cCode.trim()) return;
    const total = parseFloat(cTotalCost) || 0;
    const paid = parseFloat(cPaidAmount) || 0;

    setContainers((prev) => [
      ...prev,
      {
        id: Date.now(),
        code: cCode,
        country: cCountry || 'الصين',
        supplier: cSupplier || 'مصنع الصين',
        itemType: cItemType || 'بورسلان',
        sqm: parseFloat(cSqm) || 0,
        slabsCount: parseInt(cSlabsCount) || 0,
        totalCost: total,
        paidAmount: paid,
        remainingCost: total - paid,
        daysLeft: parseInt(cDaysLeft) || 0,
        status: 'قيد الشحن'
      }
    ]);

    setCCode('');
    setCSupplier('');
    setCItemType('');
    setCSqm('');
    setCSlabsCount('');
    setCTotalCost('');
    setCPaidAmount('');
    setCDaysLeft('');
  };

  // دالة إضافة عميل
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    setClients((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newClientName,
        phone: newClientPhone || '-',
        city: 'الخليل',
        notes: 'متابعة ميدانية'
      }
    ]);
    setNewClientName('');
    setNewClientPhone('');
  };

  // مجاميع وإحصائيات
  const totalSales = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalContainersCount = containers.length;
  const totalChinaRemaining = containers.reduce((sum, c) => sum + c.remainingCost, 0);
  const totalSqm = containers.reduce((sum, c) => sum + c.sqm, 0);
  const totalSlabs = containers.reduce((sum, c) => sum + c.slabsCount, 0);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f1f5f9', color: '#0f172a' }}>
      
      {/* الهيدر */}
      <header style={{ backgroundColor: '#0f172a', color: '#fff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px' }}>نظام Codelfa ERP</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>إدارة المبيعات، الحاويات، والاستيراد من الصين (الخليل)</p>
        </div>
        <span style={{ backgroundColor: '#10b981', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
          تفاعلي ⚡
        </span>
      </header>

      {/* التنقل */}
      <nav style={{ backgroundColor: '#1e293b', padding: '10px 24px', display: 'flex', gap: '10px', overflowX: 'auto' }}>
        <button onClick={() => setActiveTab('sales')} style={{ backgroundColor: activeTab === 'sales' ? '#2563eb' : '#334155', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          📊 المبيعات والحسابات ({invoices.length})
        </button>
        <button onClick={() => setActiveTab('inventory')} style={{ backgroundColor: activeTab === 'inventory' ? '#2563eb' : '#334155', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          📦 الاستيراد والحاويات ({containers.length})
        </button>
        <button onClick={() => setActiveTab('clients')} style={{ backgroundColor: activeTab === 'clients' ? '#2563eb' : '#334155', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          👥 العملاء والميدان ({clients.length})
        </button>
      </nav>

      <main style={{ padding: '24px', maxWidth: '1250px', margin: '0 auto' }}>

        {/* 1. قسم المبيعات */}
        {activeTab === 'sales' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', borderRight: '5px solid #2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#64748b', fontSize: '14px' }}>إجمالي الفواتير</div>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#0f172a', marginTop: '6px' }}>${totalSales.toLocaleString()}</div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', borderRight: '5px solid #10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#64748b', fontSize: '14px' }}>عدد الفواتير</div>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#0f172a', marginTop: '6px' }}>{invoices.length} فاتورة</div>
              </div>
            </div>

            {/* نموذج إضافة فاتورة */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0, color: '#0f172a' }}>➕ إضافة فاتورة مبيعات جديدة</h3>
              <form onSubmit={handleAddInvoice} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="اسم العميل / الشركة"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  style={{ flex: '1 1 200px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
                <input
                  type="number"
                  placeholder="المبلغ ($)"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  style={{ flex: '1 1 120px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
                <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  حفظ الفاتورة
                </button>
              </form>
            </div>

            {/* جدول الفواتير */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0 }}>سجل الفواتير المسجلة</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '12px' }}>العميل</th>
                    <th style={{ padding: '12px' }}>المبلغ</th>
                    <th style={{ padding: '12px' }}>التاريخ</th>
                    <th style={{ padding: '12px' }}>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{inv.client}</td>
                      <td style={{ padding: '12px', color: '#10b981', fontWeight: 'bold' }}>${inv.amount.toLocaleString()}</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{inv.date}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>{inv.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. قسم الاستيراد والحاويات */}
        {activeTab === 'inventory' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', borderRight: '5px solid #2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#64748b', fontSize: '13px' }}>الحاويات المشحونة</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>{totalContainersCount} حاوية</div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', borderRight: '5px solid #ef4444', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#64748b', fontSize: '13px' }}>المتبقي للصين / الموردين</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', marginTop: '4px' }}>${totalChinaRemaining.toLocaleString()}</div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', borderRight: '5px solid #10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#64748b', fontSize: '13px' }}>إجمالي الكمية (م²)</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669', marginTop: '4px' }}>{totalSqm.toLocaleString()} م²</div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', borderRight: '5px solid #8b5cf6', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#64748b', fontSize: '13px' }}>إجمالي الألواح</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed', marginTop: '4px' }}>{totalSlabs.toLocaleString()} لوح</div>
              </div>
            </div>

            {/* نموذج إدخال حاوية */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0, color: '#0f172a' }}>🚢 تسجيل حاوية استيراد جديدة</h3>
              <form onSubmit={handleAddContainer} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <input type="text" placeholder="رقم الحاوية (مثال: MSKU-1029)" value={cCode} onChange={(e) => setCCode(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                <input type="text" placeholder="بلد التوريد (مثال: الصين)" value={cCountry} onChange={(e) => setCCountry(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="text" placeholder="اسم المصنع / المورد" value={cSupplier} onChange={(e) => setCSupplier(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="text" placeholder="نوع الصنف (بورسلان/رخام)" value={cItemType} onChange={(e) => setCItemType(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                
                <input type="number" placeholder="الكمية (م²)" value={cSqm} onChange={(e) => setCSqm(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="number" placeholder="عدد الألواح" value={cSlabsCount} onChange={(e) => setCSlabsCount(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                
                <input type="number" placeholder="إجمالي المبلغ ($)" value={cTotalCost} onChange={(e) => setCTotalCost(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="number" placeholder="المبلغ المحول ($)" value={cPaidAmount} onChange={(e) => setCPaidAmount(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="number" placeholder="الأيام المتبقية للوصول" value={cDaysLeft} onChange={(e) => setCDaysLeft(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />

                <button type="submit" style={{ gridColumn: '1 / -1', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                  + حفظ الحاوية
                </button>
              </form>
            </div>

            {/* جدول الحاويات */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
              <h3 style={{ marginTop: 0 }}>متابعة الحاويات الشاحنة وتفاصيل الصين</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', minWidth: '850px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '14px' }}>
                    <th style={{ padding: '12px' }}>رقم الحاوية</th>
                    <th style={{ padding: '12px' }}>التوريد والمورد</th>
                    <th style={{ padding: '12px' }}>الصنف والكمية</th>
                    <th style={{ padding: '12px' }}>عدد الألواح</th>
                    <th style={{ padding: '12px' }}>الإجمالي والمدفوع</th>
                    <th style={{ padding: '12px' }}>المتبقي للصين</th>
                    <th style={{ padding: '12px' }}>متبقي للوصول</th>
                    <th style={{ padding: '12px' }}>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {containers.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.code}</td>
                      <td style={{ padding: '12px' }}>
                        <div>{c.country}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{c.supplier}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div>{c.itemType}</div>
                        <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold' }}>{c.sqm.toLocaleString()} م²</div>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#7c3aed' }}>{c.slabsCount.toLocaleString()} لوح</td>
                      <td style={{ padding: '12px' }}>
                        <div>${c.totalCost.toLocaleString()}</div>
                        <div style={{ fontSize: '12px', color: '#059669' }}>محول: ${c.paidAmount.toLocaleString()}</div>
                      </td>
                      <td style={{ padding: '12px', color: '#dc2626', fontWeight: 'bold' }}>${c.remainingCost.toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                          ⏱️ {c.daysLeft} يوم
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. قسم العملاء */}
        {activeTab === 'clients' && (
          <div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0 }}>👤 إضافة عميل جديد</h3>
              <form onSubmit={handleAddClient} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input type="text" placeholder="اسم العميل / الشريك" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} style={{ flex: '1 1 200px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                <input type="text" placeholder="رقم الهاتف" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} style={{ flex: '1 1 150px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <button type="submit" style={{ backgroundColor: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>حفظ العميل</button>
              </form>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0 }}>سجل العملاء والميدان</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '12px' }}>الاسم</th>
                    <th style={{ padding: '12px' }}>الهاتف</th>
                    <th style={{ padding: '12px' }}>المدينة</th>
                    <th style={{ padding: '12px' }}>ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((cli) => (
                    <tr key={cli.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{cli.name}</td>
                      <td style={{ padding: '12px', color: '#2563eb' }}>{cli.phone}</td>
                      <td style={{ padding: '12px' }}>{cli.city}</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{cli.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
