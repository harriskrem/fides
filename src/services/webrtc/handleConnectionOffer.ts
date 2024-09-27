import type { Socket } from "socket.io-client";

type HandleConnectionOffer = {
  pc: RTCPeerConnection,
  offer: RTCSessionDescriptionInit,
  socket: Socket,
  peerId: string,
}

export default async function handleConnectionOffer(props: HandleConnectionOffer) {
  console.log('in handleConnectionOffer')
  const { pc, offer, socket, peerId } = props;
  await pc.setRemoteDescription(offer);
  console.log('added remote description')
  const answer = await pc.createAnswer();
  console.log('created answer')
  await pc.setLocalDescription(answer);
  socket.emit('answer', { answer: answer, peerId: peerId });
}