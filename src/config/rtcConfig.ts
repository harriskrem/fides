const configuration = {
  iceServers: [
    {
      // Google's public STUN server
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        // 'stun:stun2.l.google.com:19302',
        // 'stun:stun3.l.google.com:19302',
      ]

    }
  ]
}

export default configuration