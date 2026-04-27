import { useEffect, useRef, useState, useCallback } from "react";

interface UseTableWebSocketOptions {
  url?: string;
  sendParam?: string;
  enabled?: boolean;
}

interface UseTableWebSocketReturn {
  wsData: any[] | null;
  wsStatus: "idle" | "connecting" | "connected" | "disconnected" | "error";
  sendMessage: (msg: string) => void;
  reconnect: () => void;
}

export function useTableWebSocket({
  url,
  sendParam,
  enabled = true,
}: UseTableWebSocketOptions): UseTableWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const [wsData, setWsData] = useState<any[] | null>(null);
  const [wsStatus, setWsStatus] = useState<
    "idle" | "connecting" | "connected" | "disconnected" | "error"
  >("idle");
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  const parseWsMessage = (raw: string): any[] | null => {
    try {
      const parsed = JSON.parse(raw);
      // Handle various response shapes
      if (Array.isArray(parsed)) return parsed;
      if (parsed?.data && Array.isArray(parsed.data)) return parsed.data;
      if (parsed?.Data && Array.isArray(parsed.Data)) return parsed.Data;
      if (parsed?.rows && Array.isArray(parsed.rows)) return parsed.rows;
      if (parsed?.Rows && Array.isArray(parsed.Rows)) return parsed.Rows;
      if (parsed?.Table && Array.isArray(parsed.Table)) return parsed.Table;
      // Single object — wrap in array
      if (typeof parsed === "object" && parsed !== null) return [parsed];
    } catch {
      // Not JSON — ignore
    }
    return null;
  };

  const connect = useCallback(() => {
    if (!url || !enabled) return;

    // Close any existing connection
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    if (!mountedRef.current) return;

    setWsStatus("connecting");

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      setWsStatus("connected");
      // Send the parameter immediately after connection
      if (sendParam) {
        ws.send(sendParam);
      }
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;
      const parsed = parseWsMessage(event.data);
      if (parsed !== null) {
        setWsData(parsed);
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setWsStatus("disconnected");
    };

    ws.onerror = () => {
      if (!mountedRef.current) return;
      setWsStatus("error");
    };
  }, [url, sendParam, enabled]);

  // Connect on mount / when url or sendParam changes
  useEffect(() => {
    mountedRef.current = true;
    if (url && enabled) {
      connect();
    }
    return () => {
      mountedRef.current = false;
      clearReconnectTimer();
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [url, sendParam, enabled, connect]);

  const sendMessage = useCallback((msg: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(msg);
    }
  }, []);

  const reconnect = useCallback(() => {
    clearReconnectTimer();
    connect();
  }, [connect]);

  return { wsData, wsStatus, sendMessage, reconnect };
}
