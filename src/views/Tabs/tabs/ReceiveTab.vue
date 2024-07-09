<script setup lang="ts">
import { ScanQrIcon, CopyIcon, CopySuccessIcon } from "@/assets/icons";
import type { FileDescription } from "@/types/FileDescription";
import { ref } from "vue";
import ModalScanQr from "@/components/modal/ScanQr.vue";

const { selfCode, receivedFileDesc, dataReceivedSize } = defineProps<{
  selfCode: string;
  receivedFileDesc: FileDescription | undefined;
  dataReceivedSize: number;
  onSaveFile: () => void;
}>();

defineEmits<{
  (e: "saveFile"): void;
}>();

const checkedURL = ref<boolean>(false);
const userClicked = ref<boolean>(false);
const showQrModal = ref<boolean>(false);

const toggleQrModal = () => (showQrModal.value = !showQrModal.value);

const copyToClipboard = () => {
  if (checkedURL.value) {
    navigator.clipboard.writeText(`https://tobefilled.tech/${selfCode}`);
  } else {
    navigator.clipboard.writeText(selfCode);
  }
  userClicked.value = true;
  setTimeout(() => (userClicked.value = false), 3000);
};

const getShareCodeForReceive = () => {
  if (checkedURL.value) {
    return `https://tobefilled.tech/${selfCode}`;
  }
  return selfCode;
};
</script>

<template>
  <ModalScanQr
    v-model:show-modal="showQrModal"
    :self-code="selfCode"
  />
  <div>
    <p class="leading-loose text-md">Receive files</p>
  </div>
  <div class="my-2">
    <div class="label pb-0">
      <span
        v-if="checkedURL"
        class="label-text"
        >Your share URL is:</span
      >
      <span
        v-else
        class="label-text"
        >Your share code is:</span
      >
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">URL</span>
          <input
            v-model="checkedURL"
            type="checkbox"
            class="toggle toggle-primary ml-3"
          />
        </label>
      </div>
    </div>
    <label class="input input-bordered flex items-center gap-2">
      <input
        type="text"
        class="grow disabled disabled:opacity-60"
        :placeholder="getShareCodeForReceive()"
        disabled
      />
      <button
        id="scanQr"
        class="btn btn-ghost btn-circle btn-sm"
        @click="toggleQrModal"
      >
        <ScanQrIcon />
      </button>
      <button
        id="copyClipboard"
        class="btn btn-ghost btn-circle btn-sm"
        @click="copyToClipboard"
      >
        <CopySuccessIcon v-if="userClicked" />
        <CopyIcon v-else />
      </button>
    </label>
  </div>
  <div
    v-if="receivedFileDesc"
    class="mockup-window border bg-base-300"
  >
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
          <th>{{ receivedFileDesc.filename }}</th>
          <th>{{ receivedFileDesc.size }}</th>
          <th class="sm:w-36">
            <div class="flex justify-center">
              <button
                v-if="
                  dataReceivedSize > 0 &&
                  dataReceivedSize === receivedFileDesc.size
                "
                class="btn btn-sm btn-secondary"
                @click="$emit('saveFile')"
              >
                Download
              </button>
              <progress
                v-else
                class="progress sm:w-36"
                :value="dataReceivedSize"
                :max="receivedFileDesc.size"
              />
            </div>
          </th>
        </tr>
      </tbody>
    </table>
  </div>
</template>
