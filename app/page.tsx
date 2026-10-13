'use client';
import React, { useState, useEffect } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('sales');

  // البيانات
  const [invoices, setInvoices] = useState<any[]>([]);
  const [containers, setContainers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [checks, setChecks] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  // تحميل البيانات المحفوظة تلقائياً
  useEffect(() => {
    const sInv = localStorage.getItem('codelfa_invoices');
    const sCont = localStorage.getItem('codelfa_containers');
    const sCli = localStorage.getItem('codelfa_clients');
    const sChk = localStorage.getItem('codelfa_checks');
    const sStock = localStorage.getItem('codelfa_inventory');

    if (sInv) setInvoices(JSON.parse(sInv));
    else setInvoices([{ id: 1, client: 'شركة الأمل للمقاولات', totalAmount: 5000, paidAmount: 3000, remainingAmount: 2000, date: '2026-10-12', status: 'جزئي' }]);

    if (sCont) setContainers(JSON.parse(sCont));
    else setContainers([{ id: 1, code: 'MSKU-98231', country: 'الصين', supplier: 'مصنع غوانغدونغ', itemType: 'بورسلان 60x120', sqm: 1440, slabsCount: 720, totalCost: 18500, paidAmount: 12000, remainingCost: 6500, daysLeft: 12, status: 'في الطريق' }]);

    if (sCli) setClients(JSON.parse(sCli));
    else setClients([{ id: 1, name: 'شركة الأمل للمقاولات', phone: '0590000000', city: 'الخليل', notes: 'عميل رئيسي' }, { id: 2, name: 'أبو إيهاب (الميداني)', phone: '0591111111', city: 'الخليل', notes: 'إشراف ميداني' }]);

    if (sChk) setChecks(JSON.parse(sChk));
    else setChecks([{ id: 1, checkNumber: '109283', bankName: 'بنك فلسطين', clientName: 'شركة الأمل للمقاولات', amount: 2000, dueDate: '2026-11-01', type: 'وارد (زبون)', status: 'قيد الاستحقاق' }]);

    if (sStock) setInventory(JSON.parse(sStock));
    else setInventory([{ id: 1, itemName: 'بورسلان رمادي 60x120', warehouse: 'مخزن الخليل الرئيسي', sqm: 850, slabsCount: 425, unitPrice: 18 }]);
  }, []);

  // الحفظ التلقائي
  useEffect(() => { if (invoices.length > 0) localStorage.setItem('codelfa_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { if (containers.length > 0) localStorage.setItem('codelfa_containers', JSON.stringify(containers)); }, [containers]);
  useEffect(() => { if (clients.length > 0) localStorage.setItem('codelfa_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { if (checks.length > 0) localStorage.setItem('codelfa_checks', JSON.stringify(checks)); }, [checks]);
  useEffect(() => { if (inventory.length > 0) localStorage.setItem('codelfa_inventory', JSON.stringify(inventory)); }, [inventory]);

  // نماذج الإدخال والتعديل
  const [editingItem, setEditingItem] = useState<any>(null); // لحفظ العناصر التي قيد التعديل

  // الفواتير
  const [invClient, setInvClient] = useState('');
  const [invTotal, setInvTotal] = useState('');
  const [invPaid, setInvPaid] = useState('');

  // الحاويات
  const [cCode, setCCode] = useState('');
  const [cCountry, setCCountry] = useState('الصين');
  const [cSupplier, setCSupplier] = useState('');
  const [cItemType, setCItemType] = useState('');
  const [cSqm, setCSqm] = useState('');
  const [cSlabsCount, setCSlabsCount] = useState('');
  const [cTotalCost, setCTotalCost] = useState('');
  const [cPaidAmount, setCPaidAmount] = useState('');
  const [cDaysLeft, setCDaysLeft] = useState('');

  // الشيكات
  const [chkNum, setChkNum] = useState('');
  const [chkBank, setChkBank] = useState('');
  const [chkClient, setChkClient] = useState('');
  const [chkAmount, setChkAmount] = useState('');
  const [chkDate, setChkDate] = useState('');
  const [chkType, setChkType] = useState('وارد (زبون)');

  // المخزون
  const [stkName, setStkName] = useState('');
  const [stkWarehouse, setStkWarehouse] = useState('مخزن الخليل الرئيسي');
  const [stkSqm, setStkSqm] = useState('');
  const [stkSlabs, setStkSlabs] = useState('');
  const [stkPrice, setStkPrice] = useState('');

  // كشف الحساب
  const [selectedClientLedger, setSelectedClientLedger] = useState('');

  // --- دالّة حفظ أو تعديل الفاتورة ---
  const handleSaveInvoice = () => {
    if (!invClient.trim() || !invTotal) { alert('يرجى كتابة العميل وإجمالي المبيعات'); return; }
    const total = parseFloat(invTotal) || 0;
    const paid = parseFloat(invPaid) || 0;
    const rem = total - paid;

    if (editingItem && editingItem.type === 'invoice') {
      setInvoices(invoices.map(i => i.id === editingItem.id ? { ...i, client: invClient, totalAmount: total, paidAmount: paid, remainingAmount: rem } : i));
      setEditingItem(null);
    } else {
      setInvoices([{ id: Date.now(), client: invClient.trim(), totalAmount: total, paidAmount: paid, remainingAmount: rem, date: new Date().toISOString().split('T')[0], status: rem <= 0 ? 'مكتمل' : 'متبقي' }, ...invoices]);
    }
    setInvClient(''); setInvTotal(''); setInvPaid('');
  };

  // --- دالّة حفظ أو تعديل الحاوية ---
  const handleSaveContainer = () => {
    if (!cCode.trim()) { alert('يرجى تعبئة رقم الحاوية'); return; }
    const total = parseFloat(cTotalCost) || 0;
    const paid = parseFloat(cPaidAmount) || 0;
    const rem = total - paid;

    if (editingItem && editingItem.type === 'container') {
      setContainers(containers.map(c => c.id === editingItem.id ? { ...c, code: cCode, country: cCountry, supplier: cSupplier, itemType: cItemType, sqm: parseFloat(cSqm)||0, slabsCount: parseInt(cSlabsCount)||0, totalCost: total, paidAmount: paid, remainingCost: rem, daysLeft: parseInt(cDaysLeft)||0 } : c));
      setEditingItem(null);
    } else {
      setContainers([{ id: Date.now(), code: cCode.trim(), country: cCountry || 'الصين', supplier: cSupplier || 'مصنع الصين', itemType: cItemType || 'بورسلان', sqm: parseFloat(cSqm) || 0, slabsCount: parseInt(cSlabsCount) || 0, totalCost: total, paidAmount: paid, remainingCost: rem, daysLeft: parseInt(cDaysLeft) || 0, status: 'في الطريق' }, ...containers]);
    }
    setCCode(''); setCSupplier(''); setCItemType(''); setCSqm(''); setCSlabsCount(''); setCTotalCost(''); setCPaidAmount(''); setCDaysLeft('');
  };

  // --- دالّة إضافة شيك ---
  const handleSaveCheck = () => {
    if (!chkNum || !chkAmount) { alert('يرجى تعبئة رقم الشيك وقيمته'); return; }
    setChecks([{ id: Date.now(), checkNumber: chkNum, bankName: chkBank || 'بنك محلي', clientName: chkClient || 'غير محدد', amount: parseFloat(chkAmount) || 0, dueDate: chkDate || new Date().toISOString().split('T')[0], type: chkType, status: 'قيد الاستحقاق' }, ...checks]);
    setChkNum(''); setChkBank(''); setChkClient(''); setChkAmount(''); setChkDate('');
  };

  // --- دالّة إضافة مخزون ---
  const handleSaveStock = () => {
    if (!stkName) { alert('يرجى كتابة اسم الصنف بالمخزن'); return; }
    setInventory([{ id: Date.now(), itemName: stkName, warehouse: stkWarehouse, sqm: parseFloat(stkSqm) || 0, slabsCount: parseInt(stkSlabs) || 0, unitPrice: parseFloat(stkPrice) || 0 }, ...inventory]);
    setStkName(''); setStkSqm(''); setStkSlabs(''); setStkPrice('');
  };

  // الحسابات العامة للمالية والذمم
  const totalCustomerSales = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const totalCustomerPaid = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
  const totalCustomerRemaining = invoices.reduce((sum, i) => sum + (i.remainingAmount || 0), 0);

  const totalChinaCost = containers.reduce((sum, c) => sum + (c.totalCost || 0), 0);
  const totalChinaPaid = containers.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
  const totalChinaRemaining = containers.reduce((sum, c) => sum + (c.remainingCost || 0), 0);

  const totalStockSqm = inventory.reduce((sum, s) => sum + (s.sqm || 0), 0);
  const totalStockSlabs = inventory.reduce((sum, s) => sum + (s.slabsCount || 0), 0);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f1f5f9', color: '#0f172a' }}>
      
      {/* الهيدر */}
      <header style={{ backgroundColor: '#0f172a', color: '#fff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px' }}>نظام Codelfa ERP المتكامل</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>إدارة الحسابات، المخازن، الشيكات، والاستيراد (الخليل)</p>
        </div>
        <span style={{ backgroundColor: '#10b981', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
          ERP شامل وحي 🚀
        </span>
      </header>

      {/* التنقل */}
      <nav style={{ backgroundColor: '#1e293b', padding: '10px 24px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        <button onClick={() => setActiveTab('sales')} style={{ backgroundColor: activeTab === 'sales' ? '#2563eb' : '#334155', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📊 المبيعات والزبائن</button>
        <button onClick={() => setActiveTab('checks')} style={{ backgroundColor: activeTab === 'checks' ? '#2563eb' : '#334155', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>💳 حركة الشيكات ({checks.length})</button>
        <button onClick={() => setActiveTab('inventory')} style={{ backgroundColor: activeTab === 'inventory' ? '#2563eb' : '#334155', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📦 الاستيراد والحاويات ({containers.length})</button>
        <button onClick={() => setActiveTab('warehouse')} style={{ backgroundColor: activeTab === 'warehouse' ? '#2563eb' : '#334155', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🏭 جرد المخازن</button>
        <button onClick={() => setActiveTab('ledger')} style={{ backgroundColor: activeTab === 'ledger' ? '#2563eb' : '#334155', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📋 كشف حساب عميل</button>
      </nav>

      <main style={{ padding: '24px', maxWidth: '1300px', margin: '0 auto' }}>

        {/* 1. قسم المبيعات وحسابات الزبائن */}
        {activeTab === 'sales' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', borderRight: '5px solid #2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#64748b', fontSize: '13px' }}>إجمالي المبيعات للزبائن</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px' }}>${totalCustomerSales.toLocaleString()}</div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', borderRight: '5px solid #10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#64748b', fontSize: '13px' }}>المدفوع من الزبائن</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669', marginTop: '4px' }}>${totalCustomerPaid.toLocaleString()}</div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', borderRight: '5px solid #ef4444', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#64748b', fontSize: '13px' }}>المتبقي ديون على الزبائن</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', marginTop: '4px' }}>${totalCustomerRemaining.toLocaleString()}</div>
              </div>
            </div>

            {/* نموذج إدخال/تعديل فاتورة */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0 }}>{editingItem?.type === 'invoice' ? '✏️ تعديل فاتورة زبون' : '➕ إضافة فاتورة مبيعات جديدة'}</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input type="text" placeholder="اسم الزبون / الشركة" value={invClient} onChange={(e) => setInvClient(e.target.value)} style={{ flex: '1 1 200px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="number" placeholder="إجمالي المبلغ ($)" value={invTotal} onChange={(e) => setInvTotal(e.target.value)} style={{ flex: '1 1 120px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="number" placeholder="المدفوع نقداً ($)" value={invPaid} onChange={(e) => setInvPaid(e.target.value)} style={{ flex: '1 1 120px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                
                <button onClick={handleSaveInvoice} type="button" style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {editingItem?.type === 'invoice' ? 'تحديث الفاتورة' : 'حفظ الفاتورة'}
                </button>
              </div>
            </div>

            {/* جدول الفواتير */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
              <h3 style={{ marginTop: 0 }}>سجل فواتير المبيعات والذمم</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '12px' }}>الزبون</th>
                    <th style={{ padding: '12px' }}>الإجمالي</th>
                    <th style={{ padding: '12px' }}>المدفوع</th>
                    <th style={{ padding: '12px' }}>المتبقي على الزبون</th>
                    <th style={{ padding: '12px' }}>التاريخ</th>
                    <th style={{ padding: '12px' }}>خيارات والتعديل</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{inv.client}</td>
                      <td style={{ padding: '12px' }}>${(inv.totalAmount || 0).toLocaleString()}</td>
                      <td style={{ padding: '12px', color: '#059669', fontWeight: 'bold' }}>${(inv.paidAmount || 0).toLocaleString()}</td>
                      <td style={{ padding: '12px', color: '#dc2626', fontWeight: 'bold' }}>${(inv.remainingAmount || 0).toLocaleString()}</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{inv.date}</td>
                      <td style={{ padding: '12px', display: 'flex', gap: '6px' }}>
                        <button onClick={() => { setEditingItem({ id: inv.id, type: 'invoice' }); setInvClient(inv.client); setInvTotal(inv.totalAmount); setInvPaid(inv.paidAmount); }} style={{ backgroundColor: '#dbeafe', color: '#1e40af', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>تعديل ✏️</button>
                        <button onClick={() => setInvoices(invoices.filter(i => i.id !== inv.id))} style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>حذف 🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. قسم الشيكات */}
        {activeTab === 'checks' && (
          <div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0 }}>➕ إضافة شيك جديد (صادر / وارد)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <input type="text" placeholder="رقم الشيك" value={chkNum} onChange={(e) => setChkNum(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="text" placeholder="اسم البنك" value={chkBank} onChange={(e) => setChkBank(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="text" placeholder="الساحب / العميل" value={chkClient} onChange={(e) => setChkClient(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="number" placeholder="قيمة الشيك ($)" value={chkAmount} onChange={(e) => setChkAmount(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="date" value={chkDate} onChange={(e) => setChkDate(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <select value={chkType} onChange={(e) => setChkType(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="وارد (زبون)">وارد (من زبون)</option>
                  <option value="صادر (مورد)">صادر (إلى مورد)</option>
                </select>
                <button onClick={handleSaveCheck} type="button" style={{ gridColumn: '1 / -1', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>+ حفظ الشيك</button>
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
              <h3 style={{ marginTop: 0 }}>حافظة حركة الشيكات ومواعيد الاستحقاق</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '12px' }}>رقم الشيك</th>
                    <th style={{ padding: '12px' }}>البنك</th>
                    <th style={{ padding: '12px' }}>العميل / الساحب</th>
                    <th style={{ padding: '12px' }}>المبلغ</th>
                    <th style={{ padding: '12px' }}>تاريخ الاستحقاق</th>
                    <th style={{ padding: '12px' }}>النوع</th>
                    <th style={{ padding: '12px' }}>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {checks.map((chk) => (
                    <tr key={chk.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{chk.checkNumber}</td>
                      <td style={{ padding: '12px' }}>{chk.bankName}</td>
                      <td style={{ padding: '12px' }}>{chk.clientName}</td>
                      <td style={{ padding: '12px', color: '#2563eb', fontWeight: 'bold' }}>${(chk.amount || 0).toLocaleString()}</td>
                      <td style={{ padding: '12px', color: '#d97706', fontWeight: 'bold' }}>{chk.dueDate}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ backgroundColor: chk.type.includes('وارد') ? '#d1fae5' : '#fef3c7', color: chk.type.includes('وارد') ? '#065f46' : '#92400e', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>{chk.type}</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button onClick={() => setChecks(checks.filter(c => c.id !== chk.id))} style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>حذف 🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. قسم الاستيراد والحاويات */}
        {activeTab === 'inventory' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', borderRight: '5px solid #2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#64748b', fontSize: '13px' }}>إجمالي تكلفة الشحنات</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px' }}>${totalChinaCost.toLocaleString()}</div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', borderRight: '5px solid #10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#64748b', fontSize: '13px' }}>المحول للموردين (الصين)</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669', marginTop: '4px' }}>${totalChinaPaid.toLocaleString()}</div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', borderRight: '5px solid #ef4444', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#64748b', fontSize: '13px' }}>المتبقي للموردين (الصين)</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', marginTop: '4px' }}>${totalChinaRemaining.toLocaleString()}</div>
              </div>
            </div>

            {/* نموذج تسجيل/تعديل الحاوية */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0 }}>{editingItem?.type === 'container' ? '✏️ تعديل بيانات الحاوية' : '🚢 تسجيل حاوية استيراد جديدة'}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <input type="text" placeholder="رقم الحاوية (مثال: MSKU-1029)" value={cCode} onChange={(e) => setCCode(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="text" placeholder="بلد التوريد (مثال: الصين)" value={cCountry} onChange={(e) => setCCountry(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="text" placeholder="اسم المصنع / المورد" value={cSupplier} onChange={(e) => setCSupplier(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="text" placeholder="نوع الصنف" value={cItemType} onChange={(e) => setCItemType(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="number" placeholder="الكمية (م²)" value={cSqm} onChange={(e) => setCSqm(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="number" placeholder="عدد الألواح" value={cSlabsCount} onChange={(e) => setCSlabsCount(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="number" placeholder="إجمالي تكلفة الحاوية ($)" value={cTotalCost} onChange={(e) => setCTotalCost(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="number" placeholder="المبلغ المحول ($)" value={cPaidAmount} onChange={(e) => setCPaidAmount(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="number" placeholder="أيام متبقية للوصول" value={cDaysLeft} onChange={(e) => setCDaysLeft(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />

                <button onClick={handleSaveContainer} type="button" style={{ gridColumn: '1 / -1', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {editingItem?.type === 'container' ? 'تحديث بيانات الحاوية' : '+ حفظ الحاوية'}
                </button>
              </div>
            </div>

            {/* جدول الحاويات */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
              <h3 style={{ marginTop: 0 }}>جدول الحاويات والالتزامات المادية للموردين</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', minWidth: '850px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '12px' }}>رقم الحاوية</th>
                    <th style={{ padding: '12px' }}>التوريد والمورد</th>
                    <th style={{ padding: '12px' }}>الصنف والكمية</th>
                    <th style={{ padding: '12px' }}>الألواح</th>
                    <th style={{ padding: '12px' }}>التكلفة والمحول</th>
                    <th style={{ padding: '12px' }}>المتبقي للمورد (الصين)</th>
                    <th style={{ padding: '12px' }}>خيارات والتعديل</th>
                  </tr>
                </thead>
                <tbody>
                  {containers.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.code}</td>
                      <td style={{ padding: '12px' }}>{c.country} - {c.supplier}</td>
                      <td style={{ padding: '12px' }}>{c.itemType} ({(c.sqm||0).toLocaleString()} م²)</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#7c3aed' }}>{(c.slabsCount||0).toLocaleString()} لوح</td>
                      <td style={{ padding: '12px' }}>
                        <div>${(c.totalCost||0).toLocaleString()}</div>
                        <div style={{ fontSize: '12px', color: '#059669' }}>محول: ${(c.paidAmount||0).toLocaleString()}</div>
                      </td>
                      <td style={{ padding: '12px', color: '#dc2626', fontWeight: 'bold' }}>${(c.remainingCost||0).toLocaleString()}</td>
                      <td style={{ padding: '12px', display: 'flex', gap: '6px' }}>
                        <button onClick={() => { setEditingItem({ id: c.id, type: 'container' }); setCCode(c.code); setCCountry(c.country); setCSupplier(c.supplier); setCItemType(c.itemType); setCSqm(c.sqm); setCSlabsCount(c.slabsCount); setCTotalCost(c.totalCost); setCPaidAmount(c.paidAmount); setCDaysLeft(c.daysLeft); }} style={{ backgroundColor: '#dbeafe', color: '#1e40af', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>تعديل ✏️</button>
                        <button onClick={() => setContainers(containers.filter(item => item.id !== c.id))} style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>حذف 🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. قسم جرد المخازن */}
        {activeTab === 'warehouse' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', borderRight: '5px solid #10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#64748b', fontSize: '13px' }}>إجمالي الكميات بالمخازن (م²)</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669', marginTop: '4px' }}>{totalStockSqm.toLocaleString()} م²</div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', borderRight: '5px solid #8b5cf6', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#64748b', fontSize: '13px' }}>إجمالي عدد الألواح المتوفرة</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed', marginTop: '4px' }}>{totalStockSlabs.toLocaleString()} لوح</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0 }}>🏭 إدخال صنف جديد للمخزن / جرد</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <input type="text" placeholder="اسم الصنف (بورسلان/رخام)" value={stkName} onChange={(e) => setStkName(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="text" placeholder="اسم المخزن (الخليل/غيره)" value={stkWarehouse} onChange={(e) => setStkWarehouse(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="number" placeholder="المساحة بـ (م²)" value={stkSqm} onChange={(e) => setStkSqm(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="number" placeholder="عدد الألواح" value={stkSlabs} onChange={(e) => setStkSlabs(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="number" placeholder="سعر المتر ($)" value={stkPrice} onChange={(e) => setStkPrice(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <button onClick={handleSaveStock} type="button" style={{ gridColumn: '1 / -1', backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>+ تسجيل بالمرتجع/المخزن</button>
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
              <h3 style={{ marginTop: 0 }}>جدول كميات البضاعة الحالية بالمخازن</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '12px' }}>الصنف</th>
                    <th style={{ padding: '12px' }}>المخزن</th>
                    <th style={{ padding: '12px' }}>الكمية (م²)</th>
                    <th style={{ padding: '12px' }}>عدد الألواح</th>
                    <th style={{ padding: '12px' }}>سعر المتر</th>
                    <th style={{ padding: '12px' }}>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((stk) => (
                    <tr key={stk.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{stk.itemName}</td>
                      <td style={{ padding: '12px' }}>{stk.warehouse}</td>
                      <td style={{ padding: '12px', color: '#059669', fontWeight: 'bold' }}>{(stk.sqm||0).toLocaleString()} م²</td>
                      <td style={{ padding: '12px', color: '#7c3aed', fontWeight: 'bold' }}>{(stk.slabsCount||0).toLocaleString()} لوح</td>
                      <td style={{ padding: '12px' }}>${stk.unitPrice}</td>
                      <td style={{ padding: '12px' }}>
                        <button onClick={() => setInventory(inventory.filter(i => i.id !== stk.id))} style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>حذف 🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. قسم كشف حساب لكل عميل */}
        {activeTab === 'ledger' && (
          <div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0 }}>📋 اختر العميل لعرض كشف الحساب المالي التفصيلي</h3>
              <select value={selectedClientLedger} onChange={(e) => setSelectedClientLedger(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}>
                <option value="">-- اختر العميل من القائمة --</option>
                {invoices.map(i => <option key={i.id} value={i.client}>{i.client}</option>)}
              </select>
            </div>

            {selectedClientLedger && (
              <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2 style={{ marginTop: 0, color: '#1e293b' }}>كشف حساب: {selectedClientLedger}</h2>
                <hr style={{ margin: '16px 0', borderColor: '#e2e8f0' }} />

                <h4>الفواتير والمسحوبات الخاصة بالعميل:</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', marginBottom: '24px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                      <th style={{ padding: '10px' }}>التاريخ</th>
                      <th style={{ padding: '10px' }}>إجمالي الفاتورة</th>
                      <th style={{ padding: '10px' }}>المدفوع</th>
                      <th style={{ padding: '10px' }}>المتبقي بذمته</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.filter(i => i.client === selectedClientLedger).map(inv => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px' }}>{inv.date}</td>
                        <td style={{ padding: '10px' }}>${(inv.totalAmount||0).toLocaleString()}</td>
                        <td style={{ padding: '10px', color: '#059669' }}>${(inv.paidAmount||0).toLocaleString()}</td>
                        <td style={{ padding: '10px', color: '#dc2626', fontWeight: 'bold' }}>${(inv.remainingAmount||0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h4>الشيكات المقدمة من العميل:</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                      <th style={{ padding: '10px' }}>رقم الشيك</th>
                      <th style={{ padding: '10px' }}>البنك</th>
                      <th style={{ padding: '10px' }}>المبلغ</th>
                      <th style={{ padding: '10px' }}>تاريخ الاستحقاق</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checks.filter(c => c.clientName === selectedClientLedger).map(chk => (
                      <tr key={chk.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px' }}>{chk.checkNumber}</td>
                        <td style={{ padding: '10px' }}>{chk.bankName}</td>
                        <td style={{ padding: '10px', color: '#2563eb' }}>${(chk.amount||0).toLocaleString()}</td>
                        <td style={{ padding: '10px' }}>{chk.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
