<script setup lang="ts">
import { computed } from 'vue';

const { variant } = defineProps<{ variant?: 'default' | 'error' }>();

const classNames = computed(() => {
  if (variant === 'error') {
    return 'border-rose-400 bg-rose-400 text-zinc-900 focus-visible:ring-rose-400 focus-visible:border-rose-500 focus-visible:bg-rose-500 hover:border-rose-500 hover:bg-rose-500';
  } else {
    return 'border-emerald-400 bg-emerald-400 text-zinc-900 focus-visible:ring-emerald-400 focus-visible:border-emerald-500 focus-visible:bg-emerald-500 hover:border-emerald-500 hover:bg-emerald-500';
  }
});
</script>

<template>
  <button
    type="button"
    class="border outline-none rounded-md h-9 px-3 text-sm font-medium flex items-center transition-colors cursor-pointer focus-visible:ring focus-visible:text-zinc-800 hover:text-zinc-800"
    :class="classNames"
  >
    <slot />
  </button>
</template>
