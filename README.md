# Vue SignalR Composable

## Overview

A lightweight, type-safe Vue composable for seamless SignalR hub integration with automatic connection management and reactive event handling.

## Prerequisites

- Vue 3
- TypeScript
- SignalR

## Installation

### Package Installation

Install the required dependencies:

```bash
bun add @microsoft/signalr vue
```

### TypeScript Types (Optional but Recommended)

```bash
bun add -D @types/signalr
```

## Composable Contents

The `useSignalR` composable provides the following reactive properties and methods:

### Reactive Properties

- `connection`: Current SignalR connection instance
- `isConnected`: Reactive boolean indicating connection status
- `connectionError`: Reactive error object for connection issues
- `events`: Reactive storage of received events

### Methods

- `connect()`: Manually establish SignalR connection
- `disconnect()`: Manually close SignalR connection
- `on(eventName, callback)`: Listen to specific server events
- `invoke(methodName, ...args)`: Invoke server methods

## Usage Example

### Basic Implementation

```typescript
<script setup lang="ts">
import { ref } from 'vue'
import { useSignalR } from '@/composables/useSignalR'

// Define data interface
interface Message {
  user: string
  text: string
  timestamp: Date
}

// Create SignalR connection
const {
  isConnected,
  connectionError,
  on,
  invoke
} = useSignalR<Message>('https://your-signalr-hub-url')

// Reactive messages list
const messages = ref<Message[]>([])
const newMessage = ref('')

// Listen for incoming messages
on('ReceiveMessage', (message: Message) => {
  messages.value.push(message)
})

// Send a message
async function sendMessage() {
  if (isConnected.value && newMessage.value.trim()) {
    await invoke('SendMessage', {
      user: 'CurrentUser',
      text: newMessage.value,
      timestamp: new Date()
    })
    newMessage.value = '' // Clear input after sending
  }
}
</script>
```

## Advanced Usage

### Manual Connection Management

```typescript
const { connect, disconnect, isConnected } = useSignalR('https://your-hub-url');

// Manually control connection
function toggleConnection() {
  if (isConnected.value) {
    disconnect();
  } else {
    connect();
  }
}
```

### Multiple Event Listeners

```typescript
// Listen to multiple events
on('Event1', (data) => {
  // Handle Event1
});

on('Event2', (data) => {
  // Handle Event2
});
```

## Configuration Options

### Customization

- Supports generic typing for type-safe event handling
- Automatic connection on component mount
- Automatic disconnection on component unmount
- Built-in error handling

## Error Handling

```typescript
const { connectionError } = useSignalR('https://your-hub-url');

// Check and handle connection errors
if (connectionError.value) {
  console.error('Connection failed:', connectionError.value.message);
}
```

## Notes

- Ensure your SignalR hub URL is correct
- Handle authentication if required by your hub
- Consider network and connection stability

## Typescript Support

Fully typed with generics for flexible and type-safe usage.
