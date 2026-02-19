import { useState, useEffect, useRef } from "react";
import { TbAlertHexagon } from "react-icons/tb";

const AutoConfirmToast = ({
  onConfirm,
  onCancel,
  message = "آیا مطمئن هستید؟",
}) => {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef(null);
  const confirmTimerRef = useRef(null);
  const DURATION = 3000;
  const TICK = 30;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev - (TICK / DURATION) * 100;
        return next <= 0 ? 0 : next;
      });
    }, TICK);

    confirmTimerRef.current = setTimeout(() => {
      handleConfirm();
    }, DURATION);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(confirmTimerRef.current);
    };
  }, []);

  const handleConfirm = () => {
    clearInterval(intervalRef.current);
    clearTimeout(confirmTimerRef.current);
    setVisible(false);
    setTimeout(onConfirm, 300);
  };

  const handleCancel = () => {
    clearInterval(intervalRef.current);
    clearTimeout(confirmTimerRef.current);
    setVisible(false);
    setTimeout(onCancel, 300);
  };

  const seconds = Math.ceil((progress / 100) * (DURATION / 1000));

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: visible
          ? "translateX(-50%) translateY(0)"
          : "translateX(-50%) translateY(100px)",
        opacity: visible ? 1 : 0,
        transition:
          "transform 0.35s cubic-bezier(0.34,1.4,0.64,1), opacity 0.3s ease",
        zIndex: 9999,
        width: 340,
        maxWidth: "calc(100vw - 32px)",
        direction: "rtl",
      }}
    >
      <div
        style={{
          background: "#431407",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(234,88,12,0.2)",
        }}
      >
        <div
          style={{
            height: 3,
            background: "rgba(255,255,255,0.08)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, #ea580c, #fb923c)",
              width: `${progress}%`,
              transition: `width ${TICK}ms linear`,
              borderRadius: 3,
            }}
          />
        </div>

        <div
          style={{
            padding: "14px 16px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TbAlertHexagon
              className="w-6 h-6 animate-bounce motion-reduce:animate-none"
              style={{ color: "#fb923c" }}
            />

            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 13.5,
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                {message}
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 12,
                }}
              >
                {seconds > 0
                  ? `${seconds} ثانیه دیگر تأیید می‌شود`
                  : "در حال ارسال..."}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleCancel}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 10,
                border: "none",
                background: "rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.target.style.background = "rgba(255,255,255,0.12)")
              }
              onMouseLeave={(e) =>
                (e.target.style.background = "rgba(255,255,255,0.07)")
              }
            >
              خیر، لغو شود
            </button>
            <button
              onClick={handleConfirm}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 10,
                border: "none",
                background: "rgba(234,88,12,0.25)",
                color: "#fdba74",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.target.style.background = "rgba(234,88,12,0.4)")
              }
              onMouseLeave={(e) =>
                (e.target.style.background = "rgba(234,88,12,0.25)")
              }
            >
              همین الان تأیید
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoConfirmToast;
