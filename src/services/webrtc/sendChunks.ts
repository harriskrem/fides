import configuration from "@/config/rtcConfig";
import { usePeerStore } from "@/store/peerStore";

export default function sendChunks(selectedFile: File | undefined, pc: RTCPeerConnection, dataChannel: RTCDataChannel) {
  console.log("###### CHANNEL OPENED ######");
  const chunkSize = Math.min(
    (pc.sctp as RTCSctpTransport).maxMessageSize,
    26214
  );
  const peerStore = usePeerStore();

  if (selectedFile) {
    console.log("selectedFile: ", selectedFile);
    try {
      const file = selectedFile;
      const fileReader = new FileReader();

      // Reading file as binary data
      fileReader.readAsArrayBuffer(file);
      dataChannel.send(
        JSON.stringify({
          type: "description",
          filename: selectedFile.name,
          size: selectedFile.size,
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
            console.log("Sending chunk: ", chunk.byteLength);
            dataChannel.send(chunk);
          }
        } else {
          console.error("File could not be read as ArrayBuffer");
          dataChannel.close();
          pc.close();
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
