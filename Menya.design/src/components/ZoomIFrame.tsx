import React from "react";

import { ZoomIFrameProps } from "../types";

const ZoomIFrame: React.FC<ZoomIFrameProps> = ({ meetingId, password, userName = "Menya User" }) => {
  const zoomUrl = `https://zoom.us/wc/${meetingId}/join?pwd=${password}${userName ? `&uname=${encodeURIComponent(userName)}` : ""}`;

  return (
    <iframe
      src={zoomUrl}
      title="Zoom Prototyping Frame"
      allow="camera; microphone; fullscreen, display-capture"
      className="w-full h-full border-0"
    />
  );
};

export default ZoomIFrame;