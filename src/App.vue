<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router'
import { useSocketStore } from './store/socketStore';

const socketStore = useSocketStore()

onMounted(() => {
  socketStore.initializeSocket()
})

</script>

<template>
  <RouterView />
</template>

