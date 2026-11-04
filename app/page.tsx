"use client";

import { useMemo, useState } from "react";

type Section = "overview" | "shipments" | "purchases" | "sales" | "payments" | "expenses" | "checks" | "documents" | "reports" | "notes";
type Shipment = { id: string; container: string; supplier: string; route: string; status: string; eta: string; cost: string };
const initialShipments: Shipment[] = [
  { id: "SHP-026", container: "OOLU0890025", supplier: "Xiamen Sofiko", route: "Qingdao → Ashdod", status: "قيد الشحن البحري", eta: "22 Dec 2026", cost: "$28,450" },
  { id: "SHP-025", container: "MRSU6859427", supplier: "Fujian Stone", route: "Qingdao → Ashdod", status: "تم الاستلام في المستودع", eta: "تم الوصول", cost: "$31,800" },
  { id: "SHP-024", container: "TGHU7712041", supplier: "Foshan Ceramics", route: "Ningbo → Ashdod", status: "قيد التخليص الجمركي", eta: "08 Nov 2026", cost: "$19,600" },
];
const nav: { id: Section; label: string; icon: string }[] = [
  { id: "overview", label: "الرئيسية", icon: "⌂" },
  { id: "shipments", label: "الشحنات والحاويات", icon: "▤" },
  { id: "purchases", label: "المشتريات", icon: "＋" },
  { id: "sales", label: "المبيعات", icon: "↗" },
  { id: "payments", label: "الحوالات والدفعات", icon: "⇄" },
  { id: "expenses", label: "التكاليف والإضافات", icon: "◈" },
  { id: "checks", label: "الشيكات", icon: "▣" },
  { id: "documents", label: "الفواتير والمستندات", icon: "▧" },
  { id: "reports", label: "الكشوفات والتقارير", icon: "▥" },
  { id: "notes", label: "الملاحظات", icon: "✎" },
];
const statuses = ["تم الشراء", "تم تأكيد الطلب", "تم حجز الشحن البحري", "تم التحميل وإصدار بوليصة الشحن", "غادرت الميناء", "قيد الشحن البحري", "وصلت إلى الميناء", "قيد التخليص الجمركي", "تم الإفراج عنها", "تم الاستلام في المستودع", "مكتملة ومغلقة"];

