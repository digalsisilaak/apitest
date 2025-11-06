import {
  useContext,
  createContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from "react";

interface Notification {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
  startTime: number;
  duration: number;
  pausedAt?: number;
  currentRemainingDuration: number;
  lastActiveTime: number;
}

interface NotifContextType {
  notifications: Notification[];
  addNotification: (
    message: string,
    type?: "success" | "error" | "info"
  ) => void;
  removeNotification: (id: string) => void;
  pauseNotification: (id: string) => void;
  resumeNotification: (id: string) => void;
}

const NotifContext = createContext<NotifContextType>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  pauseNotification: () => {},
  resumeNotification: () => {},
});

export const useNotifCon = () => {
  const data = useContext(NotifContext);
  return data;
};

export const NotifContextProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timerRefs = useRef<Record<string, NodeJS.Timeout | undefined>>({});

  const removeNotification = useCallback((id: string) => {
    setNotifications((prevNotifications) => {
      if (timerRefs.current[id]) {
        clearTimeout(timerRefs.current[id]);
        delete timerRefs.current[id];
      }
      return prevNotifications.filter((notif) => notif.id !== id);
    });
  }, []);

  const addNotification = useCallback(
    (message: string, type?: "success" | "error" | "info") => {
      const id = Date.now().toString();
      const duration = 1500;
      const startTime = Date.now();

      const newNotification: Notification = {
        id,
        message,
        type,
        startTime,
        duration,
        currentRemainingDuration: duration,
        lastActiveTime: startTime,
      };

      setNotifications((prevNotifications) => {
        return [...prevNotifications, newNotification];
      });

      timerRefs.current[id] = setTimeout(() => {
        removeNotification(id);
      }, duration);
    },
    [removeNotification]
  );

  const pauseNotification = useCallback((id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) => {
        if (notif.id === id) {
          if (timerRefs.current[notif.id]) {
            clearTimeout(timerRefs.current[notif.id]);
            timerRefs.current[notif.id] = undefined;
          }
          const timePassedWhileActive = Date.now() - notif.lastActiveTime;
          const updatedRemainingDuration = Math.max(
            0,
            notif.currentRemainingDuration - timePassedWhileActive
          );

          const updatedNotif = {
            ...notif,
            timerId: undefined,
            pausedAt: Date.now(),
            currentRemainingDuration: updatedRemainingDuration,
          };

          return updatedNotif;
        }
        return notif;
      })
    );
  }, []);

  const resumeNotification = useCallback(
    (id: string) => {
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) => {
          if (notif.id === id && notif.pausedAt) {
            const remainingDuration = notif.currentRemainingDuration;

            if (remainingDuration > 0) {
              if (timerRefs.current[notif.id]) {
                clearTimeout(timerRefs.current[notif.id]);
              }

              const newTimerId = setTimeout(() => {
                removeNotification(id);
              }, remainingDuration);

              timerRefs.current[id] = newTimerId;

              const updatedNotif = {
                ...notif,

                pausedAt: undefined,
                lastActiveTime: Date.now(),
              };

              return updatedNotif;
            } else {
              removeNotification(id);
              return {
                ...notif,
                timerId: undefined,
                pausedAt: undefined,
                currentRemainingDuration: 0,
                lastActiveTime: Date.now(),
              };
            }
          }
          return notif;
        })
      );
    },
    [removeNotification]
  );

  return (
    <NotifContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        pauseNotification,
        resumeNotification,
      }}
    >
      {children}
    </NotifContext.Provider>
  );
};
