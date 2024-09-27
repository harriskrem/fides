import { setupSocketListeners } from "@/services/socket";
import { defineStore, type StoreDefinition } from "pinia";
import { io, type Socket } from "socket.io-client";
import { computed, ref } from "vue";

export const useSocketStore: StoreDefinition = defineStore('socket', () => {
  
  const socket = ref<Socket>();

  const getSocket = computed(() => socket.value);

  const initializeSocket = () => {
    socket.value = io();
    setupSocketListeners(socket.value);
  };

  return { getSocket, initializeSocket };
});
