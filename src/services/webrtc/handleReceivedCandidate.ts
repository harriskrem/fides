export default async function handleReceivedCandidate(pc: RTCPeerConnection, candidate: RTCIceCandidate) {
  console.log('in handleReceivedCandidate')
  if (candidate && pc.remoteDescription?.type) {
    console.log('adding candidate')
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
    console.log('added candidate')
  }
}