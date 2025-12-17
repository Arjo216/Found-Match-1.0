
// components/MatchCard.tsx
import React from "react";
import Link from "next/link";

type Props = {
  id: string;
  name: string;
  headline?: string;
  image?: string;
  summary?: string;
  onLike?: (id: string) => void;
  onPreview?: (id: string) => void;
  className?: string;
};

export default function MatchCard({ id, name, headline, image, summary, onLike, onPreview, className = "" }: Props) {
  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow p-0 ${className}`}>
      <div className="w-full h-40 relative bg-gray-100">
        {image ? (
          // next/image would require width/height; using img for simplicity
          // Replace with <Image ... /> if you prefer
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 flex items-center justify-center text-2xl text-gray-500">{name?.slice(0,1)}</div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold leading-snug">{name}</h3>
            <div className="text-sm text-gray-500 mt-1">{headline}</div>
            {summary && <div className="text-sm text-gray-600 mt-2 line-clamp-2">{summary}</div>}
          </div>

          <div className="flex flex-col gap-2 items-end">
            <button
              onClick={() => onLike?.(id)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
            >
              Connect
            </button>

            <Link href={`/profile/view?id=${id}`} className="text-sm text-gray-600 underline">
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
