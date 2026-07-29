import api from "@/lib/api";

export interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
  staff: { firstName: string; lastName: string; role: string } | null;
}

export interface LoginLogEntry {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  staff: { firstName: string; lastName: string; role: string; email: string };
}

export interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
}

export interface PermissionGrid {
  permissions: { id: string; name: string; action: string; description: string | null }[];
  roles: string[];
  grid: Record<string, string[]>;
}

export const ManagementAPI = {
  getAuditLogs: (): Promise<AuditLogEntry[]> =>
    api.get("/audit-logs").then((r) => r.data),

  getLoginLogs: (staffId?: string): Promise<LoginLogEntry[]> =>
    api.get("/staff/login-logs", { params: staffId ? { staffId } : {} }).then((r) => r.data),

  getWallet: (): Promise<{ balance: number; transactions: WalletTransaction[] }> =>
    api.get("/wallets/mine").then((r) => r.data),

  getPermissionGrid: (): Promise<PermissionGrid> =>
    api.get("/rbac").then((r) => r.data),

  grantPermission: (role: string, action: string) =>
    api.post("/rbac/grant", { role, action }).then((r) => r.data),

  revokePermission: (role: string, action: string) =>
    api.post("/rbac/revoke", { role, action }).then((r) => r.data),
};