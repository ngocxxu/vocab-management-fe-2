import type { TNotification, TNotificationInput, TUpdateNotificationStatusInput } from '@/types/notification';
import { useEffect, useState } from 'react';
import { notificationsApi } from '@/utils/client-api';

export const useNotifications = () => {
  const [data, setData] = useState<{ items: TNotification[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await notificationsApi.getMy();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const mutate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await notificationsApi.getMy();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    notifications: data?.items || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const useUnreadNotifications = () => {
  const [data, setData] = useState<{ items: TNotification[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await notificationsApi.getUnread();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const mutate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await notificationsApi.getUnread();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    unreadNotifications: data?.items || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const useUnreadCount = () => {
  const [data, setData] = useState<{ count: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await notificationsApi.getUnreadCount();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const mutate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await notificationsApi.getUnreadCount();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    unreadCount: data?.count || 0,
    isLoading,
    isError: error,
    mutate,
  };
};

export const useNotification = (id: string | null) => {
  const [data, setData] = useState<TNotification | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await notificationsApi.getById(id);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const mutate = async () => {
    if (!id) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await notificationsApi.getById(id);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    notification: data,
    isLoading,
    isError: error,
    mutate,
  };
};

export const notificationMutations = {
  markAsRead: async (id: string) => {
    return await notificationsApi.markAsRead(id);
  },
  markAllAsRead: async () => {
    return await notificationsApi.markAllAsRead();
  },
  delete: async (id: string) => {
    return await notificationsApi.delete(id);
  },
  create: async (notificationData: TNotificationInput) => {
    return await notificationsApi.create(notificationData);
  },
  update: async (id: string, notificationData: Partial<TNotificationInput>) => {
    return await notificationsApi.update(id, notificationData);
  },
  updateStatus: async (id: string, statusData: TUpdateNotificationStatusInput) => {
    return await notificationsApi.updateStatus(id, statusData);
  },
};
