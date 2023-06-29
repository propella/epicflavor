"use client";

import React, { useRef, useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";

async function postImage(url: string, { arg }: { arg: { imageUrl: string } }) {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(arg),
  }).then((res) => res.json());
}

async function startCamera(videoRef: React.RefObject<HTMLVideoElement>) {
  let stream: MediaStream | null = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: "environment" } },
    });
  } catch (err) {
    console.info("Ignore: OverconstrainedError", err);
  }

  if (!stream) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 400, height: 400 },
      });
    } catch (err) {
      console.error("Camera not found", err);
      return;
    }
  }
  // Link the video source to the video element
  if (videoRef != null && videoRef.current != null) {
    videoRef.current.srcObject = stream;
  }
}

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const captureLabel = imageUrl ? "Retake" : "Capture";

  const {
    trigger,
    isMutating,
    data: postResult,
    error,
  } = useSWRMutation("/api", postImage /* options */);

  useEffect(() => {
    startCamera(videoRef);
  }, []);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const file = event?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async function () {
        if (typeof reader.result === "string") {
          await updateImage(reader.result);
        }
      };
    }
  };

  const updateImage = async (newImageUrl: string) => {
    // console.log("newImageUrl", newImageUrl);
    setImageUrl(newImageUrl);

    const result = await trigger({ imageUrl: newImageUrl } /* options */);
    console.log(result);

    // Stop all video tracks
    if (videoRef.current == null) {
      return;
    }
    if (videoRef.current.srcObject != null) {
      const mediaStream = videoRef.current.srcObject as MediaStream;
      mediaStream.getTracks().forEach((track) => track.stop());
    }

    // Remove srcObject from the videoRef.current
    videoRef.current.srcObject = null;
  };

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
      canvas
        .getContext("2d")!
        .drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      // Get the image data URL from the canvas
      const capturedImageUrl = canvas.toDataURL("image/png");
      // Do something with the image (imageUrl)
      //console.log(capturedImageUrl);

      await updateImage(capturedImageUrl);
    } else {
      setImageUrl("");
      startCamera(videoRef);
    }
  };
  let keywords = "";
  let aiImageUr = "";
  if (postResult) {
    keywords = postResult.description;
    if (keywords) {
      aiImageUr =
        "https://a2bc-35-238-195-40.ngrok-free.app/" +
        keywords.replace(" ", "_");
    }
  }

  /* eslint-disable @next/next/no-img-element */
  return (
    <div>
      <video
        ref={videoRef}
        autoPlay={true}
        playsInline={true}
        muted={true}
        className="w-full m-2"
        style={{ display: imageUrl ? "none" : "block" }}
      />

      <img
        src={imageUrl}
        alt="Captured"
        style={{ display: imageUrl ? "block" : "none" }}
        className="m-2"
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {imageUrl && !isMutating && postResult && <div className="m-2">{postResult.result}</div>}

      {!isMutating && <button onClick={captureImage} className="bg-sky-500 hover:bg-sky-700 m-1 py-1 px-4 rounded-full">{captureLabel}</button>}
      {!isMutating && (
        <div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="bg-sky-500 hover:bg-sky-700 m-1 py-1 px-4 rounded-full"/>
        </div>
      )}
      <div>{isMutating ? "Loading..." : ""}</div>
      {imageUrl && !isMutating && postResult && (
        <a target="_blank" href={aiImageUr}>
          {keywords}
        </a>
      )}
      {error && <div>error</div>}
    </div>
  );
}
