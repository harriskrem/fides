<script setup lang="ts">
import { ref } from 'vue';
import QrcodeVue from 'qrcode.vue';
import { type Level, type RenderAs } from 'qrcode.vue';

const { qrValue } = defineProps<{
  qrValue: string
}>();
const level = ref<Level>('M');
const renderAs = ref<RenderAs>('svg');

</script>

<template>
  <qrcode-vue :value="qrValue" :level="level" :render-as="renderAs" />
</template>