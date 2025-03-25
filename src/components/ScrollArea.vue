<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script lang="ts" setup>
import { type HTMLAttributes, computed } from 'vue';
import {
  type ScrollAreaRootProps,
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from 'reka-ui';

type ExtendedProps = ScrollAreaRootProps & {
  class?: HTMLAttributes['class'];
  mount?: 'vertical' | 'horizontal' | 'both';
};

const SCROLLBAR_CLASS = `flex select-none touch-none p-0.5 bg-transparent transition-colors duration-[160ms] ease-out data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5`;

const THUMB_CLASS = `z-20 flex-1 bg-(--ui-primary) rounded-[10px] relative transition-colors hover:bg-cyan-600 before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]`;

const props = defineProps<ExtendedProps>();

const delegatedProps = computed(() => {
  const { class: _, mount: __, ...delegated } = props;
  return delegated;
});
</script>

<template>
  <ScrollAreaRoot v-bind="delegatedProps" :class="['relative overflow-hidden', props.class]">
    <ScrollAreaViewport class="size-full rounded-[inherit]">
      <slot />
    </ScrollAreaViewport>

    <ScrollAreaScrollbar
      orientation="vertical"
      :forceMount="['vertical', 'both'].includes(props.mount ?? '') ? true : undefined"
      :class="['z-20', SCROLLBAR_CLASS]"
    >
      <ScrollAreaThumb :class="THUMB_CLASS" />
    </ScrollAreaScrollbar>

    <ScrollAreaScrollbar
      orientation="horizontal"
      :forceMount="['horizontal', 'both'].includes(props.mount ?? '') ? true : undefined"
      :class="SCROLLBAR_CLASS"
    >
      <ScrollAreaThumb :class="THUMB_CLASS" />
    </ScrollAreaScrollbar>
  </ScrollAreaRoot>
</template>
