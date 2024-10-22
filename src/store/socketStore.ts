import { setupSocketListeners } from "@/services/socket";
import { defineStore, type StoreDefinition } from "pinia";
import { io, type Socket } from "socket.io-client";
import { computed, ref } from "vue";

export const useSocketStore: StoreDefinition = defineStore('socket', () => {
  // Socket refs
  const socket = ref<Socket>();
  
  // Getters
  const getSocket = computed(() => socket.value);
  
  // Setters
  const initializeSocket = () => {
    socket.value = io();
    setupSocketListeners(socket.value);
  };

  return { getSocket, initializeSocket };
});
