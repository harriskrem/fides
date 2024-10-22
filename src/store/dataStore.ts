import type { FileDescription } from "@/types/FileDescription";
import type { FileProgress } from "@/types/FileProgress";
import type { HashFile } from "@/types/HashFile";
import type { ReceiveFile } from "@/types/ReceiveFile";
import type { SendFile } from "@/types/SendFile";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useDataStore = defineStore('data', () => {
  // Receive & send refs
  const filesToReceiveRef = ref<Record<string, ReceiveFile>>({});
  const filesToSendRef = ref<Record<string, SendFile>>({});
  // Currently sending / receving file
  const recFileIdRef = ref<string | undefined>();
  const sendFileIdRef = ref<string | undefined>()
  // Progress reporting interval
  const intervalIdRef = ref<NodeJS.Timeout | undefined>();
  // Getters
  const filesToReceive = computed(() => filesToReceiveRef.value);
  const filesToSend = computed(() => filesToSendRef.value);
  const recFileId = computed(() => recFileIdRef.value);
  const sendFileId = computed(() => sendFileIdRef.value)
  const getIntervalId = computed(() => intervalIdRef.value);
  // Setters
  const setFileDescription = (value: FileDescription) => {
    filesToReceiveRef.value[value.id] = { filename: value.filename, size: value.size, progress: 0, chunks: [] };
    recFileIdRef.value = value.id
  }
  const setReceivedChunks = (value: Blob) => {
    if (recFileIdRef.value) {
      if (filesToReceiveRef.value[recFileIdRef.value]) {
        filesToReceiveRef.value[recFileIdRef.value].chunks.push(value)
        filesToReceiveRef.value[recFileIdRef.value].progress = new Blob(filesToReceiveRef.value[recFileIdRef.value].chunks).size;
      }
    }
  }
  const setFileToSend = (fileToSend: HashFile) => {
    if (!filesToSend?.value[fileToSend.id]) {
      sendFileIdRef.value = fileToSend.id;
      filesToSendRef.value[fileToSend.id] = {
        file: fileToSend.file,
        progress: 0
      }
    }
  }
  const setIntervalId = (value: NodeJS.Timeout) => {
    intervalIdRef.value = value
  }
  const setDataSentProgress = (value: FileProgress) => {
    if (sendFileId.value && filesToSendRef.value[value.id]) {
      filesToSendRef.value[value.id].progress = value.progress;
    }
  }
  // Clear everything
  const resetData = () => {
    filesToReceiveRef.value = {};
    filesToSendRef.value = {};
    recFileIdRef.value = undefined;
    sendFileIdRef.value = undefined;
    intervalIdRef.value = undefined;
  }

  return {
    filesToReceive,
    filesToSend,
    getIntervalId,
    recFileId,
    sendFileId,
    setFileDescription,
    setReceivedChunks,
    setDataSentProgress,
    setIntervalId,
    setFileToSend,
    resetData,
  }
})