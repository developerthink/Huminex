"use client";

import type React from "react";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile } from "lucide-react";
import { MdOutlineEmojiEmotions } from "react-icons/md";

// Limited set of just 5 emojis
const emojis = ["😀", "❤️", "👍", "👏", "🎉"];

interface EmojiParticle {
  id: number;
  emoji: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
}

export default function EmojiBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [particles, setParticles] = useState<EmojiParticle[]>([]);

  const handleEmojiSelect = (emoji: string, event: React.MouseEvent) => {
    // Get the position of the clicked emoji button
    const rect = event.currentTarget.getBoundingClientRect();
    const buttonCenterX = rect.left + rect.width / 2;
    const buttonCenterY = rect.top + rect.height / 2;

    // Create 5 particles of the same emoji that will animate upward
    const newParticles = Array.from({ length: 5 }).map((_, index) => ({
      id: Date.now() + index,
      emoji,
      // Start from the button position
      startX: buttonCenterX,
      startY: buttonCenterY,
      // Add slight horizontal variation
      endX: buttonCenterX + (Math.random() - 0.5) * 60,
      endY: buttonCenterY - 150 - Math.random() * 50, // Move upward with variation
      delay: index * 0.1, // Stagger the animations
    }));

    setParticles(newParticles);

    // Clear particles after animation completes
    setTimeout(() => {
      setParticles([]);
    }, 2000);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed -translate-y-8 z-50 inset-0">
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{
                  opacity: 1,
                  scale: 1,
                  x: particle.startX,
                  y: particle.startY,
                }}
                animate={{
                  opacity: 0,
                  scale: 0.3,
                  x: particle.endX,
                  y: particle.endY,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.5,
                  delay: particle.delay,
                  ease: "easeOut",
                }}
                className="fixed text-4xl pointer-events-none"
                style={{
                  transform: "translate(-50%, -50%)",
                }}
              >
                {particle.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="size-12 p-0">
            <MdOutlineEmojiEmotions className="!w-7 !h-7" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex gap-2"
          >
            {emojis.map((emoji, index) => (
              <motion.button
                key={index}
                onClick={(event) => handleEmojiSelect(emoji, event)}
                className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded-md transition-colors duration-150"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        </PopoverContent>
      </Popover>
    </>
  );
}
