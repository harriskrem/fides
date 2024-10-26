
import { useDataStore } from "@/store/dataStore";

export default function saveFile(fileId: string) {
  const dataStore = useDataStore();
  const incomingFiles = dataStore.filesToReceive;
  const fileToSave = incomingFiles[fileId]
  const blob = new Blob(fileToSave.chunks);

  if (blob.size === fileToSave.size) {
    clearInterval(dataStore.getIntervalId);
    const fileURL = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = fileURL;
    link.download = fileToSave.filename;
    link.click();
  }
}