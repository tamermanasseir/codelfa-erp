"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";

type Role = "owner" | "partner";
type User = { id: string; username: string; displayName: string; role: Role };
type Shipment = {
  id:string; reference_no:string|null; container_no:string|null; supplier_name:string|null;
  origin:string|null; destination:string|null; status:string; purchase_date:string|null; etd:string|null;
  eta:string|null; bill_of_lading_no:string|null; notes:string|null; created_at:string;
};
type Entry = {
  id:string; entry_type:string; purpose?:string; reference_no:string|null; counterparty_id:string|null; shipment_id:string|null;
  entry_date:string; due_date:string|null; amount_minor:number; currency:string; direction:"in"|"out";
  status:string; description:string|null; notes:string|null; payment_method:string|null; cheque_no:string|null;
  bank_name:string|null; paid_at:string|null; counterparty_name:string|null; container_no:string|null;
};
type Party = {id:string;name:string;counterparty_type:"supplier"|"customer"|"other";phone:string|null;email:string|null;notes:string|null};
type Invoice = {
  id:string;invoice_no:string;invoice_type:"sale"|"purchase";counterparty_id:string|null;shipment_id:string|null;
  invoice_date:string;due_date:string|null;currency:string;subtotal_minor:number;discount_minor:number;tax_minor:number;
  total_minor:number;paid_minor:number;status:string;notes:string|null;counterparty_name:string|null;container_no:string|null;
};
type Remittance = {id:string;entry_date:string;amount_minor:number;currency:string;reference_no:string|null;description:string|null;notes:string|null;payment_method:string|null;status:string;allocated_minor:number};
type RemittanceAllocation = {id:string;invoice_id:string;financial_entry_id:string;amount_minor:number;currency:string;entry_date:string;invoice_no:string;supplier_name:string|null;container_no:string|null};
type InvoiceLine = {id:string;invoice_id:string;description:string;quantity:number;unit:string;unit_price_minor:number;line_total_minor:number;notes:string|null};
type PurchaseExtra = {id:string;invoice_id:string;category:string;description:string;amount_minor:number;currency:string;expense_date:string;notes:string|null;shipment_id:string|null;invoice_no:string};
type PurchaseExtraForm = {category:string;description:string;amount:string;currency:string;expenseDate:string;notes:string};
type ShipmentPhoto = {id:string;shipment_id:string;file_name:string;content_type:string;byte_size:number;photo_date:string;caption:string|null;uploaded_by:string;created_at:string};
type Budget = {id:string;shipment_id:string;budget_type:"sale"|"purchase"|"expense";currency:string;expected_minor:number;notes:string|null};
type DocumentItem = {id:string;target_type:string;target_id:string;file_name:string;content_type:string;byte_size:number;created_at:string};
type Comment = {id:string;body:string;author:string;created_at:string;target_type:string;target_id:string|null};
type Section = "overview"|"shipments"|"purchases"|"sales"|"invoices"|"china"|"finance"|"parties"|"statements"|"reports"|"notes"|"team";
type InvoiceLineForm = {description:string;quantity:string;unit:string;unitPrice:string};
const currencies=["USD","CNY","ILS","TRY"];
const shipmentStatuses=[
  ["purchased","تم الشراء"],["ordered","تم تأكيد الطلب"],["booked","تم حجز الشحن البحري"],
  ["loaded","تم التحميل وإصدار بوليصة الشحن"],["departed","غادرت الميناء"],["in_transit","قيد الشحن البحري"],
  ["arrived","وصلت إلى الميناء"],["customs_clearance","قيد التخليص الجمركي"],["released","تم الإفراج عنها"],
  ["received","تم الاستلام في المستودع"],["closed","مكتملة ومغلقة"]
];
const entryTypes=[["payment","دفعة / حوالة"],["expense","مصروف / تكلفة"],["addition","إضافة"],["cheque","شيك"]];
const money=(minor:number,currency:string)=>new Intl.NumberFormat("en-US",{style:"currency",currency,maximumFractionDigits:2}).format((minor||0)/100);
const dateLabel=(value:string|null|undefined)=>value?new Date(value+"T00:00:00").toLocaleDateString("en-GB"):"—";
async function api<T>(path:string,options:RequestInit={}):Promise<T>{
  const response=await fetch(path,{...options,credentials:"same-origin",headers:{"content-type":"application/json",...(options.headers||{})}});
  const data=await response.json().catch(()=>({error:"تعذر قراءة استجابة الخادم"}));
  if(!response.ok)throw new Error(data.error||"حدث خطأ");
  return data as T;
}
const blankShipment=()=>({containerNo:"",referenceNo:"",supplierName:"",origin:"Qingdao",destination:"Ashdod",status:"purchased",purchaseDate:"",etd:"",eta:"",billOfLadingNo:"",notes:""});
const blankEntry=()=>({entryType:"payment",amount:"",currency:"USD",direction:"out",entryDate:new Date().toISOString().slice(0,10),dueDate:"",description:"",referenceNo:"",status:"recorded",counterpartyId:"",shipmentId:"",paymentMethod:"bank_transfer",chequeNo:"",bankName:"",paidAt:"",notes:""});
const blankInvoice=()=>({invoiceNo:"",invoiceType:"sale",counterpartyId:"",shipmentId:"",invoiceDate:new Date().toISOString().slice(0,10),dueDate:"",currency:"USD",discount:"0",tax:"0",status:"issued",notes:"",lines:[{description:"",quantity:"1",unit:"pcs",unitPrice:""}] as InvoiceLineForm[],purchaseExtras:[] as PurchaseExtraForm[]});
const purchaseExtraCategories=[["freight","أجور الشحن"],["customs","جمارك وتخليص"],["handling","مناولة وتحميل"],["cutting","قص وتجهيز"],["unloading","تنزيل"],["insurance","تأمين"],["other","إضافات أخرى"]];
const blankPurchaseExtra=(currency="USD"):PurchaseExtraForm=>({category:"freight",description:"",amount:"",currency,expenseDate:new Date().toISOString().slice(0,10),notes:""});
const blankChinaPayment=()=>({amount:"",currency:"USD",entryDate:new Date().toISOString().slice(0,10),referenceNo:"",notes:"",allocations:[{invoiceId:"",amount:""}]});

