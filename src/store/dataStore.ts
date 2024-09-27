import type { FileDescription } from "@/types/FileDescription";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useDataStore = defineStore('data', () => {
  // Receive refs
  const receivedFileDesc = ref<FileDescription>();
  const receivedChunks = ref<Blob[]>([]);
  const receivedChunkSize = ref<number>(0);

  const incomingFileDesc = computed(() => receivedFileDesc.value);
  const receivedData = computed(() => receivedChunks.value);
  const receivedDataSize = computed(() => receivedChunkSize.value);

  const setFileDescription = (value: FileDescription) => {
    receivedFileDesc.value = value;
  }
  const setReceivedChunks = (value: Blob) => {
    receivedChunks.value.push(value);
  }
  const setReceivedDataSize = (value: number) => {
    receivedChunkSize.value = value;
  }

  // Send refs
  const chunkSentSize = ref<number>(0);

  const dataSentSize = computed(() => chunkSentSize.value);

  const setDataSentSize = (value: number) => {
    chunkSentSize.value = value
  }

  return {
    incomingFileDesc,
    setFileDescription,
    receivedData,
    setReceivedChunks,
    receivedDataSize,
    setReceivedDataSize,
    dataSentSize,
    setDataSentSize
  }
})