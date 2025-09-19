import React from "react";
import { Box, Transition } from "@mantine/core";

interface TypingIndicatorProps {
  size?: "sm" | "md" | "lg";
}

export function TypingIndicator({ size = "md" }: TypingIndicatorProps) {
  const dotSize = size === "sm" ? 6 : size === "md" ? 8 : 10;
  const gap = size === "sm" ? 2 : size === "md" ? 3 : 4;
  const [visibleDots, setVisibleDots] = React.useState<boolean[]>([
    false,
    false,
    false,
  ]);

  React.useEffect(() => {
    const animateSequence = () => {
      // Reset all dots
      setVisibleDots([false, false, false]);

      // Staggered appearance
      setTimeout(() => setVisibleDots([true, false, false]), 0);
      setTimeout(() => setVisibleDots([true, true, false]), 200);
      setTimeout(() => setVisibleDots([true, true, true]), 400);

      // Hold for a moment
      setTimeout(() => {
        // Fade out in reverse order
        setVisibleDots([true, true, false]);
        setTimeout(() => setVisibleDots([true, false, false]), 150);
        setTimeout(() => setVisibleDots([false, false, false]), 300);
      }, 800);
    };

    // Start immediately
    animateSequence();

    // Repeat every 1.8 seconds
    const interval = setInterval(animateSequence, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        gap: `${gap}px`,
        padding: "8px 0",
        height: `${dotSize + 4}px`,
      }}
    >
      {[0, 1, 2].map((index) => (
        <Transition
          key={index}
          mounted={visibleDots[index]}
          transition="fade"
          duration={200}
          timingFunction="ease-out"
        >
          {(styles) => (
            <Box
              style={{
                ...styles,
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                borderRadius: "50%",
                backgroundColor: "#9ca3af",
                transform: visibleDots[index]
                  ? "translateY(-2px) scale(1.1)"
                  : "translateY(0) scale(1)",
                transition: "transform 0.2s ease-out",
              }}
            />
          )}
        </Transition>
      ))}
    </Box>
  );
}
