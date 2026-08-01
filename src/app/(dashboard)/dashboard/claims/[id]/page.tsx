"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { openAttachment } from "@/lib/fileUrl";
import { ClaimAPI, Claim } from "@/services/insurance";
import {
  ArrowLeft,
  FileText,
  Send,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Building2,
  User,
  Receipt,
  Paperclip,
  Plus,
  Save,
  X,
  Activity,
  HeartPulse,
  Stethoscope,
  FlaskConical,
  Pill,
  BedDouble,
  ClipboardList,
  LogOut,
  ShieldCheck,
  Clock,
  Ban,
  CreditCard,
  ExternalLink,
  Calendar,
  Hash,
} from "lucide-react";

const ATTACHMENT_TYPES = ["CLAIM", "AUTHORIZATION", "OTHER"];

const EVENT_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  VITALS: HeartPulse,
  CONSULTATION: Stethoscope,
  DIAGNOSIS: Stethoscope,
  PROCEDURE_ORDER: FlaskConical,
  PROCEDURE_RESULT: FlaskConical,
  PRESCRIPTION: Pill,
  DISPENSED: Pill,
  ADMISSION: BedDouble,
  DOCTOR_REVIEW: Stethoscope,
  NURSING_NOTE: ClipboardList,
  MEDICATION_ORDER: Pill,
  MEDICATION_ADMINISTERED: Pill,
  DISCHARGE: LogOut,
};

