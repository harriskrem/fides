export type ReceiveFile = {
  filename: string;
  size: number
  progress: number;
  chunks: Blob[];
  file?: File;
}