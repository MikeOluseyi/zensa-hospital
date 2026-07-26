"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { 
  Users, 
  Plus, 
  Mail, 
  Phone, 
  Shield, 
  MoreHorizontal,
  Search,
  X,
  Loader2,
  Stethoscope,
  UserCog,
  FlaskConical,
  Pill,
  Calculator,
  ClipboardList,
  Crown
} from "lucide-react";

type Staff = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  isActive?: boolean;
};

const ROLE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  DOCTOR: { 
    label: "Doctor", 
    icon: <Stethoscope className="w-3.5 h-3.5" />, 
    color: "text-emerald-700", 
    bg: "bg-emerald-50" 
  },
  NURSE: { 
    label: "Nurse", 
    icon: <UserCog className="w-3.5 h-3.5" />, 
    color: "text-sky-700", 
    bg: "bg-sky-50" 
  },
  LAB_TECH: { 
    label: "Lab Tech", 
    icon: <FlaskConical className="w-3.5 h-3.5" />, 
    color: "text-violet-700", 
    bg: "bg-violet-50" 
  },
  PHARMACIST: { 
    label: "Pharmacist", 
    icon: <Pill className="w-3.5 h-3.5" />, 
    color: "text-amber-700", 
    bg: "bg-amber-50" 
  },
  ACCOUNTANT: { 
    label: "Accountant", 
    icon: <Calculator className="w-3.5 h-3.5" />, 
    color: "text-slate-700", 
    bg: "bg-slate-100" 
  },
  RECEPTIONIST: { 
    label: "Receptionist", 
    icon: <ClipboardList className="w-3.5 h-3.5" />, 
    color: "text-pink-700", 
    bg: "bg-pink-50" 
  },
  ADMIN: { 
    label: "Admin", 
    icon: <Crown className="w-3.5 h-3.5" />, 
    color: "text-rose-700", 
    bg: "bg-rose-50" 
  },
};

export default function StaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "DOCTOR",
    phone: ""
  });

  async function fetchStaff() {
    try {
      const response = await api.get("/staff");
      setStaff(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStaff();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/staff/register", form);
      setShowModal(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "DOCTOR",
        phone: ""
      });
      fetchStaff();
    } catch (err) {
      console.error(err);
      alert("Failed to register staff");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredStaff = staff.filter((member) => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      fullName.includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.role.toLowerCase().includes(query)
    );
  });

  const getRoleBadge = (role: string) => {
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.ADMIN;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      "bg-blue-500", "bg-emerald-500", "bg-violet-500", 
      "bg-amber-500", "bg-rose-500", "bg-cyan-500"
    ];
    return colors[id.charCodeAt(0) % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Staff Registry
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manage hospital personnel and access permissions
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Staff
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Staff", value: staff.length, icon: Users },
            { label: "Doctors", value: staff.filter(s => s.role === "DOCTOR").length, icon: Stethoscope },
            { label: "Nurses", value: staff.filter(s => s.role === "NURSE").length, icon: UserCog },
            { label: "Other Roles", value: staff.filter(s => !["DOCTOR", "NURSE"].includes(s.role)).length, icon: Shield },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-xl">
                  <stat.icon className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200" />
                          <div className="space-y-2">
                            <div className="w-32 h-4 bg-gray-200 rounded" />
                            <div className="w-20 h-3 bg-gray-100 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6"><div className="w-20 h-6 bg-gray-200 rounded-full" /></td>
                      <td className="py-4 px-6 space-y-2"><div className="w-32 h-3 bg-gray-200 rounded" /></td>
                      <td className="py-4 px-6"><div className="w-16 h-6 bg-gray-200 rounded-full" /></td>
                      <td className="py-4 px-6"><div className="w-20 h-8 bg-gray-200 rounded-lg ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Users className="w-12 h-12 stroke-1" />
                        <p className="text-sm font-medium">No staff members found</p>
                        {searchQuery && (
                          <p className="text-xs">Try adjusting your search query</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((member) => (
                    <tr 
                      key={member.id} 
                      className="group hover:bg-gray-50/80 transition-colors duration-150"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${getAvatarColor(member.id)} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                            {getInitials(member.firstName, member.lastName)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">ID: {member.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getRoleBadge(member.role)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate max-w-[180px]">{member.email}</span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                          member.isActive !== false 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            member.isActive !== false ? "bg-emerald-500" : "bg-gray-400"
                          }`} />
                          {member.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => router.push(`/staff/${member.id}/edit`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                          >
                            Edit
                          </button>
                          <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                          >
                            Disable
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Register Staff</h2>
                <p className="text-sm text-gray-500 mt-0.5">Add a new member to the hospital staff</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">First Name</label>
                  <input
                    placeholder="John"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all placeholder:text-gray-400"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Last Name</label>
                  <input
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Email Address</label>
                <input
                  type="email"
                  placeholder="john.doe@hospital.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all bg-white"
                >
                  <option value="DOCTOR">Doctor</option>
                  <option value="NURSE">Nurse</option>
                  <option value="LAB_TECH">Laboratory Technician</option>
                  <option value="PHARMACIST">Pharmacist</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}