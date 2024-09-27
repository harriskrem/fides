<script setup lang="ts">
import configuration from "@/config/rtcConfig";
import { setupSocketListeners } from "@/services/socket";
import { sendOffer } from "@/services/webrtc";
import { useDataStore } from "@/store/dataStore";
import { usePeerStore } from "@/store/peerStore";
import { useSocketStore } from "@/store/socketStore";
import { computed, ref, watch, watchEffect } from "vue";
import ReceiveTab from "./tabs/ReceiveTab.vue";
import SendTab from "./tabs/SendTab.vue";

/**
 *
 * TODO:
 * Add feedback connected or disconnected from user
 * multiple files
 * Fix issue where cannot send more than 1 times
 **/
const peerStore = usePeerStore();
const dataStore = useDataStore();
const socketStore = useSocketStore()

// WebRTC & socket.io intializations
let pc = computed(() => peerStore.pc);
const dataChannel = pc.value.createDataChannel("dataTransfer", {
  ordered: true,
  maxRetransmits: 10,
});
dataChannel.binaryType = "arraybuffer";

const clientId = computed(() => peerStore.clientId);
const remoteId = computed(() => peerStore.remoteId);
const socket = computed(() => socketStore.getSocket)
const chunkSize = ref();

// Receive tab
const receivedData = computed(() => dataStore.receivedData);
const receivedDataSize = computed(() => dataStore.receivedDataSize);
const intervalId = ref<any>(null);

// Send Tab
const selectedFile = ref<File | undefined>();
const isSendButtonDisabled = ref<boolean>(true);
const pressedSendButton = ref<boolean>(false);
const dataSentSize = computed(() => dataStore.dataSentSize);

function sendChunks() {
  console.log("###### CHANNEL OPENED ######");
  chunkSize.value = Math.min(
    (pc.value.sctp as RTCSctpTransport).maxMessageSize,
    26214
  );

  if (selectedFile.value) {
    console.log("selectedFile: ", selectedFile.value);
    try {
      const file = selectedFile.value;
      const fileReader = new FileReader();

      // Reading file as binary data
      fileReader.readAsArrayBuffer(file);
      dataChannel.send(
        JSON.stringify({
          type: "description",
          filename: selectedFile.value.name,
          size: selectedFile.value.size,
        })
      );

      fileReader.onload = function () {
        const fileData = fileReader.result;
        if (fileData instanceof ArrayBuffer && selectedFile.value) {
          for (
            let offset = 0;
            offset < fileData.byteLength &&
            dataSentSize.value < selectedFile.value.size;
            offset += chunkSize.value
          ) {
            console.log("dataSentSize: ", dataSentSize.value);
            const chunk = fileData.slice(offset, offset + chunkSize.value);
            console.log("Sending chunk: ", chunk.byteLength);
            dataChannel.send(chunk);
          }
        } else {
          console.error("File could not be read as ArrayBuffer");
          dataChannel.close();
          pc.value.close();
          peerStore.setPeerConnection(new RTCPeerConnection(configuration));
        }
      };
      fileReader.onerror = function (e) {
        console.error("File reading error:", e);
      };
    } catch (error) {
      console.error(error);
    }
  }
}

function receiveChunk(ev: RTCDataChannelEvent) {
  ev.channel.onmessage = (event) => {
    // if the data is the description or of a file
    if (typeof event.data === "string") {
      const data = JSON.parse(event.data);
      if (data.type === "description") {
        // receivedFileDesc.value = data;
        dataStore.setFileDescription(data);
        console.log("receiving file: ", data);
        // if the receiver sent the progress
      } else if (data.type === "progress") {
        // inform the sender the progress
        dataStore.setDataSentSize(data.progress);
      }
      // else if it's a chunk
    } else {
      dataStore.setReceivedChunks(event.data);
      dataStore.setReceivedDataSize(new Blob(receivedData.value).size);
      console.log("receivedData: ", receivedData.value.length);
      console.log("receivedDataSize: ", receivedDataSize.value);
    }

    if (receivedData.value.length > 0 && intervalId.value === null) {
      // When received the first chunk initialize an interval
      // where it sends the received progress to the other peer
      intervalId.value = setInterval(() => {
        dataChannel.send(
          JSON.stringify({
            type: "progress",
            progress: receivedDataSize.value,
          })
        );
      }, 500);
    }
  };
}

function sendCandidate(candidate: RTCIceCandidate | null) {
  console.log("in icecandidate eventlistener");
  if (remoteId.value.length === 20 && pressedSendButton.value) {
    if (pc.value) {
      socket.value.emit("send_candidate", {
        candidate: candidate,
        peerId: remoteId.value,
      });
    }
  }
}
pc.value.addEventListener("iceconnectionstatechange", () => {
  console.log("state: ", pc.value.iceConnectionState);
  if (
    pc.value.iceConnectionState === "connected" ||
    pc.value.iceConnectionState === "completed"
  ) {
    console.log("ICE negotiation successful!");
  }
});

// find candidates
pc.value.addEventListener("icecandidate", (ev) => sendCandidate(ev.candidate));
// receive chunks
pc.value.addEventListener("datachannel", (ev) => receiveChunk(ev));

// send chunks when channel is connected
dataChannel.onopen = () => sendChunks();

const onCameraDetect = (detectedCode: any[]) => {
  console.log("detectedCode: ", detectedCode[0]);
  peerStore.setRemoteId(detectedCode[0].rawValue);
};

const onFileSelection = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    selectedFile.value = input.files[0];
  }
};

// when pressing send file button
const handleSendButton = () => {
  pressedSendButton.value = true;
  sendOffer(pc.value, socket.value, remoteId);
};

const onSaveFile = () => {
  const blob = new Blob(receivedData.value);

  if (blob.size === dataStore.incomingFileDesc?.size) {
    clearInterval(intervalId.value);
    const fileURL = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = fileURL;
    link.download = dataStore.incomingFileDesc.filename;
    link.click();
  }
};

watchEffect(() => {
  if (selectedFile.value && remoteId.value) {
    isSendButtonDisabled.value = false;
  }
});

watch(remoteId, () => console.log("remoteId: ", remoteId.value));
watch(dataSentSize, async () => {
  // close the channels if sent the file
  if (
    dataSentSize.value > 0 &&
    dataSentSize.value === selectedFile.value?.size
  ) {
    dataChannel.close();
    pc.value.close();
  }
});
</script>

<template>
  <div class="sm:hero min-h-screen bg-base-200">
    <div class="sm:hero-content">
      <div class="flex flex-wrap md:flex-nowrap mx-2 sm:mx-40">
        <article class="prose text-center md:text-left mt-10 sm:mt-0">
          <h1>share_me</h1>
          <p>
            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
            excepturi exercitationem quasi. In deleniti eaque aut repudiandae et
            a id nisi.
          </p>
        </article>
        <div
          role="tablist"
          class="grow tabs tabs-lifted size-10/12"
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
            class="tab-content bg-base-100 border-base-300 rounded-box p-6 tab-test"
          >
            <SendTab
              :is-send-button-disabled="isSendButtonDisabled"
              :selected-file="selectedFile"
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
            class="tab-content bg-base-100 border-base-300 rounded-box p-6"
          >
            <ReceiveTab
              v-if="clientId"
              :client-id="clientId"
              @save-file="onSaveFile"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
