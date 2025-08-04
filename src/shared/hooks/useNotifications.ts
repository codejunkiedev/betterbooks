import { useState, useEffect, useCallback } from "react";
import { getUnreadMessageCount } from "@/shared/services/supabase/message";

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadUnreadCount = useCallback(async () => {
    try {
      const { count, error } = await getUnreadMessageCount();
      if (error) {
        console.error("Error loading unread count:", error);
        return;
      }
      setUnreadCount(count);
    } catch (error) {
      console.error("Error in loadUnreadCount:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  const refreshUnreadCount = useCallback(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  return {
    unreadCount,
    isLoading,
    refreshUnreadCount,
  };
} 