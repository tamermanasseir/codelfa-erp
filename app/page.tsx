"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type Role = "owner" | "partner";
type User = { id: string; username: string; displayName: string; role: Role };
type Shipment = {
  id: string; reference_no: string | null; container_no: string | null; supplier_name: string | null;
  origin: string | null; destination: string | null; status: string; eta: string | null; created_at: string;
};
type Entry = {
  id: string; entry_type: string; reference_no: string | null; entry_date: string; amount_minor: number;
  currency: string; direction: "in" | "out"; status: string; description: string | null;
  counterparty_name: string | null; container_no: string | null;
};
type Comment = { id: string; body: string; author: string; created_at: string; target_type: string };
type Section = "overview" | "shipments" | "finance" | "notes" | "team";
const shipmentStatuses = [
  ["purchased","تم الشراء"],["ordered","تم تأكيد الطلب"],["booked","تم حجز الشحن البحري"],
  ["loaded","تم التحميل وإصدار بوليصة الشحن"],["departed","غادرت الميناء"],["in_transit","قيد الشحن البحري"],
  ["arrived","وصلت إلى الميناء"],["customs_clearance","قيد التخليص الجمركي"],["released","تم الإفراج عنها"],
  ["received","تم الاستلام في المستودع"],["closed","مكتملة ومغلقة"],
];
const entryTypes = [["purchase","شراء"],["sale","مبيعات"],["payment","دفعة / حوالة"],["expense","تكلفة"],["addition","إضافة"],["cheque","شيك"]];
const currencies = ["USD","CNY","ILS","TRY"];
const money = (minor: number, currency: string) => new Intl.NumberFormat("en-US",{style:"currency",currency,maximumFractionDigits:2}).format(minor/100);
const dateLabel = (v: string) => { try { return new Date(v).toLocaleDateString("en-GB"); } catch { return v; } };
async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path,{...options,credentials:"same-origin",headers:{"content-type":"application/json",...(options.headers||{})}});
  const data = await response.json().catch(()=>({error:"تعذر قراءة استجابة الخادم"}));
  if (!response.ok) throw new Error(data.error || "حدث خطأ");
  return data as T;
}

