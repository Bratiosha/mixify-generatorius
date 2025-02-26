"use client"; // Mark this component as client-side only

import { motion, MotionProps } from "framer-motion";
import { ReactNode } from "react";

interface ClientWrapperProps extends MotionProps {
  children: ReactNode;
}

export default function ClientWrapper({ children, ...motionProps }: ClientWrapperProps) {
  return <motion.div {...motionProps}>{children}</motion.div>;
}