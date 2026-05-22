import { AnimatePresence, motion } from "framer-motion";

export function TypingIndicator({
  typingUsernames,
}: {
  typingUsernames: string[];
}) {
  if (typingUsernames.length === 0) {
    return null;
  }

  const formatTypingUsers = (usernames: string[]): string => {
    if (usernames.length === 1) {
      return `${usernames[0]} is typing...`;
    }
    if (usernames.length === 2) {
      return `${usernames[0]} and ${usernames[1]} are typing...`;
    }
    const rest = usernames.length - 2;
    return `${usernames[0]}, ${usernames[1]} and ${rest} other${rest > 1 ? "s are" : " is"} typing...`;
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="typing-indicator"
        role="status"
        aria-live="polite"
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 3 }}
        transition={{ duration: 0.15 }}
        className="mx-auto flex max-w-3xl items-center gap-1.5 px-6 py-1 text-[10.5px] text-[var(--text-muted)] select-none bg-transparent"
      >
        <div className="flex items-center gap-1">
          <motion.span
            animate={{ opacity: [0.35, 1, 0.35], y: [0, -1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
            className="inline-block h-1 w-1 rounded-full bg-[var(--text-muted)]"
          />
          <motion.span
            animate={{ opacity: [0.35, 1, 0.35], y: [0, -1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.15 }}
            className="inline-block h-1 w-1 rounded-full bg-[var(--text-muted)]"
          />
          <motion.span
            animate={{ opacity: [0.35, 1, 0.35], y: [0, -1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
            className="inline-block h-1 w-1 rounded-full bg-[var(--text-muted)]"
          />
        </div>
        <span className="font-normal text-[10.5px]">{formatTypingUsers(typingUsernames)}</span>
      </motion.div>
    </AnimatePresence>
  );
}
