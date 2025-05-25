'use client'
import { useQuery } from "@tanstack/react-query";
import { fetchNotifications } from "@/lib/api-functions/cnadidate/notifications.api";
import { Bell, Briefcase, Calendar, Star, UserCheck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MdOutlineEmail } from "react-icons/md";
import Link from "next/link";
import { BiSolidNotification } from "react-icons/bi";

const NotificationDropdown = (
    {redirect}: {redirect: string}
) => {
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications
  });

  const getNotificationIcon = (title: string) => {
    if (title.toLowerCase().includes('application')) return Briefcase;
    if (title.toLowerCase().includes('interview')) return Calendar;
    if (title.toLowerCase().includes('profile')) return UserCheck;
    if (title.toLowerCase().includes('job match')) return Star;
    return Bell;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-2 rounded-full bg-muted/50 hover:bg-primary/30 hover:text-primary relative">
          <MdOutlineEmail className="w-5 h-5" />
          {notifications && notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {Math.min(notifications.length, 9)}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-2 border-b">
          <h4 className="text-sm font-semibold">Recent Notifications</h4>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications?.slice(0, 3).map((notification: any) => {
            const IconComponent = getNotificationIcon(notification.title);
            return (
              <div
                key={notification._id}
                className="p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <div className="p-1.5 rounded-full bg-blue-100">
                    <IconComponent className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notification.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {(!notifications || notifications.length === 0) && (
            <div className="p-3 text-center text-sm text-muted-foreground">
              <p className="flex items-center gap-2 flex-col"><BiSolidNotification className="w-10 h-10 text-primary" />No notifications found</p>
            </div>
          )}
        </div>
        {notifications && notifications.length > 3 && (
          <div className="p-2 border-t">
            <Link
              href={redirect}
              className="text-xs text-primary hover:underline block text-center"
            >
              View all notifications
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
