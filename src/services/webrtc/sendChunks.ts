import { useDataStore } from "@/store/dataStore";
import type { HashFile } from "@/types/HashFile";

export default function sendChunks(selectedFile: HashFile | undefined, pc: RTCPeerConnection, dataChannel: RTCDataChannel) {
  console.log("###### CHANNEL OPENED ######");
  const chunkSize = Math.min(
    (pc.sctp as RTCSctpTransport).maxMessageSize,
    26214
  );

  if (selectedFile) {
    try {
      const hashFile = selectedFile;
      const fileReader = new FileReader();
      const dataStore = useDataStore();
      // Reading file as binary data
      fileReader.readAsArrayBuffer(hashFile.file);
      dataStore.setFileToSend(selectedFile);
      dataChannel.send(
        JSON.stringify({
          type: "description",
          id: selectedFile.id,
          filename: selectedFile.file.name,
          size: selectedFile.file.size,
        })
      );
      fileReader.onload = function () {
        const fileData = fileReader.result;
        if (fileData instanceof ArrayBuffer && selectedFile) {
          for (
            let offset = 0;
            offset < fileData.byteLength;
            offset += chunkSize
          ) {
            const chunk = fileData.slice(offset, offset + chunkSize);
            dataChannel.send(chunk);
          }
        } else {
          console.error("File could not be read as ArrayBuffer");
          dataChannel.close();
          pc.close();
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
