// client/src/components/common/DevApiInfo.jsx

import { useEffect, useState } from "react";

import { API_BASE_URL } from "../../config/apiConfig";

export default function DevApiInfo() {
  const [serverStatus, setServerStatus] = useState("checking");

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return undefined;
    }

    const controller = new AbortController();

    async function checkServerStatus() {
      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setServerStatus("offline");
          return;
        }

        setServerStatus("online");
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        console.error(error);
        setServerStatus("offline");
      }
    }

    checkServerStatus();

    return () => controller.abort();
  }, []);

  if (!import.meta.env.DEV) {
    return null;
  }

  const statusLabel =
    serverStatus === "checking"
      ? "Server wird geprüft"
      : serverStatus === "online"
        ? "Server erreichbar"
        : "Server nicht erreichbar";

  return (
    <div className="dev-api-info">
      API: <code>{API_BASE_URL}</code>
      <span className={`dev-api-status dev-api-status-${serverStatus}`}>
        {statusLabel}
      </span>
    </div>
  );
}
