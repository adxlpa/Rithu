import { AudioTrack, VideoItem, MagazineSpread, MagazinePage, MagazineEditionInfo } from "../types";

import cemCampusSunriseImg from "../assets/images/iliad.jpg";
import titleHeroImg from "../assets/images/title.jpg";
import rithuCardImg from "../assets/images/magimag.png";

const rithuCoverImg = rithuCardImg;
const letsTalkArtImg = rithuCardImg;
const myFlowerTulipsImg = titleHeroImg;
const monsoonBananaLeafImg = titleHeroImg;
const cemCollectiveSunsetImg = cemCampusSunriseImg;

export {
  rithuCoverImg,
  cemCampusSunriseImg,
  titleHeroImg,
  rithuCardImg,
  letsTalkArtImg,
  myFlowerTulipsImg,
  monsoonBananaLeafImg,
  cemCollectiveSunsetImg,
};

export const INITIAL_AUDIO_TRACKS: AudioTrack[] = [
  {
    "id": "1",
    "title": "മൂന്നാറിലേക്കുള്ള യാത്ര",
    "englishSubtitle": "Journey to Munnar",
    "author": "Harikrishnan K., Mechanical '26",
    "category": "Travelogue",
    "language": "Malayalam",
    "duration": "5:32",
    "durationSeconds": 332,
    "publishedDate": "Feb 18, 2026",
    "description": "A reflective travel narrative recounting the misty morning ascent through the Western Ghats to the high-altitude campus."
  },
  {
    "id": "2",
    "title": "Editorial: The Architecture of Memory",
    "author": "Editorial Board",
    "category": "Editorial",
    "language": "English",
    "duration": "3:10",
    "durationSeconds": 190,
    "publishedDate": "Feb 14, 2026",
    "description": "An introductory spoken editorial exploring how physical spaces, granite facades, and mountain mist anchor our memories."
  },
  {
    "id": "3",
    "title": "മഴ തോരാത്ത ക്യാമ്പസ്",
    "englishSubtitle": "Campus in Rain",
    "author": "Sneha V., EEE '25",
    "category": "Poetry",
    "language": "Malayalam",
    "duration": "4:18",
    "durationSeconds": 258,
    "publishedDate": "Feb 10, 2026",
    "description": "Spoken verses dedicated to the unrelenting monsoon showers enveloping the laboratories and pine ridges of Munnar."
  },
  {
    "id": "4",
    "title": "Conversation with Dr. Radhakrishnan",
    "author": "Tech Forum",
    "category": "Interview",
    "language": "English",
    "duration": "14:05",
    "durationSeconds": 845,
    "publishedDate": "Jan 28, 2026",
    "description": "An in-depth dialogue on sustainable micro-hydro systems and alpine civil engineering in fragile ecological zones."
  },
  {
    "id": "5",
    "title": "The Midnight Lab Experiments",
    "author": "Arjun S., CSE '27",
    "category": "Fiction",
    "language": "English",
    "duration": "6:45",
    "durationSeconds": 405,
    "publishedDate": "Jan 15, 2026",
    "description": "A whimsical fiction piece on late-night neural network training runs inside the campus computing centre when fog seeps through the louvers."
  },
  {
    "id": "6",
    "title": "വായനയുടെ വസന്തം",
    "englishSubtitle": "Spring of Reading",
    "author": "Literary Club",
    "category": "Discussion",
    "language": "Malayalam",
    "duration": "8:20",
    "durationSeconds": 500,
    "publishedDate": "Dec 22, 2025",
    "description": "A warm group roundtable discussing classic Malayalam anthologies, translation craft, and mountain poetry."
  }
];

