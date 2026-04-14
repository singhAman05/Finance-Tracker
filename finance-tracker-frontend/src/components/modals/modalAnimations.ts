// Shared modal animation config — use these in all modals for consistency
export const MODAL_OVERLAY_VARIANTS = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

export const MODAL_CONTENT_VARIANTS = {
    hidden: { scale: 0.95, y: 16, opacity: 0 },
    visible: {
        scale: 1,
        y: 0,
        opacity: 1,
        transition: { type: "spring" as const, stiffness: 320, damping: 28 },
    },
    exit: {
        scale: 0.95,
        y: 16,
        opacity: 0,
        transition: { duration: 0.15, ease: "easeIn" as const },
    },
};

export const MODAL_TRANSITION = {
    type: "spring" as const,
    stiffness: 320,
    damping: 28,
};