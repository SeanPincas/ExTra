const HIGH_PRIORITY_WINDOW_DAYS = 3;

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getDaysUntilDue(dueDate, now = new Date()) {
  const today = startOfDay(now);
  const target = new Date(dueDate);
  if (Number.isNaN(target.getTime())) return Number.POSITIVE_INFINITY;
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.ceil(diffMs / 86_400_000);
}

function isHighPriority(reminder, now = new Date()) {
  if (!reminder?.active) return false;
  const daysUntil = getDaysUntilDue(reminder.dueDate, now);
  return daysUntil >= 0 && daysUntil <= HIGH_PRIORITY_WINDOW_DAYS;
}

function sortByClosestDue(reminders, now = new Date()) {
  return [...reminders].sort((a, b) => {
    const aDays = getDaysUntilDue(a.dueDate, now);
    const bDays = getDaysUntilDue(b.dueDate, now);
    if (aDays !== bDays) return aDays - bDays;
    const aTime = new Date(a.dueDate).getTime();
    const bTime = new Date(b.dueDate).getTime();
    return aTime - bTime;
  });
}

export function sortRemindersByPriority(reminders, now = new Date()) {
  const active = [];
  const completed = [];

  for (const reminder of reminders || []) {
    if (reminder?.active === false) completed.push(reminder);
    else active.push(reminder);
  }

  const high = [];
  const normal = [];

  for (const reminder of active) {
    if (isHighPriority(reminder, now)) high.push(reminder);
    else normal.push(reminder);
  }

  return [
    ...sortByClosestDue(high, now),
    ...sortByClosestDue(normal, now),
    ...sortByClosestDue(completed, now),
  ];
}

