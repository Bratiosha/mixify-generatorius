"use client";

import LoginButton from "@/components/LoginLogoutButton";
import UserGreetText from "@/components/UserGreetText";
import Image from "next/image";
import ClientWrapper from "@/components/ClientWrapper";
import { motion, useAnimation } from "framer-motion";


export default function Home() {
  const testimonials = [
    {
      name: "John Doe",
      testimonial: "Mixify has completely changed how I create playlists. It's so easy and fun to use!",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      name: "Jane Smith",
      testimonial: "I love how seamlessly Mixify integrates with Spotify. It's a game-changer!",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    {
      name: "Alex Johnson",
      testimonial: "Discovering new music has never been easier. Mixify is a must-have for music lovers!",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    },
    {
      name: "Emily Davis",
      testimonial: "The playlist customization options are amazing. I can't imagine going back to manual playlist creation!",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
      name: "Michael Brown",
      testimonial: "Mixify's recommendations are spot-on. I've discovered so many new artists!",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    {
      name: "Sarah Wilson",
      testimonial: "The offline mode is a lifesaver. I can listen to my playlists anywhere!",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    },
  ];

  return (
    <main className="relative flex min-h-screen flex-col bg-gradient-to-b from-[#1DB954] via-[#121212] to-[#000000] text-white p-10">
      {/* Header Section */}
      <div className="absolute top-5 left-5 flex flex-col items-start space-y-2 p-4">
        <Image src="/images/Mixify-logo.png" alt="Mixify Logo" width={160} height={50} className="ml-4 mb-4" />
        <UserGreetText />
      </div>
      <div className="absolute top-5 right-5 p-4">
        <LoginButton />
      </div>

      {/* Hero Section */}
      <ClientWrapper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center max-w-2xl mx-auto mt-32">
          <h1 className="text-6xl font-extrabold tracking-tight sm:text-7xl">
            Welcome to <span className="text-[#38ff7e]">Mixify</span>
          </h1>
          <p className="mt-6 text-lg text-gray-300">
            Your ultimate destination for creating, curating, and deploying personalized playlists directly to your Spotify account. Enjoy seamless music discovery and an intuitive experience built just for music lovers like you!
          </p>
        </div>
      </ClientWrapper>

      {/* Features Section */}
      <ClientWrapper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto text-center">
          {[
            {
              title: "Create Playlists",
              description: "Easily generate and customize playlists with your favorite tracks.",
              icon: "🎵",
            },
            {
              title: "Seamless Integration",
              description: "Connect directly to your Spotify account and deploy playlists in seconds.",
              icon: "🔗",
            },
            {
              title: "Discover Music",
              description: "Find new songs and artists tailored to your taste with intelligent recommendations.",
              icon: "🔍",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-8 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-300 hover:scale-105"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h2 className="text-2xl font-bold text-[#1DB954]">{feature.title}</h2>
              <p className="mt-4 text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </ClientWrapper>

      {/* Why Mixify Section */}
      <ClientWrapper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="mt-20 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1DB954]">Why Mixify?</h2>
          <p className="mt-6 text-lg text-gray-300">
            Mixify is designed to revolutionize the way you interact with music. Whether you're crafting the perfect workout mix or setting the mood for a chill evening, we provide the tools to make it happen effortlessly.
          </p>
        </div>
      </ClientWrapper>

      {/* Testimonials Section with Left-to-Right Scrolling */}
      <ClientWrapper>
        <div className="mt-20 max-w-6xl mx-auto overflow-hidden">
          <h2 className="text-3xl font-bold text-[#1DB954] text-center mb-8">What Our Users Say</h2>
          <div className="relative w-full h-64 overflow-hidden">
            <motion.div
              className="absolute flex space-x-8"
              animate={{
                x: ["-100%", "0%"], // Move from left to right
              }}
              transition={{
                duration: 50, // Adjust speed here
                repeat: Infinity, // Loop infinitely
                ease: "linear", // Smooth linear animation
              }}
            >
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="w-96 p-6 bg-gray-800 rounded-lg shadow-lg flex-shrink-0"
                  initial={{ opacity: 0, x: -100 }} // Start off-screen to the left
                  whileInView={{ opacity: 1, x: 0 }} // Fade in when in view
                  exit={{ opacity: 0, x: 100 }} // Fade out when exiting to the right
                  transition={{ duration: 1 }} // Smooth fade in/out
                >
                  <div className="flex items-center space-x-4">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                    <h3 className="text-xl font-bold">{testimonial.name}</h3>
                  </div>
                  <p className="mt-4 text-gray-300">{testimonial.testimonial}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </ClientWrapper>

      {/* Call-to-Action Section */}
      <ClientWrapper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <div className="mt-20 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1DB954]">Ready to Elevate Your Music Experience?</h2>
          <p className="mt-6 text-lg text-gray-300">
            Join thousands of music lovers who are already using Mixify to create, discover, and share their favorite playlists.
          </p>
        </div>
      </ClientWrapper>

      {/* Footer Section */}
      <footer className="mt-20 text-center text-gray-400">
        <p>© 2025 Mixify. All rights reserved.</p>
        <p className="mt-2">
          Made with ❤️ by{" "}
          <a href="https://mixify.lt" className="text-[#1DB954] hover:underline">
            Mixify
          </a>
        </p>
      </footer>
    </main>
  );
}