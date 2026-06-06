"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import getSocket from "@/lib/socket";

export type CallType = "video" | "audio";
export type CallStatus = "idle" | "calling" | "incoming" | "active" | "ended";

interface UseWebRTCProps {
  conversationId: string;
}

interface IncomingCall {
  from: string;
  callType: CallType;
  roomId: string;
}

export function useWebRTC({ conversationId }: UseWebRTCProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [callType, setCallType] = useState<CallType>("audio");
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isLocalTalking, setIsLocalTalking] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  // Remote peer is screen sharing — updated via socket signal
  const [remoteScreenSharing, setRemoteScreenSharing] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  // Dedicated element for local screen preview
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const remoteAnalyserRef = useRef<AnalyserNode | null>(null);
  const localAnalyserRef = useRef<AnalyserNode | null>(null);
  const talkingRafRef = useRef<number | null>(null);

  // 1 ── Cleanup ──────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current = null;
    screenStreamRef.current = null;
    remoteStreamRef.current = null;
    pendingCandidatesRef.current = [];
    pendingOfferRef.current = null;
    if (talkingRafRef.current) cancelAnimationFrame(talkingRafRef.current);
    remoteAnalyserRef.current = null;
    localAnalyserRef.current = null;
    setIsTalking(false);
    setIsLocalTalking(false);
    setIsScreenSharing(false);
    setRemoteScreenSharing(false);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
  }, []);

  // 2 ── Create peer connection ───────────────────────────────────────
  const createPeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        getSocket().emit("call:ice", {
          room: conversationId,
          candidate: e.candidate,
        });
      }
    };

    // Re-bind remoteVideoRef every time a track arrives so replaceTrack
    // changes are always reflected — browsers don't auto-refresh srcObject
    pc.ontrack = (e) => {
      const stream = e.streams[0];
      if (!stream) return;
      remoteStreamRef.current = stream;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("📡 connection state:", pc.connectionState);
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        endCall();
      }
    };

    pcRef.current = pc;
    return pc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // 3 ── Get media ────────────────────────────────────────────────────
  const getMedia = useCallback(async (type: CallType) => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video" ? { facingMode: "user" } : false,
        audio: true,
      });
    } catch (err) {
      if (type === "video") {
        console.warn("Camera unavailable, falling back to audio only:", err);
        stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
      } else {
        throw err;
      }
    }
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  }, []);

  // 4 ── Audio level detection ────────────────────────────────────────
  const startTalkingDetection = useCallback(
    (localStream: MediaStream, remoteStream?: MediaStream) => {
      if (talkingRafRef.current) cancelAnimationFrame(talkingRafRef.current);

      const localAudio = localStream
        .getAudioTracks()
        .filter((t) => t.readyState === "live");
      if (localAudio.length === 0) return;

      const ctx = new AudioContext();

      const localSrc = ctx.createMediaStreamSource(new MediaStream(localAudio));
      const localAnalyser = ctx.createAnalyser();
      localAnalyser.fftSize = 512;
      localSrc.connect(localAnalyser);
      localAnalyserRef.current = localAnalyser;

      let remoteAnalyser: AnalyserNode | null = null;
      if (remoteStream) {
        const remoteAudio = remoteStream
          .getAudioTracks()
          .filter((t) => t.readyState === "live");
        if (remoteAudio.length > 0) {
          const remoteSrc = ctx.createMediaStreamSource(
            new MediaStream(remoteAudio),
          );
          remoteAnalyser = ctx.createAnalyser();
          remoteAnalyser.fftSize = 512;
          remoteSrc.connect(remoteAnalyser);
          remoteAnalyserRef.current = remoteAnalyser;
        }
      }

      const data = new Uint8Array(512);
      const THRESHOLD = 20;

      const tick = () => {
        localAnalyser.getByteFrequencyData(data);
        const localAvg = data.slice(0, 50).reduce((a, b) => a + b, 0) / 50;
        setIsLocalTalking(localAvg > THRESHOLD);

        if (remoteAnalyser) {
          remoteAnalyser.getByteFrequencyData(data);
          const remoteAvg = data.slice(0, 50).reduce((a, b) => a + b, 0) / 50;
          setIsTalking(remoteAvg > THRESHOLD);
        }

        talkingRafRef.current = requestAnimationFrame(tick);
      };
      talkingRafRef.current = requestAnimationFrame(tick);
    },
    [],
  );

  // 5 ── Apply offer → create + emit answer ──────────────────────────
  const applyOffer = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      const pc = pcRef.current;
      if (!pc) return;
      const socket = getSocket();
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        for (const c of pendingCandidatesRef.current) {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        }
        pendingCandidatesRef.current = [];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("call:answer", { room: conversationId, answer });
        setCallStatus("active");

        if (localStreamRef.current && remoteStreamRef.current) {
          startTalkingDetection(
            localStreamRef.current,
            remoteStreamRef.current,
          );
        }
      } catch (err) {
        console.error("Failed to apply offer:", err);
      }
    },
    [conversationId, startTalkingDetection],
  );

  // 6 ── Start call (caller) ──────────────────────────────────────────
  const startCall = useCallback(
    async (type: CallType) => {
      try {
        setCallType(type);
        setCallStatus("calling");
        pendingCandidatesRef.current = [];
        pendingOfferRef.current = null;

        const stream = await getMedia(type);
        const pc = createPeerConnection();
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Always add a disabled video sender on audio calls so
        // replaceTrack works for screen share without renegotiation.
        if (type === "audio") {
          const black = createBlackVideoTrack();
          black.enabled = false;
          pc.addTrack(black, new MediaStream([black]));
        }

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        getSocket().emit("call:start", {
          room: conversationId,
          callType: type,
        });
        getSocket().emit("call:offer", { room: conversationId, offer });
      } catch (err) {
        console.error("Failed to start call:", err);
        cleanup();
        setCallStatus("idle");
      }
    },
    [conversationId, createPeerConnection, getMedia, cleanup],
  );

  // 7 ── Accept call (receiver) ───────────────────────────────────────
  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;
    try {
      setCallType(incomingCall.callType);
      pendingCandidatesRef.current = [];

      const stream = await getMedia(incomingCall.callType);
      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      if (incomingCall.callType === "audio") {
        const black = createBlackVideoTrack();
        black.enabled = false;
        pc.addTrack(black, new MediaStream([black]));
      }

      if (pendingOfferRef.current) {
        const queued = pendingOfferRef.current;
        pendingOfferRef.current = null;
        await applyOffer(queued);
      }
    } catch (err) {
      console.error("Failed to accept call:", err);
      cleanup();
      setCallStatus("idle");
    }
  }, [incomingCall, createPeerConnection, getMedia, applyOffer, cleanup]);

  // 8 ── Reject call ──────────────────────────────────────────────────
  const rejectCall = useCallback(() => {
    getSocket().emit("call:reject", { room: conversationId });
    setIncomingCall(null);
    setCallStatus("idle");
    pendingOfferRef.current = null;
  }, [conversationId]);

  // 9 ── End call ─────────────────────────────────────────────────────
  const endCall = useCallback(() => {
    getSocket().emit("call:end", { room: conversationId });
    cleanup();
    setCallStatus("idle");
    setIncomingCall(null);
    setIsMuted(false);
    setIsCameraOff(false);
  }, [conversationId, cleanup]);

  // 10 ── Toggle mute ─────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMuted((prev) => !prev);
  }, []);

  // 11 ── Toggle camera ───────────────────────────────────────────────
  const toggleCamera = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsCameraOff((prev) => !prev);
  }, []);

  // 12 ── Toggle screen share ─────────────────────────────────────────
  const toggleScreenShare = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    const socket = getSocket();

    // ── Stop ──────────────────────────────────────────────────────
    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;

      // Restore original camera/black track
      const camTrack = localStreamRef.current?.getVideoTracks()[0];
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender) {
        if (camTrack) {
          await sender.replaceTrack(camTrack);
        } else {
          const black = createBlackVideoTrack();
          black.enabled = false;
          await sender.replaceTrack(black);
        }
      }

      // Clear screen preview
      if (screenVideoRef.current) screenVideoRef.current.srcObject = null;

      // Notify remote that screen share stopped
      socket.emit("call:screen-share", { room: conversationId, active: false });
      setIsScreenSharing(false);
      return;
    }

    // ── Start ─────────────────────────────────────────────────────
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: false,
      });
      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];

      // Enable and replace into the video sender
      screenTrack.enabled = true;
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender) {
        await sender.replaceTrack(screenTrack);
      }

      // Bind to dedicated local preview element
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = screenStream;
      }

      // Notify remote that screen share started
      socket.emit("call:screen-share", { room: conversationId, active: true });

      // Auto-stop when user clicks browser's native "Stop sharing"
      screenTrack.onended = () => {
        screenStreamRef.current = null;
        const cam = localStreamRef.current?.getVideoTracks()[0];
        const s = pc.getSenders().find((s) => s.track?.kind === "video");
        if (s) {
          if (cam) {
            s.replaceTrack(cam);
          } else {
            const black = createBlackVideoTrack();
            black.enabled = false;
            s.replaceTrack(black);
          }
        }
        if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
        socket.emit("call:screen-share", {
          room: conversationId,
          active: false,
        });
        setIsScreenSharing(false);
      };

      setIsScreenSharing(true);
    } catch (err) {
      console.warn("Screen share cancelled or failed:", err);
    }
  }, [isScreenSharing, conversationId]);

  // 13 ── Socket listeners ────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();

    const onIncoming = ({ from, callType, roomId }: IncomingCall) => {
      setIncomingCall({ from, callType, roomId });
      setCallStatus("incoming");
    };

    const onOffer = async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
      if (!pcRef.current) {
        console.warn("Offer arrived before PC ready — queuing");
        pendingOfferRef.current = offer;
        return;
      }
      await applyOffer(offer);
    };

    const onAnswer = async ({
      answer,
    }: {
      answer: RTCSessionDescriptionInit;
    }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(answer),
        );

        for (const c of pendingCandidatesRef.current) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
        }
        pendingCandidatesRef.current = [];

        setCallStatus("active");
        if (localStreamRef.current && remoteStreamRef.current) {
          startTalkingDetection(
            localStreamRef.current,
            remoteStreamRef.current,
          );
        }
      } catch (err) {
        console.error("Failed to handle answer:", err);
      }
    };

    const onIce = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      if (!pcRef.current || !pcRef.current.remoteDescription) {
        pendingCandidatesRef.current.push(candidate);
        return;
      }
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("ICE candidate error:", err);
      }
    };

    const onEnded = () => {
      cleanup();
      setCallStatus("idle");
      setIncomingCall(null);
      setIsMuted(false);
      setIsCameraOff(false);
    };

    const onRejected = () => {
      cleanup();
      setCallStatus("idle");
      setIncomingCall(null);
    };

    // Remote peer started/stopped screen sharing
    const onScreenShare = ({ active }: { active: boolean }) => {
      setRemoteScreenSharing(active);
      // Re-bind remoteVideoRef so the new track is rendered immediately
      if (remoteStreamRef.current && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
      }
    };

    socket.on("call:incoming", onIncoming);
    socket.on("call:offer", onOffer);
    socket.on("call:answer", onAnswer);
    socket.on("call:ice", onIce);
    socket.on("call:ended", onEnded);
    socket.on("call:rejected", onRejected);
    socket.on("call:screen-share", onScreenShare);

    return () => {
      socket.off("call:incoming", onIncoming);
      socket.off("call:offer", onOffer);
      socket.off("call:answer", onAnswer);
      socket.off("call:ice", onIce);
      socket.off("call:ended", onEnded);
      socket.off("call:rejected", onRejected);
      socket.off("call:screen-share", onScreenShare);
    };
  }, [conversationId, cleanup, applyOffer, startTalkingDetection]);

  return {
    callStatus,
    callType,
    incomingCall,
    isMuted,
    isCameraOff,
    isTalking,
    isLocalTalking,
    isScreenSharing,
    remoteScreenSharing,
    localVideoRef,
    remoteVideoRef,
    screenVideoRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────
// 2×2 black canvas track used as a disabled placeholder video sender
// so replaceTrack always works on audio calls without renegotiation.
function createBlackVideoTrack(): MediaStreamTrack {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 2;
  canvas.getContext("2d")?.fillRect(0, 0, 2, 2);
  const stream = (canvas as any).captureStream(1) as MediaStream;
  return stream.getVideoTracks()[0];
}
