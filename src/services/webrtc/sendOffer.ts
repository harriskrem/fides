import type { Socket } from "socket.io-client";
import type { Ref } from "vue";

export default async function sendOffer(pc: RTCPeerConnection, socket: Socket, foreign_code: Ref<string>) {
  console.log('Sending offer')
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  console.log('Sent offer')
  socket.emit('send_connection_offer', { offer: offer, peerId: foreign_code.value })
}