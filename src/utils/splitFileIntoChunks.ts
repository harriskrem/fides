// Function to split a file into equal-sized chunks
export default function splitFileIntoChunks(file: File, cSize: number) {

  let startPointer = 0;
  const endPointer = file.size;
  const chunks = [];

  while (startPointer < endPointer) {
    const newStartPointer = startPointer + cSize;
    chunks.push(file.slice(startPointer, newStartPointer));
    startPointer = newStartPointer;
  }

  return chunks;

}