import React from "react";

const PLACEHOLDER_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const ZoomIFrame: React.FC = () => (
  <video
    src={PLACEHOLDER_VIDEO_URL}
    autoPlay
    loop
    muted
    playsInline
    className="w-full h-full object-cover"
  />
);

export default ZoomIFrame;