import { useDataStore } from "@/store/dataStore";
import type { FileDescription } from "@/types/FileDescription";

/**
 * Handles receiving file chunks through WebRTC data channel
 * @param ev - RTCDataChannel event containing the channel
 * @param dataChannel - RTCDataChannel instance for sending responses
 */
export default function receiveChunk(ev: RTCDataChannelEvent, dataChannel: RTCDataChannel) {
  // Keeps track of the currently receiving file's ID
  let currentFileId: string | null = null;
  // Wh
  ev.channel.onmessage = (event) => {
    const dataStore = useDataStore();

    // Handle control messages (description, complete, progress)
    if (typeof event.data === "string") {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          // Initialize new file reception when description received
          case "description":
            const fileDesc = data as FileDescription;
            dataStore.setFileDescription(fileDesc);
            currentFileId = fileDesc.id;
            break;
          // Handle file transfer completion
          case "complete":
            if (currentFileId === data.id) {
              if (!currentFileId) break;
              const receivedFile = dataStore?.filesToReceive[currentFileId];
              if (receivedFile) {
                // Send final progress update with total bytes
                dataChannel.send(JSON.stringify({
                  type: "progress",
                  id: currentFileId,
                  progress: receivedFile.progress
                }));
                console.log(`File ${currentFileId} complete. Total size: ${receivedFile.progress} bytes`);
              }
              currentFileId = null; // Reset current file ID
            }
            break;

          case "progress":
            // Handle progress updates coming from receiver
            dataStore.setDataSentProgress({
              id: data.id,
              progress: data.progress,
            });
            break;
        }
      } catch (e) {
        console.error("Error parsing message:", e);
      }
    } else {
      // Handle binary chunk data
      if (currentFileId) {
        // Store the received chunk
        dataStore.setReceivedChunks(event.data);

        // Send progress update after each chunk
        const receivedFile = dataStore.filesToReceive[currentFileId];
        if (receivedFile) {
          dataChannel.send(JSON.stringify({
            type: "progress",
            id: currentFileId,
            progress: receivedFile.progress // Raw bytes received
          }));
        }
      }
    }
  }
}