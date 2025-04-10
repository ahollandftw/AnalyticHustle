"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type Notification = {
  id: string
  message: string
  type: "homerun" | "touchdown" | "goal" | "basket" | "info"
  teamColor?: string
}

type NotificationContextType = {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id">) => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setNotifications((prev) => [...prev, { ...notification, id }])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []

    notifications.forEach((notification) => {
      const timeout = setTimeout(() => {
        removeNotification(notification.id)
      }, 5000)

      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [notifications])

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "flex items-center gap-2 rounded-md p-4 shadow-md transition-all",
              notification.teamColor ? `bg-opacity-90 text-white` : "bg-background border",
            )}
            style={notification.teamColor ? { backgroundColor: notification.teamColor } : {}}
          >
            <div className="flex-1">{notification.message}</div>
            <button onClick={() => removeNotification(notification.id)} className="rounded-full p-1 hover:bg-black/10">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