export default function Home() {
  const [section, setSection] = useState<Section>("overview");
  const [role, setRole] = useState<"admin" | "partner">("admin");
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [shipments, setShipments] = useState(initialShipments);
  const [modal, setModal] = useState(false);
  const [newContainer, setNewContainer] = useState("");
  const [newSupplier, setNewSupplier] = useState("");
  const [newStatus, setNewStatus] = useState(statuses[0]);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(["تم تحديث موعد الوصول المتوقع للحاوية OOLU0890025.", "يرجى مراجعة فاتورة الشحن البحري قبل اعتماد الدفعة."]);
  const [files, setFiles] = useState<string[]>([]);
  const [notice, setNotice] = useState("هذه معاينة تشغيلية للواجهة؛ سيتم تفعيل الدخول المشترك والحفظ الآمن بعد ربط قاعدة البيانات المستقلة.");
  const [filter, setFilter] = useState("الكل");

  const isAr = lang === "ar";
  const filteredShipments = useMemo(() => filter === "الكل" ? shipments : shipments.filter(s => s.status === filter), [shipments, filter]);
  const title = nav.find(n => n.id === section)?.label ?? "الرئيسية";

  function addShipment() {
    if (!newContainer.trim()) return;
    setShipments([{ id: "SHP-" + String(shipments.length + 27).padStart(3, "0"), container: newContainer.trim().toUpperCase(), supplier: newSupplier || "غير محدد", route: "يحدد لاحقاً", status: newStatus, eta: "غير محدد", cost: "—" }, ...shipments]);
    setNewContainer(""); setNewSupplier(""); setNewStatus(statuses[0]); setModal(false);
    setNotice("تمت إضافة الحاوية إلى معاينة الواجهة. سيصبح الحفظ مشتركاً بعد ربط قاعدة البيانات.");
  }
  function addComment() {
    if (!comment.trim()) return;
    setComments([comment.trim(), ...comments]); setComment("");
  }

  return (
    <div className={isAr ? "app-shell" : "app-shell ltr"} dir={isAr ? "rtl" : "ltr"}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">C<span>✦</span></div>
          <div><div className="brand-name">CODELFA <b>PARTNERS</b></div><div className="brand-sub">PRIVATE BUSINESS PORTAL</div></div>
        </div>
        <div className="workspace"><span className="workspace-dot" /> مساحة الشراكة <small>حساب مشترك</small></div>
        <div className="nav-caption">إدارة الأعمال</div>
        <nav>{nav.map(item => <button key={item.id} className={section === item.id ? "nav-item active" : "nav-item"} onClick={() => setSection(item.id)}><span className="nav-icon">{item.icon}</span><span>{item.label}</span>{section === item.id && <i />}</button>)}</nav>
        <div className="sidebar-bottom"><div className="secure"><span>⌑</span><div><b>مساحة خاصة وآمنة</b><small>وصول للمستخدمين المصرح لهم</small></div></div><div className="version">CODELFA PARTNERS · 1.0</div></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand"><div className="brand-mark small">C<span>✦</span></div><b>CODELFA PARTNERS</b></div>
          <div className="crumb">مساحة الشراكة <span>/</span> <b>{title}</b></div>
          <div className="top-actions">
            <button className="icon-btn" title="الإشعارات">♧<i /></button>
            <select className="lang-select" value={lang} onChange={e => setLang(e.target.value as "ar" | "en")}><option value="ar">العربية</option><option value="en">English</option></select>
            <div className="user-chip"><div className="avatar">{role === "admin" ? "ت" : "أ"}</div><div><b>{role === "admin" ? "تمـر — المدير" : "د. أبو خليل"}</b><small>{role === "admin" ? "مدير النظام" : "شريك · مشاهدة وتعليق"}</small></div><button className="chevron" onClick={() => setRole(role === "admin" ? "partner" : "admin")} title="تبديل معاينة الدور">⌄</button></div>
          </div>
        </header>

        <div className="content">
          <div className="welcome-row"><div><div className="eyebrow">PRIVATE PARTNERSHIP OVERVIEW</div><h1>{section === "overview" ? "صباح الخير، تمـر" : title}</h1><p>{section === "overview" ? "إليك ملخص حركة الأعمال والشحنات والحسابات." : "متابعة واضحة ومنظمة لجميع تفاصيل العمل المشترك."}</p></div><div className="date-pill">◷ <span>الأربعاء، 4 نوفمبر 2026</span></div></div>
          {notice && <div className="preview-notice"><span>ⓘ</span>{notice}<button onClick={() => setNotice("")}>×</button></div>}

          {section === "overview" && <>
            <div className="hero-card"><div className="hero-copy"><div className="hero-kicker">CODELFA · BUSINESS PARTNERSHIP</div><h2>كل تفاصيل العمل،<br/><em>في مكان واحد.</em></h2><p>متابعة الشحنات والمشتريات والمبيعات والتدفقات المالية بكل وضوح.</p><button onClick={() => setSection("shipments")} className="gold-button">استعراض الشحنات <span>←</span></button></div><div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-cube">C<span>✦</span></div><div className="hero-label">TRUST · CLARITY · PARTNERSHIP</div></div></div>
            <div className="section-heading"><div><h2>نظرة عامة</h2><p>ملخص الأداء المالي والتشغيلي</p></div><span className="period">كل الفترات　⌄</span></div>
            <div className="stats-grid">
              <Stat icon="▤" label="إجمالي الحاويات" value="08" note="3 شحنات قيد المتابعة" />
              <Stat icon="↗" label="إجمالي المبيعات" value="$125,400" note="قيمة المبيعات المسجلة" />
              <Stat icon="⇄" label="إجمالي المدفوعات" value="$78,250" note="حوالات ودفعات مسجلة" />
              <Stat icon="◈" label="الربح المتوقع" value="$32,800" note="حسب بيانات العمليات" gold />
            </div>
            <div className="two-col">
              <section className="panel"><div className="panel-head"><div><h3>حركة الشحنات</h3><p>آخر الشحنات المحدثة</p></div><button className="text-link" onClick={() => setSection("shipments")}>عرض الكل ←</button></div><ShipmentTable rows={shipments.slice(0,3)} /></section>
              <section className="panel"><div className="panel-head"><div><h3>آخر الملاحظات</h3><p>تحديثات ومتابعات الشراكة</p></div><button className="text-link" onClick={() => setSection("notes")}>كل الملاحظات ←</button></div><div className="activity-list">{comments.slice(0,3).map((c,i)=><div className="activity" key={i}><div className="activity-icon">✎</div><div><b>{c}</b><small>تحديث ضمن مساحة الشراكة</small></div></div>)}</div></section>
            </div>
          </>}

          {section === "shipments" && <section className="panel full-panel"><div className="panel-head"><div><h3>الشحنات والحاويات</h3><p>متابعة مراحل الشحن من الشراء حتى الاستلام</p></div>{role === "admin" && <button className="gold-button compact" onClick={() => setModal(true)}>＋ إضافة حاوية</button>}</div><div className="toolbar"><select value={filter} onChange={e=>setFilter(e.target.value)}><option>الكل</option>{statuses.map(s=><option key={s}>{s}</option>)}</select><span>{filteredShipments.length} شحنات</span></div><ShipmentTable rows={filteredShipments} detailed /></section>}

          {["purchases","sales","payments","expenses","checks","documents","reports"].includes(section) && <section className="panel full-panel"><div className="panel-head"><div><h3>{title}</h3><p>سجل موحد مرتبط بالشحنات والحسابات</p></div>{role === "admin" && <button className="gold-button compact" onClick={()=>setNotice("سيتم تفعيل نموذج الإدخال والحفظ المشترك عند ربط قاعدة البيانات.")}>＋ إضافة جديد</button>}</div><div className="empty-state"><div className="empty-icon">{nav.find(n=>n.id===section)?.icon}</div><h3>مساحة {title}</h3><p>سيظهر هنا سجل العمليات والمرفقات والتفاصيل المرتبطة بكل عملية.</p><div className="feature-chips"><span>ربط بالحاوية</span><span>فواتير PDF وصور</span><span>سجل التعديلات</span><span>كشف حساب قابل للطباعة</span></div></div></section>}

          {section === "notes" && <section className="panel full-panel"><div className="panel-head"><div><h3>الملاحظات والتعليقات</h3><p>مساحة تواصل مرتبطة بمتابعة العمل</p></div></div><div className="comment-compose"><textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="اكتب ملاحظة أو تعليقاً للشريك..." /><button className="gold-button compact" onClick={addComment}>إضافة الملاحظة</button></div><div className="activity-list notes-list">{comments.map((c,i)=><div className="activity" key={i}><div className="activity-icon">✎</div><div><b>{c}</b><small>{i===0?"أضيفت الآن":"ضمن سجل الملاحظات"}</small></div></div>)}</div></section>}
        </div>
        <footer>© 2026 CODELFA PARTNERS <span>مساحة خاصة لإدارة الشراكة</span></footer>
      </main>

      {modal && <div className="modal-backdrop" onClick={()=>setModal(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><h3>إضافة حاوية جديدة</h3><p>أدخل البيانات الأساسية ويمكن استكمال التفاصيل لاحقاً.</p></div><button onClick={()=>setModal(false)}>×</button></div><label>رقم الحاوية<input value={newContainer} onChange={e=>setNewContainer(e.target.value)} placeholder="مثال: MSCU1234567"/></label><label>المورد / المصنع<input value={newSupplier} onChange={e=>setNewSupplier(e.target.value)} placeholder="اسم المورد"/></label><label>حالة الشحنة<select value={newStatus} onChange={e=>setNewStatus(e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></label><div className="modal-actions"><button className="plain-button" onClick={()=>setModal(false)}>إلغاء</button><button className="gold-button compact" onClick={addShipment}>إضافة الحاوية</button></div></div></div>}
    </div>
  );
}

function Stat({icon,label,value,note,gold=false}:{icon:string;label:string;value:string;note:string;gold?:boolean}) {
  return <div className={gold?"stat-card gold-stat":"stat-card"}><div className="stat-top"><span>{label}</span><i>{icon}</i></div><strong>{value}</strong><small>{note}</small></div>;
}
function ShipmentTable({rows,detailed=false}:{rows:Shipment[];detailed?:boolean}) {
  return <div className="table-wrap"><table><thead><tr><th>رقم الحاوية</th><th>المورد</th><th>المسار</th><th>الحالة</th>{detailed&&<><th>التكلفة</th><th>الوصول المتوقع</th></>}</tr></thead><tbody>{rows.map(row=><tr key={row.id}><td><b className="mono">{row.container}</b><small className="row-id">{row.id}</small></td><td>{row.supplier}</td><td>{row.route}</td><td><span className={row.status.includes("الاستلام")?"status done":row.status.includes("التخليص")?"status warning":"status transit"}>{row.status}</span></td>{detailed&&<><td className="mono">{row.cost}</td><td>{row.eta}</td></>}</tr>)}</tbody></table>{rows.length===0&&<div className="empty-row">لا توجد نتائج لهذه الحالة.</div>}</div>;
}
