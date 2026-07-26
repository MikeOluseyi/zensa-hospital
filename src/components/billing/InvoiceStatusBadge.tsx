import {
  Clock,
  CircleDollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Receipt,
  type LucideIcon
} from "lucide-react";

interface Props {
  status: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

type StatusConfig = {
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  dot: string;
};

const STATUS_MAP: Record<string, StatusConfig> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  PARTIALLY_PAID: {
    label: "Partially Paid",
    icon: CircleDollarSign,
    color: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
    dot: "bg-sky-500",
  },
  PAID: {
    label: "Paid",
    icon: CheckCircle2,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
  OVERDUE: {
    label: "Overdue",
    icon: AlertCircle,
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  DRAFT: {
    label: "Draft",
    icon: Receipt,
    color: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

const SIZE_MAP = {
  sm: {
    wrapper: "px-2 py-0.5 gap-1 text-[11px]",
    icon: "w-3 h-3",
    dot: "w-1 h-1",
  },
  md: {
    wrapper: "px-2.5 py-1 gap-1.5 text-xs",
    icon: "w-3.5 h-3.5",
    dot: "w-1.5 h-1.5",
  },
  lg: {
    wrapper: "px-3 py-1.5 gap-2 text-sm",
    icon: "w-4 h-4",
    dot: "w-2 h-2",
  },
};

export default function InvoiceStatusBadge({
  status,
  size = "md",
  showIcon = true,
}: Props) {
  const config = STATUS_MAP[status] || {
    label: status.replaceAll("_", " "),
    icon: AlertCircle,
    color: "text-gray-600",
    bg: "bg-gray-100",
    border: "border-gray-200",
    dot: "bg-gray-400",
  };

  const sizeClasses = SIZE_MAP[size];
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${config.bg} ${config.color} ${config.border}
        ${sizeClasses.wrapper}
        transition-colors duration-150
      `}
      title={config.label}
    >
      {showIcon ? (
        <Icon className={sizeClasses.icon} strokeWidth={2.5} />
      ) : (
        <span className={`rounded-full ${sizeClasses.dot} ${config.dot}`} />
      )}
      <span className="whitespace-nowrap">{config.label}</span>
    </span>
  );
}