import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { type Article, articles as mockArticles } from "@/lib/mockData";

type VideoItem = {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  articleId: string;
  source: "youtube" | "internal";
};

type Props = {
  candidateVideos?: VideoItem[];
};

const defaultVideos: VideoItem[] = [
  {
    id: "v1",
    title: "Inside the New National Policy on Renewable Energy",
    duration: "4:12",
    thumbnail: "https://images.unsplash.com/photo-1542204057-f8f85f7f7ff3?auto=format&fit=crop&w=1200&q=80",
    articleId: "1",
    source: "youtube",
  },
  {
    id: "v2",
    title: "Interview: Ministers React to Digital Rights Bill",
    duration: "5:30",
    thumbnail: "https://images.unsplash.com/photo-1485217988980-11786ced9454?auto=format&fit=crop&w=1200&q=80",
    articleId: "2",
    source: "internal",
  },
  {
    id: "v3",
    title: "AI Startup Trail: Scaling Across Africa",
    duration: "3:45",
    thumbnail: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=1200&q=80",
    articleId: "3",
    source: "youtube",
  },
  {
    id: "v4",
    title: "Election Update: Markets and Policy Outlook",
    duration: "6:05",
    thumbnail: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    articleId: "4",
    source: "internal",
  },
];

const VideoNewsSection = ({ candidateVideos }: Props) => {
  const videos = candidateVideos && candidateVideos.length > 0 ? candidateVideos : defaultVideos;

  const featured = videos[0];
  const list = videos.slice(1, 5);

  return (
    <section className="container py-8 md:py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold">Video News</h2>
        <Link to="/videos" className="text-sm font-semibold text-primary hover:underline">View all videos</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link to={`/video/${featured.articleId}`} className="relative group overflow-hidden rounded border border-border">
          <img src={featured.thumbnail} alt={featured.title} className="w-full h-[320px] object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <button className="bg-white/90 text-black rounded-full p-3 shadow">
              <Play className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4 bg-background">
            <p className="text-xs uppercase font-bold tracking-wide text-muted-foreground">Featured</p>
            <h3 className="mt-1 text-lg font-semibold leading-snug">{featured.title}</h3>
            <p className="text-xs text-muted-foreground mt-2">{featured.duration}</p>
          </div>
        </Link>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((video) => (
            <Link key={video.id} to={`/video/${video.articleId}`} className="relative overflow-hidden rounded border border-border group">
              <img src={video.thumbnail} alt={video.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              <div className="absolute right-2 top-2 px-2 py-1 bg-black/70 text-white text-xs rounded">{video.duration}</div>
              <div className="p-3 bg-background">
                <h4 className="text-sm font-semibold leading-tight">{video.title}</h4>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoNewsSection;
