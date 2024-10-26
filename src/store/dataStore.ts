import type { FileDescription } from "@/types/FileDescription";
import type { FileProgress } from "@/types/FileProgress";
import type { ReceiveFile } from "@/types/ReceiveFile";
import type { SendFile } from "@/types/SendFile";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useDataStore = defineStore('data', () => {
  // State refs for tracking files and progress
  const filesToReceiveRef = ref<Record<string, ReceiveFile>>({});
  const filesToSendRef = ref<Record<string, SendFile>>({});
  const recFileIdRef = ref<string | undefined>();
  const sendFileIdRef = ref<string | undefined>()

  // Computed properties for reactive access to state
  const filesToReceive = computed(() => filesToReceiveRef.value);
  const filesToSend = computed(() => filesToSendRef.value);
  const recFileId = computed(() => recFileIdRef.value);
  const sendFileId = computed(() => sendFileIdRef.value)

  /**
   * Initializes a new file to be received
   * @param value - File description containing ID, filename, and size
   */
  const setFileDescription = (value: FileDescription) => {
    filesToReceiveRef.value[value.id] = { 
      filename: value.filename, 
      size: value.size, 
      progress: 0, 
      chunks: [] 
    };
    recFileIdRef.value = value.id;
  }

  /**
   * Stores a received chunk and updates progress
   * @param value - Blob containing chunk data
   */
  const setReceivedChunks = (value: Blob) => {
    if (recFileIdRef.value) {
      if (filesToReceiveRef.value[recFileIdRef.value]) {
        // Store the chunk and update progress with total bytes received
        filesToReceiveRef.value[recFileIdRef.value].chunks.push(value);
        filesToReceiveRef.value[recFileIdRef.value].progress = 
          new Blob(filesToReceiveRef.value[recFileIdRef.value].chunks).size;
      }
    }
  }

  /**
  * Initializes a new file to be sent
  * @param fileId - Unique identifier for the file
  * @param fileToSend - File object to be sent
  */
  const setFileToSend = (fileId: string, fileToSend: File) => {
    if (!filesToSend?.value[fileId]) {
      filesToSendRef.value[fileId] = {
        file: fileToSend,
        progress: 0
      }
    }
  }

  /**
   * Updates the currently sending file ID
   * @param value - File ID
   */
  const setSendFileId = (value: string) => {
    sendFileIdRef.value = value;
  }

  /**
  * Updates progress for a file being sent
  * @param value - Progress update containing file ID and bytes transferred
  */
  const setDataSentProgress = (value: FileProgress) => {
    if (filesToSendRef.value[value.id]) {
      filesToSendRef.value[value.id].progress = value.progress;
    }
  }

  /**
   * Resets all transfer state
   */
  const resetData = () => {
    filesToReceiveRef.value = {};
    filesToSendRef.value = {};
    recFileIdRef.value = undefined;
    sendFileIdRef.value = undefined;
  }

  return {
    filesToReceive,
    filesToSend,
    recFileId,
    sendFileId,
    setFileDescription,
    setReceivedChunks,
    setDataSentProgress,
    setFileToSend,
    setSendFileId,
    resetData,
  }
})