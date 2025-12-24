import { Bell, Check, X, AlertTriangle, FileText, Clock, Users, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications, NotificationType } from '@/contexts/NotificationsContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const notificationIcons: Record<NotificationType, typeof Bell> = {
  contract_expiring: FileText,
  justification_pending: FileText,
  sanction_pending: AlertTriangle,
  task_due: ListTodo,
  vacation_request: Users,
  evaluation_pending: Users,
  attendance_issue: Clock,
  general: Bell,
};

const priorityColors = {
  high: 'border-l-destructive',
  medium: 'border-l-warning',
  low: 'border-l-muted',
};

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) {
      navigate(link);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[500px] overflow-y-auto">
        <div className="flex items-center justify-between px-2">
          <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              <Check className="w-3 h-3 mr-1" />
              Marcar todo leído
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay notificaciones</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => {
            const Icon = notificationIcons[notification.type];
            return (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex items-start gap-3 p-3 cursor-pointer border-l-4",
                  priorityColors[notification.priority],
                  !notification.isRead && "bg-muted/50"
                )}
                onClick={() => handleNotificationClick(notification.id, notification.link)}
              >
                <div className={cn(
                  "p-2 rounded-lg shrink-0",
                  notification.priority === 'high' ? "bg-destructive/10" :
                  notification.priority === 'medium' ? "bg-warning/10" : "bg-muted"
                )}>
                  <Icon className={cn(
                    "w-4 h-4",
                    notification.priority === 'high' ? "text-destructive" :
                    notification.priority === 'medium' ? "text-warning" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm font-medium", !notification.isRead && "font-semibold")}>
                      {notification.title}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 shrink-0 opacity-50 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification(notification.id);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true, locale: es })}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
