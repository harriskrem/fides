import { useDataStore } from "@/store/dataStore";

export default function saveFile(filename: string) {
  const dataStore = useDataStore();
  const incomingFiles = dataStore.incomingFiles;
  const blob = new Blob(incomingFiles[filename].chunks);

  if (blob.size === incomingFiles[filename].size) {
    clearInterval(dataStore.getIntervalId);
    const fileURL = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = fileURL;
    link.download = filename;
    link.click();
  }
}