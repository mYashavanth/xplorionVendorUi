import { Box } from "@chakra-ui/react";

function Loading() {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      className="loadingSection"
    >
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
              offset="0%"
              style={{ stopColor: "#54AB6A", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#0099FF", stopOpacity: 1 }}
            />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#grad1)"
          strokeWidth="8"
          fill="none"
          strokeDasharray="283"
          strokeDashoffset="75"
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </Box>
  );
}

export default Loading;
