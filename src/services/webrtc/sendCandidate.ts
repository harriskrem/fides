import type { Socket } from "socket.io-client";

export default function sendCandidate(candidate: RTCIceCandidate | null, remoteId: string, pc: RTCPeerConnection | null, socket: Socket) {

  console.log("in icecandidate eventlistener");

  if (remoteId.length === 20) {
    if (pc) {
      socket.emit("send_candidate", {
        candidate: candidate,
        peerId: remoteId,
      });
    }
  }
}