export const INITIAL_VIDEO_ITEMS: VideoItem[] = [
  {
    "id": "hero",
    "title": "ELYSION '26 · Munnar",
    "tagline": "Official Highlights & Aftermovie",
    "dateStr": "Feb 14–15, 2026",
    "category": "Events",
    "duration": "8:42",
    "durationSeconds": 522,
    "image": cemCampusSunriseImg,
    "imageAlt": "Cinematic wide-angle shot of open-air amphitheater celebration at College of Engineering Munnar.",
    "isFeatured": true,
    "description": "The flagship annual cultural symposium capturing the amphitheatre concert, student showcases, mountain acoustics, and night celebrations amidst Munnar fog."
  },
  {
    "id": "1",
    "title": "RoboFest Tech Expo 2025",
    "tagline": "Tech Symposium",
    "dateStr": "Dec 10, 2025",
    "category": "Workshops Events",
    "duration": "4:15",
    "durationSeconds": 255,
    "image": cemCollectiveSunsetImg,
    "imageAlt": "Students assembling custom robotic rovers and microcontrollers in a bright technical laboratory.",
    "description": "Documentation of automated rovers, IoT telemetry prototypes, and microcontrollers built by student teams for rugged terrain exploration."
  },
  {
    "id": "2",
    "title": "Alumni Voices: From Munnar to CERN",
    "tagline": "Dialogue & Keynote",
    "dateStr": "Nov 22, 2025",
    "category": "Interviews",
    "duration": "12:30",
    "durationSeconds": 750,
    "image": monsoonBananaLeafImg,
    "imageAlt": "Intimate portrait interview setting of an engineer researcher seated in an architectural academic lounge.",
    "description": "An insightful masterclass dialogue with alumna Dr. Maya V. on cryogenic detectors and particle physics research at CERN Geneva."
  },
  {
    "id": "3",
    "title": "College Day Celebrations '25",
    "tagline": "Annual Convocation",
    "dateStr": "Oct 15, 2025",
    "category": "Events",
    "duration": "6:48",
    "durationSeconds": 408,
    "image": rithuCoverImg,
    "imageAlt": "Annual college day traditional procession and stage address at campus auditorium.",
    "description": "Honouring graduating cohorts with traditional Kerala Chenda Melam, convocation speeches, and academic merit presentations."
  },
  {
    "id": "4",
    "title": "HackCEM 36-Hour Hackathon",
    "tagline": "Innovation Sprint",
    "dateStr": "Sep 28, 2025",
    "category": "Workshops IEEE",
    "duration": "5:20",
    "durationSeconds": 320,
    "image": letsTalkArtImg,
    "imageAlt": "Late-night hackathon in progress with multiple glowing code monitors and collaborative engineering clusters.",
    "description": "Thirty-six continuous hours of prototyping AI edge devices, disaster alert networks, and clean energy dispatch systems."
  },
  {
    "id": "5",
    "title": "Nature & Engineering: Campus Biodiversity",
    "tagline": "Environmental Study",
    "dateStr": "Aug 14, 2025",
    "category": "Workshops",
    "duration": "9:10",
    "durationSeconds": 550,
    "image": cemCampusSunriseImg,
    "imageAlt": "Scenic documentary shot of Munnar cloud forests wrapping around college engineering campus terrace.",
    "description": "Documentary fieldwork examining microclimate fluctuations, endemic high-altitude Shola forest ecology, and passive green architecture."
  },
  {
    "id": "6",
    "title": "Kadhaprasangam & Literary Evenings",
    "tagline": "Cultural Society",
    "dateStr": "Jul 02, 2025",
    "category": "Events Interviews",
    "duration": "7:15",
    "durationSeconds": 435,
    "image": myFlowerTulipsImg,
    "imageAlt": "Intimate open mic literary gathering under twilight canopy in Kerala.",
    "description": "Oral storytelling, resonant folk instruments, and student poetry under lantern-lit bamboo pavilions at dusk."
  }
];

export const INITIAL_MAGAZINE_SPREADS: MagazineSpread[] = [];

export const INITIAL_MAGAZINE_EDITION: MagazineEditionInfo = {
  title: "Rithu — College Magazine 2025–26",
  year: "2026",
  institution: "College of Engineering Munnar",
  totalPages: 74,
  sourceType: "pdf",
  fileName: "rithumag.pdf",
  updatedAt: "Official Edition",
};

export const DEFAULT_MAGAZINE_PAGES: MagazinePage[] = Array.from({ length: 74 }, (_, idx) => {
  const pageNum = idx + 1;
  const isCover = pageNum === 1;
  const isBack = pageNum === 74;
  return {
    id: `page-${pageNum}`,
    pageNumber: pageNum - 1,
    type: isCover ? "cover" : isBack ? "back-cover" : "content",
    title: isCover ? "Cover" : isBack ? "Back Cover" : `Page ${pageNum}`,
    subtitle: `Page ${pageNum} of 74`,
    pdfImageUrl: `/magazine/page-${pageNum}.webp`,
  };
});

