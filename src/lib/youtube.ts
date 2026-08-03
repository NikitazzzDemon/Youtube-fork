import { Innertube, UniversalCache } from 'youtubei.js';

let ytInstance: Innertube | null = null;
let initPromise: Promise<Innertube> | null = null;

export async function getYouTubeClient(): Promise<Innertube> {
  if (ytInstance) return ytInstance;

  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      console.log('[YouTube Client] Initializing InnerTube engine...');
      const yt = await Innertube.create({
        cache: new UniversalCache(false),
        generate_session_locally: true,
        device_category: 'desktop',
      });
      ytInstance = yt;
      console.log('[YouTube Client] Innertube initialized successfully');
      return yt;
    } catch (err) {
      console.error('[YouTube Client] Error initializing Innertube:', err);
      // Fallback instance creation
      const fallback = await Innertube.create({
        generate_session_locally: true,
      });
      ytInstance = fallback;
      return fallback;
    }
  })();

  return initPromise;
}

// Fallback search mock data if YouTube blocks IP completely in preview sandbox
export function getMockTrendingVideos() {
  return [
    {
      id: 'dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
      description: 'The official video for "Never Gonna Give You Up" by Rick Astley',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      duration: '3:33',
      durationSec: 213,
      viewCount: '1.5B views',
      publishedTime: '14 years ago',
      author: {
        id: 'UCuAXFkgaiiZoznacU6L5E',
        name: 'Rick Astley',
        avatar: 'https://yt3.ggpht.com/ytc/AIdro_mQ1k0f2Lz6',
        subscriberCount: '4.2M subscribers',
        verified: true,
      },
      isLive: false,
    },
    {
      id: 'L_LUpnjgPso',
      title: 'Glassmorphism UI Design Speed Art in Figma 2026',
      description: 'Creating futuristic glass aesthetic, glow effects and capsule pill navigation for modern apps.',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      duration: '12:45',
      durationSec: 765,
      viewCount: '342K views',
      publishedTime: '2 days ago',
      author: {
        id: 'UC_design_lab',
        name: 'Design System Lab',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        subscriberCount: '128K subscribers',
        verified: true,
      },
      isLive: false,
    },
    {
      id: 'jfKfPfyJRdk',
      title: 'lofi hip hop radio 📚 - beats to relax/study to',
      description: 'Peaceful lofi beats for studying, working, relaxing and sleeping.',
      thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
      duration: 'LIVE',
      durationSec: 0,
      viewCount: '24K watching',
      publishedTime: 'Started streaming 2 days ago',
      author: {
        id: 'UCSJ4gkVC6NrvII8umztf0OWg',
        name: 'Lofi Girl',
        avatar: 'https://yt3.ggpht.com/ytc/AIdro_k2L0Zg',
        subscriberCount: '14.1M subscribers',
        verified: true,
      },
      isLive: true,
    },
    {
      id: 'M576WGiDBdQ',
      title: 'Building a Full-Stack Private Media Server with Node.js & React',
      description: 'Complete guide to setting up custom video proxies, chunk streaming, and secure authentication.',
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      duration: '24:10',
      durationSec: 1450,
      viewCount: '89K views',
      publishedTime: '1 week ago',
      author: {
        id: 'UC_vps_dev',
        name: 'VPS Cybercraft',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        subscriberCount: '45K subscribers',
        verified: false,
      },
      isLive: false,
    },
    {
      id: 'fJ9rUzIMcZQ',
      title: 'Queen – Bohemian Rhapsody (Official Video Remastered)',
      description: 'REMASTERED IN HD! Official Music Video for Queen - Bohemian Rhapsody',
      thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
      duration: '5:59',
      durationSec: 359,
      viewCount: '1.7B views',
      publishedTime: '15 years ago',
      author: {
        id: 'UC2Y6B8vM4a3g03x',
        name: 'Queen Official',
        avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80',
        subscriberCount: '18M subscribers',
        verified: true,
      },
      isLive: false,
    },
    {
      id: '5qap5aO4i9A',
      title: 'Lofi Cyberpunk Atmosphere 2026 - Neon Rain & Chill Synthesizers',
      description: 'Relaxing ambient electronic beats with futuristic dark neon visuals.',
      thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      duration: '48:12',
      durationSec: 2892,
      viewCount: '512K views',
      publishedTime: '3 days ago',
      author: {
        id: 'UC_synthwave',
        name: 'Neo Tokyo Radio',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        subscriberCount: '210K subscribers',
        verified: true,
      },
      isLive: false,
    }
  ];
}