export default function ClaimDetailPage() {
  const { id } = useParams();

  const [claim, setClaim] = useState<Claim | null>(null);
  const [dto, setDto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const [attachments, setAttachments] = useState<any[]>([]);
  const [showAddAttachment, setShowAddAttachment] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentType, setAttachmentType] = useState("OTHER");
  const [addingAttachment, setAddingAttachment] = useState(false);

  const [editingDraft, setEditingDraft] = useState(false);
  const [draftForm, setDraftForm] = useState({ totalAmount: "" });
  const [savingDraft, setSavingDraft] = useState(false);

  useEffect(() => {
    load();
    loadDTO();
    loadMessages();
    loadAttachments();
  }, [id]);

  async function load() {
    try {
      setLoading(true);
      const data = await ClaimAPI.getOne(id as string);
      setClaim(data);
      setDraftForm({ totalAmount: String(data.totalAmount ?? "") });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadDTO() {
    try {
      const res = await api.get(`/claims/${id}/full`);
      setDto(res.data);
    } catch (err) {
      console.error("Failed to fetch claim detail:", err);
      setDto(null);
    }
  }

  async function loadMessages() {
    try {
      const res = await api.get(`/claim-Message/${id}`);
      setMessages(res.data);
    } catch {
      setMessages([]);
    }
  }

  async function loadAttachments() {
    try {
      const data = await ClaimAPI.getAttachments(id as string);
      setAttachments(data);
    } catch {
      setAttachments([]);
    }
  }

  async function handleSaveDraft() {
    const amount = Number(draftForm.totalAmount);
    if (!amount || amount <= 0) return;

    setSavingDraft(true);
    try {
      await ClaimAPI.update(id as string, { totalAmount: amount });
      setEditingDraft(false);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to update claim draft.");
    } finally {
      setSavingDraft(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await ClaimAPI.submit(id as string);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to submit claim.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeliver() {
    if (!claim) return;
    setDelivering(true);
    try {
      if (claim.insurance.provider.integrationMode === "ZENSA") {
        await ClaimAPI.deliverToZensa(id as string);
        load();
      } else {
        const res = await ClaimAPI.exportFile(id as string, exportFormat);
        const blob = new Blob([res.data]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${claim.claimNumber ?? claim.id}.${exportFormat}`;
        a.click();
        URL.revokeObjectURL(url);
        load();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to deliver/export claim.");
    } finally {
      setDelivering(false);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;
    setSendingMessage(true);
    try {
      await api.post(`/claim-Message/${id}`, { message: newMessage.trim() });
      setNewMessage("");
      loadMessages();
    } catch {
      alert("Failed to send message.");
    } finally {
      setSendingMessage(false);
    }
  }

  async function handleAddAttachment(e: React.FormEvent) {
  e.preventDefault();
  if (!attachmentFile) return;

  setAddingAttachment(true);
  try {
    await ClaimAPI.addAttachment(id as string, attachmentFile, attachmentType);
    setAttachmentFile(null);
    setAttachmentType("OTHER");
    setShowAddAttachment(false);
    loadAttachments();
  } catch (err: any) {
    alert(err?.response?.data?.error || "Failed to add attachment.");
  } finally {
    setAddingAttachment(false);
  }
}

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "DRAFT":
        return { color: "text-slate-700", bg: "bg-slate-100", border: "border-slate-200", icon: <FileText className="w-3.5 h-3.5" /> };
      case "SUBMITTED":
        return { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: <Send className="w-3.5 h-3.5" /> };
      case "APPROVED":
        return { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
      case "PARTIALLY_APPROVED":
        return { color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", icon: <AlertCircle className="w-3.5 h-3.5" /> };
      case "REJECTED":
        return { color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", icon: <Ban className="w-3.5 h-3.5" /> };
      case "PAID":
        return { color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", icon: <CreditCard className="w-3.5 h-3.5" /> };
      default:
        return { color: "text-gray-700", bg: "bg-gray-100", border: "border-gray-200", icon: <Clock className="w-3.5 h-3.5" /> };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">Loading claim...</p>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/dashboard/claims"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-slate-900 transition-colors w-fit group mb-6"
          >
            <div className="p-1 rounded-md group-hover:bg-gray-200 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium">Back to Claims</span>
          </Link>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
            <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Claim Not Found</h2>
            <p className="text-sm text-gray-500">The requested claim could not be loaded.</p>
          </div>
        </div>
      </div>
    );
  }

  const isZensa = claim.insurance.provider.integrationMode === "ZENSA";
  const isDraft = claim.status === "DRAFT";
  const status = getStatusConfig(claim.status);

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all bg-white";
  const labelClass = "block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Back Button */}
        <Link
          href="/dashboard/claims"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-slate-900 transition-colors w-fit group"
        >
          <div className="p-1 rounded-md group-hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-medium">Back to Claims</span>
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#1a237e] flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {claim.claimNumber ?? claim.id.slice(0, 8).toUpperCase()}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color} ${status.border}`}
                  >
                    {status.icon}
                    {claim.status.replaceAll("_", " ")}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(claim.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isDraft && !isZensa && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Claim
              </button>
            )}

            {(claim.status === "SUBMITTED" || (isZensa && isDraft)) && (
              <div className="flex items-center gap-2">
                {!isZensa && (
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="xml">XML</option>
                    <option value="edi">EDI</option>
                    <option value="pdf">PDF</option>
                  </select>
                )}
                <button
                  onClick={handleDeliver}
                  disabled={delivering}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
                >
                  {delivering ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isZensa ? (
                    <Send className="w-4 h-4" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {isZensa ? "Submit to Insurer" : "Export & Download"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Draft edit */}
        {isDraft && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-amber-900 text-sm">Draft — editable until submitted</h2>
              {!editingDraft && (
                <button
                  onClick={() => setEditingDraft(true)}
                  className="text-sm text-amber-700 hover:text-amber-900 font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            {editingDraft ? (
              <div className="flex flex-col sm:flex-row items-end gap-3">
                <div className="flex-1 w-full">
                  <label className={labelClass}>Claim Total Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">₦</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draftForm.totalAmount}
                      onChange={(e) => setDraftForm({ totalAmount: e.target.value })}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveDraft}
                  disabled={savingDraft}
                  className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
                >
                  {savingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save
                </button>
                <button
                  onClick={() => setEditingDraft(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-white border border-transparent hover:border-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="text-sm text-amber-800">
                Current claim total: <span className="font-bold">{formatCurrency(claim.totalAmount)}</span>
              </p>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(claim.totalAmount)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <Receipt className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Approved Amount</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {claim.approvedAmount != null ? formatCurrency(claim.approvedAmount) : "—"}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Insurer</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{claim.insurance.provider.organization.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">Policy: {claim.insurance.policyNumber}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {claim.status === "REJECTED" && claim.rejectionReason && (
          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Rejection Reason</p>
              <p className="mt-0.5">{claim.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Patient */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Patient
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
              {claim.patient.firstName[0]}
              {claim.patient.lastName[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {claim.patient.firstName} {claim.patient.lastName}
              </p>
              <p className="text-xs text-gray-500">ID: {claim.patient.patientNumber}</p>
            </div>
          </div>
        </div>

        {/* Encounter & Clinical Timeline */}
        {dto && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600" />
              Encounter & Clinical Timeline
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-5 pb-5 border-b border-gray-100">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Check-In: {dto.encounter.checkIn ? new Date(dto.encounter.checkIn).toLocaleString() : "—"}
              </span>
              <span className="flex items-center gap-1.5">
                <LogOut className="w-3.5 h-3.5" />
                Check-Out: {dto.encounter.checkOut ? new Date(dto.encounter.checkOut).toLocaleString() : "—"}
              </span>
            </div>

            {dto.timeline.length === 0 ? (
              <p className="text-sm text-gray-400">No clinical activity recorded for this visit.</p>
            ) : (
              <div className="space-y-3">
                {dto.timeline.map((event: any, i: number) => {
                  const Icon = EVENT_ICONS[event.type] ?? Activity;
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{event.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(event.time).toLocaleString()}
                          {event.actor && ` · ${event.actorRole}: ${event.actor}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Invoice charges */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-400" />
              Invoice {claim.invoice?.invoiceNumber || claim.invoice?.id?.slice(0, 8)}
            </h2>
            {claim.invoice && (
              <Link
                href={`/dashboard/billing/invoice/${claim.invoice.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View Invoice
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Qty</th>
                  <th className="px-6 py-3">Unit Price</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(dto?.invoice?.charges ?? claim.invoice?.charges ?? []).map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5 text-gray-900 font-medium">{c.description}</td>
                    <td className="px-6 py-3.5">
                      {c.code && (
                        <span className="font-mono text-[10px] bg-blue-50 border border-blue-100 rounded-md px-1.5 py-0.5 text-blue-700">
                          CPT {c.code}
                        </span>
                      )}
                      {c.sku && (
                        <span className="ml-1 font-mono text-[10px] bg-amber-50 border border-amber-100 rounded-md px-1.5 py-0.5 text-amber-700">
                          SKU {c.sku}
                        </span>
                      )}
                      {!c.code && !c.sku && <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-3.5 text-gray-600">{c.quantity}</td>
                    <td className="px-6 py-3.5 text-gray-600">₦{(c.unitPrice ?? 0).toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-gray-900">
                      ₦{(c.total ?? c.totalPrice ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attachments */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-gray-500" />
              Attachments
            </h2>
            <button
              onClick={() => setShowAddAttachment(!showAddAttachment)}
              className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:text-slate-900 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          {showAddAttachment && (
  <form onSubmit={handleAddAttachment} className="p-6 border-b border-slate-100 bg-slate-50 space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className={labelClass}>File</label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
          onChange={(e) => setAttachmentFile(e.target.files?.[0] ?? null)}
          className={`${inputClass} bg-white`}
          required
        />
      </div>
      <div>
        <label className={labelClass}>Type</label>
        <select
          value={attachmentType}
          onChange={(e) => setAttachmentType(e.target.value)}
          className={`${inputClass} bg-white`}
        >
          {ATTACHMENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
    </div>
    {attachmentFile && (
      <p className="text-xs text-slate-500">
        {attachmentFile.name} · {(attachmentFile.size / 1024).toFixed(0)} KB
      </p>
    )}
    <div className="flex justify-end gap-3">
      <button type="button" onClick={() => setShowAddAttachment(false)} className="px-4 py-2 text-sm font-medium text-slate-600">
        Cancel
      </button>
      <button
        type="submit"
        disabled={addingAttachment || !attachmentFile}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        {addingAttachment ? <Loader2 size={14} className="animate-spin" /> : "Upload Attachment"}
      </button>
    </div>
  </form>
)}
          
          {attachments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No attachments yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
             {attachments.map((a) => (
  <button
    key={a.id}
    onClick={() => openAttachment(`/claim-Attachment/download/${a.id}`, a.fileName)}
    className="w-full flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors text-left"
  >
    <div className="flex items-center gap-3">
      <Paperclip size={14} className="text-slate-400" />
      <div>
        <p className="text-sm text-slate-800">{a.fileName}</p>
        <p className="text-xs text-slate-400">{a.type} · {new Date(a.attachedAt).toLocaleDateString()}</p>
      </div>
    </div>
  </button>
))}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              Messages
            </h2>
          </div>

          <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No messages yet.</p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-xl max-w-md ${
                    m.senderType === "HOSPITAL"
                      ? "bg-blue-50 ml-auto border border-blue-100"
                      : "bg-gray-50 border border-gray-100"
                  }`}
                >
                  <p className="text-sm text-gray-800">{m.message}</p>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {m.senderType === "HOSPITAL"
                      ? m.senderStaff
                        ? `${m.senderStaff.firstName} ${m.senderStaff.lastName}`
                        : "You"
                      : m.senderInsuranceStaff
                      ? `${m.senderInsuranceStaff.firstName} ${m.senderInsuranceStaff.lastName} (Insurer)`
                      : "Insurer"}
                    {" · "}
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-100 p-4 flex items-center gap-3">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write a message to the insurer..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={sendingMessage || !newMessage.trim()}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
            >
              {sendingMessage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}