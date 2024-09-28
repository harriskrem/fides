<script setup lang="ts">
import QrCode from "../QrCode.vue";
import { CloseIcon } from "@/assets/icons";

const { selfCode, scanQr } = defineProps<{
  scanQr?: boolean;
  selfCode?: string;
  cameraDetect?: (a: any[]) => void;
}>();

const showModal = defineModel("showModal", {
  type: Boolean,
  required: true,
});

defineEmits<{
  (e: "cameraDetect", a: any): void;
}>();

const handleClose = () => (showModal.value = false);
</script>

<template>
  <div v-if="showModal">
    <dialog
      id="my_modal_2"
      class="modal"
      :class="{ 'modal-open': showModal }"
    >
      <div class="modal-box sm:w-4/12">
        <p
          v-if="scanQr"
          class="text-center text-2xl"
        >
          Scan with your camera
        </p>
        <p
          v-else
          class="text-center text-2xl"
        >
          Share your code
        </p>
        <div class="flex justify-center my-4">
          <QrCode
            v-if="selfCode"
            :qr-value="selfCode"
            :size="350"
          />
          <qrcode-stream
            v-else
            @detect="$emit('cameraDetect', $event)"
          />
        </div>
        <div class="flex justify-center">
          <button
            class="btn btn-accent btn-md"
            @click="handleClose"
          >
            <CloseIcon />
          </button>
        </div>
      </div>
      <form
        method="dialog"
        class="modal-backdrop"
        @submit="handleClose"
      >
        <button type="submit">close</button>
      </form>
    </dialog>
  </div>
</template>
