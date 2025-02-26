"use client"; // Mark this component as client-side only

import React from "react";
import { LoginForm } from "./components/LoginForm";

const LoginPage = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-[#1DB954] to-[#121212]">
      <LoginForm />
    </div>
  );
};

export default LoginPage;