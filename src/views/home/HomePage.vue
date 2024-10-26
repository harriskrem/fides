<script setup lang="ts">
import { receiveChunk, sendChunks, sendOffer } from "@/services/webrtc";
import sendCandidate from "@/services/webrtc/sendCandidate";
import { useDataStore } from "@/store/dataStore";
import { usePeerStore } from "@/store/peerStore";
import { useSocketStore } from "@/store/socketStore";
import saveFile from "@/utils/saveFile";
import { computed, ref, watchEffect } from "vue";
import ReceiveTab from "./tabs/ReceiveTab.vue";
import SendTab from "./tabs/SendTab.vue";
import { v4 as uuidv4 } from "uuid";
/**
 * TODO:
 * Add feedback connected or disconnected from user
 **/
const peerStore = usePeerStore();
const dataStore = useDataStore();
const socketStore = useSocketStore();
// WebRTC & socket.io intializations
let pc = computed(() => peerStore.pc);
const dataChannel = pc.value.createDataChannel("dataTransfer", {
  ordered: true,
  maxRetransmits: 10,
});
dataChannel.binaryType = "arraybuffer";

const clientId = computed(() => peerStore.clientId);
const remoteId = computed(() => peerStore.remoteId);
const socket = computed(() => socketStore.getSocket);
// Receive tab
const filesToSend = computed(() => dataStore.filesToSend);
// Send Tab
const isSendButtonDisabled = ref<boolean>(true);
const pressedSendButton = ref<boolean>(false);
// For debugging
pc.value.addEventListener("iceconnectionstatechange", () => {
  console.log("state: ", pc.value.iceConnectionState);
  if (
    pc.value.iceConnectionState === "connected" ||
    pc.value.iceConnectionState === "completed"
  ) {
    console.log("ICE negotiation successful!");
  }
});
// Find candidates
pc.value.addEventListener("icecandidate", (ev) =>
  sendCandidate(ev.candidate, remoteId.value, pc.value, socket.value)
);
// Receive chunks
pc.value.addEventListener("datachannel", (ev) => receiveChunk(ev, dataChannel));
// Send chunks when channel is connected
dataChannel.onopen = () => sendChunks(filesToSend.value, pc.value, dataChannel);

const onCameraDetect = (detectedCode: any[]) => {
  peerStore.setRemoteId(detectedCode[0].rawValue);
};

const onFileSelection = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    for (const file of input.files) {
      const fileId = uuidv4();
      dataStore.setFileToSend(fileId, file);
    }
  }
};
// When pressing send file button
const handleSendButton = () => {
  pressedSendButton.value = true;
  if (pc.value.iceConnectionState === "new") {
    sendOffer(pc.value, socket.value, remoteId);
  } else if (pc.value.iceConnectionState === "connected") {
    if (dataChannel.readyState === "open") {
      sendChunks(filesToSend.value, pc.value, dataChannel);
    }
  }
};

watchEffect(() => {
  if (remoteId.value) {
    isSendButtonDisabled.value = false;
  }
});
</script>

<template>
  <div class="sm:hero min-h-screen bg-base-200">
    <div class="sm:hero-content">
      <div class="flex flex-wrap md:flex-nowrap mx-2 sm:mx-10 gap-x-2">
        <article class="prose text-center md:text-left mt-10 sm:mt-0">
          <h1>fides</h1>
          <p>
            Fides is a cutting-edge file transfer app that utilizes WebRTC for
            seamless, peer-to-peer file sharing. Experience fast, secure
            transfers directly between devices without intermediaries, all
            within your browser.
          </p>
        </article>
        <div
          role="tablist"
          class="tabs tabs-lifted"
        >
          <!-- TAB 1 -->
          <input
            type="radio"
            name="my_tabs_1"
            role="tab"
            class="tab"
            aria-label="Send"
            checked
          />
          <div
            role="tabpanel"
            class="tab-content bg-base-100 border-base-300 rounded-box p-6 w-full"
          >
            <send-tab
              :is-send-button-disabled="isSendButtonDisabled"
              @qr-detect="onCameraDetect"
              @handle-file-selection="onFileSelection"
              @handle-send-button="handleSendButton"
            />
          </div>
          <!-- TAB 2 -->
          <input
            type="radio"
            name="my_tabs_1"
            role="tab"
            class="tab"
            aria-label="Receive"
          />
          <div
            role="tabpanel"
            class="tab-content bg-base-100 border-base-300 rounded-box p-6 w-full"
          >
            <receive-tab
              v-if="clientId"
              :client-id="clientId"
              @save-file="saveFile"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
