"use client";

export function SongItem({
  song,
  isSelected,
  onSelect,
}: {
  song: { id: string; name: string; artist: string; album: string; image: string };
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-4 p-2 border rounded cursor-pointer ${
        isSelected ? "bg-green-200" : "bg-white"
      }`}
      onClick={onSelect}
    >
      <img src={song.image} alt={song.name} className="w-12 h-12 rounded" />
      <div>
        <p className="font-semibold">{song.name}</p>
        <p className="text-sm text-gray-600">{song.artist} - {song.album}</p>
      </div>
    </div>
  );
}
