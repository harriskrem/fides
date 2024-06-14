<script setup lang="ts">
import { io } from "socket.io-client";
import { ref, watch, watchEffect } from "vue";
import configuration from "@/config/rtcConfig";
import {
  handleConnectionOffer,
  handleReceivedCandidate,
  processAnswer,
  sendOffer,
} from "@/services/webrtc";
import ReceiveTab from "./tabs/ReceiveTab.vue";
import SendTab from "./tabs/SendTab.vue";
import { type FileDescription } from "@/types/FileDescription";

/**
 *
 * TODO:
 * Add feedback connected or disconnected from user
 * maybe add button to disconnect from user
 * multiple files
**/

// WebRTC & socket.io intializations
const pc = new RTCPeerConnection(configuration);
const dataChannel = pc.createDataChannel("dataTransfer", { ordered: true, maxRetransmits: 10 });
dataChannel.binaryType = "arraybuffer";
const socket = io();
const selfCode = ref<string>("");
const foreignCode = ref<string>("");
const chunkSize = ref();

// Receive tab
const receivedFileDesc = ref<FileDescription>();
const dataReceived = ref<Blob[]>([]);
const dataReceivedSize = ref<number>(0);
const intervalId = ref<any>(null);

// Send Tab
const selectedFile = ref<File | undefined>();
const isSendButtonDisabled = ref<boolean>(true);
const pressedSendButton = ref<boolean>(false);
const dataSentSize = ref<number>(0);

pc.addEventListener("datachannel", (ev) => {
  ev.channel.onmessage = function (event) {

    // if the data is the description or of a file
    if (typeof event.data === "string") {
      const data = JSON.parse(event.data);
      if (data.type === "description") {
        receivedFileDesc.value = data;
        console.log("receiving file: ", data);
        // if the receiver sent the progress
      } else if (data.type === "progress") {
        dataSentSize.value = data.progress
      }
      // else if it's a chunk
    } else {
      dataReceived.value.push(event.data);
      dataReceivedSize.value = new Blob(dataReceived.value).size
      console.log('dataReceived: ', dataReceived.value.length);
      console.log('dataReceivedSize: ', dataReceivedSize.value);
    }

    if (dataReceived.value.length > 0 && intervalId.value === null) {
      // When received the first chunk initialize an interval
      // where it sends the received progress to the other peer
      intervalId.value = setInterval(() => {
        dataChannel.send(JSON.stringify({
          type: 'progress',
          progress: dataReceivedSize.value
        }));
      }, 500);
    }

  };
});

pc.addEventListener("icecandidate", ({ candidate }) => {
  console.log("in icecandidate eventlistener");
  if (foreignCode.value.length === 20) {
    socket.emit("send_candidate", {
      candidate: candidate,
      peerId: foreignCode.value,
    });
  }
});

// send files when connected
dataChannel.onopen = () => {
  chunkSize.value = Math.min((pc.sctp as RTCSctpTransport).maxMessageSize, 26214);

  if (selectedFile.value) {
    try {
      const file = selectedFile.value;
      const fileReader = new FileReader();

      // Reading file as binary data
      fileReader.readAsArrayBuffer(file);
      dataChannel.send(JSON.stringify({
        type: 'description',
        filename: selectedFile.value.name,
        size: selectedFile.value.size
      }));

      fileReader.onload = function () {
        const fileData = fileReader.result;
        if (fileData instanceof ArrayBuffer && selectedFile.value) {
          for (let offset = 0; offset < fileData.byteLength && dataSentSize.value < selectedFile.value.size; offset += chunkSize.value) {
            const chunk = fileData.slice(offset, offset + chunkSize.value);
            console.log('Sending chunk: ', chunk.byteLength);
            dataChannel.send(chunk);
          }
        } else {
          console.error('File could not be read as ArrayBuffer');
          dataChannel.close();
        }
      };
      fileReader.onerror = function (e) {
        console.error('File reading error:', e);
      };
    } catch (error) {
      console.error(error);
    }
  }
};

const onCameraDetect = (detectedCode: any[]) => {
  console.log("detectedCode: ", detectedCode[0]);
  // @ts-ignore
  foreignCode.value = detectedCode[0].rawValue;
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
  sendOffer(pc, socket, foreignCode);
};

const onSaveFile = () => {
  const blob = new Blob(dataReceived.value);

  if (blob.size === receivedFileDesc.value?.size) {
    clearInterval(intervalId.value);
    console.log("in download link!");
    const fileURL = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = fileURL;
    link.download = receivedFileDesc.value.filename;
    link.click();
  }
};

// socket.io listeners
socket.on("connect", () => {
  // when connected assign the id to the qr component
  selfCode.value = socket.id ?? "";
});

socket.on("get_connection_offer", ({ offer, peerId: peerId }: {
  offer: RTCSessionDescriptionInit;
  peerId: string;
}) => {
  foreignCode.value === "" && (foreignCode.value = peerId);
  handleConnectionOffer({ pc, offer, socket, peerId });
});

socket.on("get_answer", async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
  processAnswer(pc, answer);
});

socket.on("get_candidate", ({ candidate }: { candidate: RTCIceCandidate }) => {
  handleReceivedCandidate(pc, candidate);
});

socket.on("get_id", ({ peerId }: { peerId: string }) => {
  foreignCode.value = peerId;
});

watchEffect(() => {
  if (selectedFile.value && foreignCode.value) {
    isSendButtonDisabled.value = false;
  }
});

watch(foreignCode, () => console.log("foreignCode: ", foreignCode.value));
watch(dataSentSize, () => {
  if(dataSentSize.value > 0 && dataSentSize.value === selectedFile.value?.size) {
    dataChannel.close();
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
        <div role="tablist" class="grow tabs tabs-lifted size-10/12">
          <!-- TAB 1 -->
          <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="Send" checked />
          <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6 tab-test">
            <SendTab v-model="foreignCode" :is-send-button-disabled="isSendButtonDisabled" @qr-detect="onCameraDetect"
              @handle-file-selection="onFileSelection" @handle-send-button="handleSendButton"
              :data-sent-size="dataSentSize" :selected-file="selectedFile" />
          </div>
          <!-- TAB 2 -->
          <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="Receive" />
          <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
            <ReceiveTab v-if="selfCode" :self-code="selfCode" :received-file-desc="receivedFileDesc"
              :data-received-size="dataReceivedSize" @save-file="onSaveFile" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
