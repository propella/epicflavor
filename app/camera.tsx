"use client";

import React, { useRef, useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";

async function postImage(url: string, { arg }: { arg: { imageUrl: string } }) {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(arg),
  }).then((res) => res.json());
}

async function receiveFlavorText(
  url: string,
  { arg }: { arg: { caption: string } }
) {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(arg),
  }).then((res) => res.json());
}

async function startCamera(videoRef: React.RefObject<HTMLVideoElement>) {
  let stream: MediaStream | null = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: "environment" }, width: 320, height: 320 },
    });
  } catch (err) {
    console.info("Ignore: OverconstrainedError", err);
  }

  if (!stream) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 320, height: 320 },
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
    trigger: triggerFlavor,
    isMutating: isMutating,
    data: postResult,
    error,
  } = useSWRMutation("/api/flavor", receiveFlavorText);

  const {
    trigger: triggerVision,
    isMutating: isMutatingVision,
    data: dataVison,
    error: errorVision,
  } = useSWRMutation("/api/vision", postImage);

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

    const { caption } = await triggerVision({ imageUrl: newImageUrl });
    console.log(caption);

    const result = await triggerFlavor({ caption });
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
  let cardname = "";
  let cardtext = "";
  if (dataVison) {
    keywords = dataVison.caption;
    if (keywords) {
      aiImageUr =
        "https://a2bc-35-238-195-40.ngrok-free.app/" +
        keywords.replace(" ", "_");
    }
  }

  if (postResult && postResult.flavorText) {
    const results = postResult.flavorText.split("\n");
    cardname = results[0];
    cardtext = results.slice(1).join("\n");
  }

  /* eslint-disable @next/next/no-img-element */
  return (
    <div>
      <video
        ref={videoRef}
        autoPlay={true}
        playsInline={true}
        muted={true}
        style={{ display: imageUrl ? "none" : "block" }}
        className="m-2 mx-auto"
      />

      <img
        src={imageUrl}
        alt="Captured"
        style={{ display: imageUrl ? "block" : "none" }}
        className="m-2 mx-auto"
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {imageUrl && !isMutating && postResult && (
        <div className="m-2">
          <div>{cardname}</div>
          <div>{cardtext}</div>
        </div>
      )}

      {!isMutating && (
        <button
          onClick={captureImage}
          className="bg-sky-500 hover:bg-sky-700 m-1 py-1 px-4 rounded-full"
        >
          {captureLabel}
        </button>
      )}
      {!isMutating && (
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="bg-sky-500 hover:bg-sky-700 m-1 py-1 px-4 rounded-full"
          />
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
