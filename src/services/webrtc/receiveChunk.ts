import { useDataStore } from "@/store/dataStore";

export default function receiveChunk(ev: RTCDataChannelEvent, receivedData: Blob[], dataChannel: RTCDataChannel) {
  ev.channel.onmessage = (event) => {
    const dataStore = useDataStore();
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
      dataStore.setReceivedDataSize(new Blob(receivedData).size);
    }

    if (receivedData.length > 0 && !dataStore.getIntervalId) {
      // When received the first chunk initialize an interval
      // where it sends the received progress to the other peer
      const intervalId = setInterval(() => {
        const receivedDataSize = dataStore.receivedDataSize;
        dataChannel.send(
          JSON.stringify({
            type: "progress",
            progress: receivedDataSize,
          })
        );
      }, 500);

      dataStore.setIntervalId(intervalId);
    }
  };
}