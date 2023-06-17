'use client'

import React, { useRef, useEffect, useState } from 'react';
import useSWRMutation from 'swr/mutation'

async function postImage(url: string, { arg }: { arg: { imageUrl: string } }) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(arg)
  }).then(res => res.json())
}

function startCamera(videoRef: React.RefObject<HTMLVideoElement>) {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function (stream) {
        // Link the video source to the video element
        if (videoRef != null && videoRef.current != null) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(function (err) {
        console.log("An error occurred: " + err);
      });
  }
}

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const captureLabel = imageUrl ? "Retake" : "Capture";

  const { trigger, data: postResult, error } = useSWRMutation('/api', postImage, /* options */)

  useEffect(() => {
    startCamera(videoRef);
  }, []);

  const captureImage = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!video || !canvas) {
      return;
    }

    if (captureLabel === "Capture") {

      // Set the canvas dimensions to match the video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to the canvas
      canvas.getContext('2d')!.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      // Get the image data URL from the canvas
      const capturedImageUrl = canvas.toDataURL('image/png');
      // Do something with the image (imageUrl)
      //console.log(capturedImageUrl);
      setImageUrl(capturedImageUrl);
      const result = await trigger({ imageUrl: capturedImageUrl }, /* options */)
      console.log(result);

      // Stop all video tracks
      if (video.srcObject != null) {
        const mediaStream = video.srcObject as MediaStream;
        mediaStream.getTracks().forEach(track => track.stop());
      }

      // Remove srcObject from the video
      video.srcObject = null;

    } else {
      setImageUrl("");
      startCamera(videoRef);
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay={true} style={{ display: imageUrl ? "none" : "block" }} />
      <img src={imageUrl} alt="Captured" style={{ display: imageUrl ? "block" : "none" }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button onClick={captureImage}>{captureLabel}</button>
      {postResult && <div>{postResult.result}</div> }
      {error && <div>error</div>}
    </div>
  );
}
