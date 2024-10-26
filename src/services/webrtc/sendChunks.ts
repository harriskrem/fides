import { useDataStore } from "@/store/dataStore";
import type { SendFile } from "@/types/SendFile";

/**
 * Handles sending files in chunks through WebRTC data channel
 * @param filesToSend - Record of files queued for sending
 * @param pc - RTCPeerConnection instance
 * @param dataChannel - RTCDataChannel instance for sending data
 */
export default function sendChunks(filesToSend: Record<string, SendFile>, pc: RTCPeerConnection, dataChannel: RTCDataChannel) {

  // Calculate optimal chunk size based on SCTP transport max message size
  // Limited to 26214 bytes as a conservative default
  const chunkSize = Math.min(
    (pc.sctp as RTCSctpTransport).maxMessageSize,
    26214
  );

  // Only proceed if there are files to send
  if (Object.keys(filesToSend).length) {
    const dataStore = useDataStore()

    /**
    * Handles progress updates received from the receiver
    * @param event - MessageEvent containing progress data
    */
    const progressHandler = (event: MessageEvent) => {
      if (typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "progress" && data.id) {
            dataStore.setDataSentProgress({
              id: data.id,
              progress: data.progress
            });
          }
        } catch (e) {
          console.error("Error parsing progress message:", e);
        }
      }
    };

    // Set up event listener for progress updates
    dataChannel.addEventListener("message", progressHandler);

    /**
     * Recursively sends files one by one
     * @param fileHashes - Array of file IDs to send
     * @param currentIndex - Current position in the fileHashes array
     */
    const sendNextFile = async (fileHashes: string[], currentIndex: number = 0) => {
      // Base case: all files have been sent
      if (currentIndex >= fileHashes.length) {
        // Clean up event listener when all files are sent
        dataChannel.removeEventListener("message", progressHandler);
        return;
      }

      const fileHash = fileHashes[currentIndex];
      const fileToSend = filesToSend[fileHash];

      try {
        // Initialize FileReader for binary file reading
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(fileToSend.file);

        // Send initial file metadata to receiver
        dataChannel.send(
          JSON.stringify({
            type: "description",
            id: fileHash,
            filename: fileToSend.file.name,
            size: fileToSend.file.size,
          })
        );
        // Update current sending file ID in store
        dataStore.setSendFileId(fileHash);
        // Handle successful file load
        fileReader.onload = function () {
          const fileData = fileReader.result;
          if (fileData instanceof ArrayBuffer) {
            let offset = 0;
            const totalChunks = Math.ceil(fileData.byteLength / chunkSize);
            /**
             * Recursively sends chunks of the file
             * Uses setTimeout to prevent blocking and allow for progress updates
             */
            const sendNextChunk = () => {
              if (offset >= fileData.byteLength) {
                // Send completion message
                dataChannel.send(JSON.stringify({
                  type: "complete",
                  id: fileHash,
                  totalChunks
                }));
                // Move to next file
                sendNextFile(fileHashes, currentIndex + 1);
                return;
              }
              // Send next chunk
              const chunk = fileData.slice(offset, offset + chunkSize);
              dataChannel.send(chunk);
              offset += chunkSize;
              // Schedule next chunk with setTimeout to prevent blocking
              // This allows for progress updates and other messages to be processed
              setTimeout(sendNextChunk, 0);
            };

            // Start sending chunks
            sendNextChunk();
          } else {
            console.error("File could not be read as ArrayBuffer");
            dataChannel.close();
            pc.close();
          }
        };
        // Handle file reading errors
        fileReader.onerror = function (e) {
          console.error("File reading error:", e);
        };
      } catch (error) {
        console.error(error);
      }
    };

    // Start the file sending process with all files in the queue
    sendNextFile(Object.keys(filesToSend));
  }
}