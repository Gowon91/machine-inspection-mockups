/** 위험도 배지 색상 */
export function riskBadge(level: string): string {
  switch (level) {
    case "상":
      return "bg-red-100 text-red-700";
    case "중":
      return "bg-amber-100 text-amber-700";
    case "하":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

/** 상태 배지 색상 */
export function statusBadge(status: string): string {
  switch (status) {
    case "조치완료":
    case "완료":
      return "bg-emerald-100 text-emerald-700";
    case "미조치":
    case "예정":
      return "bg-amber-100 text-amber-700";
    case "진행중":
      return "bg-sky-100 text-sky-700";
    case "종료":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export function fmtDate(d: string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
