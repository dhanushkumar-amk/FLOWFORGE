'use client';

/**
 * useSocket — Phase 25
 *
 * Singleton Socket.io client for the browser.
 * - Connects lazily on first call, reuses the same socket on subsequent calls.
 * - Injects the Clerk session token in the handshake auth.
 * - Auto-disconnects when all components unmount (refCount → 0).
 *
 * Usage:
 *   const socket = useSocket();
 *   socket.emit(EVENTS.JOIN_WORKFLOW, { workflowId });
 *   socket.on(EVENTS.DAG_UPDATED, handler);
 */

import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';

// ── Module-level singleton so the socket survives re-renders ──────────────────
let globalSocket: Socket | null = null;
let refCount = 0;

async function getClerkToken(): Promise<string | null> {
  try {
    const clerk = (window as any).Clerk;
    if (clerk?.session) {
      return await clerk.session.getToken();
    }
    return null;
  } catch {
    return null;
  }
}

async function createSocket(): Promise<Socket> {
  const token = await getClerkToken();

  const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000', {
    auth: { token: token ?? '' },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
}

export function useSocket(): Socket | null {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let mounted = true;

    const connect = async () => {
      if (!globalSocket || !globalSocket.connected) {
        globalSocket = await createSocket();
      }

      if (mounted) {
        socketRef.current = globalSocket;
        refCount++;
      }
    };

    connect();

    return () => {
      mounted = false;
      refCount--;

      // Only disconnect when the last consumer unmounts
      if (refCount <= 0 && globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        refCount = 0;
      }
    };
  }, []);

  return socketRef.current;
}
