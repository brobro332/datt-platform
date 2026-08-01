"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { useNotifications, useUnreadNotificationCount } from "@/hooks/useNotifications";
import { notificationService } from "@/services/notificationService";
import { useQueryClient } from "@tanstack/react-query";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: notificationsData } = useNotifications(0, 10);
  const { data: unreadData } = useUnreadNotificationCount();
  const queryClient = useQueryClient();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRead = async (id: number) => {
    // Optimistic update for immediate UI response
    queryClient.setQueryData(["notifications", 0, 10], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        content: oldData.content.map((n: any) =>
          n.id === id ? { ...n, read: true } : n
        ),
      };
    });
    
    // Decrement unread count optimistically if greater than 0
    queryClient.setQueryData(["unreadNotificationCount"], (oldData: any) => {
      if (!oldData || oldData.count <= 0) return oldData;
      return { ...oldData, count: oldData.count - 1 };
    });

    try {
      await notificationService.readNotification(id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadAll = async () => {
    // Optimistic update for immediate UI response
    queryClient.setQueryData(["notifications", 0, 10], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        content: oldData.content.map((n: any) => ({ ...n, read: true })),
      };
    });
    queryClient.setQueryData(["unreadNotificationCount"], { count: 0 });

    try {
      await notificationService.readAllNotifications();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    } catch (err) {
      console.error(err);
    }
  };

  const notifications = notificationsData?.content || [];
  const unreadCount = unreadData?.count || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            handleReadAll();
          }
        }}
        className="relative p-2 rounded-xl text-slate-650 hover:bg-slate-50 transition cursor-pointer flex items-center justify-center"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xs font-extrabold text-slate-800">알림</h3>
          </div>
          <div className="max-h-[320px] overflow-y-auto p-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                새로운 알림이 없습니다.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.read) handleRead(notif.id);
                  }}
                  className={`p-3 rounded-xl mb-1 cursor-pointer transition-colors ${
                    notif.read ? "bg-white hover:bg-slate-50" : "bg-indigo-50/40 hover:bg-indigo-50/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-[11px] font-bold truncate ${notif.read ? "text-slate-600" : "text-slate-900"}`}>
                        {notif.title}
                      </h4>
                      <p className={`text-[10px] mt-0.5 leading-snug line-clamp-2 ${notif.read ? "text-slate-500" : "text-slate-700"}`}>
                        {notif.content}
                      </p>
                      <p className="text-[9px] mt-1.5 text-slate-400">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
