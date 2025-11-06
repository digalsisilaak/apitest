import React, { useEffect } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useNotifCon } from "../lib/NotifContext";

interface NotificationToastProps {
  notif: {
    id: string;
    message: string;
    type?: "success" | "error" | "info";
    startTime: number;
    duration: number;
    pausedAt?: number;
    currentRemainingDuration: number;
  };
  removeNotification: (id: string) => void;
  pauseNotification: (id: string) => void;
  resumeNotification: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notif,
  removeNotification,
  pauseNotification,
  resumeNotification,
}) => {
  const controls = useAnimationControls();

  const handleMouseEnter = () => {
    pauseNotification(notif.id);
    controls.stop();
  };

  const handleMouseLeave = () => {
    resumeNotification(notif.id);
  };

  useEffect(() => {
    if (notif.currentRemainingDuration <= 0) {
      controls.set({ width: "0%" });
      controls.stop();
      removeNotification(notif.id);
      return;
    }

    if (notif.pausedAt) {
      const progressWidth =
        (notif.currentRemainingDuration / notif.duration) * 100;
      controls.set({ width: `${progressWidth}%` });
      controls.stop();
    } else {
      const progressWidth =
        (notif.currentRemainingDuration / notif.duration) * 100;

      controls.stop();
      controls.set({ width: `${progressWidth}%` });

      controls.start({
        width: "0%",
        transition: {
          duration: notif.currentRemainingDuration / 1000,
          ease: "linear",
        },
      });
    }
  }, [
    notif.id,
    notif.duration,
    notif.pausedAt,
    notif.currentRemainingDuration,
    controls,
    removeNotification,
  ]);

  return (
    <motion.div
      key={notif.id}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
      drag="x"
      dragConstraints={{ left: 0 }}
      onDragEnd={(event, info) => {
        if (info.offset.x > 100) {
          removeNotification(notif.id);
        }
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`text-white px-4 py-2.5 rounded-md mb-2.5 flex flex-col justify-between items-start overflow-hidden relative max-w-xs ${
        notif.type === "success"
          ? "bg-green-600"
          : notif.type === "error"
          ? "bg-red-600"
          : "bg-blue-600"
      }`}
    >
      <div className="flex justify-between items-center w-full">
        <span>{notif.message}</span>
        <button
          onClick={() => removeNotification(notif.id)}
          className="bg-transparent border-none text-white ml-2.5 cursor-pointer text-base"
        >
          &times;
        </button>
      </div>
      <motion.div
        className="h-1 bg-black/20 w-full absolute bottom-0 left-0"
        style={{ width: "100%" }}
        animate={controls}
      />
    </motion.div>
  );
};

const NotificationDisplay = () => {
  const {
    notifications,
    removeNotification,
    pauseNotification,
    resumeNotification,
  } = useNotifCon();

  return (
    <div className="fixed top-5 right-5 z-50">
      <AnimatePresence>
        {notifications.map((notif) => (
          <NotificationToast
            key={notif.id}
            notif={notif}
            removeNotification={removeNotification}
            pauseNotification={pauseNotification}
            resumeNotification={resumeNotification}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDisplay;
