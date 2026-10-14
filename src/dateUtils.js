
function pad(n) {
  return String(n).padStart(2, "0");
}

export function localDateStr(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function localTimeStr(d = new Date()) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function isFutureDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return false;
  return new Date(`${dateStr}T${timeStr}`).getTime() > Date.now();
}