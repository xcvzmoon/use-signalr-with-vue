<script setup lang="ts">
const model = defineModel({ type: String });
</script>

<template>
  <input
    v-model="model"
    class="border-zinc-700 bg-zinc-800 text-zinc-200 border outline-none rounded-md h-9 px-3 text-sm font-medium transition-colors focus-visible:ring focus-visible:ring-emerald-400 focus-visible:border-emerald-300"
  />
</template>
