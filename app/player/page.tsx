"use client";

import React, { useEffect, useRef, useState } from "react";
import YouTubePlayer from "@/components/YouTubePlayer";
import DanmakuComp from "@/components/Danmaku";
import { useData } from "@/context/DataContext";
import { VideoProvider } from "@/context/VideoContext";
import dynamic from "next/dynamic";

// Dynamically import the ChewingTesting component with SSR disabled
const ChewingTestingNoSSR = dynamic(
  () => import("@/components/ChewingTesting"),
  {
    ssr: false, // This disables server-side rendering for the component
  }
);

const PlayerPage: React.FC = () => {
  const {
    videoLink,
    chewingFrequency,
    isGazing,
    isEating,
    userBehaviorInfo,
    setUserBehaviorInfo,
  } = useData();

  const isFirstChange = useRef(true); // Track first state change

  useEffect(() => {
    const updateBehaviorInfo = () => {
      if (isFirstChange.current) {
        // Skip first state change
        isFirstChange.current = false;
        return;
      }

      if (!isEating) {
        setUserBehaviorInfo((prevInfo) => ({
          resumeChewingTimes: prevInfo?.resumeChewingTimes || [],
          stopChewingTimes: prevInfo?.stopChewingTimes
            ? [...prevInfo.stopChewingTimes, new Date()]
            : [new Date()],
        }));
      } else {
        setUserBehaviorInfo((prevInfo) => ({
          resumeChewingTimes: prevInfo?.resumeChewingTimes
            ? [...prevInfo.resumeChewingTimes, new Date()]
            : [new Date()],
          stopChewingTimes: prevInfo?.stopChewingTimes || [],
        }));
      }
    };

    updateBehaviorInfo();
  }, [isEating]);

  // Check if the user is gazing at the screen and whether it changes over time
  useEffect(() => {
    console.log("isGazing value:", isGazing);
  }, [isGazing]);

  // Extract YouTube video ID
  const getYouTubeVideoId = (url: string) => {
    if (videoLink) {
      const urlParams = new URLSearchParams(new URL(url).search);
      return urlParams.get("v");
    }
    return "";
  };

  const videoId = getYouTubeVideoId(videoLink);

  return (
    <VideoProvider>
      <div className="h-screen w-full bg-black flex">
        {/* Video Player in the center of the left side */}
        <div className="w-1/2 h-full flex items-center justify-center p-2">
          {videoId ? (
            <div className="relative w-full" style={{ paddingTop: "56.25%" /* 16:9 Aspect Ratio */ }}>
              <div className="absolute top-0 left-0 w-full h-full">
                <YouTubePlayer videoId={videoId} />
                {!isEating && <DanmakuComp />}
              </div>
            </div>
          ) : (
            <div className="text-white">No video link provided or invalid video ID.</div>
          )}
        </div>

        {/* Chewing Testing on the right side */}
        <div className="w-1/2 h-full p-2 bg-gray-800">
          <ChewingTestingNoSSR />
        </div>
      </div>
    </VideoProvider>
  );
};

export default PlayerPage;
