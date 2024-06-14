<script setup lang="ts">
import { ScanQrIcon } from '@/assets/icons';
import { ref } from 'vue';
import ModalScanQr from '../modal/ScanQr.vue';

const { isSendButtonDisabled, dataSentSize, selectedFile } = defineProps<{
  isSendButtonDisabled: boolean;
  onQrDetect: (a: any[]) => void;
  onHandleSendButton: () => void;
  onHandleFileSelection: (a: Event) => void;
  dataSentSize: number;
  selectedFile: File | undefined;
}>()
const emit = defineEmits<{
  (e: 'handleSendButton'): void
  (e: 'qrDetect', a: any[]): void
  (e: 'handleFileSelection', a: Event): void
}>()
const foreignCode = defineModel({ required: true });

const scanQr = ref(false)
const toggleScan = () => scanQr.value = !scanQr.value

const handleOnQrDetect = (detectedCodes: any[]) => {
  if (detectedCodes[0].rawValue) {
    scanQr.value = false;
    emit('qrDetect', detectedCodes)
  }
}
</script>

<template>
  <ModalScanQr v-model:show-modal="scanQr" :scan-qr="true" @camera-detect="handleOnQrDetect" />
  <div>
    <p class="leading-loose text-md">Send any type of file at any size</p>
  </div>
  <div class="my-2">
    <label class="input input-bordered flex items-center gap-2">
      <input type="text" v-model="foreignCode" class="grow" placeholder="Type other peer's code" />
      <button class="btn btn-ghost btn-circle btn-sm" @click="toggleScan">
        <ScanQrIcon />
      </button>
    </label>
  </div>
  <div class="my-2">
    <input class="file-input file-input-primary file-input-bordered w-full" id="file"
      @change="$emit('handleFileSelection', $event)" type="file" />
  </div>
  <div v-if="selectedFile" class="my-2 mockup-window border bg-base-300">
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Size</th>
          <th>Progress</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>{{ selectedFile.name }}</th>
          <th>{{ selectedFile.size }}</th>
          <th class="sm:w-36">
            <div class="flex justify-center">
              <span v-if="dataSentSize > 0 && dataSentSize === selectedFile?.size">
                Sent!
              </span>
              <progress v-else class="progress sm:w-36" :value="dataSentSize" :max="selectedFile.size" />
            </div>
          </th>
        </tr>
      </tbody>
    </table>
  </div>
  <button :disabled="isSendButtonDisabled" @click="$emit('handleSendButton')" class="btn btn-block btn-primary">
    Send File
  </button>
</template>