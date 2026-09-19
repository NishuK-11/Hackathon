import React, { useEffect } from "react";
import { Bell, CalendarDays, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { markAllRead } from "../../redux/slices/notificationSlice";

const NotificationSection = () => {

  const dispatch = useDispatch();

  const notifications = useSelector(
    (state) => state.notification.notifications
  );

  useEffect(() => {
    dispatch(markAllRead());
  }, [dispatch]);

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-slate-950">

      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">

          <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
            <Bell
              size={24}
              className="text-blue-600 dark:text-blue-400"
            />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Notifications
            </h1>

            <p className="text-sm text-gray-500 dark:text-slate-400">
              Stay updated with your latest notifications
            </p>
          </div>

        </div>

        {/* Notification List */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">

          {notifications.length === 0 ? (

            <div className="p-10 text-center">

              <Bell
                size={40}
                className="mx-auto mb-3 text-gray-400"
              />

              <h2 className="text-lg font-medium text-gray-700 dark:text-white">
                No notifications
              </h2>

              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                You are all caught up.
              </p>

            </div>

          ) : (

            notifications.map((notification) => (

              <div
                key={notification.id}
                className="flex gap-4 p-5 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >

                {/* Icon */}
                <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">

                  <CalendarDays
                    size={21}
                    className="text-blue-600 dark:text-blue-400"
                  />

                </div>

                {/* Content */}
                <div className="flex-1">

                  <div className="flex justify-between gap-4">

                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {notification.message}
                    </h3>

                    {notification.createdAt && (
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(
                          notification.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    )}

                  </div>

                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                    A new appointment has been booked.
                  </p>

                  {notification.reason && (
                    <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">
                      Reason: {notification.reason}
                    </p>
                  )}

                </div>

              </div>

            ))

          )}

        </div>

      </div>

    </div>
  );
};

export default NotificationSection;