export default function Home() {
  const [user,setUser] = useState<User|null>(null);
  const [initialized,setInitialized] = useState<boolean|null>(null);
  const [loading,setLoading] = useState(true);
  const [section,setSection] = useState<Section>("overview");
  const [lang,setLang] = useState<"ar"|"en">("ar");
  const [shipments,setShipments] = useState<Shipment[]>([]);
  const [entries,setEntries] = useState<Entry[]>([]);
  const [comments,setComments] = useState<Comment[]>([]);
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");
  const [showShipment,setShowShipment] = useState(false);
  const [showEntry,setShowEntry] = useState(false);
  const [showPartner,setShowPartner] = useState(false);
  const [loginName,setLoginName] = useState("");
  const [loginPassword,setLoginPassword] = useState("");
  const [setupKey,setSetupKey] = useState("");
  const [ownerName,setOwnerName] = useState("");
  const [ownerDisplay,setOwnerDisplay] = useState("");
  const [ownerPassword,setOwnerPassword] = useState("");
  const [partnerName,setPartnerName] = useState("abukhalil");
  const [partnerDisplay,setPartnerDisplay] = useState("د. أبو خليل");
  const [partnerPassword,setPartnerPassword] = useState("");
  const [commentText,setCommentText] = useState("");
  const [shipmentForm,setShipmentForm] = useState({containerNo:"",referenceNo:"",supplierName:"",origin:"Qingdao",destination:"Ashdod",status:"purchased",eta:"",billOfLadingNo:"",notes:""});
  const [entryForm,setEntryForm] = useState({entryType:"purchase",amount:"",currency:"USD",direction:"out",entryDate:new Date().toISOString().slice(0,10),description:"",referenceNo:"",status:"recorded"});

  const isAr = lang === "ar";
  const isOwner = user?.role === "owner";
  const labels = isAr
    ? {home:"الرئيسية",shipments:"الشحنات والحاويات",finance:"الحسابات والعمليات",notes:"الملاحظات",team:"إدارة الشريك",hello:"مساحة الشراكة",signout:"تسجيل الخروج",add:"إضافة",refresh:"تحديث",empty:"لا توجد بيانات مسجلة بعد",readOnly:"صلاحية مشاهدة وتعليق فقط"}
    : {home:"Overview",shipments:"Shipments",finance:"Financial entries",notes:"Comments",team:"Partner access",hello:"Partnership workspace",signout:"Sign out",add:"Add",refresh:"Refresh",empty:"No records have been added yet",readOnly:"View and comment only"};
  const nav: {id:Section;label:string;icon:string}[] = [
    {id:"overview",label:labels.home,icon:"⌂"},{id:"shipments",label:labels.shipments,icon:"▤"},
    {id:"finance",label:labels.finance,icon:"⇄"},{id:"notes",label:labels.notes,icon:"✎"},
    ...(isOwner?[{id:"team" as Section,label:labels.team,icon:"♙"}]:[]),
  ];
  const title = nav.find(x=>x.id===section)?.label || labels.home;

  const loadData = useCallback(async () => {
    if (!user) return;
    setError("");
    try {
      const [s,f,c] = await Promise.all([
        api<{shipments:Shipment[]}>("/api/shipments"),
        api<{entries:Entry[]}>("/api/financial-entries"),
        api<{comments:Comment[]}>("/api/comments"),
      ]);
      setShipments(s.shipments); setEntries(f.entries); setComments(c.comments);
    } catch(e) { setError(e instanceof Error?e.message:"تعذر تحميل البيانات"); }
  },[user]);

  useEffect(() => {
    let active = true;
    Promise.all([api<{user:User}>("/api/me"),api<{initialized:boolean}>("/api/health")])
      .then(([session,health])=>{if(active){setUser(session.user);setInitialized(health.initialized);}})
      .catch(async()=>{try{const health=await api<{initialized:boolean}>("/api/health");if(active)setInitialized(health.initialized);}catch{if(active)setError("تعذر الاتصال بالخادم وقاعدة البيانات.");}})
      .finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[]);
  useEffect(()=>{if(user) void loadData();},[user,loadData]);

  async function signIn(e:FormEvent) {
    e.preventDefault();setError("");
    try { const result=await api<{user:User}>("/api/login",{method:"POST",body:JSON.stringify({username:loginName,password:loginPassword})});setUser(result.user);setLoginPassword(""); }
    catch(e){setError(e instanceof Error?e.message:"تعذر تسجيل الدخول");}
  }
  async function setup(e:FormEvent) {
    e.preventDefault();setError("");
    try { await api("/api/setup",{method:"POST",headers:{"x-setup-key":setupKey},body:JSON.stringify({username:ownerName,displayName:ownerDisplay,password:ownerPassword})});setInitialized(true);setNotice("تم إنشاء حساب المدير. سجّل الدخول الآن.");setSetupKey(""); }
    catch(e){setError(e instanceof Error?e.message:"تعذر إنشاء الحساب");}
  }
  async function signOut() {
    await api("/api/logout",{method:"POST"}).catch(()=>undefined);setUser(null);setShipments([]);setEntries([]);setComments([]);setSection("overview");
  }
  async function createShipment(e:FormEvent) {
    e.preventDefault();setError("");
    try {await api("/api/shipments",{method:"POST",body:JSON.stringify(shipmentForm)});setShowShipment(false);setShipmentForm({containerNo:"",referenceNo:"",supplierName:"",origin:"Qingdao",destination:"Ashdod",status:"purchased",eta:"",billOfLadingNo:"",notes:""});await loadData();setNotice("تم حفظ الحاوية في قاعدة البيانات المشتركة.");}
    catch(e){setError(e instanceof Error?e.message:"تعذر حفظ الحاوية");}
  }
  async function createEntry(e:FormEvent) {
    e.preventDefault();setError("");
    try {await api("/api/financial-entries",{method:"POST",body:JSON.stringify({...entryForm,amount:Number(entryForm.amount)})});setShowEntry(false);setEntryForm({...entryForm,amount:"",description:"",referenceNo:""});await loadData();setNotice("تم حفظ العملية المالية.");}
    catch(e){setError(e instanceof Error?e.message:"تعذر حفظ العملية");}
  }
  async function createComment(e:FormEvent) {
    e.preventDefault();if(!commentText.trim())return;
    try {await api("/api/comments",{method:"POST",body:JSON.stringify({targetType:"general",body:commentText})});setCommentText("");await loadData();}
    catch(e){setError(e instanceof Error?e.message:"تعذر إضافة التعليق");}
  }
  async function createPartner(e:FormEvent) {
    e.preventDefault();setError("");
    try {await api("/api/users",{method:"POST",body:JSON.stringify({username:partnerName,displayName:partnerDisplay,password:partnerPassword})});setShowPartner(false);setPartnerPassword("");setNotice("تم إنشاء حساب الشريك. أرسل له اسم المستخدم وكلمة المرور بطريقة آمنة.");}
    catch(e){setError(e instanceof Error?e.message:"تعذر إنشاء حساب الشريك");}
  }

  const totals = useMemo(()=>{
    const sum=(direction:"in"|"out")=>entries.filter(x=>x.direction===direction&&x.status!=="cancelled").reduce((a,x)=>a+x.amount_minor,0);
    return {in:sum("in"),out:sum("out"),count:entries.length};
  },[entries]);
  const grouped = useMemo(()=>currencies.map(currency=>({currency,in:entries.filter(x=>x.currency===currency&&x.direction==="in"&&x.status!=="cancelled").reduce((a,x)=>a+x.amount_minor,0),out:entries.filter(x=>x.currency===currency&&x.direction==="out"&&x.status!=="cancelled").reduce((a,x)=>a+x.amount_minor,0)})).filter(x=>x.in||x.out),[entries]);

  if(loading) return <div className="auth-screen"><div className="auth-card"><div className="brand-mark">C<span>✦</span></div><h2>CODELFA PARTNERS</h2><p>جارٍ الاتصال بمساحة الشراكة…</p></div></div>;
  if(!user) return <div className="auth-screen"><div className="auth-card"><div className="auth-brand"><div className="brand-mark">C<span>✦</span></div><div><b>CODELFA PARTNERS</b><small>PRIVATE BUSINESS PORTAL</small></div></div>
    <h1>{initialized===false?"إعداد مساحة الشراكة":"مرحباً بعودتك"}</h1><p>{initialized===false?"أنشئ حساب المدير الأول. هذه الخطوة متاحة مرة واحدة فقط.":"سجّل الدخول للوصول إلى بيانات العمل المشتركة."}</p>
    {error&&<div className="error-banner">{error}</div>}
    {initialized===false?<form onSubmit={setup} className="auth-form"><label>مفتاح الإعداد المؤقت<input required type="password" value={setupKey} onChange={e=>setSetupKey(e.target.value)} /></label><label>اسم المستخدم<input required minLength={3} value={ownerName} onChange={e=>setOwnerName(e.target.value)} placeholder="tamer" /></label><label>الاسم الظاهر<input required value={ownerDisplay} onChange={e=>setOwnerDisplay(e.target.value)} placeholder="المدير" /></label><label>كلمة المرور (12 حرفاً على الأقل)<input required minLength={12} type="password" value={ownerPassword} onChange={e=>setOwnerPassword(e.target.value)} /></label><button className="gold-button auth-submit">إنشاء حساب المدير</button></form>
    :<form onSubmit={signIn} className="auth-form"><label>اسم المستخدم<input autoComplete="username" required value={loginName} onChange={e=>setLoginName(e.target.value)} /></label><label>كلمة المرور<input autoComplete="current-password" required type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} /></label><button className="gold-button auth-submit">تسجيل الدخول</button></form>}
    <div className="auth-foot">مساحة خاصة للمستخدمين المصرح لهم فقط</div></div></div>;

  return <div className={isAr?"app-shell":"app-shell ltr"} dir={isAr?"rtl":"ltr"}>
    <aside className="sidebar"><div className="brand"><div className="brand-mark">C<span>✦</span></div><div><div className="brand-name">CODELFA <b>PARTNERS</b></div><div className="brand-sub">PRIVATE BUSINESS PORTAL</div></div></div>
      <div className="workspace"><span className="workspace-dot"/> مساحة الشراكة<small>حساب مشترك وآمن</small></div><div className="nav-caption">إدارة الأعمال</div>
      <nav>{nav.map(item=><button key={item.id} className={section===item.id?"nav-item active":"nav-item"} onClick={()=>setSection(item.id)}><span className="nav-icon">{item.icon}</span><span>{item.label}</span>{section===item.id&&<i/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="secure"><span>⌑</span><div><b>مساحة خاصة وآمنة</b><small>صلاحيات حسب نوع الحساب</small></div></div><div className="version">CODELFA PARTNERS · 1.0</div></div>
    </aside>
    <main className="main-area"><header className="topbar"><div className="mobile-brand"><div className="brand-mark small">C<span>✦</span></div><b>CODELFA PARTNERS</b></div><div className="crumb">{labels.hello}<span>/</span><b>{title}</b></div>
      <div className="top-actions"><select className="lang-select" value={lang} onChange={e=>setLang(e.target.value as "ar"|"en")}><option value="ar">العربية</option><option value="en">English</option></select><div className="user-chip"><div className="avatar">{user.displayName.slice(0,1)}</div><div><b>{user.displayName}</b><small>{isOwner?"مدير النظام":labels.readOnly}</small></div><button className="chevron" onClick={signOut} title={labels.signout}>↪</button></div></div>
    </header>
    <div className="content"><div className="welcome-row"><div><div className="eyebrow">PRIVATE PARTNERSHIP WORKSPACE</div><h1>{section==="overview"?"أهلاً، "+user.displayName:title}</h1><p>متابعة الشحنات والحسابات والعمليات الفعلية المسجلة.</p></div><div className="date-pill">{new Date().toLocaleDateString(isAr?"ar":"en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div></div>
      {notice&&<div className="preview-notice"><span>✓</span>{notice}<button onClick={()=>setNotice("")}>×</button></div>}
      {error&&<div className="error-banner">{error}<button onClick={()=>setError("")}>×</button></div>}
      {section==="overview"&&<><div className="hero-card"><div className="hero-copy"><div className="hero-kicker">CODELFA · BUSINESS PARTNERSHIP</div><h2>كل تفاصيل العمل،<br/><em>في مكان واحد.</em></h2><p>بيانات مشتركة، صلاحيات واضحة، ومتابعة منظمة من الشراء حتى التسليم.</p><button onClick={()=>setSection("shipments")} className="gold-button">استعراض الشحنات <span>←</span></button></div><div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-cube">C<span>✦</span></div><div className="hero-label">TRUST · CLARITY · PARTNERSHIP</div></div></div>
        <div className="section-heading"><div><h2>ملخص الحسابات</h2><p>القيم معروضة حسب كل عملة دون خلط أسعار الصرف</p></div><button className="text-link" onClick={()=>void loadData()}>{labels.refresh} ↻</button></div>
        <div className="stats-grid"><Stat label="عدد الحاويات" value={String(shipments.length)} note="الشحنات المسجلة فعلياً"/><Stat label="العمليات المالية" value={String(totals.count)} note="عدد القيود المسجلة"/><Stat label="إجمالي المقبوضات" value={String(grouped.length)} note="عملات لها حركة مالية"/><Stat label="إجمالي المدفوعات" value={String(entries.filter(x=>x.direction==="out").length)} note="قيود دفع مسجلة" gold/></div>
        <div className="two-col"><section className="panel"><div className="panel-head"><div><h3>آخر الشحنات</h3><p>حالة الحاويات المسجلة</p></div><button className="text-link" onClick={()=>setSection("shipments")}>عرض الكل ←</button></div><ShipmentTable rows={shipments.slice(0,5)}/>{shipments.length===0&&<Empty text={labels.empty}/>}</section>
        <section className="panel"><div className="panel-head"><div><h3>الحركة حسب العملة</h3><p>مقبوضات ومدفوعات دون تحويل تلقائي</p></div></div>{grouped.length?grouped.map(g=><div className="currency-row" key={g.currency}><b>{g.currency}</b><span>داخل: {money(g.in,g.currency)}</span><span>خارج: {money(g.out,g.currency)}</span></div>):<Empty text={labels.empty}/>}</section></div></>}
      {section==="shipments"&&<section className="panel full-panel"><div className="panel-head"><div><h3>الشحنات والحاويات</h3><p>مراحل الشحن من الشراء حتى الاستلام</p></div>{isOwner&&<button className="gold-button compact" onClick={()=>setShowShipment(true)}>＋ إضافة حاوية</button>}</div><ShipmentTable rows={shipments} detailed/>{shipments.length===0&&<Empty text={labels.empty}/>}</section>}
      {section==="finance"&&<section className="panel full-panel"><div className="panel-head"><div><h3>الحسابات والعمليات المالية</h3><p>المشتريات والمبيعات والدفعات والتكاليف والإضافات والشيكات</p></div>{isOwner&&<button className="gold-button compact" onClick={()=>setShowEntry(true)}>＋ تسجيل عملية</button>}</div><div className="table-wrap"><table><thead><tr><th>التاريخ</th><th>النوع</th><th>البيان</th><th>المرجع</th><th>الاتجاه</th><th>القيمة</th><th>الحالة</th></tr></thead><tbody>{entries.map(x=><tr key={x.id}><td>{dateLabel(x.entry_date)}</td><td>{entryTypes.find(t=>t[0]===x.entry_type)?.[1]||x.entry_type}</td><td>{x.description||"—"}</td><td className="mono">{x.reference_no||"—"}</td><td>{x.direction==="in"?"داخل":"خارج"}</td><td className="mono">{money(x.amount_minor,x.currency)}</td><td>{x.status}</td></tr>)}</tbody></table></div>{entries.length===0&&<Empty text={labels.empty}/>}</section>}
      {section==="notes"&&<section className="panel full-panel"><div className="panel-head"><div><h3>الملاحظات والتعليقات</h3><p>يمكن للمدير والشريك إضافة التعليقات</p></div></div><form className="comment-compose" onSubmit={createComment}><textarea value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="اكتب ملاحظة أو تعليقاً للشريك…"/><button className="gold-button compact">إضافة التعليق</button></form><div className="activity-list notes-list">{comments.map(c=><div className="activity" key={c.id}><div className="activity-icon">✎</div><div><b>{c.body}</b><small>{c.author} · {dateLabel(c.created_at)}</small></div></div>)}</div>{comments.length===0&&<Empty text={labels.empty}/>}</section>}
      {section==="team"&&isOwner&&<section className="panel full-panel"><div className="panel-head"><div><h3>إدارة حساب الشريك</h3><p>حساب الشريك بصلاحية مشاهدة البيانات والتعليق فقط، دون تعديل القيود المالية أو الشحنات</p></div><button className="gold-button compact" onClick={()=>setShowPartner(true)}>＋ إنشاء حساب الشريك</button></div><div className="empty-state"><div className="empty-icon">♙</div><h3>صلاحيات محددة وآمنة</h3><p>أنشئ حساب الدكتور أبو خليل بكلمة مرور مستقلة. لا تشارك كلمة مرور المدير.</p><div className="feature-chips"><span>مشاهدة كل السجلات</span><span>إضافة التعليقات</span><span>لا تعديل مالي</span><span>لا حذف</span></div></div></section>}
    </div><footer>© 2026 CODELFA PARTNERS <span>مساحة خاصة لإدارة الشراكة</span></footer></main>

    {showShipment&&<Modal title="إضافة حاوية جديدة" close={()=>setShowShipment(false)}><form onSubmit={createShipment} className="modal-form">
      <label>رقم الحاوية<input value={shipmentForm.containerNo} onChange={e=>setShipmentForm({...shipmentForm,containerNo:e.target.value})} placeholder="OOLU1234567"/></label>
      <label>رقم مرجعي<input value={shipmentForm.referenceNo} onChange={e=>setShipmentForm({...shipmentForm,referenceNo:e.target.value})}/></label>
      <label>المورد / المصنع<input value={shipmentForm.supplierName} onChange={e=>setShipmentForm({...shipmentForm,supplierName:e.target.value})}/></label>
      <div className="form-grid"><label>ميناء الشحن<input value={shipmentForm.origin} onChange={e=>setShipmentForm({...shipmentForm,origin:e.target.value})}/></label><label>ميناء الوصول<input value={shipmentForm.destination} onChange={e=>setShipmentForm({...shipmentForm,destination:e.target.value})}/></label></div>
      <label>الحالة<select value={shipmentForm.status} onChange={e=>setShipmentForm({...shipmentForm,status:e.target.value})}>{shipmentStatuses.map(s=><option value={s[0]} key={s[0]}>{s[1]}</option>)}</select></label>
      <div className="form-grid"><label>موعد الوصول المتوقع<input type="date" value={shipmentForm.eta} onChange={e=>setShipmentForm({...shipmentForm,eta:e.target.value})}/></label><label>رقم بوليصة الشحن<input value={shipmentForm.billOfLadingNo} onChange={e=>setShipmentForm({...shipmentForm,billOfLadingNo:e.target.value})}/></label></div>
      <label>ملاحظات<textarea value={shipmentForm.notes} onChange={e=>setShipmentForm({...shipmentForm,notes:e.target.value})}/></label><div className="modal-actions"><button type="button" className="plain-button" onClick={()=>setShowShipment(false)}>إلغاء</button><button className="gold-button compact">حفظ الحاوية</button></div>
    </form></Modal>}
    {showEntry&&<Modal title="تسجيل عملية مالية" close={()=>setShowEntry(false)}><form onSubmit={createEntry} className="modal-form">
      <label>نوع العملية<select value={entryForm.entryType} onChange={e=>setEntryForm({...entryForm,entryType:e.target.value})}>{entryTypes.map(t=><option value={t[0]} key={t[0]}>{t[1]}</option>)}</select></label>
      <div className="form-grid"><label>المبلغ<input required type="number" min="0.01" step="0.01" value={entryForm.amount} onChange={e=>setEntryForm({...entryForm,amount:e.target.value})}/></label><label>العملة<select value={entryForm.currency} onChange={e=>setEntryForm({...entryForm,currency:e.target.value})}>{currencies.map(c=><option key={c}>{c}</option>)}</select></label></div>
      <div className="form-grid"><label>الاتجاه<select value={entryForm.direction} onChange={e=>setEntryForm({...entryForm,direction:e.target.value as "in"|"out"})}><option value="out">خارج</option><option value="in">داخل</option></select></label><label>التاريخ<input required type="date" value={entryForm.entryDate} onChange={e=>setEntryForm({...entryForm,entryDate:e.target.value})}/></label></div>
      <label>البيان<input value={entryForm.description} onChange={e=>setEntryForm({...entryForm,description:e.target.value})}/></label><label>رقم مرجعي<input value={entryForm.referenceNo} onChange={e=>setEntryForm({...entryForm,referenceNo:e.target.value})}/></label>
      <div className="modal-actions"><button type="button" className="plain-button" onClick={()=>setShowEntry(false)}>إلغاء</button><button className="gold-button compact">حفظ العملية</button></div>
    </form></Modal>}
    {showPartner&&<Modal title="إنشاء حساب الشريك" close={()=>setShowPartner(false)}><form onSubmit={createPartner} className="modal-form"><label>اسم المستخدم<input required minLength={3} value={partnerName} onChange={e=>setPartnerName(e.target.value)}/></label><label>الاسم الظاهر<input required value={partnerDisplay} onChange={e=>setPartnerDisplay(e.target.value)}/></label><label>كلمة مرور مؤقتة (12 حرفاً على الأقل)<input required minLength={12} type="password" value={partnerPassword} onChange={e=>setPartnerPassword(e.target.value)}/></label><div className="modal-actions"><button type="button" className="plain-button" onClick={()=>setShowPartner(false)}>إلغاء</button><button className="gold-button compact">إنشاء الحساب</button></div></form></Modal>}
  </div>;
}

function Stat({label,value,note,gold=false}:{label:string;value:string;note:string;gold?:boolean}) {return <div className={gold?"stat-card gold-stat":"stat-card"}><div className="stat-top"><span>{label}</span><i>◈</i></div><strong>{value}</strong><small>{note}</small></div>;}
function Empty({text}:{text:string}) {return <div className="empty-row">{text}</div>;}
function ShipmentTable({rows,detailed=false}:{rows:Shipment[];detailed?:boolean}) {
  return <div className="table-wrap"><table><thead><tr><th>رقم الحاوية</th><th>المورد</th><th>المسار</th><th>الحالة</th>{detailed&&<th>الوصول المتوقع</th>}</tr></thead><tbody>{rows.map(row=><tr key={row.id}><td><b className="mono">{row.container_no||"—"}</b><small className="row-id">{row.reference_no||row.id.slice(0,8)}</small></td><td>{row.supplier_name||"—"}</td><td>{[row.origin,row.destination].filter(Boolean).join(" → ")||"—"}</td><td><span className={row.status==="received"||row.status==="closed"?"status done":row.status==="customs_clearance"?"status warning":"status transit"}>{shipmentStatuses.find(s=>s[0]===row.status)?.[1]||row.status}</span></td>{detailed&&<td>{row.eta?dateLabel(row.eta):"—"}</td>}</tr>)}</tbody></table></div>;
}
function Modal({title,close,children}:{title:string;close:()=>void;children:React.ReactNode}) {return <div className="modal-backdrop" onMouseDown={close}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><h3>{title}</h3><p>تُحفظ البيانات في مساحة الشراكة المشتركة</p></div><button onClick={close}>×</button></div>{children}</div></div>;}
