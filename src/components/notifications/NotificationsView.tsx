import { ArrowLeft, Bell, Briefcase, MessageSquare, DollarSign, Info } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface NotificationsViewProps {
  onClose: () => void;
}

export function NotificationsView({ onClose }: NotificationsViewProps) {
  const { state, dispatch } = useApp();
  const notifications = state.notifications;

  const getIcon = (type: string) => {
    switch (type) {
      case 'job': return Briefcase;
      case 'message': return MessageSquare;
      case 'payment': return DollarSign;
      default: return Info;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'job': return 'bg-blue-100 text-blue-600';
      case 'message': return 'bg-emerald-100 text-emerald-600';
      case 'payment': return 'bg-amber-100 text-amber-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleMarkRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  const handleMarkAllRead = () => {
    notifications.forEach(n => {
      if (!n.isRead) dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id });
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-title">Notifications</h1>
          </div>
          {state.unreadNotifications > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="text-sm text-emerald-600 font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No notifications yet</p>
            <p className="text-caption text-gray-400">
              We'll notify you about jobs, messages, and payments
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = getIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  onClick={() => handleMarkRead(notification.id)}
                  className={`bg-white rounded-xl p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                    notification.isRead ? 'opacity-70' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm">{notification.title}</p>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-small text-gray-500 mt-1">{notification.message}</p>
                    <p className="text-caption text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleString('en-KE', {
                        hour: 'numeric',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
