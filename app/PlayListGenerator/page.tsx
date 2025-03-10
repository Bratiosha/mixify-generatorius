// app/playlist-generator/page.tsx
import PlaylistGenerator from "@/components/PlaylistGenerator";
import Layout from "../spotifyLayout";

export default function PlaylistGeneratorPage() {
  return (
    <Layout>
      <PlaylistGenerator />
    </Layout>
  );
}