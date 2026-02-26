export const COMPLETED_STATUSES = ["valide", "completed", "done", "terminer"];

export const isCompleted = (statusName) =>
  COMPLETED_STATUSES.includes(statusName?.toLowerCase());

export const getAccentColor = (statusName) => {
  const s = statusName?.toLowerCase();
  if (COMPLETED_STATUSES.includes(s)) return "#10B981";
  if (["encours", "inprogress", "active"].includes(s)) return "#3B82F6";
  return "#F59E0B";
};

export const getTimelineColor = (statusName) => getAccentColor(statusName);

export const getInitials = (name) => {
  if (!name) return "NA";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};
