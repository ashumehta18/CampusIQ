/**
 * Returns how much time is left until a deadline, as a human-readable string.
 * Also returns an urgency level for styling.
 */
export const getDeadlineInfo = (deadline) => {
  const now = new Date();
  const due = new Date(deadline);
  const diffMs = due - now;

  if (diffMs < 0) return { label: 'Overdue', urgency: 'overdue' };

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 24) return { label: `Due in ${diffHours}h`, urgency: 'urgent' };
  if (diffDays <= 3) return { label: `Due in ${diffDays}d`, urgency: 'soon' };
  return {
    label: due.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    urgency: 'normal',
  };
};

export const urgencyStyle = {
  overdue: 'text-red-600 bg-red-50',
  urgent: 'text-orange-600 bg-orange-50',
  soon: 'text-yellow-600 bg-yellow-50',
  normal: 'text-gray-500 bg-gray-50',
};
