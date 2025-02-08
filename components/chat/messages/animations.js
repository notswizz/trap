// Add animation keyframes
export const animations = `
  @keyframes border-glow {
    0% {
      border-color: rgba(167, 139, 250, 0.1);
    }
    50% {
      border-color: rgba(167, 139, 250, 0.3);
    }
    100% {
      border-color: rgba(167, 139, 250, 0.1);
    }
  }

  @keyframes blink {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }

  @keyframes progress-indeterminate {
    0% {
      transform: translateX(-100%);
      width: 50%;
    }
    100% {
      transform: translateX(200%);
      width: 50%;
    }
  }
`; 