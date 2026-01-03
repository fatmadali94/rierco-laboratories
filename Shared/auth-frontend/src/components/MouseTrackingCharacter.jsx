import React, { useState, useEffect, useRef } from "react";
import headImage from "../assets/Character-without-pupils2.png";
import rightEyeImage from "../assets/left-pupil.png";
import leftEyeImage from "../assets/right-pupil.png";
import mouth1Image from "../assets/mouth1.png";
import mouth2Image from "../assets/mouth2.png";

const MouseTrackingCharacter = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [leftEyePos, setLeftEyePos] = useState({ x: 0, y: 0 });
  const [rightEyePos, setRightEyePos] = useState({ x: 0, y: 0 });
  const [isHoveringHead, setIsHoveringHead] = useState(false);

  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);
  const headRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Configuration
  const config = {
    maxDistance: 15, // Maximum pupil movement in pixels
    smoothing: 0.15, // Lower = smoother but slower (0.1 - 0.3 recommended)
    eyeSocketRadius: 30, // Radius of the eye socket area
  };

  // Smooth lerp function for natural eye movement
  const lerp = (start, end, factor) => {
    return start + (end - start) * factor;
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      // Check if mouse is hovering over the head
      if (headRef.current) {
        const headRect = headRef.current.getBoundingClientRect();
        const isInside =
          e.clientX >= headRect.left &&
          e.clientX <= headRect.right &&
          e.clientY >= headRect.top &&
          e.clientY <= headRect.bottom;

        setIsHoveringHead(isInside);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const animate = () => {
      const calculateEyePosition = (eyeRef, currentPos) => {
        if (!eyeRef.current) return currentPos;

        const eyeRect = eyeRef.current.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;

        // Calculate direction from eye to mouse
        const deltaX = mousePos.x - eyeCenterX;
        const deltaY = mousePos.y - eyeCenterY;
        const angle = Math.atan2(deltaY, deltaX);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Scale the distance to constrain within eye socket
        const normalizedDistance = Math.min(distance / 50, 1);
        const actualDistance = normalizedDistance * config.maxDistance;

        // Calculate target position
        const targetX = Math.cos(angle) * actualDistance;
        const targetY = Math.sin(angle) * actualDistance;

        // Smooth transition using lerp
        const x = lerp(currentPos.x, targetX, config.smoothing);
        const y = lerp(currentPos.y, targetY, config.smoothing);

        return { x, y };
      };

      setLeftEyePos((prev) => calculateEyePosition(leftEyeRef, prev));
      setRightEyePos((prev) => calculateEyePosition(rightEyeRef, prev));

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePos]);

  return (
    <div className="flex items-center justify-center opacity-50 bg-[#000000]">
      <div className="relative">
        {/* Character Container */}
        <div className="relative inline-block">
          {/* Head with white pupils (base layer) */}
          <img
            ref={headRef}
            src={headImage}
            alt="Character Head"
            className="w-96 h-auto select-none"
            draggable="false"
          />

          {/* Left Eye Container */}
          <div
            ref={leftEyeRef}
            className="absolute pointer-events-none"
            style={{
              top: "43.6%",
              left: "31.7%",
              width: "60px",
              height: "60px",
            }}
          >
            {/* Left Eyeball */}
            <img
              src={leftEyeImage}
              alt="Left Eyeball"
              className="absolute inset-0 w-full h-full select-none"
              draggable="false"
              style={{
                transform: `translate(${leftEyePos.x}px, ${leftEyePos.y}px)`,
              }}
            />
          </div>

          {/* Right Eye Container */}
          <div
            ref={rightEyeRef}
            className="absolute pointer-events-none"
            style={{
              top: "43.6%",
              right: "32.2%",
              width: "60px",
              height: "60px",
            }}
          >
            {/* Right Eyeball */}
            <img
              src={rightEyeImage}
              alt="Right Eyeball"
              className="absolute inset-0 w-full h-full select-none"
              draggable="false"
              style={{
                transform: `translate(${rightEyePos.x}px, ${rightEyePos.y}px)`,
              }}
            />
          </div>

          {/* Mouth Container - Switches based on hover */}
          <div
            className="absolute pointer-events-none"
            style={{
              // IMPORTANT: Adjust these values to position the mouth correctly
              // You'll need to tweak these percentages based on your character
              top: "7%", // Distance from top of head image
              left: "50%", // Centered horizontally
              transform: "translateX(-50%)", // Center alignment
              width: "370px", // Adjust based on your mouth image size
              height: "350px", // Adjust based on your mouth image size
            }}
          >
            {/* Mouth Image - shows mouth1 when hovering, mouth2 otherwise */}
            <img
              src={isHoveringHead ? mouth2Image : mouth1Image}
              alt="Character Mouth"
              className="w-full h-full select-none transition-opacity duration-200"
              draggable="false"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MouseTrackingCharacter;
