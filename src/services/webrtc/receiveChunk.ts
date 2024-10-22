import { useDataStore } from "@/store/dataStore";
import type { FileDescription } from "@/types/FileDescription";
import type { FileProgress } from "@/types/FileProgress";
import type { ReceiveFile } from "@/types/ReceiveFile";

export default function receiveChunk(ev: RTCDataChannelEvent, receivedData: Record<string, ReceiveFile>, dataChannel: RTCDataChannel) {
  ev.channel.onmessage = (event) => {
    const dataStore = useDataStore();
    if (typeof event.data === "string") {
      const data = JSON.parse(event.data);
      // if the data is the description or of a file
      if (data.type === "description") {
        const fileDesc = data as FileDescription;
        dataStore.setFileDescription(fileDesc);
      } else if (data.type === "progress") {
        // if the receiver sent the progress
        const fileProgress = data as FileProgress;
        dataStore.setDataSentProgress(fileProgress);
      }
      // else if it's a chunk
    } else {
      dataStore.setReceivedChunks(event.data);
    }

    if (Object.keys(receivedData).length > 0 && !dataStore.getIntervalId) {
      // When received the first chunk initialize an interval
      // where it sends the received progress to the other peer
      const intervalId = setInterval(() => {
        const receivingFileId = dataStore.recFileId;
        const incomingFiles = dataStore.filesToReceive;
        if (receivingFileId) {
          const receivedDataSize = incomingFiles?.[receivingFileId].progress;
          if (receivedDataSize) {
            dataChannel.send(
              JSON.stringify({
                type: "progress",
                id: receivingFileId,
                progress: receivedDataSize,
              })
            );
          }
        }
      }, 500);

      dataStore.setIntervalId(intervalId);
    }
  };
}