export default function Home(){
  const [user,setUser]=useState<User|null>(null);
  const [initialized,setInitialized]=useState<boolean|null>(null);
  const [loading,setLoading]=useState(true);
  const [section,setSection]=useState<Section>("overview");
  const [lang,setLang]=useState<"ar"|"en">("ar");
  const [shipments,setShipments]=useState<Shipment[]>([]);
  const [entries,setEntries]=useState<Entry[]>([]);
  const [invoices,setInvoices]=useState<Invoice[]>([]);
  const [invoiceLines,setInvoiceLines]=useState<InvoiceLine[]>([]);
  const [purchaseExtras,setPurchaseExtras]=useState<PurchaseExtra[]>([]);
  const [shipmentPhotos,setShipmentPhotos]=useState<ShipmentPhoto[]>([]);
  const [parties,setParties]=useState<Party[]>([]);
  const [budgets,setBudgets]=useState<Budget[]>([]);
  const [documents,setDocuments]=useState<DocumentItem[]>([]);
  const [comments,setComments]=useState<Comment[]>([]);
  const [chinaRemittances,setChinaRemittances]=useState<Remittance[]>([]);
  const [chinaAllocations,setChinaAllocations]=useState<RemittanceAllocation[]>([]);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [modal,setModal]=useState<"shipment"|"shipmentPhotos"|"invoice"|"entry"|"party"|"budget"|"partner"|"chinaPayment"|null>(null);
  const [editingId,setEditingId]=useState<string|null>(null);
  const [shipmentForm,setShipmentForm]=useState(blankShipment());
  const [entryForm,setEntryForm]=useState(blankEntry());
  const [invoiceForm,setInvoiceForm]=useState(blankInvoice());
  const [invoiceFiles,setInvoiceFiles]=useState<File[]>([]);
  const [activePhotoShipment,setActivePhotoShipment]=useState<Shipment|null>(null);
  const [photoFiles,setPhotoFiles]=useState<File[]>([]);
  const [photoDate,setPhotoDate]=useState(new Date().toISOString().slice(0,10));
  const [photoCaption,setPhotoCaption]=useState("");
  const [uploadingPhotos,setUploadingPhotos]=useState(false);
  const [chinaPaymentForm,setChinaPaymentForm]=useState(blankChinaPayment);
  const [partyForm,setPartyForm]=useState({name:"",type:"supplier",phone:"",email:"",notes:""});
  const [budgetForm,setBudgetForm]=useState({shipmentId:"",budgetType:"sale",currency:"USD",expected:"",notes:""});
  const [partnerForm,setPartnerForm]=useState({username:"abukhalil",displayName:"د. أبو خليل",password:""});
  const [loginName,setLoginName]=useState("");
  const [loginPassword,setLoginPassword]=useState("");
  const [setupKey,setSetupKey]=useState("");
  const [ownerName,setOwnerName]=useState("tamer");
  const [ownerDisplay,setOwnerDisplay]=useState("Tamer");
  const [ownerPassword,setOwnerPassword]=useState("");
  const [commentText,setCommentText]=useState("");
  const [commentTarget,setCommentTarget]=useState("general");
  const [statementParty,setStatementParty]=useState("");
  const [uploadTarget,setUploadTarget]=useState<{type:"shipment"|"invoice"|"financial_entry";id:string}|null>(null);
  const [uploading,setUploading]=useState(false);

  const isOwner=user?.role==="owner";
  const isAr=lang==="ar";
  const labels=isAr
    ? {home:"الرئيسية",shipments:"الشحنات والحاويات",purchases:"المشتريات",sales:"المبيعات",invoices:"سجل الفواتير",china:"دفعات الصين",finance:"الدفعات والشيكات",parties:"الموردون والعملاء",statements:"كشوف الحسابات",reports:"الأرباح التلقائية",notes:"الملاحظات والتعليقات",team:"إدارة المساحة",refresh:"تحديث",empty:"لا توجد بيانات مسجلة بعد",add:"إضافة",readOnly:"مشاهدة وتعليق فقط"}
    : {home:"Overview",shipments:"Shipments & Containers",purchases:"Purchases",sales:"Sales",invoices:"Invoice register",china:"China remittances",finance:"Payments & Cheques",parties:"Suppliers & Customers",statements:"Statements",reports:"Automatic profit",notes:"Notes & Comments",team:"Workspace admin",refresh:"Refresh",empty:"No records yet",add:"Add",readOnly:"View and comment only"};
  const sections: {id:Section;label:string;icon:string}[]=[
    {id:"overview",label:labels.home,icon:"⌂"},{id:"shipments",label:labels.shipments,icon:"▤"},
    {id:"purchases",label:labels.purchases,icon:"＋"},{id:"sales",label:labels.sales,icon:"↗"},
    {id:"invoices",label:labels.invoices,icon:"▧"},{id:"china",label:labels.china,icon:"⇢"},
    {id:"finance",label:labels.finance,icon:"⇄"},{id:"parties",label:labels.parties,icon:"♙"},
    {id:"statements",label:labels.statements,icon:"≡"},{id:"reports",label:labels.reports,icon:"▥"},
    {id:"notes",label:labels.notes,icon:"✎"},
    ...(isOwner?[{id:"team" as Section,label:labels.team,icon:"⚙"}]:[])
  ];
  const title=sections.find(s=>s.id===section)?.label||labels.home;

  const loadData=useCallback(async()=>{
    if(!user)return;
    setError("");
    try{
      const [s,e,i,p,b,d,c,m,h]=await Promise.all([
        api<{shipments:Shipment[]}>("/api/shipments"),
        api<{entries:Entry[]}>("/api/financial-entries"),
        api<{invoices:Invoice[];lines:InvoiceLine[];purchaseExtras:PurchaseExtra[]}>("/api/invoices"),
        api<{counterparties:Party[]}>("/api/counterparties"),
        api<{budgets:Budget[]}>("/api/shipment-budgets"),
        api<{documents:DocumentItem[]}>("/api/documents"),
        api<{comments:Comment[]}>("/api/comments"),
        api<{entries:Remittance[];allocations:RemittanceAllocation[]}>("/api/china-remittances"),
        api<{photos:ShipmentPhoto[]}>("/api/shipment-loading-photos")
      ]);
      setShipments(s.shipments);setEntries(e.entries);setInvoices(i.invoices);setInvoiceLines(i.lines);setPurchaseExtras(i.purchaseExtras||[]);
      setParties(p.counterparties);setBudgets(b.budgets);setDocuments(d.documents);setComments(c.comments);
      setChinaRemittances(m.entries);setChinaAllocations(m.allocations);setShipmentPhotos(h.photos||[]);
    }catch(err){setError(err instanceof Error?err.message:"تعذر تحميل بيانات الشراكة");}
  },[user]);

  useEffect(()=>{
    let active=true;
    Promise.all([api<{user:User}>("/api/me"),api<{initialized:boolean}>("/api/health")])
      .then(([session,health])=>{if(active){setUser(session.user);setInitialized(health.initialized);}})
      .catch(async()=>{try{const h=await api<{initialized:boolean}>("/api/health");if(active)setInitialized(h.initialized);}catch{if(active)setError("تعذر الاتصال بالخادم.");}})
      .finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[]);
  useEffect(()=>{if(user)void loadData();},[user,loadData]);

  async function signIn(e:FormEvent){e.preventDefault();setError("");try{const r=await api<{user:User}>("/api/login",{method:"POST",body:JSON.stringify({username:loginName,password:loginPassword})});setUser(r.user);setLoginPassword("");}catch(err){setError(err instanceof Error?err.message:"تعذر تسجيل الدخول");}}
  async function setup(e:FormEvent){e.preventDefault();setError("");try{await api("/api/setup",{method:"POST",headers:{"x-setup-key":setupKey},body:JSON.stringify({username:ownerName,displayName:ownerDisplay,password:ownerPassword})});setInitialized(true);setNotice("تم إنشاء حساب المدير. سجّل الدخول الآن.");setSetupKey("");setOwnerPassword("");}catch(err){setError(err instanceof Error?err.message:"تعذر إنشاء الحساب");}}
  async function signOut(){await api("/api/logout",{method:"POST"}).catch(()=>undefined);setUser(null);setSection("overview");}
  function openShipmentPhotos(s:Shipment){
    setActivePhotoShipment(s);setPhotoFiles([]);setPhotoDate(new Date().toISOString().slice(0,10));setPhotoCaption("");setModal("shipmentPhotos");
  }
  async function saveShipmentPhotos(e:FormEvent){
    e.preventDefault();
    if(!activePhotoShipment||!photoFiles.length)return;
    setUploadingPhotos(true);setError("");
    const failed:File[]=[];
    const errors:string[]=[];
    for(const original of photoFiles){
      try{
        const file=await prepareDocumentFile(original);
        const bytes=new Uint8Array(await file.arrayBuffer());let binary="";
        for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
        await api("/api/shipment-loading-photos",{method:"POST",body:JSON.stringify({shipmentId:activePhotoShipment.id,fileName:file.name,contentType:file.type,contentBase64:btoa(binary),photoDate,caption:photoCaption})});
      }catch(err){
        failed.push(original);errors.push(original.name+": "+(err instanceof Error?err.message:"تعذر رفع الصورة"));
      }
    }
    setUploadingPhotos(false);
    await loadData();
    setPhotoFiles(failed);
    if(failed.length){setError("تم رفع "+(photoFiles.length-failed.length)+" صورة، وتعذر رفع "+failed.length+": "+errors.join(" · "));}
    else{setModal(null);setNotice("تم حفظ صور التحميل وربطها بالحاوية "+(activePhotoShipment.container_no||activePhotoShipment.reference_no||"")+".");}
  }
  async function deleteShipmentPhoto(photo:ShipmentPhoto){
    if(!window.confirm("حذف صورة التحميل هذه نهائياً؟"))return;
    try{await api("/api/shipment-loading-photos/"+photo.id,{method:"DELETE"});await loadData();setNotice("تم حذف الصورة.");}
    catch(err){setError(err instanceof Error?err.message:"تعذر حذف الصورة");}
  }
  function startShipmentEdit(s:Shipment){
    setEditingId(s.id);
    setShipmentForm({containerNo:s.container_no||"",referenceNo:s.reference_no||"",supplierName:s.supplier_name||"",origin:s.origin||"",destination:s.destination||"",status:s.status,purchaseDate:s.purchase_date||"",etd:s.etd||"",eta:s.eta||"",billOfLadingNo:s.bill_of_lading_no||"",notes:s.notes||""});
    setModal("shipment");
  }
  async function saveShipment(e:FormEvent){
    e.preventDefault();setError("");
    try{
      await api(editingId?"/api/shipments/"+editingId:"/api/shipments",{method:editingId?"PATCH":"POST",body:JSON.stringify(shipmentForm)});
      setModal(null);setEditingId(null);await loadData();setNotice("تم حفظ بيانات الشحنة.");
    }catch(err){setError(err instanceof Error?err.message:"تعذر حفظ الشحنة");}
  }
  async function archive(path:string,label:string){
    if(!window.confirm("سيتم إخفاء السجل من القوائم مع الاحتفاظ به في سجل التدقيق. هل تتابع؟"))return;
    try{await api(path,{method:"DELETE"});await loadData();setNotice("تمت أرشفة "+label+".");}
    catch(err){setError(err instanceof Error?err.message:"تعذر تنفيذ العملية");}
  }
  async function saveEntry(e:FormEvent){
    e.preventDefault();setError("");
    try{
      await api(editingId?"/api/financial-entries/"+editingId:"/api/financial-entries",{method:editingId?"PATCH":"POST",body:JSON.stringify({...entryForm,amount:Number(entryForm.amount)})});
      setModal(null);setEditingId(null);await loadData();setNotice("تم حفظ الحركة المالية.");
    }catch(err){setError(err instanceof Error?err.message:"تعذر حفظ الحركة");}
  }
  function startEntryEdit(x:Entry){
    setEditingId(x.id);
    setEntryForm({entryType:x.entry_type,amount:String(x.amount_minor/100),currency:x.currency,direction:x.direction,entryDate:x.entry_date,dueDate:x.due_date||"",description:x.description||"",referenceNo:x.reference_no||"",status:x.status,counterpartyId:x.counterparty_id||"",shipmentId:x.shipment_id||"",paymentMethod:x.payment_method||"",chequeNo:x.cheque_no||"",bankName:x.bank_name||"",paidAt:x.paid_at||"",notes:x.notes||""});
    setModal("entry");
  }
  function startNewInvoice(type:"purchase"|"sale"){
    setEditingId(null);setInvoiceFiles([]);setInvoiceForm({...blankInvoice(),invoiceType:type});setModal("invoice");
  }
  function startInvoiceEdit(i:Invoice){
    const lines=invoiceLines.filter(l=>l.invoice_id===i.id);
    setEditingId(i.id);
    setInvoiceFiles([]);
    setInvoiceForm({
      invoiceNo:i.invoice_no,invoiceType:i.invoice_type,counterpartyId:i.counterparty_id||"",shipmentId:i.shipment_id||"",
      invoiceDate:i.invoice_date,dueDate:i.due_date||"",currency:i.currency,discount:String(i.discount_minor/100),
      tax:String(i.tax_minor/100),status:i.status,notes:i.notes||"",
      lines:lines.length?lines.map(l=>({description:l.description,quantity:String(l.quantity),unit:l.unit,unitPrice:String(l.unit_price_minor/100)})):[{description:"",quantity:"1",unit:"pcs",unitPrice:""}],
      purchaseExtras:purchaseExtras.filter(x=>x.invoice_id===i.id).map(x=>({category:x.category,description:x.description,amount:String(x.amount_minor/100),currency:x.currency,expenseDate:x.expense_date,notes:x.notes||""}))
    });
    setModal("invoice");
  }
  async function saveInvoice(e:FormEvent){
    e.preventDefault();setError("");
    try{
      const payload={...invoiceForm,discount:Number(invoiceForm.discount||0),tax:Number(invoiceForm.tax||0),lines:invoiceForm.lines.map(l=>({...l,quantity:Number(l.quantity),unitPrice:Number(l.unitPrice)})),purchaseExtras:invoiceForm.invoiceType==="purchase"?invoiceForm.purchaseExtras.filter(x=>x.description.trim()&&Number(x.amount)>0).map(x=>({...x,amount:Number(x.amount)})):[]};
      const saved=await api<{ok:boolean;id?:string}>(editingId?"/api/invoices/"+editingId:"/api/invoices",{method:editingId?"PATCH":"POST",body:JSON.stringify(payload)});
      const invoiceId=editingId||saved.id;
      if(!invoiceId)throw new Error("تم حفظ الفاتورة لكن تعذر تحديد رقمها لربط المرفقات.");
      const pendingFiles=[...invoiceFiles];
      const failedFiles:string[]=[];
      if(pendingFiles.length)setUploading(true);
      for(const file of pendingFiles){
        try{await uploadDocument("invoice",invoiceId,file);}
        catch(err){failedFiles.push(file.name+": "+(err instanceof Error?err.message:"تعذر الرفع"));}
      }
      setUploading(false);
      setModal(null);setEditingId(null);setInvoiceForm(blankInvoice());setInvoiceFiles([]);
      await loadData();
      setNotice(failedFiles.length
        ?"تم حفظ الفاتورة، لكن تعذر رفع "+failedFiles.length+" من المرفقات. يمكنك إعادة رفعها من زر «مرفق» بجانب الفاتورة."
        :"تم حفظ الفاتورة وتفاصيل بنودها"+(pendingFiles.length?" ورفع "+pendingFiles.length+" مرفق بنجاح.":"."));
      if(failedFiles.length)setError(failedFiles.join(" · "));
    }catch(err){setUploading(false);setError(err instanceof Error?err.message:"تعذر حفظ الفاتورة");}
  }
  async function saveChinaRemittance(e:FormEvent){
    e.preventDefault();setError("");
    const allocations=chinaPaymentForm.allocations.filter(x=>x.invoiceId&&Number(x.amount)>0).map(x=>({invoiceId:x.invoiceId,amount:Number(x.amount)}));
    if(!allocations.length){setError("اختر فاتورة شراء واحدة على الأقل لتخصيص التحويل لها.");return;}
    try{
      await api("/api/china-remittances",{method:"POST",body:JSON.stringify({...chinaPaymentForm,amount:Number(chinaPaymentForm.amount),allocations})});
      setModal(null);setChinaPaymentForm(blankChinaPayment());await loadData();
      setNotice("تم تسجيل التحويل للصين وتوزيعه على الفواتير. تم تحديث المبالغ المسددة والمتبقية تلقائياً.");
    }catch(err){setError(err instanceof Error?err.message:"تعذر حفظ تحويل الصين");}
  }
  async function downloadBackup(showNotice=true){
    const backup=await api<Record<string,unknown>>("/api/workspace/backup");
    const blob=new Blob([JSON.stringify(backup,null,2)],{type:"application/json"});
    const objectUrl=URL.createObjectURL(blob);
    const anchor=document.createElement("a");
    anchor.href=objectUrl;
    anchor.download="CODELFA-PARTNERS-backup-"+new Date().toISOString().replace(/[:.]/g,"-")+".json";
    document.body.appendChild(anchor);anchor.click();anchor.remove();
    window.setTimeout(()=>URL.revokeObjectURL(objectUrl),1500);
    if(showNotice)setNotice("تم تنزيل نسخة احتياطية من سجلات العمل والمرفقات.");
  }
  async function resetWorkspace(){
    if(!isOwner)return;
    if(!window.confirm("سيتم تصفير سجلات العمل والشحنات والفواتير والدفعات والمرفقات والتعليقات. ستبقى حسابات الدخول والإعدادات وسجل التدقيق. سيتم تنزيل نسخة احتياطية أولاً. هل تريد المتابعة؟"))return;
    const phrase=window.prompt("للتأكيد اكتب العبارة التالية كما هي: RESET CODELFA");
    if(phrase!=="RESET CODELFA"){if(phrase!==null)setError("لم يتم التصفير؛ عبارة التأكيد غير مطابقة.");return;}
    setError("");
    try{
      await downloadBackup(false);
      await api("/api/workspace/reset",{method:"POST",body:JSON.stringify({confirmation:"RESET CODELFA"})});
      await loadData();setSection("overview");
      setNotice("تم تصفير سجلات العمل. احتفظ بملف النسخة الاحتياطية الذي تم تنزيله.");
    }catch(err){setError(err instanceof Error?err.message:"تعذر تصفير مساحة العمل. لم يتم تأكيد العملية.");}
  }
  async function saveParty(e:FormEvent){
    e.preventDefault();setError("");
    try{await api("/api/counterparties",{method:"POST",body:JSON.stringify(partyForm)});setModal(null);setPartyForm({name:"",type:"supplier",phone:"",email:"",notes:""});await loadData();setNotice("تمت إضافة جهة التعامل.");}
    catch(err){setError(err instanceof Error?err.message:"تعذر حفظ جهة التعامل");}
  }
  async function saveBudget(e:FormEvent){
    e.preventDefault();setError("");
    try{await api("/api/shipment-budgets",{method:"POST",body:JSON.stringify({...budgetForm,expected:Number(budgetForm.expected)})});setModal(null);await loadData();setNotice("تم حفظ القيمة التقديرية للشحنة.");}
    catch(err){setError(err instanceof Error?err.message:"تعذر حفظ التقدير");}
  }
  async function savePartner(e:FormEvent){
    e.preventDefault();setError("");
    try{await api("/api/users",{method:"POST",body:JSON.stringify(partnerForm)});setModal(null);setPartnerForm({...partnerForm,password:""});setNotice("تم إنشاء حساب الشريك. أرسل بيانات الدخول له بطريقة آمنة.");}
    catch(err){setError(err instanceof Error?err.message:"تعذر إنشاء حساب الشريك");}
  }
  async function addComment(e:FormEvent){
    e.preventDefault();if(!commentText.trim())return;
    try{await api("/api/comments",{method:"POST",body:JSON.stringify({targetType:commentTarget,body:commentText})});setCommentText("");await loadData();setNotice("تمت إضافة الملاحظة.");}
    catch(err){setError(err instanceof Error?err.message:"تعذر إضافة الملاحظة");}
  }
  async function prepareDocumentFile(file:File):Promise<File>{
    if(file.type==="application/pdf"){
      if(file.size>900000)throw new Error("ملف PDF أكبر من 900 كيلوبايت. يرجى ضغطه قبل الرفع.");
      return file;
    }
    if(!file.type.startsWith("image/"))throw new Error("الملف يجب أن يكون PDF أو صورة.");
    const supported=["image/jpeg","image/png","image/webp"];
    if(supported.includes(file.type)&&file.size<=900000)return file;
    let bitmap:ImageBitmap;
    try{bitmap=await createImageBitmap(file);}catch{throw new Error("تعذر قراءة الصورة. اختر JPG أو PNG أو WEBP، أو التقط صورة جديدة بالكاميرا.");}
    const maxSide=1800,scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement("canvas");
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));
    canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const context=canvas.getContext("2d");
    if(!context){bitmap.close();throw new Error("تعذر تجهيز الصورة للرفع.");}
    context.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
    for(const quality of [0.82,0.74,0.66,0.58,0.5]){
      const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/jpeg",quality));
      if(blob&&blob.size<=900000){
        const baseName=file.name.replace(/\.[^.]+$/,"")||"invoice-photo";
        return new File([blob],baseName+".jpg",{type:"image/jpeg",lastModified:Date.now()});
      }
    }
    throw new Error("تعذر ضغط الصورة إلى أقل من 900 كيلوبايت. التقط صورة بدقة أقل.");
  }
  async function uploadDocument(targetType:"shipment"|"invoice"|"financial_entry",targetId:string,file:File){
    const prepared=await prepareDocumentFile(file);
    const bytes=new Uint8Array(await prepared.arrayBuffer());let binary="";
    for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
    await api("/api/documents",{method:"POST",body:JSON.stringify({targetType,targetId,fileName:prepared.name,contentType:prepared.type,contentBase64:btoa(binary)})});
  }
  async function uploadFile(file:File){
    if(!uploadTarget)return;
    setUploading(true);setError("");
    try{
      await uploadDocument(uploadTarget.type,uploadTarget.id,file);
      await loadData();setUploadTarget(null);setNotice("تم رفع المرفق وربطه بالسجل.");
    }catch(err){setError(err instanceof Error?err.message:"تعذر رفع الملف");}
    finally{setUploading(false);}
  }

  const totals=useMemo(()=>currencies.map(c=>{
    const inc=entries.filter(x=>x.currency===c&&x.direction==="in"&&x.status!=="cancelled").reduce((a,x)=>a+x.amount_minor,0);
    const out=entries.filter(x=>x.currency===c&&x.direction==="out"&&x.status!=="cancelled").reduce((a,x)=>a+x.amount_minor,0);
    const sales=invoices.filter(x=>x.currency===c&&x.invoice_type==="sale"&&x.status!=="cancelled").reduce((a,x)=>a+x.total_minor,0);
    const purchases=invoices.filter(x=>x.currency===c&&x.invoice_type==="purchase"&&x.status!=="cancelled").reduce((a,x)=>a+x.total_minor,0);
    const purchaseAdditions=purchaseExtras.filter(x=>x.currency===c).reduce((a,x)=>a+x.amount_minor,0);
    const costs=entries.filter(x=>x.currency===c&&x.entry_type==="expense"&&x.status!=="cancelled"&&x.purpose!=="china_remittance").reduce((a,x)=>a+x.amount_minor,0);
    return {currency:c,inc,out,sales,purchases,purchaseAdditions,costs,profit:sales-purchases-purchaseAdditions-costs};
  }).filter(x=>x.inc||x.out||x.sales||x.purchases||x.purchaseAdditions||x.costs),[entries,invoices,purchaseExtras]);
  const purchaseTotals=useMemo(()=>currencies.map(currency=>{
    const invoicesTotal=invoices.filter(x=>x.invoice_type==="purchase"&&x.status!=="cancelled"&&x.currency===currency).reduce((n,x)=>n+x.total_minor,0);
    const additions=purchaseExtras.filter(x=>x.currency===currency).reduce((n,x)=>n+x.amount_minor,0);
    return {currency,invoicesTotal,additions,total:invoicesTotal+additions};
  }).filter(x=>x.invoicesTotal||x.additions),[invoices,purchaseExtras]);
  const saleProfitRows=useMemo(()=>invoices.filter(x=>x.invoice_type==="sale"&&x.status!=="cancelled").map(sale=>{
    if(!sale.shipment_id)return {sale,status:"no_shipment" as const,allocatedCost:0,profit:0,margin:0};
    const shipmentPurchases=invoices.filter(x=>x.shipment_id===sale.shipment_id&&x.invoice_type==="purchase"&&x.status!=="cancelled");
    const shipmentExtras=purchaseExtras.filter(x=>x.shipment_id===sale.shipment_id);
    const shipmentExpenses=entries.filter(x=>x.shipment_id===sale.shipment_id&&x.entry_type==="expense"&&x.status!=="cancelled"&&x.purpose!=="china_remittance");
    const foreignCurrency=[...shipmentPurchases.map(x=>x.currency),...shipmentExtras.map(x=>x.currency),...shipmentExpenses.map(x=>x.currency)].some(x=>x!==sale.currency);
    if(foreignCurrency)return {sale,status:"currency_mismatch" as const,allocatedCost:0,profit:0,margin:0};
    if(!shipmentPurchases.length)return {sale,status:"no_purchase" as const,allocatedCost:0,profit:0,margin:0};
    const salesInShipment=invoices.filter(x=>x.shipment_id===sale.shipment_id&&x.invoice_type==="sale"&&x.status!=="cancelled"&&x.currency===sale.currency);
    const totalSales=salesInShipment.reduce((n,x)=>n+x.total_minor,0);
    const totalCost=shipmentPurchases.reduce((n,x)=>n+x.total_minor,0)+shipmentExtras.reduce((n,x)=>n+x.amount_minor,0)+shipmentExpenses.reduce((n,x)=>n+x.amount_minor,0);
    const allocatedCost=totalSales>0?Math.round(totalCost*sale.total_minor/totalSales):0;
    const profit=sale.total_minor-allocatedCost;
    return {sale,status:"calculated" as const,allocatedCost,profit,margin:sale.total_minor>0?profit/sale.total_minor*100:0};
  }),[invoices,purchaseExtras,entries]);
  const saleProfitTotals=useMemo(()=>currencies.map(currency=>{
    const rows=saleProfitRows.filter(x=>x.sale.currency===currency&&x.status==="calculated");
    return {currency,sales:rows.reduce((n,x)=>n+x.sale.total_minor,0),cost:rows.reduce((n,x)=>n+x.allocatedCost,0),profit:rows.reduce((n,x)=>n+x.profit,0),count:rows.length};
  }).filter(x=>x.count),[saleProfitRows]);
  const chinaTotals=useMemo(()=>currencies.map(currency=>{
    const items=chinaRemittances.filter(x=>x.currency===currency);
    const transferred=items.reduce((n,x)=>n+x.amount_minor,0);
    const allocated=items.reduce((n,x)=>n+x.allocated_minor,0);
    return {currency,transferred,allocated,unallocated:transferred-allocated};
  }).filter(x=>x.transferred>0),[chinaRemittances]);
  const activeStatements=useMemo(()=>parties.filter(p=>!statementParty||p.id===statementParty),[parties,statementParty]);
  const statementRows=useMemo(()=>{
    if(!statementParty)return [];
    const inv=invoices.filter(x=>x.counterparty_id===statementParty&&x.status!=="cancelled").map(x=>({id:x.id,date:x.invoice_date,label:(x.invoice_type==="sale"?"فاتورة مبيعات ":"فاتورة مشتريات ")+x.invoice_no,currency:x.currency,debit:x.invoice_type==="sale"?x.total_minor:0,credit:x.invoice_type==="purchase"?x.total_minor:0}));
    const ent=entries.filter(x=>x.counterparty_id===statementParty&&x.status!=="cancelled"&&x.purpose!=="china_remittance").map(x=>({id:x.id,date:x.entry_date,label:x.description||x.entry_type,currency:x.currency,debit:x.direction==="out"?x.amount_minor:0,credit:x.direction==="in"?x.amount_minor:0}));
    const rem=chinaAllocations.filter(a=>invoices.some(i=>i.id===a.invoice_id&&i.counterparty_id===statementParty)).map(a=>({id:a.id,date:a.entry_date,label:"تحويل إلى الصين مقابل فاتورة "+a.invoice_no,currency:a.currency,debit:a.amount_minor,credit:0}));
    return [...inv,...ent,...rem].sort((a,b)=>a.date.localeCompare(b.date));
  },[invoices,entries,chinaAllocations,statementParty]);

  const pageHeader=(eyebrow:string,heading:string,description:string,action?:ReactNode)=><div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{heading}</h1><p>{description}</p></div>{action}</div>;
  const docsFor=(type:string,id:string)=>documents.filter(d=>d.target_type===type&&d.target_id===id);

  if(loading)return <div className="auth-screen"><div className="auth-card"><div className="brand-mark">C✦</div><h2>CODELFA PARTNERS</h2><p>جارٍ الاتصال بمساحة الشراكة…</p></div></div>;
  if(!user)return <div className="auth-screen"><div className="auth-card"><div className="auth-brand"><div className="brand-mark">C✦</div><div><b>CODELFA PARTNERS</b><small>PRIVATE BUSINESS PORTAL</small></div></div><h1>{initialized===false?"إعداد مساحة الشراكة":"مرحباً بعودتك"}</h1><p>{initialized===false?"أنشئ حساب المدير الأول. هذه الخطوة متاحة مرة واحدة فقط.":"سجّل الدخول للوصول إلى بيانات العمل المشتركة."}</p>{error&&<div className="error-banner">{error}</div>}
    {initialized===false?<form onSubmit={setup} className="auth-form"><label>مفتاح الإعداد المؤقت<input required type="password" value={setupKey} onChange={e=>setSetupKey(e.target.value)}/></label><label>اسم المستخدم<input required minLength={3} value={ownerName} onChange={e=>setOwnerName(e.target.value)}/></label><label>الاسم الظاهر<input required value={ownerDisplay} onChange={e=>setOwnerDisplay(e.target.value)}/></label><label>كلمة المرور (12 حرفاً على الأقل)<input required minLength={12} type="password" value={ownerPassword} onChange={e=>setOwnerPassword(e.target.value)}/></label><button className="gold-button auth-submit">إنشاء حساب المدير</button></form>
    :<form onSubmit={signIn} className="auth-form"><label>اسم المستخدم<input autoComplete="username" required value={loginName} onChange={e=>setLoginName(e.target.value)}/></label><label>كلمة المرور<input autoComplete="current-password" required type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)}/></label><button className="gold-button auth-submit">تسجيل الدخول</button></form>}
    <div className="auth-foot">مساحة خاصة للمستخدمين المصرح لهم فقط</div></div></div>;

  return <div className={isAr?"app-shell":"app-shell ltr"} dir={isAr?"rtl":"ltr"}>
    <aside className="sidebar"><div className="brand"><div className="brand-mark">C✦</div><div><div className="brand-name">CODELFA <b>PARTNERS</b></div><div className="brand-sub">PRIVATE BUSINESS PORTAL</div></div></div><div className="workspace"><span className="workspace-dot"/> مساحة الشراكة<small>حساب مشترك وآمن</small></div><div className="nav-caption">إدارة الأعمال</div><nav>{sections.map(item=><button key={item.id} className={section===item.id?"nav-item active":"nav-item"} onClick={()=>setSection(item.id)}><span className="nav-icon">{item.icon}</span><span>{item.label}</span>{section===item.id&&<i/>}</button>)}</nav><div className="sidebar-bottom"><div className="secure"><span>⌑</span><div><b>مساحة خاصة وآمنة</b><small>صلاحيات حسب نوع الحساب</small></div></div><div className="version">CODELFA PARTNERS · 1.2</div></div></aside>
    <main className="main-area"><header className="topbar"><div className="mobile-brand"><div className="brand-mark small">C✦</div><b>CODELFA PARTNERS</b></div><div className="crumb">{labels.home}<span>/</span><b>{title}</b></div><div className="top-actions"><select className="lang-select" value={lang} onChange={e=>setLang(e.target.value as "ar"|"en")}><option value="ar">العربية</option><option value="en">English</option></select><div className="user-chip"><div className="avatar">{user.displayName.slice(0,1)}</div><div><b>{user.displayName}</b><small>{isOwner?"مدير النظام":labels.readOnly}</small></div><button className="chevron" onClick={signOut} title="تسجيل الخروج">↪</button></div></div></header>
    <div className="mobile-nav">{sections.map(item=><button key={item.id} className={section===item.id?"selected":""} onClick={()=>setSection(item.id)}>{item.icon} {item.label}</button>)}</div>
    <div className="content"><div className="welcome-row"><div><div className="eyebrow">PRIVATE PARTNERSHIP WORKSPACE</div><h1>{section==="overview"?"أهلاً، "+user.displayName:title}</h1><p>متابعة العمل التجاري والشحنات والحسابات من مكان واحد.</p></div><div className="date-pill">{new Date().toLocaleDateString(isAr?"ar":"en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div></div>
      {notice&&<div className="preview-notice"><span>✓</span>{notice}<button onClick={()=>setNotice("")}>×</button></div>}{error&&<div className="error-banner">{error}<button onClick={()=>setError("")}>×</button></div>}
      {section==="overview"&&<><div className="hero-card"><div className="hero-copy"><div className="hero-kicker">CODELFA · BUSINESS PARTNERSHIP</div><h2>كل تفاصيل العمل،<br/><em>في مكان واحد.</em></h2><p>بيانات مشتركة، صلاحيات واضحة، ومتابعة منظمة من الشراء حتى التسليم.</p><button onClick={()=>setSection("shipments")} className="gold-button">استعراض الشحنات ←</button></div><div className="hero-art"><img src="/apple-touch-icon.png" alt="CODELFA PARTNERS" /></div></div>
        <div className="workflow-grid">
          <button onClick={()=>setSection("shipments")}><span>01</span><b>الشحنات</b><small>الحاويات والمراحل والمواعيد</small></button>
          <button onClick={()=>setSection("purchases")}><span>02</span><b>المشتريات</b><small>فواتير الموردين وتكلفة البضاعة</small></button>
          <button onClick={()=>setSection("sales")}><span>03</span><b>المبيعات</b><small>فواتير العملاء وقيمة البيع</small></button>
          <button onClick={()=>setSection("china")}><span>04</span><b>دفعات الصين</b><small>الحوالات وتوزيعها على الفواتير</small></button>
        </div>
        <div className="section-heading"><div><h2>الملخص المالي حسب العملة</h2><p>لا يتم خلط العملات أو تحويلها تلقائياً</p></div><button className="text-link" onClick={()=>void loadData()}>{labels.refresh} ↻</button></div>
        <div className="stats-grid"><Stat label="الحاويات النشطة" value={String(shipments.length)} note="شحنات غير مؤرشفة"/><Stat label="الفواتير" value={String(invoices.length)} note="مشتريات ومبيعات"/><Stat label="الحركات المالية" value={String(entries.length)} note="مدفوعات ومصاريف وشيكات"/><Stat label="جهات التعامل" value={String(parties.length)} note="موردون وعملاء"/></div>
        <div className="currency-grid">{totals.length?totals.map(t=><div className="currency-card" key={t.currency}><div className="currency-title">{t.currency}<span>ملخص العملة</span></div><div><small>المبيعات</small><b>{money(t.sales,t.currency)}</b></div><div><small>المشتريات</small><b>{money(t.purchases,t.currency)}</b></div><div><small>المصاريف</small><b>{money(t.costs,t.currency)}</b></div><div className="profit-line"><small>الربح الفعلي</small><b>{money(t.profit,t.currency)}</b></div><div><small>مقبوضات نقدية</small><b>{money(t.inc,t.currency)}</b></div><div><small>مدفوعات نقدية</small><b>{money(t.out,t.currency)}</b></div></div>):<Empty text={labels.empty}/>}</div>
        <div className="two-col"><section className="panel"><div className="panel-head"><div><h3>آخر الشحنات</h3><p>حالة الحاويات المسجلة</p></div><button className="text-link" onClick={()=>setSection("shipments")}>عرض الكل ←</button></div><ShipmentTable rows={shipments.slice(0,5)} compact/></section><section className="panel"><div className="panel-head"><div><h3>آخر الفواتير</h3><p>المشتريات والمبيعات</p></div><button className="text-link" onClick={()=>setSection("invoices")}>عرض الكل ←</button></div><InvoiceTable invoices={invoices.slice(0,5)} parties={parties} compact/></section></div></>}

      {section==="shipments"&&<>{pageHeader("LOGISTICS","الشحنات والحاويات","رقم الحاوية والمرجع والموانئ والمورد والمراحل والمرفقات.",isOwner&&<button className="gold-button compact" onClick={()=>{setEditingId(null);setShipmentForm(blankShipment());setModal("shipment");}}>＋ إضافة شحنة</button>)}<div className="panel full-panel"><ShipmentTable rows={shipments} detailed isOwner={isOwner} onEdit={startShipmentEdit} onArchive={id=>void archive("/api/shipments/"+id,"الشحنة")} onBudget={id=>{setBudgetForm({...budgetForm,shipmentId:id,expected:""});setModal("budget");}} onUpload={id=>setUploadTarget({type:"shipment",id})} documents={documents} photos={shipmentPhotos} onPhotos={openShipmentPhotos}/>{shipments.length===0&&<Empty text={labels.empty}/>}</div></>}

      {section==="purchases"&&<>{pageHeader("PURCHASES","المشتريات وتكلفة الوصول","قيمة فاتورة المورد منفصلة عن إضافات الشحن والتخليص والتحميل والقص.",isOwner&&<button className="gold-button compact" onClick={()=>startNewInvoice("purchase")}>＋ إضافة فاتورة شراء</button>)}<div className="purchase-summary-grid">{purchaseTotals.length?purchaseTotals.map(t=><div className="purchase-summary-card" key={t.currency}><span className="eyebrow">{t.currency}</span><div><small>إجمالي فواتير الشراء</small><b>{money(t.invoicesTotal,t.currency)}</b></div><div><small>إضافات الشراء</small><b>{money(t.additions,t.currency)}</b></div><div className="purchase-summary-total"><small>إجمالي تكلفة الشراء</small><strong>{money(t.total,t.currency)}</strong></div></div>):<div className="panel"><Empty text="أضف فاتورة شراء أو تكلفة إضافية لبدء المتابعة."/></div>}</div><p className="purchase-summary-note">المبالغ تُجمع حسب عملتها. إذا كانت الإضافة بعملة مختلفة عن الفاتورة فستظهر مستقلة، ولا يتم تحويل العملات تلقائياً. إضافات الشراء لا تزيد مديونية المورد ولا تُسدد عبر تحويل الصين.</p><div className="panel full-panel"><div className="panel-head"><div><h3>فواتير الموردين</h3><p>قيمة الفاتورة، المبالغ المسددة للصين، الإضافات، والمتبقي للمورد.</p></div><button className="text-link" onClick={()=>setSection("invoices")}>فتح سجل الفواتير ←</button></div><InvoiceTable invoices={invoices.filter(x=>x.invoice_type==="purchase")} parties={parties} detailed isOwner onEdit={startInvoiceEdit} onArchive={id=>void archive("/api/invoices/"+id,"الفاتورة")} onUpload={id=>setUploadTarget({type:"invoice",id})} documents={documents} lines={invoiceLines} purchaseExtras={purchaseExtras}/>{invoices.filter(x=>x.invoice_type==="purchase").length===0&&<Empty text={labels.empty}/>}</div></>}

      {section==="sales"&&<>{pageHeader("SALES & PROFIT","المبيعات وتحليل الأرباح","قيمة كل فاتورة بيع، حصة تكلفة البضاعة والإضافات، والربح التقديري بصورة تلقائية.",isOwner&&<button className="gold-button compact" onClick={()=>startNewInvoice("sale")}>＋ إضافة فاتورة مبيعات</button>)}<div className="sales-summary-grid">{saleProfitTotals.length?saleProfitTotals.map(t=><div className="sales-summary-card" key={t.currency}><span className="eyebrow">{t.currency} · ملخص المبيعات</span><div className="sales-summary-values"><div><small>إجمالي البيع المحسوب</small><strong>{money(t.sales,t.currency)}</strong></div><div><small>تكلفة البضاعة المخصصة</small><strong>{money(t.cost,t.currency)}</strong></div></div><div className="sales-profit-highlight"><small>الربح التقديري</small><strong>{money(t.profit,t.currency)}</strong><span>{t.sales>0?(t.profit/t.sales*100).toFixed(1):"0.0"}% هامش ربح</span></div><small className="sales-count">{t.count} فاتورة داخلة في الحساب</small></div>):<div className="panel"><Empty text="لا توجد فواتير بيع مرتبطة بشحنات ومشتريات يمكن حساب ربحها بعد."/></div>}</div><div className="profit-method-note"><b>طريقة الاحتساب:</b> تُجمع مشتريات الشحنة وإضافاتها ومصاريفها بالعملة نفسها، ثم توزّع التكلفة على فواتير البيع المرتبطة بالشحنة بنسبة قيمة كل فاتورة من إجمالي مبيعات الشحنة. هذا ربح تقديري تشغيلي، وليس ربحاً محاسبياً نهائياً لتكلفة البضاعة المباعة.</div><div className="panel full-panel sales-table-panel"><div className="panel-head"><div><h3>ربحية فواتير المبيعات</h3><p>الأرقام محسوبة تلقائياً من الفواتير والتكاليف المرتبطة بالشحنة.</p></div><button className="text-link" onClick={()=>setSection("reports")}>عرض التقرير العام ←</button></div><div className="table-wrap"><table><thead><tr><th>التاريخ</th><th>فاتورة البيع</th><th>العميل</th><th>الشحنة</th><th>قيمة البيع</th><th>حصة التكلفة</th><th>الربح التقديري</th><th>الهامش</th><th>حالة الحساب</th></tr></thead><tbody>{saleProfitRows.map(row=><tr key={row.sale.id}><td>{dateLabel(row.sale.invoice_date)}</td><td className="mono">{row.sale.invoice_no}</td><td>{row.sale.counterparty_name||"—"}</td><td className="mono">{row.sale.container_no||"—"}</td><td className="mono">{money(row.sale.total_minor,row.sale.currency)}</td><td className="mono">{row.status==="calculated"?money(row.allocatedCost,row.sale.currency):"—"}</td><td className="mono">{row.status==="calculated"?money(row.profit,row.sale.currency):"—"}</td><td>{row.status==="calculated"?row.margin.toFixed(1)+"%":"—"}</td><td>{row.status==="calculated"?<span className="pill positive">محسوب تقديرياً</span>:row.status==="no_shipment"?"اربط الفاتورة بشحنة":row.status==="no_purchase"?"لا توجد فاتورة شراء مرتبطة":"اختلاف عملة؛ يلزم تحويل التكلفة"}</td></tr>)}</tbody></table></div>{saleProfitRows.length===0&&<Empty text="لا توجد فواتير مبيعات حتى الآن."/>}</div></>}

      {section==="invoices"&&<>{pageHeader("INVOICE REGISTER","سجل الفواتير","سجل مركزي لجميع فواتير الشراء والبيع، بينما لكل نوع صفحة مستقلة في القائمة.",isOwner&&<div className="action-group"><button className="gold-button compact" onClick={()=>startNewInvoice("purchase")}>＋ فاتورة شراء</button><button className="gold-button compact" onClick={()=>startNewInvoice("sale")}>＋ فاتورة مبيعات</button></div>)}<div className="panel full-panel"><InvoiceTable invoices={invoices} parties={parties} detailed isOwner onEdit={startInvoiceEdit} onArchive={id=>void archive("/api/invoices/"+id,"الفاتورة")} onUpload={id=>setUploadTarget({type:"invoice",id})} documents={documents} lines={invoiceLines}/>{invoices.length===0&&<Empty text={labels.empty}/>}</div></>}

      {section==="china"&&<>{pageHeader("CHINA REMITTANCES","دفعات وتحويلات الصين","سجّل الحوالة مرة واحدة، ثم وزّع قيمتها على فاتورة أو أكثر. يتحدث المسدد والمتبقي وكشف المورد تلقائياً.",isOwner&&<button className="gold-button compact" onClick={()=>{setChinaPaymentForm(blankChinaPayment());setModal("chinaPayment");}}>＋ تسجيل تحويل للصين</button>)}<div className="currency-grid">{chinaTotals.length?chinaTotals.map(t=><div className="currency-card" key={t.currency}><div className="currency-title">{t.currency}<span>ملخص التحويلات</span></div><div><small>إجمالي المحوّل</small><b>{money(t.transferred,t.currency)}</b></div><div><small>موزّع على الفواتير</small><b>{money(t.allocated,t.currency)}</b></div><div className="profit-line"><small>غير موزّع</small><b>{money(t.unallocated,t.currency)}</b></div></div>):<Empty text="لم تُسجّل تحويلات للصين بعد."/>}</div><div className="panel full-panel"><div className="panel-head"><div><h3>سجل الحوالات</h3><p>كل حوالة تظهر مرة واحدة مهما تعددت الفواتير المرتبطة بها.</p></div></div><div className="table-wrap"><table><thead><tr><th>التاريخ</th><th>المرجع</th><th>المبلغ المحوّل</th><th>الموزّع</th><th>غير الموزّع</th><th>الفواتير التي سُدّدت</th>{isOwner&&<th>إدارة</th>}</tr></thead><tbody>{chinaRemittances.map(x=><tr key={x.id}><td>{dateLabel(x.entry_date)}</td><td className="mono">{x.reference_no||"—"}</td><td className="mono">{money(x.amount_minor,x.currency)}</td><td className="mono">{money(x.allocated_minor,x.currency)}</td><td className="mono">{money(x.amount_minor-x.allocated_minor,x.currency)}</td><td>{chinaAllocations.filter(a=>a.financial_entry_id===x.id).length?chinaAllocations.filter(a=>a.financial_entry_id===x.id).map(a=><div key={a.id}>{a.invoice_no} · {money(a.amount_minor,a.currency)}<small className="row-id">{a.supplier_name||"مورد"} · {a.container_no||"بدون حاوية"}</small></div>):"—"}</td>{isOwner&&<td><button className="danger-text" onClick={()=>void archive("/api/financial-entries/"+x.id,"تحويل الصين")}>أرشفة التحويل</button></td>}</tr>)}</tbody></table></div>{chinaRemittances.length===0&&<Empty text="أضف أول تحويل للصين من الزر أعلى الصفحة."/>}</div></>}

      {section==="finance"&&<>{pageHeader("CASH & PAYMENTS","الدفعات والشيكات والمصاريف","سجّل هنا المقبوضات والمدفوعات والمصاريف والشيكات فقط. فواتير الشراء والبيع وتحويلات الصين لها صفحات مستقلة حتى لا تتكرر الأرقام.",isOwner&&<button className="gold-button compact" onClick={()=>{setEditingId(null);setEntryForm(blankEntry());setModal("entry");}}>＋ تسجيل حركة</button>)}<div className="panel full-panel"><div className="table-wrap"><table><thead><tr><th>التاريخ</th><th>النوع</th><th>الطرف</th><th>الحاوية</th><th>البيان</th><th>الاتجاه</th><th>المبلغ</th><th>الحالة</th>{isOwner&&<th>إدارة</th>}</tr></thead><tbody>{entries.filter(x=>x.purpose!=="china_remittance").map(x=><tr key={x.id}><td>{dateLabel(x.entry_date)}</td><td>{entryTypes.find(t=>t[0]===x.entry_type)?.[1]||x.entry_type}</td><td>{x.counterparty_name||"—"}</td><td className="mono">{x.container_no||"—"}</td><td>{x.description||x.reference_no||"—"}{x.cheque_no&&<small className="row-id">شيك {x.cheque_no} · {x.bank_name||""}</small>}</td><td><span className={x.direction==="in"?"pill positive":"pill neutral"}>{x.direction==="in"?"داخل":"خارج"}</span></td><td className="mono">{money(x.amount_minor,x.currency)}</td><td>{x.status}</td>{isOwner&&<td><div className="row-actions"><button onClick={()=>startEntryEdit(x)}>تعديل</button><button className="danger-text" onClick={()=>void archive("/api/financial-entries/"+x.id,"الحركة")}>أرشفة</button><button onClick={()=>setUploadTarget({type:"financial_entry",id:x.id})}>مرفق</button></div></td>}</tr>)}</tbody></table></div>{entries.filter(x=>x.purpose!=="china_remittance").length===0&&<Empty text={labels.empty}/>}</div></>}

      {section==="parties"&&<>{pageHeader("CONTACTS","الموردون والعملاء","سجل الجهات وبيانات الاتصال لمتابعة المشتريات والمبيعات والأرصدة.",isOwner&&<button className="gold-button compact" onClick={()=>setModal("party")}>＋ إضافة جهة</button>)}<div className="cards-grid">{parties.map(p=><div className="panel party-card" key={p.id}><div className="party-top"><span className="avatar">{p.name.slice(0,1)}</span><div><b>{p.name}</b><small>{p.counterparty_type==="supplier"?"مورد":p.counterparty_type==="customer"?"عميل":"جهة أخرى"}</small></div></div><p>{p.phone||"لا يوجد هاتف"}<br/>{p.email||"لا يوجد بريد"}</p><button className="text-link" onClick={()=>{setStatementParty(p.id);setSection("statements");}}>كشف الحساب ←</button></div>)}</div>{parties.length===0&&<Empty text={labels.empty}/>}</>}

      {section==="statements"&&<>{pageHeader("ACCOUNT STATEMENTS","كشوف حسابات العملاء والموردين","حركة الفواتير والمدفوعات حسب الطرف والعملة.")}<div className="panel full-panel"><div className="filter-row"><label>اختر العميل أو المورد<select value={statementParty} onChange={e=>setStatementParty(e.target.value)}><option value="">اختر جهة التعامل</option>{parties.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label></div>{statementParty?<><div className="table-wrap"><table><thead><tr><th>التاريخ</th><th>البيان</th><th>العملة</th><th>مدين</th><th>دائن</th><th>الرصيد</th></tr></thead><tbody>{statementRows.map((r,i)=>{const prev=statementRows.slice(0,i+1).filter(x=>x.currency===r.currency);const debit=prev.reduce((a,x)=>a+x.debit,0),credit=prev.reduce((a,x)=>a+x.credit,0);return <tr key={r.id}><td>{dateLabel(r.date)}</td><td>{r.label}</td><td>{r.currency}</td><td>{r.debit?money(r.debit,r.currency):"—"}</td><td>{r.credit?money(r.credit,r.currency):"—"}</td><td className="mono">{money(debit-credit,r.currency)}</td></tr>})}</tbody></table></div>{statementRows.length===0&&<Empty text="لا توجد حركات لهذا الطرف."/>}</>:<Empty text="اختر جهة التعامل لعرض كشف الحساب."/>}</div></>}

      {section==="reports"&&<>{pageHeader("MANAGEMENT REPORTS","الأرباح والتقارير","المبيعات ناقص المشتريات والمصاريف، مع مقارنة التقديري والفعلي لكل حاوية.")}<div className="currency-grid">{totals.map(t=><div className="currency-card" key={t.currency}><div className="currency-title">{t.currency}<span>الربح حسب العملة</span></div><div><small>المبيعات الفعلية</small><b>{money(t.sales,t.currency)}</b></div><div><small>المشتريات الفعلية</small><b>{money(t.purchases,t.currency)}</b></div><div><small>المصاريف الفعلية</small><b>{money(t.costs,t.currency)}</b></div><div className="profit-line"><small>صافي الربح الفعلي</small><b>{money(t.profit,t.currency)}</b></div></div>)}</div><div className="panel full-panel"><div className="panel-head"><div><h3>ربحية الشحنات</h3><p>التقديري مقابل الفعلي، دون تحويل بين العملات</p></div></div><div className="table-wrap"><table><thead><tr><th>الحاوية</th><th>العملة</th><th>مبيعات متوقعة</th><th>تكلفة متوقعة</th><th>مبيعات فعلية</th><th>تكاليف فعلية</th><th>الربح الفعلي</th></tr></thead><tbody>{shipments.flatMap(s=>currencies.map(c=>{const b=budgets.filter(x=>x.shipment_id===s.id&&x.currency===c);const expectedSale=b.filter(x=>x.budget_type==="sale").reduce((a,x)=>a+x.expected_minor,0);const expectedCost=b.filter(x=>x.budget_type!=="sale").reduce((a,x)=>a+x.expected_minor,0);const actualSale=invoices.filter(x=>x.shipment_id===s.id&&x.currency===c&&x.invoice_type==="sale"&&x.status!=="cancelled").reduce((a,x)=>a+x.total_minor,0);const actualPurchase=invoices.filter(x=>x.shipment_id===s.id&&x.currency===c&&x.invoice_type==="purchase"&&x.status!=="cancelled").reduce((a,x)=>a+x.total_minor,0);const actualExpense=entries.filter(x=>x.shipment_id===s.id&&x.currency===c&&x.entry_type==="expense"&&x.status!=="cancelled").reduce((a,x)=>a+x.amount_minor,0);const cost=actualPurchase+actualExpense;if(!b.length&&!actualSale&&!cost)return null;return <tr key={s.id+c}><td className="mono">{s.container_no||s.reference_no}</td><td>{c}</td><td>{money(expectedSale,c)}</td><td>{money(expectedCost,c)}</td><td>{money(actualSale,c)}</td><td>{money(cost,c)}</td><td className="mono">{money(actualSale-cost,c)}</td></tr>})).filter(Boolean)}</tbody></table></div>{!budgets.length&&!invoices.length&&<Empty text="أضف فواتير واربطها بالحاويات، ثم أدخل التكاليف التقديرية من صفحة الشحنات."/>}</div></>}

      {section==="notes"&&<>{pageHeader("PARTNER NOTES","الملاحظات والتعليقات","مساحة مشتركة للتوضيح والمتابعة بين المدير والشريك.")}<section className="panel full-panel"><form className="comment-compose" onSubmit={addComment}><textarea required value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="اكتب ملاحظة أو تعليقاً للشريك…"/><select value={commentTarget} onChange={e=>setCommentTarget(e.target.value)}><option value="general">ملاحظة عامة</option><option value="shipment">شحنة</option><option value="financial_entry">حركة مالية</option></select><button className="gold-button compact">إضافة التعليق</button></form><div className="activity-list">{comments.map(c=><div className="activity" key={c.id}><div className="activity-icon">✎</div><div><b>{c.body}</b><small>{c.author} · {new Date(c.created_at).toLocaleString("en-GB")}</small></div></div>)}</div>{comments.length===0&&<Empty text={labels.empty}/>}</section></>}

      {section==="team"&&isOwner&&<>{pageHeader("WORKSPACE ADMIN","إدارة مساحة العمل وحساب الشريك","إعدادات الشراكة، صلاحيات الدخول، والنسخ الاحتياطي والتصفير الآمن.",<button className="gold-button compact" onClick={()=>setModal("partner")}>＋ إنشاء حساب الشريك</button>)}<div className="panel permission-panel"><h3>صلاحيات الشريك</h3><div className="permission-grid"><span>مشاهدة الشحنات والفواتير</span><span>مشاهدة الحسابات والتقارير</span><span>رفع التعليقات</span><b>لا تعديل مالي · لا حذف · لا إدارة مستخدمين</b></div></div><div className="panel reset-panel"><div><span className="eyebrow">SAFE WORKSPACE RESET</span><h3>البدء من جديد</h3><p>ينزّل التطبيق نسخة احتياطية من البيانات والمرفقات أولاً، ثم يمسح سجلات العمل فقط. تبقى حسابات المدير والشريك وكلمات المرور والإعدادات وسجل التدقيق كما هي.</p></div><div className="reset-actions"><button className="plain-button" onClick={()=>void downloadBackup()}>تنزيل نسخة احتياطية</button><button className="danger-button" onClick={()=>void resetWorkspace()}>تصفير بيانات العمل</button></div><small>يتطلب تأكيداً بعبارة RESET CODELFA. لا يمكن التراجع بعد إتمام التصفير؛ احتفظ بنسخة JSON التي يتم تنزيلها.</small></div></>}
    </div><footer>© 2026 CODELFA PARTNERS <span>TRUST · CLARITY · PARTNERSHIP</span></footer></main>

    {modal==="shipmentPhotos"&&activePhotoShipment&&<Modal title="صور الحاوية بعد التحميل" close={()=>setModal(null)} wide><form className="modal-form" onSubmit={saveShipmentPhotos}><div className="photo-shipment-heading"><div><span className="eyebrow">CONTAINER LOADING GALLERY</span><h3 className="mono">{activePhotoShipment.container_no||activePhotoShipment.reference_no||"الحاوية"}</h3><p>{activePhotoShipment.supplier_name||"المورد غير محدد"} · {[activePhotoShipment.origin,activePhotoShipment.destination].filter(Boolean).join(" → ")}</p></div><span className="pill positive">صور مرتبطة بالحاوية</span></div><div className="form-grid"><label>تاريخ التصوير<input required type="date" value={photoDate} onChange={e=>setPhotoDate(e.target.value)}/></label><label>ملاحظة على الصور<input value={photoCaption} onChange={e=>setPhotoCaption(e.target.value)} placeholder="مثلاً: ترتيب الألواح بعد التحميل"/></label></div><div className="photo-upload-box"><b>إضافة صور جديدة</b><p className="hint">اختر عدة صور من الجهاز أو التقط صورة مباشرة. تُضغط الصور الكبيرة تلقائياً لتناسب التخزين.</p><div className="form-grid"><label>اختيار صور من الجهاز<input type="file" accept="image/*" multiple disabled={uploadingPhotos} onChange={e=>{const picked=Array.from(e.target.files||[]);if(picked.length)setPhotoFiles(current=>[...current,...picked]);e.currentTarget.value="";}}/></label><label>التقاط صورة بالكاميرا<input type="file" accept="image/*" capture="environment" disabled={uploadingPhotos} onChange={e=>{const picked=e.target.files?.[0];if(picked)setPhotoFiles(current=>[...current,picked]);e.currentTarget.value="";}}/></label></div>{photoFiles.length>0&&<div className="selected-files"><b>صور بانتظار الحفظ ({photoFiles.length})</b>{photoFiles.map((file,index)=><div className="selected-file" key={index}><span>{file.name} · {(file.size/1024).toFixed(0)} KB</span><button type="button" className="danger-text" disabled={uploadingPhotos} onClick={()=>setPhotoFiles(current=>current.filter((_,i)=>i!==index))}>إزالة</button></div>)}</div>}</div><div className="shipment-photo-gallery"><div className="panel-head"><div><h3>معرض صور التحميل</h3><p>{shipmentPhotos.filter(x=>x.shipment_id===activePhotoShipment.id).length} صورة محفوظة لهذه الحاوية</p></div></div>{shipmentPhotos.filter(x=>x.shipment_id===activePhotoShipment.id).length? <div className="shipment-photo-grid">{shipmentPhotos.filter(x=>x.shipment_id===activePhotoShipment.id).map(photo=><div className="shipment-photo-card" key={photo.id}><a href={"/api/shipment-loading-photos/"+photo.id} target="_blank" rel="noreferrer"><img src={"/api/shipment-loading-photos/"+photo.id} alt={photo.caption||photo.file_name}/></a><div><b>{photo.caption||photo.file_name}</b><small>{dateLabel(photo.photo_date)} · {(photo.byte_size/1024).toFixed(0)} KB</small>{isOwner&&<button type="button" className="danger-text" onClick={()=>void deleteShipmentPhoto(photo)}>حذف الصورة</button>}</div></div>)}</div>:<Empty text="لم تتم إضافة صور لهذه الحاوية بعد."/>}</div><div className="modal-actions"><button type="button" className="plain-button" onClick={()=>setModal(null)}>إغلاق</button><button className="gold-button compact" disabled={uploadingPhotos||photoFiles.length===0}>{uploadingPhotos?"جارٍ رفع الصور…":"حفظ صور التحميل ("+photoFiles.length+")"}</button></div></form></Modal>}
    {modal==="shipment"&&<Modal title={editingId?"تعديل بيانات الشحنة":"إضافة شحنة جديدة"} close={()=>setModal(null)}><form className="modal-form" onSubmit={saveShipment}><div className="form-grid"><label>رقم الحاوية<input value={shipmentForm.containerNo} onChange={e=>setShipmentForm({...shipmentForm,containerNo:e.target.value})}/></label><label>الرقم المرجعي<input value={shipmentForm.referenceNo} onChange={e=>setShipmentForm({...shipmentForm,referenceNo:e.target.value})}/></label></div><label>المورد / المصنع<input value={shipmentForm.supplierName} onChange={e=>setShipmentForm({...shipmentForm,supplierName:e.target.value})}/></label><div className="form-grid"><label>ميناء الشحن<input value={shipmentForm.origin} onChange={e=>setShipmentForm({...shipmentForm,origin:e.target.value})}/></label><label>ميناء الوصول<input value={shipmentForm.destination} onChange={e=>setShipmentForm({...shipmentForm,destination:e.target.value})}/></label></div><label>مرحلة الشحن<select value={shipmentForm.status} onChange={e=>setShipmentForm({...shipmentForm,status:e.target.value})}>{shipmentStatuses.map(s=><option value={s[0]} key={s[0]}>{s[1]}</option>)}</select></label><div className="form-grid"><label>تاريخ الشراء<input type="date" value={shipmentForm.purchaseDate} onChange={e=>setShipmentForm({...shipmentForm,purchaseDate:e.target.value})}/></label><label>موعد المغادرة ETD<input type="date" value={shipmentForm.etd} onChange={e=>setShipmentForm({...shipmentForm,etd:e.target.value})}/></label><label>موعد الوصول ETA<input type="date" value={shipmentForm.eta} onChange={e=>setShipmentForm({...shipmentForm,eta:e.target.value})}/></label><label>رقم بوليصة الشحن<input value={shipmentForm.billOfLadingNo} onChange={e=>setShipmentForm({...shipmentForm,billOfLadingNo:e.target.value})}/></label></div><label>ملاحظات<textarea value={shipmentForm.notes} onChange={e=>setShipmentForm({...shipmentForm,notes:e.target.value})}/></label><ModalActions close={()=>setModal(null)} submit={editingId?"حفظ التعديلات":"حفظ الشحنة"}/></form></Modal>}
    {modal==="invoice"&&<Modal title={editingId?"تعديل فاتورة":"إنشاء فاتورة شراء / مبيعات"} close={()=>setModal(null)} wide><form className="modal-form" onSubmit={saveInvoice}><div className="form-grid"><label>نوع الفاتورة<select disabled={!editingId&&(section==="purchases"||section==="sales")} value={invoiceForm.invoiceType} onChange={e=>setInvoiceForm({...invoiceForm,invoiceType:e.target.value as "sale"|"purchase"})}><option value="sale">مبيعات</option><option value="purchase">مشتريات</option></select></label><label>رقم الفاتورة<input required value={invoiceForm.invoiceNo} onChange={e=>setInvoiceForm({...invoiceForm,invoiceNo:e.target.value})}/></label><label>العميل / المورد<select required value={invoiceForm.counterpartyId} onChange={e=>setInvoiceForm({...invoiceForm,counterpartyId:e.target.value})}><option value="">غير محدد</option>{parties.filter(p=>p.counterparty_type===(invoiceForm.invoiceType==="purchase"?"supplier":"customer")).map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label><label>ربط بالحاوية<select value={invoiceForm.shipmentId} onChange={e=>setInvoiceForm({...invoiceForm,shipmentId:e.target.value})}><option value="">بدون ربط</option>{shipments.map(s=><option value={s.id} key={s.id}>{s.container_no||s.reference_no}</option>)}</select></label><label>تاريخ الفاتورة<input type="date" required value={invoiceForm.invoiceDate} onChange={e=>setInvoiceForm({...invoiceForm,invoiceDate:e.target.value})}/></label><label>تاريخ الاستحقاق<input type="date" value={invoiceForm.dueDate} onChange={e=>setInvoiceForm({...invoiceForm,dueDate:e.target.value})}/></label><label>العملة<select value={invoiceForm.currency} onChange={e=>setInvoiceForm({...invoiceForm,currency:e.target.value})}>{currencies.map(c=><option key={c}>{c}</option>)}</select></label><label>الحالة<select value={invoiceForm.status} onChange={e=>setInvoiceForm({...invoiceForm,status:e.target.value})}><option value="issued">صادرة</option><option value="draft">مسودة</option><option value="partially_paid">مدفوعة جزئياً</option><option value="paid">مدفوعة</option></select></label></div><div className="line-items"><div className="panel-head"><div><h3>بنود الفاتورة</h3><p>أضف الأصناف والكميات والوحدات وسعر الوحدة</p></div><button type="button" className="plain-button" onClick={()=>setInvoiceForm({...invoiceForm,lines:[...invoiceForm.lines,{description:"",quantity:"1",unit:"pcs",unitPrice:""}]})}>＋ بند</button></div>{invoiceForm.lines.map((l,i)=><div className="invoice-line" key={i}><label>الوصف / الصنف<input required value={l.description} onChange={e=>setInvoiceForm({...invoiceForm,lines:invoiceForm.lines.map((x,j)=>j===i?{...x,description:e.target.value}:x)})}/></label><label>الكمية<input required type="number" min="0.001" step="0.001" value={l.quantity} onChange={e=>setInvoiceForm({...invoiceForm,lines:invoiceForm.lines.map((x,j)=>j===i?{...x,quantity:e.target.value}:x)})}/></label><label>الوحدة<input value={l.unit} onChange={e=>setInvoiceForm({...invoiceForm,lines:invoiceForm.lines.map((x,j)=>j===i?{...x,unit:e.target.value}:x)})}/></label><label>سعر الوحدة<input required type="number" min="0" step="0.01" value={l.unitPrice} onChange={e=>setInvoiceForm({...invoiceForm,lines:invoiceForm.lines.map((x,j)=>j===i?{...x,unitPrice:e.target.value}:x)})}/></label>{invoiceForm.lines.length>1&&<button type="button" className="danger-text" onClick={()=>setInvoiceForm({...invoiceForm,lines:invoiceForm.lines.filter((_,j)=>j!==i)})}>حذف</button>}</div>)}</div>{invoiceForm.invoiceType==="purchase"&&<section className="purchase-extras"><div className="panel-head"><div><h3>إضافات الشراء وتكلفة الوصول</h3><p>سجّل الشحن والتخليص والتحميل والقص وغيرها بشكل منفصل عن فاتورة المورد. لا تُضاف هذه المبالغ إلى رصيد الصين أو دفعاتها.</p></div><button type="button" className="plain-button" onClick={()=>setInvoiceForm({...invoiceForm,purchaseExtras:[...invoiceForm.purchaseExtras,blankPurchaseExtra(invoiceForm.currency)]})}>＋ إضافة تكلفة</button></div>{invoiceForm.purchaseExtras.length===0?<div className="empty-row">لا توجد إضافات مسجلة لهذه الفاتورة.</div>:invoiceForm.purchaseExtras.map((x,index)=><div className="purchase-extra-row" key={index}><label>نوع الإضافة<select value={x.category} onChange={e=>setInvoiceForm({...invoiceForm,purchaseExtras:invoiceForm.purchaseExtras.map((v,j)=>j===index?{...v,category:e.target.value}:v)})}>{purchaseExtraCategories.map(v=><option key={v[0]} value={v[0]}>{v[1]}</option>)}</select></label><label>البيان<input required value={x.description} placeholder="مثلاً: شحن الحاوية أو تخليص جمركي" onChange={e=>setInvoiceForm({...invoiceForm,purchaseExtras:invoiceForm.purchaseExtras.map((v,j)=>j===index?{...v,description:e.target.value}:v)})}/></label><label>المبلغ<input required type="number" min="0.01" step="0.01" value={x.amount} onChange={e=>setInvoiceForm({...invoiceForm,purchaseExtras:invoiceForm.purchaseExtras.map((v,j)=>j===index?{...v,amount:e.target.value}:v)})}/></label><label>العملة<select value={x.currency} onChange={e=>setInvoiceForm({...invoiceForm,purchaseExtras:invoiceForm.purchaseExtras.map((v,j)=>j===index?{...v,currency:e.target.value}:v)})}>{currencies.map(v=><option key={v}>{v}</option>)}</select></label><label>تاريخ التكلفة<input type="date" value={x.expenseDate} onChange={e=>setInvoiceForm({...invoiceForm,purchaseExtras:invoiceForm.purchaseExtras.map((v,j)=>j===index?{...v,expenseDate:e.target.value}:v)})}/></label><button type="button" className="danger-text" onClick={()=>setInvoiceForm({...invoiceForm,purchaseExtras:invoiceForm.purchaseExtras.filter((_,j)=>j!==index)})}>إزالة الإضافة</button></div>)}<div className="purchase-extra-note">تُجمع الإضافات حسب عملتها بشكل مستقل؛ لا يجري تحويل تلقائي بين USD وCNY وILS وTRY.</div></section>}<div className="form-grid"><label>خصم<input type="number" min="0" step="0.01" value={invoiceForm.discount} onChange={e=>setInvoiceForm({...invoiceForm,discount:e.target.value})}/></label><label>ضريبة / رسوم<input type="number" min="0" step="0.01" value={invoiceForm.tax} onChange={e=>setInvoiceForm({...invoiceForm,tax:e.target.value})}/></label></div><label>ملاحظات<input value={invoiceForm.notes} onChange={e=>setInvoiceForm({...invoiceForm,notes:e.target.value})}/></label><section className="invoice-attachments"><div><b>مرفقات الفاتورة</b><p className="hint">يمكنك إرفاق PDF أو صور متعددة، أو تصوير الفاتورة مباشرة بكاميرا الآيفون. الصور الكبيرة تُضغط تلقائياً.</p></div><div className="form-grid"><label>اختيار PDF أو صورة من الجهاز<input type="file" accept="application/pdf,image/*" multiple disabled={uploading} onChange={e=>{const picked=Array.from(e.target.files||[]);if(picked.length)setInvoiceFiles(current=>[...current,...picked]);e.currentTarget.value="";}}/></label><label>التقاط صورة بالكاميرا<input type="file" accept="image/*" capture="environment" disabled={uploading} onChange={e=>{const picked=e.target.files?.[0];if(picked)setInvoiceFiles(current=>[...current,picked]);e.currentTarget.value="";}}/></label></div>{invoiceFiles.length>0&&<div className="selected-files"><b>مرفقات بانتظار الحفظ ({invoiceFiles.length})</b>{invoiceFiles.map((file,index)=><div className="selected-file" key={index}><span>{file.name} · {(file.size/1024).toFixed(0)} KB</span><button type="button" className="danger-text" disabled={uploading} onClick={()=>setInvoiceFiles(current=>current.filter((_,i)=>i!==index))}>إزالة</button></div>)}</div>}{editingId&&docsFor("invoice",editingId).length>0&&<div className="selected-files"><b>المرفقات المحفوظة</b>{docsFor("invoice",editingId).map(doc=><a className="document-link" key={doc.id} href={"/api/documents/"+doc.id} target="_blank" rel="noreferrer">{doc.file_name} · {(doc.byte_size/1024).toFixed(0)} KB</a>)}</div>}</section><div className="modal-actions"><button type="button" className="plain-button" onClick={()=>setModal(null)}>إلغاء</button><button className="gold-button compact" disabled={uploading}>{uploading?"جارٍ حفظ الفاتورة والمرفقات…":"حفظ الفاتورة"}</button></div></form></Modal>}
    {modal==="chinaPayment"&&<Modal title="تسجيل تحويل إلى الصين" close={()=>setModal(null)} wide><form className="modal-form" onSubmit={saveChinaRemittance}><div className="panel-head"><div><h3>بيانات الحوالة</h3><p>أدخل المبلغ الذي خرج فعلياً من حساب الشركة، ثم وزّعه على فواتير الشراء.</p></div></div><div className="form-grid"><label>إجمالي المبلغ المحوّل<input required type="number" min="0.01" step="0.01" value={chinaPaymentForm.amount} onChange={e=>setChinaPaymentForm({...chinaPaymentForm,amount:e.target.value})}/></label><label>العملة<select value={chinaPaymentForm.currency} onChange={e=>setChinaPaymentForm({...chinaPaymentForm,currency:e.target.value,allocations:chinaPaymentForm.allocations.map(a=>({invoiceId:"",amount:""}))})}>{currencies.map(x=><option key={x}>{x}</option>)}</select></label><label>تاريخ التحويل<input required type="date" value={chinaPaymentForm.entryDate} onChange={e=>setChinaPaymentForm({...chinaPaymentForm,entryDate:e.target.value})}/></label><label>رقم الحوالة / المرجع<input value={chinaPaymentForm.referenceNo} onChange={e=>setChinaPaymentForm({...chinaPaymentForm,referenceNo:e.target.value})}/></label></div><div className="line-items"><div className="panel-head"><div><h3>توزيع الحوالة على فواتير الشراء</h3><p>يمكن ربط حوالة واحدة بعدة فواتير. يجب أن تكون العملة نفسها، ومجموع التوزيع يجب أن يساوي الحوالة بالكامل.</p></div><button type="button" className="plain-button" onClick={()=>setChinaPaymentForm({...chinaPaymentForm,allocations:[...chinaPaymentForm.allocations,{invoiceId:"",amount:""}]})}>＋ فاتورة أخرى</button></div>{chinaPaymentForm.allocations.map((a,index)=><div className="invoice-line" key={index}><label>فاتورة الشراء<select required value={a.invoiceId} onChange={e=>{const inv=invoices.find(i=>i.id===e.target.value);const remaining=inv?Math.max(inv.total_minor-(inv.paid_minor||0),0):0;setChinaPaymentForm({...chinaPaymentForm,allocations:chinaPaymentForm.allocations.map((x,j)=>j===index?{invoiceId:e.target.value,amount:remaining?String(remaining/100):""}:x)});}}><option value="">اختر فاتورة غير مسددة</option>{invoices.filter(i=>i.invoice_type==="purchase"&&i.status!=="cancelled"&&i.currency===chinaPaymentForm.currency&&i.total_minor>(i.paid_minor||0)).map(i=><option key={i.id} value={i.id}>{i.invoice_no} · {i.counterparty_name||"مورد"} · متبقي {money(Math.max(i.total_minor-(i.paid_minor||0),0),i.currency)}</option>)}</select></label><label>المبلغ المخصص<input required type="number" min="0.01" step="0.01" value={a.amount} onChange={e=>setChinaPaymentForm({...chinaPaymentForm,allocations:chinaPaymentForm.allocations.map((x,j)=>j===index?{...x,amount:e.target.value}:x)})}/></label>{chinaPaymentForm.allocations.length>1&&<button type="button" className="danger-text" onClick={()=>setChinaPaymentForm({...chinaPaymentForm,allocations:chinaPaymentForm.allocations.filter((_,j)=>j!==index)})}>إزالة</button>}</div>)}</div><label>ملاحظات<textarea value={chinaPaymentForm.notes} onChange={e=>setChinaPaymentForm({...chinaPaymentForm,notes:e.target.value})}/></label><div className="allocation-summary"><span>المبلغ المحوّل <b>{chinaPaymentForm.currency} {Number(chinaPaymentForm.amount||0).toFixed(2)}</b></span><span>الموزّع <b>{chinaPaymentForm.currency} {chinaPaymentForm.allocations.reduce((n,x)=>n+Number(x.amount||0),0).toFixed(2)}</b></span><small>يجب أن يساوي المبلغ الموزع إجمالي الحوالة تماماً، وألا يتجاوز الرصيد المتبقي لأي فاتورة. سجّل رسوم البنك كمصروف منفصل.</small></div><div className="modal-actions"><button type="button" className="plain-button" onClick={()=>setModal(null)}>إلغاء</button><button className="gold-button compact">حفظ التحويل وربطه بالفواتير</button></div></form></Modal>}
    {modal==="entry"&&<Modal title={editingId?"تعديل حركة مالية":"تسجيل دفعة أو مصروف أو شيك"} close={()=>setModal(null)} wide><form className="modal-form" onSubmit={saveEntry}><div className="form-grid"><label>نوع الحركة<select value={entryForm.entryType} onChange={e=>setEntryForm({...entryForm,entryType:e.target.value})}>{entryTypes.map(t=><option value={t[0]} key={t[0]}>{t[1]}</option>)}</select></label><label>المبلغ<input type="number" required min="0.01" step="0.01" value={entryForm.amount} onChange={e=>setEntryForm({...entryForm,amount:e.target.value})}/></label><label>العملة<select value={entryForm.currency} onChange={e=>setEntryForm({...entryForm,currency:e.target.value})}>{currencies.map(c=><option key={c}>{c}</option>)}</select></label><label>الاتجاه<select value={entryForm.direction} onChange={e=>setEntryForm({...entryForm,direction:e.target.value as "in"|"out"})}><option value="out">خارج</option><option value="in">داخل</option></select></label><label>التاريخ<input type="date" required value={entryForm.entryDate} onChange={e=>setEntryForm({...entryForm,entryDate:e.target.value})}/></label><label>تاريخ الاستحقاق<input type="date" value={entryForm.dueDate} onChange={e=>setEntryForm({...entryForm,dueDate:e.target.value})}/></label><label>الطرف<select value={entryForm.counterpartyId} onChange={e=>setEntryForm({...entryForm,counterpartyId:e.target.value})}><option value="">غير محدد</option>{parties.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label><label>الحاوية<select value={entryForm.shipmentId} onChange={e=>setEntryForm({...entryForm,shipmentId:e.target.value})}><option value="">بدون ربط</option>{shipments.map(s=><option value={s.id} key={s.id}>{s.container_no||s.reference_no}</option>)}</select></label><label>طريقة الدفع<select value={entryForm.paymentMethod} onChange={e=>setEntryForm({...entryForm,paymentMethod:e.target.value})}><option value="bank_transfer">حوالة بنكية</option><option value="cash">نقداً</option><option value="cheque">شيك</option><option value="other">أخرى</option></select></label><label>رقم الشيك<input value={entryForm.chequeNo} onChange={e=>setEntryForm({...entryForm,chequeNo:e.target.value})}/></label><label>البنك<input value={entryForm.bankName} onChange={e=>setEntryForm({...entryForm,bankName:e.target.value})}/></label><label>الحالة<select value={entryForm.status} onChange={e=>setEntryForm({...entryForm,status:e.target.value})}><option value="recorded">مسجلة</option><option value="pending">معلقة</option><option value="cleared">منفذة / مصروفة</option><option value="cancelled">ملغاة</option></select></label></div><label>البيان<input value={entryForm.description} onChange={e=>setEntryForm({...entryForm,description:e.target.value})}/></label><label>المرجع<input value={entryForm.referenceNo} onChange={e=>setEntryForm({...entryForm,referenceNo:e.target.value})}/></label><label>ملاحظات<textarea value={entryForm.notes} onChange={e=>setEntryForm({...entryForm,notes:e.target.value})}/></label><ModalActions close={()=>setModal(null)} submit={editingId?"حفظ التعديلات":"حفظ الحركة"}/></form></Modal>}
    {modal==="party"&&<Modal title="إضافة مورد أو عميل" close={()=>setModal(null)}><form className="modal-form" onSubmit={saveParty}><label>الاسم<input required value={partyForm.name} onChange={e=>setPartyForm({...partyForm,name:e.target.value})}/></label><label>التصنيف<select value={partyForm.type} onChange={e=>setPartyForm({...partyForm,type:e.target.value})}><option value="supplier">مورد</option><option value="customer">عميل</option><option value="other">أخرى</option></select></label><label>الهاتف<input value={partyForm.phone} onChange={e=>setPartyForm({...partyForm,phone:e.target.value})}/></label><label>البريد الإلكتروني<input type="email" value={partyForm.email} onChange={e=>setPartyForm({...partyForm,email:e.target.value})}/></label><label>ملاحظات<textarea value={partyForm.notes} onChange={e=>setPartyForm({...partyForm,notes:e.target.value})}/></label><ModalActions close={()=>setModal(null)} submit="حفظ جهة التعامل"/></form></Modal>}
    {modal==="budget"&&<Modal title="القيم التقديرية للشحنة" close={()=>setModal(null)}><form className="modal-form" onSubmit={saveBudget}><label>نوع التقدير<select value={budgetForm.budgetType} onChange={e=>setBudgetForm({...budgetForm,budgetType:e.target.value})}><option value="sale">مبيعات متوقعة</option><option value="purchase">مشتريات متوقعة</option><option value="expense">مصاريف متوقعة</option></select></label><label>العملة<select value={budgetForm.currency} onChange={e=>setBudgetForm({...budgetForm,currency:e.target.value})}>{currencies.map(c=><option key={c}>{c}</option>)}</select></label><label>القيمة المتوقعة<input required type="number" min="0" step="0.01" value={budgetForm.expected} onChange={e=>setBudgetForm({...budgetForm,expected:e.target.value})}/></label><label>ملاحظات<textarea value={budgetForm.notes} onChange={e=>setBudgetForm({...budgetForm,notes:e.target.value})}/></label><ModalActions close={()=>setModal(null)} submit="حفظ التقدير"/></form></Modal>}
    {modal==="partner"&&<Modal title="إنشاء حساب الشريك" close={()=>setModal(null)}><form className="modal-form" onSubmit={savePartner}><label>اسم المستخدم<input required minLength={3} value={partnerForm.username} onChange={e=>setPartnerForm({...partnerForm,username:e.target.value})}/></label><label>الاسم الظاهر<input required value={partnerForm.displayName} onChange={e=>setPartnerForm({...partnerForm,displayName:e.target.value})}/></label><label>كلمة مرور مؤقتة<input required minLength={12} type="password" value={partnerForm.password} onChange={e=>setPartnerForm({...partnerForm,password:e.target.value})}/></label><p className="hint">الشريك يشاهد البيانات ويضيف التعليقات فقط، ولا يمكنه تعديل الأموال أو الشحنات.</p><ModalActions close={()=>setModal(null)} submit="إنشاء حساب الشريك"/></form></Modal>}
    {uploadTarget&&<Modal title="رفع مستند أو صورة" close={()=>setUploadTarget(null)}><div className="modal-form"><p className="hint">الأنواع المدعومة PDF وJPG وPNG وWEBP. الحد الأقصى 900 كيلوبايت للملف.</p><input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" disabled={uploading} onChange={e=>{const file=e.target.files?.[0];if(file)void uploadFile(file);}}/><button className="plain-button" disabled={uploading} onClick={()=>setUploadTarget(null)}>{uploading?"جارٍ الرفع…":"إغلاق"}</button></div></Modal>}
    </div>;
}

function Stat({label,value,note}:{label:string;value:string;note:string}){return <div className="stat-card"><div className="stat-top"><span>{label}</span><i>◈</i></div><strong>{value}</strong><small>{note}</small></div>}
function Empty({text}:{text:string}){return <div className="empty-row">{text}</div>}
function ShipmentTable({rows,detailed=false,compact=false,isOwner=false,onEdit,onArchive,onBudget,onUpload,documents=[],photos=[],onPhotos}:{rows:Shipment[];detailed?:boolean;compact?:boolean;isOwner?:boolean;onEdit?:(s:Shipment)=>void;onArchive?:(id:string)=>void;onBudget?:(id:string)=>void;onUpload?:(id:string)=>void;documents?:DocumentItem[];photos?:ShipmentPhoto[];onPhotos?:(s:Shipment)=>void}){
  const photoStages=["loaded","departed","in_transit","arrived","customs_clearance","released","received","closed"];
  return <div className="table-wrap"><table><thead><tr><th>الحاوية / المرجع</th><th>المورد</th><th>المسار</th><th>الحالة</th>{detailed&&<><th>ETD / ETA</th><th>بوليصة الشحن</th><th>صور بعد التحميل</th></>}{isOwner&&<th>إدارة</th>}</tr></thead><tbody>{rows.map(s=>{const shipmentPhotos=photos.filter(p=>p.shipment_id===s.id);const canAddPhotos=photoStages.includes(s.status);return <tr key={s.id}><td><b className="mono">{s.container_no||"—"}</b><small className="row-id">{s.reference_no||s.id.slice(0,8)}</small></td><td>{s.supplier_name||"—"}</td><td>{[s.origin,s.destination].filter(Boolean).join(" → ")||"—"}</td><td><span className={s.status==="received"||s.status==="closed"?"pill positive":"pill neutral"}>{shipmentStatuses.find(x=>x[0]===s.status)?.[1]||s.status}</span></td>{detailed&&<><td>{dateLabel(s.etd)} / {dateLabel(s.eta)}</td><td>{s.bill_of_lading_no||"—"}<small className="row-id">{documents.filter(d=>d.target_type==="shipment"&&d.target_id===s.id).length} مرفق</small></td><td><div className="shipment-photo-strip">{shipmentPhotos.slice(0,3).map(photo=><a key={photo.id} href={"/api/shipment-loading-photos/"+photo.id} target="_blank" rel="noreferrer" title={photo.caption||photo.file_name}><img src={"/api/shipment-loading-photos/"+photo.id} alt={photo.caption||"صورة تحميل الحاوية"}/></a>)}</div><small className="row-id">{shipmentPhotos.length} صورة تحميل</small></td></>}{isOwner&&<td><div className="row-actions"><button onClick={()=>onEdit?.(s)}>تعديل</button><button onClick={()=>onBudget?.(s.id)}>تقدير</button><button onClick={()=>onUpload?.(s.id)}>ملف</button><button disabled={!canAddPhotos} onClick={()=>onPhotos?.(s)}>{canAddPhotos?"صور التحميل":"بعد التحميل"}</button><button className="danger-text" onClick={()=>onArchive?.(s.id)}>أرشفة</button></div></td>}</tr>})}</tbody></table></div>;
}
function InvoiceTable({invoices,parties,detailed=false,compact=false,isOwner=false,onEdit,onArchive,onUpload,documents=[],lines=[],purchaseExtras=[]}:{invoices:Invoice[];parties:Party[];detailed?:boolean;compact?:boolean;isOwner?:boolean;onEdit?:(i:Invoice)=>void;onArchive?:(id:string)=>void;onUpload?:(id:string)=>void;documents?:DocumentItem[];lines?:InvoiceLine[];purchaseExtras?:PurchaseExtra[]}){
  return <div className="table-wrap"><table><thead><tr><th>رقم الفاتورة</th><th>النوع</th><th>الطرف</th><th>الحاوية</th><th>التاريخ</th><th>القيمة</th>{detailed&&<th>إضافات الشراء</th>}<th>المسدّد</th><th>المتبقي</th><th>الحالة</th>{detailed&&<th>بنود / مرفقات</th>}{isOwner&&<th>إدارة</th>}</tr></thead><tbody>{invoices.map(i=><tr key={i.id}><td className="mono">{i.invoice_no}</td><td>{i.invoice_type==="sale"?"مبيعات":"مشتريات"}</td><td>{i.counterparty_name||parties.find(p=>p.id===i.counterparty_id)?.name||"—"}</td><td className="mono">{i.container_no||"—"}</td><td>{dateLabel(i.invoice_date)}</td><td className="mono">{money(i.total_minor,i.currency)}</td>{detailed&&<td>{i.invoice_type==="purchase"?currencies.map(currency=>{const amount=purchaseExtras.filter(x=>x.invoice_id===i.id&&x.currency===currency).reduce((n,x)=>n+x.amount_minor,0);return amount>0?<div key={currency}>{money(amount,currency)}</div>:null;}):"—"}</td>}<td className="mono">{i.invoice_type==="purchase"?money(i.paid_minor||0,i.currency):"—"}</td><td className="mono">{i.invoice_type==="purchase"?money(Math.max(i.total_minor-(i.paid_minor||0),0),i.currency):"—"}</td><td>{i.invoice_type==="purchase"&&i.total_minor>0&&i.paid_minor>=i.total_minor?"مسددة":i.invoice_type==="purchase"&&i.paid_minor>0?"مدفوعة جزئياً":i.status}</td>{detailed&&<td><div>{lines.filter(l=>l.invoice_id===i.id).length} بند</div>{documents.filter(d=>d.target_type==="invoice"&&d.target_id===i.id).length>0?<div className="invoice-doc-links">{documents.filter(d=>d.target_type==="invoice"&&d.target_id===i.id).map(d=><a className="document-link" key={d.id} href={"/api/documents/"+d.id} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}>{d.content_type==="application/pdf"?"PDF":"صورة"} · {d.file_name}</a>)}</div>:<small className="row-id">لا توجد مرفقات</small>}</td>}{isOwner&&<td><div className="row-actions"><button onClick={()=>onEdit?.(i)}>تعديل</button><button onClick={()=>onUpload?.(i.id)}>مرفق</button><button className="danger-text" onClick={()=>onArchive?.(i.id)}>أرشفة</button></div></td>}</tr>)}</tbody></table></div>;
}
function Modal({title,close,children,wide=false}:{title:string;close:()=>void;children:ReactNode;wide?:boolean}){return <div className="modal-backdrop" onMouseDown={close}><div className={wide?"modal modal-wide":"modal"} onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><h3>{title}</h3><p>تُحفظ البيانات في مساحة الشراكة المشتركة</p></div><button onClick={close}>×</button></div>{children}</div></div>}
function ModalActions({close,submit}:{close:()=>void;submit:string}){return <div className="modal-actions"><button type="button" className="plain-button" onClick={close}>إلغاء</button><button className="gold-button compact">{submit}</button></div>}
