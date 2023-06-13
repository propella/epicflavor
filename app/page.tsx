'use client'

import React, { useRef, useEffect, useState } from 'react';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
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
  }, []);

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;


    if (video && canvas !== null) {
      // Set the canvas dimensions to match the video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to the canvas
      canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      // Get the image data URL from the canvas
      const capturedImageUrl = canvas.toDataURL('image/png');
      // Do something with the image (imageUrl)
      console.log(capturedImageUrl);
      setImageUrl(capturedImageUrl);


      // Stop all video tracks
      if (video.srcObject != null) {
        const mediaStream = video.srcObject as MediaStream;
        mediaStream.getTracks().forEach(track => track.stop());
      }

      // Remove srcObject from the video
      video.srcObject = null;
    }
  };

  return (
    <div>
      {!imageUrl && <video ref={videoRef} autoPlay={true} /> }
      {imageUrl && <img src={imageUrl} alt="Captured" />}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button onClick={captureImage}>Capture</button>

    </div>
  );
}
