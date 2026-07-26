"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { ClaimAPI, Claim } from "@/services/insurance";
import {
  ArrowLeft, FileText, Send, Download, Loader2, AlertCircle,
  CheckCircle2, MessageSquare, Building2, User, Receipt,
  Paperclip, Plus, Save, X, Activity, HeartPulse, Stethoscope, FlaskConical, Pill
} from "lucide-react";

const ATTACHMENT_TYPES = ["CLAIM", "AUTHORIZATION", "OTHER"];

export default function ClaimDetailPage() {
  const { id } = useParams();

  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const [attachments, setAttachments] = useState<any[]>([]);
  const [showAddAttachment, setShowAddAttachment] = useState(false);
  const [attachmentForm, setAttachmentForm] = useState({ fileName: "", fileUrl: "", type: "OTHER" });
  const [addingAttachment, setAddingAttachment] = useState(false);
  const [timeline, setTimeline] = useState<any>(null);

  const [editingDraft, setEditingDraft] = useState(false);
  const [draftForm, setDraftForm] = useState({ totalAmount: "" });
  const [savingDraft, setSavingDraft] = useState(false);

  useEffect(() => {
    load();
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

  async function loadTimeline() {
  try {
    const data = await ClaimAPI.getTimeline(id as string);
    setTimeline(data);
  } catch {
    setTimeline(null);
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
    if (!attachmentForm.fileName.trim() || !attachmentForm.fileUrl.trim()) return;

    setAddingAttachment(true);
    try {
      await ClaimAPI.addAttachment(id as string, attachmentForm);
      setAttachmentForm({ fileName: "", fileUrl: "", type: "OTHER" });
      setShowAddAttachment(false);
      loadAttachments();
    } catch {
      alert("Failed to add attachment.");
    } finally {
      setAddingAttachment(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-lg font-medium text-slate-600">Claim not found</p>
        <Link href="/dashboard/claims" className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium inline-block">
          Back to claims
        </Link>
      </div>
    );
  }

  const isZensa = claim.insurance.provider.integrationMode === "ZENSA";
  const isDraft = claim.status === "DRAFT";

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/claims" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText size={22} className="text-blue-600" />
              {claim.claimNumber ?? claim.id.slice(0, 8)}
            </h1>
            <span className={`inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${
              claim.status === "DRAFT" ? "bg-slate-100 text-slate-700 border-slate-200" :
              claim.status === "SUBMITTED" ? "bg-blue-50 text-blue-700 border-blue-200" :
              claim.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
              claim.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-200" :
              "bg-slate-100 text-slate-700 border-slate-200"
            }`}>
              {claim.status.replaceAll("_", " ")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isDraft && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Submit Claim
              </button>
            )}

            {(claim.status === "SUBMITTED" || (isZensa && isDraft)) && (
              <div className="flex items-center gap-2">
                {!isZensa && (
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2 py-2.5 text-sm bg-white"
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
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  {delivering ? <Loader2 size={16} className="animate-spin" /> : isZensa ? <Send size={16} /> : <Download size={16} />}
                  {isZensa ? "Submit to Insurer" : "Export & Download"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Draft edit */}
      {isDraft && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
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
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className={labelClass}>Claim Total Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₦</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={draftForm.totalAmount}
                    onChange={(e) => setDraftForm({ totalAmount: e.target.value })}
                    className={`${inputClass} pl-8 bg-white`}
                  />
                </div>
              </div>
              <button
                onClick={handleSaveDraft}
                disabled={savingDraft}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {savingDraft ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save
              </button>
              <button
                onClick={() => setEditingDraft(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-white transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="text-sm text-amber-800">
              Current claim total: <span className="font-semibold">₦{claim.totalAmount.toLocaleString()}</span>
            </p>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm"><Receipt size={16} /> Total Amount</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">₦{claim.totalAmount.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm"><CheckCircle2 size={16} /> Approved Amount</div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {claim.approvedAmount != null ? `₦${claim.approvedAmount.toLocaleString()}` : "—"}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm"><Building2 size={16} /> Insurer</div>
          <div className="text-lg font-semibold text-slate-900 mt-2">{claim.insurance.provider.organization.name}</div>
          <p className="text-xs text-slate-500 mt-0.5">Policy: {claim.insurance.policyNumber}</p>
        </div>
      </div>

      {claim.status === "REJECTED" && claim.rejectionReason && (
        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Rejection Reason</p>
            <p className="mt-0.5">{claim.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Patient */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><User size={18} className="text-blue-600" /> Patient</h2>
        <p className="text-sm text-slate-700">{claim.patient.firstName} {claim.patient.lastName} · {claim.patient.patientNumber}</p>
      </div>
      {/* Encounter & Clinical Timeline */}
{timeline && (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
    <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
      <Activity size={18} className="text-rose-600" />
      Encounter & Clinical Timeline
    </h2>

    <div className="flex items-center gap-6 text-sm text-slate-600 mb-5 pb-5 border-b border-slate-100">
      <span>Check-In: {timeline.encounter.checkIn ? new Date(timeline.encounter.checkIn).toLocaleString() : "-"}</span>
      <span>Check-Out: {timeline.encounter.checkOut ? new Date(timeline.encounter.checkOut).toLocaleString() : "-"}</span>
    </div>

    {timeline.timeline.length === 0 ? (
      <p className="text-sm text-slate-400">No clinical activity recorded for this visit.</p>
    ) : (
      <div className="space-y-3">
        {timeline.timeline.map((event: any, i: number) => {
          const iconMap: Record<string, any> = {
            VITALS: HeartPulse,
            CONSULTATION: Stethoscope,
            DIAGNOSIS: Stethoscope,
            PROCEDURE_ORDER: FlaskConical,
            PROCEDURE_RESULT: FlaskConical,
            PRESCRIPTION: Pill,
            DISPENSED: Pill,
          };
          const Icon = iconMap[event.type] ?? Activity;

          return (
            <div key={i} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <Icon size={13} className="text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-700">{event.description}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(event.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Invoice: {claim.invoice.invoiceNumber}</h2>
          <Link href={`/dashboard/billing/invoice/${claim.invoice.id}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View Invoice
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Qty</th>
              <th className="px-6 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {claim.invoice.charges.map((c: any) => (
              <tr key={c.id}>
                <td className="px-6 py-3 text-slate-700">{c.description}</td>
                <td className="px-6 py-3 text-slate-600">{c.quantity}</td>
                <td className="px-6 py-3 text-right font-medium text-slate-900">₦{c.totalPrice.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Attachments */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2"><Paperclip size={18} className="text-slate-500" /> Attachments</h2>
          <button
            onClick={() => setShowAddAttachment(!showAddAttachment)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <Plus size={14} />
            Add
          </button>
        </div>

        {showAddAttachment && (
          <form onSubmit={handleAddAttachment} className="p-6 border-b border-slate-100 bg-slate-50 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>File Name</label>
                <input
                  value={attachmentForm.fileName}
                  onChange={(e) => setAttachmentForm({ ...attachmentForm, fileName: e.target.value })}
                  className={`${inputClass} bg-white`}
                  placeholder="e.g. discharge_summary.pdf"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select
                  value={attachmentForm.type}
                  onChange={(e) => setAttachmentForm({ ...attachmentForm, type: e.target.value })}
                  className={`${inputClass} bg-white`}
                >
                  {ATTACHMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>File URL</label>
              <input
                value={attachmentForm.fileUrl}
                onChange={(e) => setAttachmentForm({ ...attachmentForm, fileUrl: e.target.value })}
                className={`${inputClass} bg-white`}
                placeholder="https://..."
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowAddAttachment(false)} className="px-4 py-2 text-sm font-medium text-slate-600">
                Cancel
              </button>
              <button
                type="submit"
                disabled={addingAttachment}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                {addingAttachment ? <Loader2 size={14} className="animate-spin" /> : "Add Attachment"}
              </button>
            </div>
          </form>
        )}

        {attachments.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No attachments yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {attachments.map((a) => (
              <a
                key={a.id}
                href={a.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Paperclip size={14} className="text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-800">{a.fileName}</p>
                    <p className="text-xs text-slate-400">{a.type} · {new Date(a.attachedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2"><MessageSquare size={18} className="text-slate-500" /> Messages</h2>
        </div>

        <div className="p-6 space-y-3 max-h-72 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No messages yet.</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`p-3 rounded-lg max-w-md ${m.senderType === "HOSPITAL" ? "bg-blue-50 ml-auto" : "bg-slate-50"}`}>
                <p className="text-sm text-slate-700">{m.message}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {m.senderType === "HOSPITAL"
                    ? (m.senderStaff ? `${m.senderStaff.firstName} ${m.senderStaff.lastName}` : "You")
                    : (m.senderInsuranceStaff ? `${m.senderInsuranceStaff.firstName} ${m.senderInsuranceStaff.lastName} (Insurer)` : "Insurer")}
                  {" · "}
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-100 p-4 flex items-center gap-3">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message to the insurer..."
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={sendingMessage || !newMessage.trim()}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {sendingMessage ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}