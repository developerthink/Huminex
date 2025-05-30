'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { fetchNotifications } from '@/lib/api-functions/cnadidate/notifications.api';
import { Bell, Briefcase, Calendar, Star, UserCheck } from 'lucide-react';
import { BiSolidNotification } from "react-icons/bi";
import WbLoader from '@/components/global-cmp/wbLoader';
import { MdErrorOutline } from 'react-icons/md';
import { SlEnvolopeLetter } from 'react-icons/sl';

interface Notification {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}

const getNotificationIcon = (title: string) => {
  if (title.toLowerCase().includes('application')) return Briefcase;
  if (title.toLowerCase().includes('interview')) return Calendar;
  if (title.toLowerCase().includes('profile')) return UserCheck;
  if (title.toLowerCase().includes('Job Invitation')) return SlEnvolopeLetter;
  if (title.toLowerCase().includes('Welcome to Huminex')) return Bell;
  return Bell;
};

const NotificationCard = ({ notification }: { notification: Notification }) => {
  const IconComponent = getNotificationIcon(notification.title);
  return (
    <Card className="mb-4 border transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-blue-100 shrink-0">
            <IconComponent className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium mb-1">{notification.title}</h3>
            <div
              className="!text-[14px]"
              dangerouslySetInnerHTML={{ __html: notification.content }}
            />
            <p className="text-xs text-muted-foreground">
              {new Date(notification.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const NotificationsPage = () => {
  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications
  });

  if (isLoading) {
    return (
      <WbLoader/>
    );
  }

  if (error) {
    return (
      <div className=" gap-2 p-8 grid place-items-baseline w-full">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-sm text-red-500 flex flex-col gap-2"><MdErrorOutline className='w-8 h-8' />{error?.message || 'Error loading notifications'}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center mt-5 flex-col w-full">
      <div className="flex flex-col w-full gap-2 p-8 bgGrad text-white rounded-xl">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-sm ">Manage your notifications here</p>
      </div>
      <br />
      <div className="space-y-4 w-full">
        {notifications?.map((notification: Notification) => (
          <NotificationCard key={notification._id} notification={notification} />
        ))}
        {notifications?.length === 0 && (
          <p className="flex items-center gap-2 text-xl flex-col"><BiSolidNotification className="w-20 h-20 text-primary" />No notifications found</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;