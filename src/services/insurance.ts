import api from "@/lib/api";

export interface InsuranceProvider {
  id: string;
  claimsEmail: string | null;
  claimsPortalUrl: string | null;
  integrationMode: "ZENSA" | "EXTERNAL";
  organization: {
    id: string;
    name: string;
    code: string;
    email?: string | null;
    phone?: string | null;
  };
}

export interface PatientInsurance {
  id: string;
  patientId: string;
  providerId: string;
  policyNumber: string;
  memberId: string | null;
  authorizationNumber: string | null;
  isPrimary: boolean;
  authorizationRequired: boolean;
  coveragePercent: number | null;
  planName: string | null;
  startDate: string | null;
  endDate: string | null;
  provider: InsuranceProvider;
}

export interface InsurancePlan {
  id: string;
  name: string;
  scope: "GENERAL" | "CONDITION_SPECIFIC";
  coveragePercent: number;
  authorizationRequired: boolean;
  maxClaimAmount: number | null;
  active: boolean;
}

export const InsuranceAPI = {
  getProviders: (): Promise<InsuranceProvider[]> =>
    api.get("/insurance-Provider").then((r) => r.data),

  getProviderPlans: (providerId: string): Promise<InsurancePlan[]> =>
    api.get(`/insurance-Provider/${providerId}/plans`).then((r) => r.data),

  getPatientInsurance: (patientId: string): Promise<PatientInsurance[]> =>
    api.get(`/insurance/patient/${patientId}`).then((r) => r.data),

  assignInsurance: (data: {
    patientId: string;
    providerId: string;
    planId?: string;
    policyNumber: string;
    memberId?: string;
    authorizationNumber?: string;
    isPrimary?: boolean;
    authorizationRequired?: boolean;
    coveragePercent?: number;
    planName?: string;
    startDate?: string;
    endDate?: string;
  }) => api.post("/insurance/assign", data).then((r) => r.data),

  quickAddProvider: (data: { name: string; claimsEmail?: string; claimsPortalUrl?: string }): Promise<InsuranceProvider> =>
    api.post("/insurance-Provider/quick-add", data).then((r) => r.data),
};

export interface Claim {
  id: string;
  claimNumber: string | null;
  status: string;
  totalAmount: number;
  approvedAmount: number | null;
  rejectionReason: string | null;
  currency: string;
  createdAt: string;
  submittedAt: string | null;
  processedAt: string | null;
  paidAt: string | null;
  exportStatus: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    patientNumber: string;
  };
  insurance: {
    id: string;
    policyNumber: string;
    provider: {
      organization: { name: string };
      integrationMode: "ZENSA" | "EXTERNAL";
    };
  };
  invoice: {
    id: string;
    invoiceNumber: string;
    subtotal: number;
    charges: any[];
  };
}

export const ClaimAPI = {
  create: (data: { insuranceId: string; invoiceId: string; claimedAmount?: number }) =>
    api.post("/claims", data).then((r) => r.data),

  getAll: (): Promise<Claim[]> => api.get("/claims").then((r) => r.data),

  getOne: (id: string): Promise<Claim> => api.get(`/claims/${id}`).then((r) => r.data),

  submit: (id: string) => api.patch(`/claims/${id}/submit`).then((r) => r.data),

  deliverToZensa: (id: string) => api.post(`/claims/${id}/deliver`, {}).then((r) => r.data),

  exportFile: (id: string, format: string) =>
    api.post(`/claims/${id}/deliver`, { format }, { responseType: "blob" }),

  remove: (id: string) => api.delete(`/claims/${id}`).then((r) => r.data),

  update: (id: string, data: Record<string, any>) =>
    api.patch(`/claims/${id}`, data).then((r) => r.data),

  getAttachments: (id: string) =>
    api.get(`/claim-Attachment/${id}`).then((r) => r.data),

  addAttachment: (id: string, file: File, type: string = "OTHER") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  return api.post(`/claim-Attachment/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }).then((r) => r.data);
},

  getTimeline: (id: string) =>
    api.get(`/claims/${id}/timeline`).then((r) => r.data),


};