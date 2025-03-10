// app/artist-playlist-generator/page.tsx
import Layout from "../spotifyLayout";
import ArtistPlaylistGenerator from "../../components/ArtistPlaylistGenerator";

export default function ArtistPlaylistGeneratorPage() {
  return (
    <Layout>
      <ArtistPlaylistGenerator />
    </Layout>
  );
}