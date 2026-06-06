// client/src/components/common/DevApiInfo.jsx

import { API_BASE_URL } from "../../config/apiConfig";

export default function DevApiInfo() {
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="dev-api-info">
      API: <code>{API_BASE_URL}</code>
    </div>
  );
}
