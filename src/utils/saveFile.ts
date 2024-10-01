import { useDataStore } from "@/store/dataStore";

export default function saveFile() {
  const dataStore = useDataStore();
  const blob = new Blob(dataStore.receivedData);

  if (blob.size === dataStore.incomingFileDesc?.size) {
    clearInterval(dataStore.getIntervalId);
    const fileURL = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = fileURL;
    link.download = dataStore.incomingFileDesc.filename;
    link.click();
  }
}