<script setup lang="ts">
import { ref, computed, watch, shallowRef } from 'vue';
import { useSignalR } from '@/composables/useSignalR';

const hubUrl = ref<string>('');
const eventName = ref<string>('');
const methodName = ref<string>('');
const methodPayload = ref<string>('');
const eventLogs = ref<Array<{ type: string; event: string; data: unknown }>>([]);

const signalRComposable = shallowRef();

const isConnecting = computed(() => signalRComposable.value?.isConnecting.value ?? false);
const isConnected = computed(() => signalRComposable.value?.isConnected.value ?? false);
const connectionError = computed(() => signalRComposable.value?.connectionError.value);

function addEventLog(type: string, event: string, data: unknown) {
  eventLogs.value.unshift({
    type,
    event,
    data: typeof data === 'object' ? JSON.stringify(data) : data,
  });

  if (eventLogs.value.length > 50) {
    eventLogs.value.pop();
  }
}

function getLogColor(type: string) {
  switch (type) {
    case 'received':
      return 'success';
    case 'sent':
      return 'info';
    case 'error':
      return 'error';
    case 'system':
      return 'neutral';
    default:
      return 'primary';
  }
}

function initializeConnection() {
  if (!hubUrl.value) return;

  signalRComposable.value = useSignalR(hubUrl.value);

  signalRComposable.value.connect();

  watch(
    () => signalRComposable.value?.isConnected.value,
    (connected) => {
      if (connected) {
        addEventLog('system', 'Connection Established', {});
      }
    },
  );

  watch(
    () => signalRComposable.value?.connectionError.value,
    (error) => {
      if (error) {
        addEventLog('error', 'Connection Error', error.message);
      }
    },
  );
}

function subscribeToEvent() {
  if (!signalRComposable.value || !eventName.value) return;

  signalRComposable.value.on(eventName.value, (data: unknown) => {
    addEventLog('received', eventName.value, data);
  });

  addEventLog('system', `Subscribed to ${eventName.value}`, {});
}

async function invokeMethod() {
  if (!signalRComposable.value || !methodName.value) return;

  try {
    let payload = methodPayload.value;
    try {
      payload = JSON.parse(methodPayload.value);
    } catch {
      console.error('Invalid JSON payload');
    }

    const result = await signalRComposable.value.invoke(methodName.value, payload);
    addEventLog('sent', methodName.value, result);
  } catch (error) {
    addEventLog('error', 'Method Invocation Error', error);
  }
}

function disconnect() {
  if (signalRComposable.value) {
    signalRComposable.value.disconnect();
    addEventLog('system', 'Disconnected', {});
    signalRComposable.value = null;
  }
}
</script>

<template>
  <UApp>
    <div class="container mx-auto p-6">
      <UCard>
        <template #header>
          <h1 class="text-2xl font-bold">SignalR Connection Tester</h1>
        </template>

        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField :color="connectionError ? 'error' : 'neutral'" label="SignalR Hub URL">
              <UInput
                v-model="hubUrl"
                size="lg"
                placeholder="Enter SignalR Hub URL"
                :disabled="isConnected"
              />

              <UBadge v-if="connectionError" color="error" class="ml-2" label="Failed" size="sm" />
            </UFormField>

            <UFormField label="Connection Actions">
              <div class="flex space-x-2">
                <UButton
                  size="lg"
                  :disabled="isConnected || !hubUrl"
                  :loading="isConnecting"
                  :label="isConnecting ? 'Connecting' : 'Connect'"
                  @click="initializeConnection"
                />

                <UButton
                  color="error"
                  size="lg"
                  label="Disconnect"
                  :disabled="!isConnected"
                  @click="disconnect"
                />
              </div>
            </UFormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Subscribe to Event">
              <div class="flex space-x-2">
                <UInput
                  size="lg"
                  placeholder="Event Name"
                  v-model="eventName"
                  :disabled="!isConnected"
                />

                <UButton
                  size="lg"
                  label="Subscribe"
                  :disabled="!isConnected || !eventName"
                  @click="subscribeToEvent"
                />
              </div>
            </UFormField>

            <UFormField label="Invoke Method">
              <div class="flex space-x-2 items-center">
                <UInput
                  size="lg"
                  placeholder="Method Name"
                  :disabled="!isConnected"
                  v-model="methodName"
                />

                <UInput
                  size="lg"
                  class="flex-grow"
                  placeholder="Payload (JSON)"
                  :disabled="!isConnected"
                  v-model="methodPayload"
                />
                <UButton
                  size="lg"
                  label="Invoke"
                  @click="invokeMethod"
                  :disabled="!isConnected || !methodName"
                />
              </div>
            </UFormField>
          </div>

          <div class="mt-4">
            <h2 class="text-xl font-semibold mb-2">Event Logs</h2>

            <UCard>
              <ScrollArea class="h-64 text-sm">
                <div v-for="(log, index) in eventLogs" :key="index" class="mb-2">
                  <UBadge
                    variant="soft"
                    class="mr-2"
                    :color="getLogColor(log.type)"
                    :label="log.type"
                  />
                  <span>{{ log.event }}: {{ log.data }}</span>
                </div>
              </ScrollArea>
            </UCard>
          </div>
        </div>
      </UCard>
    </div>
  </UApp>
</template>
