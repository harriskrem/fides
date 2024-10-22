import configuration from "@/config/rtcConfig";
import { defineStore } from "pinia";
import { io } from "socket.io-client";
import { computed, ref } from "vue";

export const usePeerStore = defineStore('peer', () => {
  // Peer refs
  const peerConnection = ref<RTCPeerConnection>(new RTCPeerConnection(configuration));
  const selfId = ref<string>("");
  const foreignId = ref<string>("");

  // Getters
  const pc = computed(() => peerConnection.value);
  const remoteId = computed(() => foreignId.value);
  const clientId = computed(() => selfId.value);

  // Setters
  function setClientId(id: string) {
    selfId.value = id;
  }
  function setRemoteId(id: string) {
    foreignId.value = id;
  }
  function setPeerConnection(pc: RTCPeerConnection) {
    peerConnection.value = pc;
  }

  return { clientId, setClientId, remoteId, setRemoteId, pc, setPeerConnection }

})