<script setup lang="ts">
import { LucidePower, LucideRadioTower, LucideLoader } from 'lucide-vue-next';
import { ref } from 'vue';

import * as signalR from '@microsoft/signalr';

import AppInput from '@/components/AppInput.vue';
import AppButton from '@/components/AppButton.vue';

const url = ref<string>('');
const error = ref();
const isConnecting = ref(false);
const connection = ref<signalR.HubConnection | null>(null);
const connectionStatus = ref<string>('Not Connected');
const connectionHubMethodName = ref<string>('');
const connectionValue = ref();

const connectToSignalR = async () => {
  // Validate URL
  if (!url.value || !connectionHubMethodName.value) {
    connectionStatus.value = 'Please complete all fields';
    return;
  }

  isConnecting.value = true;

  try {
    // Disconnect existing connection if any
    if (connection.value) {
      await connection.value.stop();
    }

    // Create new connection
    connection.value = new signalR.HubConnectionBuilder()
      .withUrl(url.value)
      .withAutomaticReconnect()
      .build();

    // Setup listeners
    connection.value.on(connectionHubMethodName.value, (data) => {
      connectionValue.value = data;
    });

    // Handle connection events
    connection.value.onclose(() => {
      connectionStatus.value = 'Disconnected';
    });

    // Start the connection
    await connection.value.start();
    connectionStatus.value = 'Connected';
    console.log('Connected to SignalR hub');
  } catch (err) {
    disconnectSignalR();

    error.value = err;
    connectionStatus.value = 'Connection Failed';
    console.error('SignalR connection error:', err);
  } finally {
    isConnecting.value = false;
  }
};

const disconnectSignalR = async () => {
  if (connection.value) {
    try {
      await connection.value.stop();
      connectionStatus.value = 'Disconnected';
      connection.value = null;
    } catch (err) {
      console.error('Error disconnecting:', err);
    }
  }
};
</script>

<template>
  <div class="bg-zinc-900 text-zinc-300 h-svh font-mono p-4">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-4">
        <div>
          <label for="url">Connection Hub URL</label>
          <AppInput
            v-model="url"
            name="url"
            placeholder="ex: http://localhost:3000/signalr"
            class="w-full"
          />
        </div>

        <div>
          <label for="hub-method-name">Connection Hub Method Name</label>
          <AppInput
            v-model="connectionHubMethodName"
            name="hub-method-name"
            placeholder="ex: MethodHubName"
            class="w-full"
          />
        </div>

        <div class="flex items-center gap-1">
          <AppButton
            @click="connectToSignalR"
            :disabled="!url || !connectionHubMethodName"
            class="w-[6.551rem] justify-center gap-1"
          >
            <LucideLoader v-if="isConnecting" :size="16" class="animate-spin" />

            <template v-else>
              <span>Connect</span>
              <LucidePower :size="16" />
            </template>
          </AppButton>

          <AppButton v-if="!isConnecting && connection" @click="disconnectSignalR" variant="error">
            Disconnect
          </AppButton>
        </div>
      </div>

      <div>
        <div class="border-zinc-700 bg-zinc-800 border rounded-md p-4 flex items-center gap-4">
          <LucideRadioTower class="stroke-emerald-400" />

          <div class="grid">
            <span class="text-zinc-400 uppercase">Connection Status</span>

            <span
              class="text-xs"
              :class="{
                'text-green-400': connectionStatus === 'Connected',
                'text-red-400':
                  connectionStatus === 'Connection Failed' || connectionStatus === 'Disconnected',
                'text-yellow-400': connectionStatus === 'Not Connected',
              }"
            >
              {{ connectionStatus }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="connectionValue" class="border-zinc-700 bg-zinc-800 border rounded-md p-4">
        {{ connectionValue }}
      </div>

      <div
        v-if="error"
        class="border-red-400 bg-red-100 text-red-700 border rounded-md px-3 py-2 text-xs text-balance"
      >
        {{ error }}
      </div>
    </div>
  </div>
</template>
