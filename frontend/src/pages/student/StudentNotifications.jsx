import { useState } from 'react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import notificationService from '../../services/notificationService';
import { useNotifications } from '../../context/NotificationContext';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';

const typeIcon = {
  assignment: '📌',
  marks: '🎯',
  attendance: '📋',
  deadline: '⏰',
  general: '🔔',
};

const typeVariant = {
  assignment: 'blue',
  marks: 'green',
  attendance: 'yellow',
  deadline: 'red',
  general: 'gray',
};

const StudentNotifications = () => {
  const { data: notifications, loading, error, refetch } = useFetch(notificationService.getAll);
  const { setUnreadCount, refetchCount } = useNotifications();
  const [markingAll, setMarkingAll] = useState(false);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      refetch();
      refetchCount();
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      toast.success('All notifications marked as read');
      setUnreadCount(0);
      refetch();
    } catch {
      toast.error('Failed');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      refetch();
      refetchCount();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const unread = notifications?.filter((n) => !n.isRead).length || 0;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up'}
        action={
          unread > 0 ? (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="text-sm text-blue-600 hover:underline disabled:opacity-60"
            >
              {markingAll ? 'Marking...' : 'Mark all as read'}
            </button>
          ) : null
        }
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : !notifications?.length ? (
        <EmptyState icon="🔔" title="No notifications yet" description="You'll see assignment updates, marks, and more here" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`rounded-xl border p-4 flex items-start gap-4 transition ${
                n.isRead ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-200'
              }`}
            >
              {/* Icon */}
              <div className="text-2xl shrink-0 mt-0.5">{typeIcon[n.type] || '🔔'}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-medium ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                    {n.title}
                  </p>
                  <Badge label={n.type} variant={typeVariant[n.type] || 'gray'} />
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.createdAt).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n._id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n._id)}
                  className="text-xs text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentNotifications;
