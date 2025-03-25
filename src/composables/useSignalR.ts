import { ref, onMounted, onUnmounted } from 'vue';
import * as signalR from '@microsoft/signalr';

export function useSignalR<T = unknown>(hubUrl: string) {
  // Connection state
  const isConnected = ref(false);
  const connection = ref<signalR.HubConnection | null | undefined>(null);
  const connectionError = ref<Error | null | undefined>(null);

  // Reactive events storage
  const events = ref<Record<string, unknown[]>>({});

  // Create connection
  async function connect() {
    try {
      // Create new connection
      connection.value = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .build();

      // Connection event handlers
      connection.value.onclose((error) => {
        isConnected.value = false;
        connectionError.value = error;
      });

      // Start connection
      await connection.value.start();
      isConnected.value = true;
    } catch (error) {
      isConnected.value = false;
      connectionError.value = error instanceof Error ? error : new Error(String(error));
    }
  }

  // Disconnect from hub
  async function disconnect() {
    try {
      if (connection.value) {
        await connection.value.stop();
        isConnected.value = false;
      }
    } catch (error) {
      connectionError.value = error instanceof Error ? error : new Error(String(error));
    }
  }

  // Listen to specific event
  function on(eventName: string, callback: (...args: unknown[]) => void) {
    if (connection.value) {
      connection.value.on(eventName, (...args) => {
        if (!events.value[eventName]) {
          events.value[eventName] = [];
        }

        // Store event in reactive events
        events.value[eventName].push(args);

        // Call the provided callback
        callback(...args);
      });
    }
  }

  // Invoke server method
  async function invoke<R = T>(methodName: string, ...args: unknown[]): Promise<R | null> {
    try {
      if (connection.value) {
        return await connection.value.invoke<R>(methodName, ...args);
      }
      return null;
    } catch (error) {
      connectionError.value = error instanceof Error ? error : new Error(String(error));
      return null;
    }
  }

  // Auto-connect on mount, disconnect on unmount
  onMounted(connect);
  onUnmounted(disconnect);

  // Return composable methods and states
  return {
    connection,
    isConnected,
    connectionError,
    events,
    connect,
    disconnect,
    on,
    invoke,
  };
}
