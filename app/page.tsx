import LoginButton from "@/components/LoginLogoutButton";
import UserGreetText from "@/components/UserGreetText";
import Image from "next/image";
import ClientWrapper from "@/components/ClientWrapper";

export default function Home() {
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
            },
            {
              title: "Seamless Integration",
              description: "Connect directly to your Spotify account and deploy playlists in seconds.",
            },
            {
              title: "Discover Music",
              description: "Find new songs and artists tailored to your taste with intelligent recommendations.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-8 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-300 hover:scale-105"
            >
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
    </main>
  );
}
