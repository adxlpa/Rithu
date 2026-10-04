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
  "title": "Rithu — College Magazine 2025–26",
  "year": "2026",
  "institution": "College of Engineering Munnar",
  "totalPages": 74,
  "sourceType": "curated",
  "fileName": "Rithu_CEM_Official_Magazine_74Pages.pdf",
  "updatedAt": "Permanent Archival Edition"
};

export const DEFAULT_MAGAZINE_PAGES: MagazinePage[] = [
  {
    "id": "page-1",
    "pageNumber": 1,
    "type": "cover",
    "title": "ഋതു",
    "subtitle": "\"അക്ഷരങ്ങൾ പൂക്കുന്ന കലാലയത്തിന്റെ കാവ്യഋതു\"",
    "templateData": {
      "side": "cover",
      "layoutVariant": "cover-2025",
      "title": "ഋതു",
      "pullQuote": "\"അക്ഷരങ്ങൾ പൂക്കുന്ന കലാലയത്തിന്റെ കാവ്യഋതു\"",
      "image": rithuCoverImg,
      "footerPrimary": "COLLEGE MAGAZINE 2025",
      "footerSecondary": "COLLEGE OF ENGINEERING MUNNAR"
    }
  },
  {
    "id": "page-2",
    "pageNumber": 2,
    "type": "content",
    "title": "Every season is one of becoming",
    "templateData": {
      "side": "left",
      "layoutVariant": "quote-window",
      "pullQuote": "\" Every season is one of becoming,\nbut not always one of blooming.\nBe gracious with your ever-evolving self \"",
      "pullQuoteCite": "— B. Oakman"
    }
  },
  {
    "id": "page-3",
    "pageNumber": 3,
    "type": "content",
    "title": "COLLEGE OF ENGINEERING MUNNAR",
    "templateData": {
      "side": "right",
      "layoutVariant": "full-photo",
      "title": "COLLEGE OF ENGINEERING\nMUNNAR",
      "image": cemCampusSunriseImg
    }
  },
  {
    "id": "page-4",
    "pageNumber": 4,
    "type": "content",
    "title": "LET'S TALK",
    "templateData": {
      "side": "left",
      "layoutVariant": "red-poster",
      "pullQuote": "\"If you do not interfere\nin politics,\npolitics will eventually\ninterfere in\nyour life\"",
      "title": "LET'S TALK",
      "image": letsTalkArtImg
    }
  },
  {
    "id": "page-5",
    "pageNumber": 5,
    "type": "content",
    "title": "A Word from the IHRD Director",
    "templateData": {
      "side": "right",
      "layoutVariant": "message",
      "category": "MESSAGES",
      "title": "A Word from the IHRD Director",
      "header": "Institute of Human Resources Development · Government of Kerala · No.IHRD/227/2026-DA1 · 23.09.2026",
      "paragraphs": [
        "I am delighted to learn that College of Engineering Munnar is bringing out \"Rithu\", its college magazine, marking an important milestone in its journey as an institution under the Institute of Human Resources Development (IHRD).",
        "A college magazine serves as a vibrant platform for students and faculty to express their thoughts, share their experiences and showcase their creativity and talents. It reflects the academic environment, intellectual pursuits and cultural spirit of the institution, while providing an opportunity to celebrate the diverse achievements and aspirations of the college community.",
        "The inclusion of College of Engineering Munnar in the IHRD family opens new avenues for academic growth, innovation, industry interaction, skill development and greater opportunities for students. I am confident that the college will make meaningful contributions to the IHRD network while preserving its distinctive academic identity and the rich spirit of Munnar.",
        "I wish Rithu every success and hope that it will continue to inspire and connect the College of Engineering Munnar community in the years ahead."
      ],
      "author": "Prof.(Dr.) M.V. Rajesh",
      "authorRole": "DIRECTOR, IHRD"
    }
  },
  {
    "id": "page-6",
    "pageNumber": 6,
    "type": "content",
    "title": "A Word from the Minister",
    "templateData": {
      "side": "left",
      "layoutVariant": "message",
      "category": "MESSAGES",
      "title": "A Word from the Minister",
      "header": "ROJI M JOHN · MINISTER FOR HIGHER EDUCATION · No. 486/M (H.Edn)/2026 · 22 September, 2026",
      "paragraphs": [
        "Education shapes the future of our society. Kerala has always been a pioneer in advancing the cause of higher education, guided by a strong commitment to learning, inclusion, and social progress.",
        "Our vision is to create institutions where young minds can think freely, question fearlessly, and innovate with purpose. Higher education must go beyond textbooks and examinations. It must equip our young people with the knowledge, skills, confidence, and values needed to navigate real-world challenges and contribute meaningfully to society.",
        "The Government of Keralam remains firmly committed to this vision. We are continuously strengthening our campuses, expanding opportunities in technical and emerging fields, and investing in modern infrastructure to provide our students with an environment that is inclusive, enabling, and future-ready.",
        "College magazines such as Rithu offer a wonderful glimpse into the creative energy and diverse perspectives of our students. I congratulate the management, faculty, and students of the College of Engineering, Munnar, on this initiative."
      ],
      "author": "Roji M John",
      "authorRole": "Minister for Higher Education"
    }
  },
  {
    "id": "page-7",
    "pageNumber": 7,
    "type": "content",
    "title": "A Word from the MLA",
    "templateData": {
      "side": "right",
      "layoutVariant": "message",
      "category": "MESSAGES",
      "title": "A Word from the MLA",
      "pullQuote": "\"യുവമനസ്സുകളുടെ സർഗ്ഗാത്മകതയ്ക്ക് കരുത്ത് പകരുന്ന മൂന്നാർ എൻജിനീയറിങ് കോളേജ്\"",
      "paragraphs": [
        "പ്രിയപ്പെട്ട വിദ്യാർത്ഥിസമൂഹത്തിനും അദ്ധ്യാപകർക്കും,",
        "കേരളത്തിന്റെ വിദ്യാഭ്യാസ ഭൂപടത്തിൽ സ്വന്തമായൊരു ഇടം അടയാളപ്പെടുത്തി മുന്നേറുന്ന കോളേജ് ഓഫ് എൻജിനീയറിങ് മൂന്നാറിന്റെ 2025-26 വർഷത്തെ കോളേജ് മാഗസിൻ പുറത്തിറങ്ങുന്നു എന്നറിഞ്ഞതിൽ എനിക്കുള്ള സന്തോഷം വലുതാണ്.",
        "പ്രകൃതിയുടെ മനോഹരമായ പശ്ചാത്തലത്തിൽ, അക്കാദമിക മികവിനൊപ്പം നവീനമായ ആശയങ്ങളും സാങ്കേതികവിദ്യയും കൈമുതലായുള്ള ഒരു യുവതലമുറയെ വാർത്തെടുക്കുന്നതിൽ ഈ സ്ഥാപനം വഹിക്കുന്ന പങ്ക് അഭിനന്ദനാർഹമാണ്.",
        "കഠിനാധ്വാനവും സർഗ്ഗാത്മകതയും ഒത്തുചേരുമ്പോഴാണ് മികച്ച നാളെകൾ പിറവിയെടുക്കുന്നത്. മാഗസിൻ പ്രസിദ്ധീകരണവുമായി ബന്ധപ്പെട്ട് പ്രവർത്തിച്ച എല്ലാ അദ്ധ്യാപകർക്കും, എഡിറ്റോറിയൽ ബോർഡ് അംഗങ്ങൾക്കും, പ്രിയപ്പെട്ട വിദ്യാർത്ഥികൾക്കും എന്റെ ആശംസകൾ നേരുന്നു."
      ],
      "author": "എ. രാജ",
      "authorRole": "എം.എൽ.എ, ദേവികുളം മണ്ഡലം"
    }
  },
  {
    "id": "page-8",
    "pageNumber": 8,
    "type": "content",
    "title": "A Word from the Principal",
    "templateData": {
      "side": "left",
      "layoutVariant": "message",
      "category": "MESSAGES",
      "title": "A Word from the Principal",
      "paragraphs": [
        "It gives me immense pleasure to address the students and the entire college community through the pages of Rithu, the college magazine of the College of Engineering Munnar.",
        "A college is more than a place where knowledge is acquired. It is a space where ideas take shape, friendships are formed, talents are discovered, and dreams begin to find direction. The years spent here become a collection of experiences that stay with us long after you leave the campus.",
        "The name Rithu, meaning seasons, beautifully reflects the different phases of life. Just as every season brings its own colours, emotions, and changes, your college journey is filled with moments of joy, challenges, growth, and new beginnings.",
        "I appreciate the efforts of the editorial team and every student, faculty member, and staff member who contributed to bringing Rithu together. May this magazine inspire more students to explore their creativity and share their voices."
      ],
      "author": "Dr. Jeoju M. Issac",
      "authorRole": "Principal"
    }
  },
  {
    "id": "page-9",
    "pageNumber": 9,
    "type": "content",
    "title": "A Word from the Staff Editor",
    "templateData": {
      "side": "right",
      "layoutVariant": "message",
      "category": "MESSAGES",
      "title": "A Word from the Staff Editor",
      "paragraphs": [
        "It gives me immense pleasure to present RITHU '26, the annual magazine of the College of Engineering Munnar.",
        "Our college magazines have always been special—not merely because of the way they are designed and presented, but because of the thoughts, creativity and talents that find a place within their pages. Year after year, Rithu has evolved as a beautiful reflection of campus life, bringing together the experiences, achievements, ideas and aspirations of our students and the entire CEM community.",
        "Every contribution is more than just a piece of writing—it is a glimpse into the minds and hearts of our young generation. As the Staff Editor, I am happy to be part of this continuing tradition. I sincerely appreciate the students who have contributed their creative works and the editorial team whose dedication and enthusiasm have shaped this edition.",
        "May RITHU '26 continue the legacy of celebrating creativity, preserving memories and giving wings to young voices. Happy reading, and let every page tell a story!"
      ],
      "author": "Manoj R",
      "authorRole": "Staff Editor"
    }
  },
  {
    "id": "page-10",
    "pageNumber": 10,
    "type": "content",
    "title": "Editor's Note",
    "templateData": {
      "side": "left",
      "layoutVariant": "message",
      "category": "MESSAGES",
      "title": "Editor's Note",
      "paragraphs": [
        "A college magazine is more than just a collection of articles and photographs. It is a space where the talents, ideas, and voices of our students can be seen and heard. More than that, it holds the little moments, friendships, experiences, and memories that make our college life special.",
        "We chose the name Rithu, meaning seasons, because our college life, much like the changing seasons, goes through different phases. Summer, Monsoon, and Winter represent different emotions and experiences we go through along the way. Together, these seasons tell the story of who we were and who we are becoming.",
        "Putting this magazine together has been a journey of its own. I sincerely thank every student, teacher, non-teaching staff member, and everyone else who contributed their time, ideas, talents, and support to make Rithu possible. Most of all, I hope Rithu lives up to your expectations and becomes a small but meaningful part of the memories you carry with you from CEM."
      ],
      "author": "Adhil P. A",
      "authorRole": "Student Editor"
    }
  },
  {
    "id": "page-11",
    "pageNumber": 11,
    "type": "content",
    "title": "A Word from the Union Chairperson",
    "templateData": {
      "side": "right",
      "layoutVariant": "message",
      "category": "MESSAGES",
      "title": "A Word from the Union Chairperson",
      "paragraphs": [
        "എന്റെ ഏറ്റവും പ്രിയപ്പെട്ട CEM-ലെ വിദ്യാർത്ഥി സുഹൃത്തുക്കളെ,",
        "Chairperson എന്ന പദവി ഞാൻ കോളേജിൽ ചേരുമ്പോഴോ അവിടെ പഠിക്കുമ്പോഴോ മനസ്സിൽ പോലും വിചാരിച്ചിരുന്ന ഒരു സ്ഥാനമായിരുന്നില്ല. എന്നാൽ ആ ഉത്തരവാദിത്വം എന്നെ വിശ്വസിച്ച് ഏൽപ്പിച്ച എല്ലാ വിദ്യാർത്ഥികളോടും ഞാൻ എന്നും കടപ്പെട്ടിരിക്കുന്നു.",
        "നമ്മുടെ യൂണിയൻ നിലവിൽ വന്നതിന് ശേഷം CEM-ൽ ഒരുപാട് മാറ്റങ്ങൾ കൊണ്ടുവരാൻ സാധിച്ചു എന്നത് ഏറെ സന്തോഷത്തോടെ പറയാനാകുന്ന കാര്യമാണ്. Magazine എന്നത് നമ്മുടെ കലാലയത്തിന്റെ ഒരു വാൽക്കണ്ണാടിയാണ്. നമ്മുടെ Magazine Editor ആയ Adhil എന്റെ നല്ലൊരു ജൂനിയറും, അതിനേക്കാളുപരി എന്റെ നല്ലൊരു സുഹൃത്തുമാണ്.",
        "ഈ നാല് വർഷത്തെ കോളേജ് ജീവിതം അടിപിടികളും പിണക്കങ്ങളുമില്ലാതെ, പരമാവധി ആസ്വദിച്ച്, നല്ല ഓർമ്മകളോടെ ജീവിക്കുക. പഠിച്ചിറങ്ങുമ്പോൾ കയ്യിൽ ഒരു degree മാത്രമല്ല, ഒരുപാട് നല്ല ഓർമ്മകളും സൗഹൃദങ്ങളും കൂടി ഉണ്ടാകട്ടെ."
      ],
      "author": "Sanjay Satheesan",
      "authorRole": "Chairperson"
    }
  },
  {
    "id": "page-12",
    "pageNumber": 12,
    "type": "content",
    "title": "ഋതു കാവ്യം",
    "templateData": {
      "side": "left",
      "layoutVariant": "poem",
      "bgColor": "#ECEAE2",
      "paragraphs": [
        "നിശ്ശബ്ദ ജീവിതത്തിൽ\nതുറന്ന ജനൽപാളികൾ പ്രതീക്ഷയുടെ\nസൂര്യകിരണങ്ങളെ സ്വാഗതം ചെയ്യുന്ന\nപ്രഥമ ഋതു\nആകാശത്തെ ചുംബിച്ച്\nചൂടിന്റെ സ്വർണ്ണച്ചിറകുകളുമായി\nകടന്നുപോകുന്ന വേനൽക്കാലം.",
        "ചുംബനങ്ങളും ഓർമ്മകളും\nതഴുകി, കുളിരായി\nതേടിയെത്തി പെയ്തിറങ്ങും കാലവർഷം.\nജനൽപാളികൾ അടച്ചുപൂട്ടി,\nകണ്ണുകളെ നനയിപ്പിക്കും\nഎൻ ജീവന്നാം ദ്വിതീയ ഋതു",
        "ഉറച്ചു ദൃഢമായി പുൽക്കുടിലിലെ ഉണ്ണിയെപ്പോലെ,\nവീണ്ടും സ്വർണ്ണച്ചിറകുകളേകി പ്രതീക്ഷകളെ വരവേറ്റ് ,\nഒപ്പിമാറിയ പുഞ്ചിരി സമ്മാനമായി നൽകി,\nആകാശത്തിലെ കിലുക്കനാദത്താൽ\nകടന്നുപോകും തൃതീയഋതു."
      ]
    }
  },
  {
    "id": "page-13",
    "pageNumber": 13,
    "type": "content",
    "title": "EDITORIAL BOARD 2026",
    "templateData": {
      "side": "right",
      "layoutVariant": "editorial-board",
      "title": "EDITORIAL BOARD 2026",
      "image": "/editorial-board-2026.jpg",
      "items": [
        {
          "title": "MANOJ R",
          "subtitle": "STAFF EDITOR"
        },
        {
          "title": "ADHIL P A",
          "subtitle": "STUDENT EDITOR"
        },
        {
          "title": "SANA K R",
          "subtitle": "Editorial Member"
        },
        {
          "title": "AARON VERGHESE SHAJI",
          "subtitle": "Editorial Member"
        },
        {
          "title": "MUHAMMED IRFAN SHIBILI",
          "subtitle": "Editorial Member"
        },
        {
          "title": "PUNNYA S R",
          "subtitle": "Editorial Member"
        },
        {
          "title": "KARTHIK KRISHNA",
          "subtitle": "Editorial Member"
        },
        {
          "title": "NAYANA K",
          "subtitle": "Editorial Member"
        },
        {
          "title": "MUHAMMAD ADIL A",
          "subtitle": "Editorial Member"
        },
        {
          "title": "ADITHYA S ANILKUMAR",
          "subtitle": "Editorial Member"
        },
        {
          "title": "BHADRA SHARMA",
          "subtitle": "Editorial Member"
        },
        {
          "title": "VARSHA MANESH",
          "subtitle": "Editorial Member"
        },
        {
          "title": "HAMZAS V V",
          "subtitle": "Editorial Member"
        },
        {
          "title": "AKASH DEEPU JACOB",
          "subtitle": "Editorial Member"
        },
        {
          "title": "AKSHAYA S",
          "subtitle": "Editorial Member"
        },
        {
          "title": "SABIO PAULSON",
          "subtitle": "Editorial Member"
        },
        {
          "title": "SREEDHAR ADITHYAN V",
          "subtitle": "Editorial Member"
        },
        {
          "title": "DILNA MOHAN V",
          "subtitle": "Editorial Member"
        },
        {
          "title": "RITHUVARNA T P",
          "subtitle": "Editorial Member"
        }
      ]
    }
  },
  {
    "id": "page-14",
    "pageNumber": 14,
    "type": "content",
    "title": "Season I — Summer",
    "templateData": {
      "side": "left",
      "layoutVariant": "divider",
      "bgColor": "#F3E3C3",
      "pullQuote": "There was a warmth in the air,\na brightness in every corner,\nand a quiet feeling\nthat something beautiful\nwas about to begin."
    }
  },
  {
    "id": "page-15",
    "pageNumber": 15,
    "type": "content",
    "title": "Contents",
    "templateData": {
      "side": "right",
      "layoutVariant": "contents",
      "title": "Contents",
      "bgColor": "#D9822B",
      "items": [
        {
          "title": "The Space Between Success & Failure",
          "subtitle": "Page 16"
        },
        {
          "title": "The Art Of Living",
          "subtitle": "Page 17"
        },
        {
          "title": "Love",
          "subtitle": "Page 18"
        },
        {
          "title": "My Flower",
          "subtitle": "Page 19"
        },
        {
          "title": "कागज़ में मेरा नाम",
          "subtitle": "Page 20"
        },
        {
          "title": "Siyom Shore",
          "subtitle": "Page 21"
        },
        {
          "title": "ജീവിതയാഗം",
          "subtitle": "Page 22"
        },
        {
          "title": "പൂരനഗരിയിൽ നിന്ന് മഞ്ഞിലേക്ക്",
          "subtitle": "Page 23"
        }
      ]
    }
  },
  {
    "id": "page-16",
    "pageNumber": 16,
    "type": "content",
    "title": "THE SPACE BETWEEN SUCCESS & FAILURE",
    "templateData": {
      "side": "left",
      "layoutVariant": "two-column",
      "title": "THE SPACE BETWEEN SUCCESS & FAILURE",
      "author": "Ayishath Shamsiya S",
      "authorRole": "EEE 2025-29",
      "columns": [
        [
          "The space? A blank space? Never. A flood of blood, sweat and tears, accompanied by a huge storm of hard work, determination, faith, hope and self-doubt, is what lies between the two triumphants of life, success and failure.",
          "The ones who can never actually measure the distance between success and failure are the ones who were never in the train of \"On your mark, get set, go\" in schools to train the lines of life in a deathbed. Do they actually have a distance between them? A big no for someone who had tasted success and now keeps no hard work on keeping it, but a big yes for someone whose hard work had never been recognised.",
          "But to know the actual difference or distance between them, just look at your parents' faces, look at your loved ones' faces. The delightful curves that bloom on their faces once you made it, the sparkling stars in their eyes, and the intentional hugs to keep us from falling apart.",
          "Have you heard the famous quote, \"Success is not in never failing, it is in rising up every time you touch the rock bottom\"?"
        ],
        [
          "The succeeded ones will never look down at you for trying, but the failed ones will. Rather than chasing the destination, love the process leading to it and see the magic of shortening the distance between them.",
          "If we have the determination and spirit, there is no literal distance between success and failure. Once you start choosing the hard path fearlessly and rising up brighter is where the path actually starts getting unveiled. Once the process is loved, you can never doubt a determined, thoughtful group of youth who want to change the world.",
          "It is never someone's physical attributes that define them. It is never the deluxe life or poor life, luxury clothes or torn ones, privileged by birth or unnoticed ones that choose the distance between success and failure. It solely depends upon the mindset that chooses to fight each and every power that stands against you to reach the destination."
        ]
      ]
    }
  },
  {
    "id": "page-17",
    "pageNumber": 17,
    "type": "content",
    "title": "THE ART OF LIVING",
    "templateData": {
      "side": "right",
      "layoutVariant": "poem",
      "bgColor": "#EFE4CE",
      "title": "THE ART OF LIVING",
      "author": "Ayishath Shamsiya S",
      "authorRole": "EEE 2025-29",
      "paragraphs": [
        "Sometimes I wish the world were more like a cartoon,\nPainted skies, softer souls, and gleaming eyes.\nYet what we are given holds a deeper grace,\nNo frame that bounds, nor screen that confines.",
        "Life is not the grand story I once thought—\nNor a perfect ending where everyone applauds.\nIt is the moonlight that embraces tired hands,\nThe scars we carry, and the warmth that's left behind.",
        "It is the quiet magic in the air\nThat we so often fail to notice.\nThis strange and raw, unfinished canvas\nNeeds no zenith to draw of dreams.\nAnd somewhere between the breaking and becoming,\nYou will find yourself being moulded.\nNo boundaries. No ends.\nJust nineteen. Breathing. And beginning."
      ]
    }
  },
  {
    "id": "page-18",
    "pageNumber": 18,
    "type": "content",
    "title": "LOVE",
    "templateData": {
      "side": "left",
      "layoutVariant": "poem",
      "bgColor": "#C9D6D5",
      "title": "LOVE",
      "author": "Adhil P A",
      "authorRole": "CSE 2024-28",
      "paragraphs": [
        "Love is a tapestry, a web so vast,\nWith threads of light and shadows cast.\nOne longs for another, heart burning bright,\nNot knowing their love is returned in another's sight.\nTwo souls drawn close, yet held back by fear,\nWith words left unspoken, though the feeling is clear.",
        "Neither dares to say what they truly hold,\nAfraid that rejection might leave their hearts cold.\nAnd then there are two who both understand,\nA love they both feel, yet cannot have at hand.\nFate keeps them apart, across distant seas,\nLeaving behind the words they never could release.",
        "And then there are two, with a place to belong,\nA love that feels simple, a love that feels strong.\nNo doubts to hold them, no fears anymore,\nThey find in each other what they were searching for.\nFrom words left unsaid and feelings kept cold,\nTo finally finding a love worth more than gold."
      ]
    }
  },
  {
    "id": "page-19",
    "pageNumber": 19,
    "type": "content",
    "title": "MY FLOWER",
    "templateData": {
      "side": "right",
      "layoutVariant": "poem",
      "title": "MY FLOWER",
      "author": "Akash Deepu Jacob",
      "authorRole": "CSE 2025-29",
      "image": myFlowerTulipsImg,
      "textColor": "#FFFFFF",
      "paragraphs": [
        "I found a flower beautiful than any\nI found a flower beautiful than ever\nI found it in the garden of beauty\nAll looked thoroughly\nBut blurred me out\nSowed me near to her left"
      ]
    }
  },
  {
    "id": "page-20",
    "pageNumber": 20,
    "type": "content",
    "title": "कागज़ में मेरा नाम",
    "templateData": {
      "side": "left",
      "layoutVariant": "poem",
      "bgColor": "#F6EFE6",
      "title": "कागज़ में मेरा नाम",
      "author": "Akash Deepu Jacob",
      "authorRole": "CSE 2025-29",
      "paragraphs": [
        "मेरा नाम लिखे थे वो कागज में,\nपर वो जो दिल की पाती में।",
        "देखी है बहुत सारी,\nसुनी है अपनों की,\nपर कभी सोचा ना मिलेगी अपनी।",
        "दोस्ती है मेरी भी,\nपर कभी वो नहीं थी\nजैसे मेरे,\nमाँ की कहानी के तरह,\nपापा की किताबों के तरह।",
        "मन चाहती एक ऐसी,\nदिल मिलवायी मुझे मेरी,\nपर क्या ही हो,\nदोस्ती थी ऐसी।"
      ]
    }
  },
  {
    "id": "page-21",
    "pageNumber": 21,
    "type": "content",
    "title": "SIYOM SHORE",
    "templateData": {
      "side": "right",
      "layoutVariant": "poem",
      "bgColor": "#DEC397",
      "title": "SIYOM SHORE",
      "author": "Akash Deepu Jacob",
      "authorRole": "CSE 2025-29",
      "paragraphs": [
        "Walking through Siyom,\nthe very first sight caught wasn't the one.\nFound the best ever, still it's not enough.\nLooks too good.\nTruly, you knew it.\nYet still, it's not enough.",
        "Red or green was wanted,\nbut white was what they got..\nNancy, pure? Not sure.\nToo high, can't find.\nNot too fancy, still not Nancy.",
        "Yeah, the pebble never caught sight.\nIt's not right.\nIt's too tight.\nYeah, thankfully, gratefully, you dropped it\nHo, ho, ho… toot gayi!"
      ]
    }
  },
  {
    "id": "page-22",
    "pageNumber": 22,
    "type": "content",
    "title": "ജീവിതയാഗം",
    "templateData": {
      "side": "left",
      "layoutVariant": "poem",
      "bgColor": "#F3EFEA",
      "title": "ജീവിതയാഗം",
      "author": "Rominson M J",
      "authorRole": "Instructor Gr II",
      "paragraphs": [
        "അരുത് , തടയരുതൻ അശ്വമേധയാഗത്തെ\nപഞ്ചയശ്വങ്ങൾ തേര് തെളിയിക്കുന്ന യാഗത്തെ.\nസുവർണ്ണത്തേരിലെൻ കൃഷ്ണനുമർജ്ജുനനും,\nസുവർണ്ണ കടിഞ്ഞാണിനെയും നിങ്ങൾ കണ്ടുവോ!",
        "അരുത് തടയാൻ ശ്രമിക്കരുതെൻ തേരോട്ടം\nകുന്നും ,കുഴിയും ,പുഴയും കടന്നു ; പുക -\nപടലങ്ങളെ താണ്ടിയെൻ ; കൊണ്ടലിൽ\nമിന്നൽ പിണറുകൾ സൃഷ്ട്ടിച്ചെൻ യാഗമെത്തുന്നു.",
        "അരുത് തേടരുതെൻ കുതിരകളെ യാഗശാസ്ത്രത്തി\nലെൻ കുതിരകൾ അശക്തരും , വികലാംഗരുമാകാം,\nഎങ്കിലുമെൻ കൃഷ്ണാർജ്ജുനന്മാർ ശക്തരല്ലേ !\nഎൻ അശ്വങ്ങളെ നയിക്കുന്നതവരല്ലേ .",
        "പഞ്ചേന്ദ്രിയങ്ങളാമശ്വങ്ങളെ,\nകടിഞ്ഞാണാം മനസ്സിനെ , കൃഷ്ണനാം\nപ്രജ്ഞാമണ്ഡലത്തി , ലാർജ്ജുനനാമെൻ\nയാഗം തുടരുന്നു , അരുതരുത്... തടയരുത്...."
      ]
    }
  },
  {
    "id": "page-23",
    "pageNumber": 23,
    "type": "content",
    "title": "പൂരനഗരിയിൽ നിന്ന് മഞ്ഞിലേക്ക്",
    "templateData": {
      "side": "right",
      "layoutVariant": "poem",
      "bgColor": "#DFC7A7",
      "title": "പൂരനഗരിയിൽ നിന്ന് മഞ്ഞിലേക്ക്",
      "author": "Aiswarya U Nair",
      "authorRole": "CSE 2026-30",
      "paragraphs": [
        "സാംസ്കാരിക തലസ്ഥാനം എന്ന് അറിയപ്പെടുന്ന തൃശ്ശൂരിൽ ജനിച്ച് വളർന്ന ഒരു പെൺകുട്ടിയാണ് ഞാൻ. ഒരുപാട് ബഹളങ്ങളിൽ നിന്ന് യാത്ര തിരിക്കുമ്പോൾ അറിയാമായിരുന്നു, സൗത്ത് ഇന്ത്യയുടെ കാശ്മീർ എന്നറിയപ്പെടുന്ന മൂന്നാറിൽ ഒരു സൗമ്യമായ നിശ്ശബ്ദത എന്നെ കാത്തിരിക്കുന്നു എന്ന്.",
        "മൂന്നാറിലേക്കുള്ള യാത്ര, ഉടനെ തന്നെ ഒരു ചരിത്രത്തിലേക്കാണ് നടന്ന് കയറുന്നത് എന്ന ബോധം ഉണ്ടായിരുന്നു. ഇരുപത് വർഷം പഴക്കമുള്ള ചരിത്രത്തിലേക്ക് അല്ല, ഇരുന്നൂറ് വർഷം പഴക്കമുള്ള ചരിത്രത്തിലേക്ക്.",
        "1870 ൽ കാട് മാത്രമായിരുന്ന മൂന്നാർ, ജോൺ ഡാനിയൽ മൺറോ എന്ന ബ്രിട്ടീഷുകാരന്റെ കൈപിടിയിൽ തേയിലത്തോട്ടമായ കഥ. അത് പിന്നീട് കണ്ണൻദേവൻ എന്ന പേരിൽ ലോകം അറിയപ്പെടുന്ന ബ്രാൻഡായതിന്റെ കഥ. 1902ൽ ഇന്ത്യയുടെ ആദ്യ മോണോറെയിൽ, കുണ്ടളവാലി റെയിൽവേയുടെ കഥ.",
        "ഈ ചരിത്രങ്ങളിലൂടെ എഞ്ചിനീയറിംഗ് എന്ന സ്വപ്നത്തിലേക്ക് നടന്ന് കയറുമ്പോൾ അറിയാമായിരുന്നു, പഠിക്കാൻ കൂടുതലുള്ളത് ഈ മലതാഴ്വരകളിൽ ഉണ്ടെന്ന്. ഈ മഞ്ഞുമൂടിയ താഴ്വരകൾ എനിക്കായി ഇനിയും ഒരുപാട് അത്ഭുതങ്ങൾ ഒരുക്കിവെച്ചിട്ടുണ്ട് എന്ന പ്രതീക്ഷയോടെ ഞാൻ യാത്ര ആരംഭിക്കുന്നു."
      ]
    }
  },
  {
    "id": "page-24",
    "pageNumber": 24,
    "type": "content",
    "title": "Beyond The Canvas",
    "templateData": {
      "side": "left",
      "layoutVariant": "art-grid",
      "title": "Beyond The Canvas",
      "items": [
        {
          "title": "നമ്മുടെ കോളേജ് · CEM",
          "subtitle": "Mohamed Shamil P K · CSE 2026-30",
          "image": cemCampusSunriseImg
        },
        {
          "title": "Arabic Calligraphy I",
          "subtitle": "Fathima Fidha · CSE 2026-30"
        },
        {
          "title": "SPECTRA Digital Character",
          "subtitle": "Mohamed Shamil P K · CSE 2026-30"
        },
        {
          "title": "Arabic Calligraphy II",
          "subtitle": "Fathima Fidha · CSE 2026-30"
        },
        {
          "title": "Botanical Line Art",
          "subtitle": "Isha Fathima I · ECE 2026-30"
        },
        {
          "title": "Shukr Gold Frame",
          "subtitle": "Isha Fathima I · ECE 2026-30"
        },
        {
          "title": "Abstract Green & Black",
          "subtitle": "Isha Fathima I · ECE 2026-30"
        }
      ]
    }
  },
  {
    "id": "page-25",
    "pageNumber": 25,
    "type": "content",
    "title": "Beyond The Canvas · Artists",
    "templateData": {
      "side": "right",
      "layoutVariant": "art-grid",
      "title": "ARTISTS · Beyond The Canvas",
      "items": [
        {
          "title": "Butterflies Pencil Study",
          "subtitle": "Angelu Sara Joseph · CSE 2025-29"
        },
        {
          "title": "Archer & Tiger Spirit",
          "subtitle": "Angelu Sara Joseph · CSE 2025-29"
        },
        {
          "title": "Motion Charcoal Sketch",
          "subtitle": "Angelu Sara Joseph · CSE 2025-29"
        },
        {
          "title": "Neymar Jr. Digital Portrait",
          "subtitle": "Mohamed Shamil P K · CSE 2026-30"
        },
        {
          "title": "Red Rose Realism Portrait",
          "subtitle": "Glorin Johnson · CSE 2022-26",
          "image": myFlowerTulipsImg
        }
      ]
    }
  },
  {
    "id": "page-26",
    "pageNumber": 26,
    "type": "content",
    "title": "Season II — Monsoon",
    "templateData": {
      "side": "left",
      "layoutVariant": "divider",
      "bgColor": "#CCCBE2",
      "pullQuote": "The skies grew heavy,\nthe windows grew quiet,\nand somewhere beneath the grey,\nwe learned to sit\nwith things we could not name."
    }
  },
  {
    "id": "page-27",
    "pageNumber": 27,
    "type": "content",
    "title": "Contents · Monsoon",
    "templateData": {
      "side": "right",
      "layoutVariant": "contents",
      "title": "Contents",
      "image": monsoonBananaLeafImg,
      "items": [
        {
          "title": "बारिश, एक और आँसू",
          "subtitle": "Pages 28–29"
        },
        {
          "title": "I Realised too late..",
          "subtitle": "Page 30"
        },
        {
          "title": "ബാലാമണി",
          "subtitle": "Page 31"
        },
        {
          "title": "Never Mine",
          "subtitle": "Page 32"
        },
        {
          "title": "ആട്ടിൻതോലിട്ട ചെന്നായ",
          "subtitle": "Page 33"
        },
        {
          "title": "തിരിച്ചുവരവ്",
          "subtitle": "Page 34"
        },
        {
          "title": "Where Silence Knows..",
          "subtitle": "Page 35"
        },
        {
          "title": "If the Moon could write",
          "subtitle": "Page 36"
        },
        {
          "title": "വേവാനിരിക്കുന്ന മാംസങ്ങൾ",
          "subtitle": "Page 37"
        },
        {
          "title": "Her",
          "subtitle": "Page 38"
        },
        {
          "title": "La folie",
          "subtitle": "Page 39"
        },
        {
          "title": "അതിര്?",
          "subtitle": "Page 40"
        },
        {
          "title": "The Mind that Never Rests",
          "subtitle": "Page 41"
        }
      ]
    }
  },
  {
    "id": "page-28",
    "pageNumber": 28,
    "type": "content",
    "title": "बारिश, एक और आँसू",
    "templateData": {
      "side": "left",
      "layoutVariant": "two-column",
      "bgColor": "#D6E4DD",
      "title": "बारिश, एक और आँसू",
      "columns": [
        [
          "बारिश का मौसम था। पानी की बूँदें बहुत ज़ोरों से घर की छत पर गिर रही थीं। उन गिरती हुई बूँदों की आवाज़ एक अनोखे गीत जैसी बन रही थी। दादी एक पुरानी कुर्सी पर बैठकर खिड़की से बाहर के नज़ारे देख रही थीं।",
          "\"टुक-टुक...\" दादी ने एक आवाज़ सुनी। \"कोई दरवाज़े पर आ रहा है!\" \"अरे दादी, मैं हूँ पोस्टमैन। चिट्ठी आई है।\" दादी ने उसकी आवाज़ पहचान ली। धीरे-धीरे दादी कुर्सी से उठीं और दरवाज़े पर पहुँचीं। वहाँ बहुत भीड़ थी। सभी लोग पोस्टमैन का इंतज़ार कर रहे थे।",
          "दादी को इस अनाथ आश्रम में करीब पाँच साल हो गए थे। कभी भी उनको अपने नाम का आज तक एक खत भी नहीं मिला था। उनके परिवार ने उन्हें पाँच साल पहले यहाँ छोड़ दिया था। कितनी मुश्किल से पाला था दादी ने अपने पुत्र को।"
        ],
        [
          "दादी ने हर समय अपनी पोती के साथ समय बिताया और उसका ख्याल रखा। सालों बीत गए और उसकी पोती बड़ी हो गई। अब दादी का बेटा बड़ा हो चला था। उसे शहर में रहने के लिए अपने गाँव की ज़मीन और घर बेचने की ज़िद की।",
          "बेटे के लिए तो माँ मान गई। लेकिन बदलने के रास्ते में दादी का सब सामान लेकर अनाथ आश्रम में चला गया। दादी कमज़ोर होने लगी थीं, तो कुछ भी नहीं कर सकती थीं। उस दादी ने अपने बेटे और बहू को जाते हुए कुछ भी नहीं बोला।",
          "उस दादी को अपनी पोती से बहुत प्यार था। इसी प्यार में वह दिन-रात सोचती रहती थी। कौन उसका अपना था? दादी हर रोज़ रोती थी। अगली बारिश में दादी का चेहरा नहीं दिखा, क्योंकि उस मौसम में दादी भी रूखी-रूखी पूजा करने लगी थी।"
        ]
      ]
    }
  },
  {
    "id": "page-29",
    "pageNumber": 29,
    "type": "content",
    "title": "बारिश, एक और आँसू (समापन)",
    "templateData": {
      "side": "right",
      "layoutVariant": "poem",
      "bgColor": "#C8DDD3",
      "title": "बारिश, एक और आँसू",
      "author": "Abhishek Suresh",
      "authorRole": "CSE 2022-26",
      "paragraphs": [
        "अगले बारिश के दिन आया था तो पोस्टमैन। हर ही दिन पोस्टमैन की आवाज़ सुनकर दादी को पता था कि कोई उसके लिए खत लेकर आया है। ऐसा ही एक दिन उसकी पत्नी अपने एक खत लेकर आई।",
        "\"सुनीता माँ, पूर्णा माँ, आज का हो गया।\" पोस्टमैन ने कहा। आज भी दूसरे दिनों की तरह वह दादी अपने कमरे में वापस जा रही थी। तभी पोस्टमैन ने बोला— \"सुनीता माँ!\" सब लोग हैरान हो गए। उस दादी ने पीछे मुड़कर बोला— \"किसका?\"",
        "पोस्टमैन ने हाँ में बोला, तो वह वहीं रुक गई और घटना शुरू हुई। उस समय उसकी आँखों में आँसू थे। उस स्टेशन (शिमला) में बारिश होने लगी। इस बीच में कभी-कभी दादी को पत्र पढ़ने को मिला। तो तय किया कि यह बहुत अच्छी तरह पढ़ेगा और बड़े आदमी बनकर उसको वहाँ से ले जाएगा। दादी के मन को कुछ हल्का महसूस हुआ।"
      ]
    }
  },
  {
    "id": "page-30",
    "pageNumber": 30,
    "type": "content",
    "title": "I realised too late...",
    "templateData": {
      "side": "left",
      "layoutVariant": "two-column",
      "title": "I realised too late...",
      "author": "Hridya Raju George",
      "authorRole": "CSE 2022-26",
      "columns": [
        [
          "I realized too late that the story I heard as a child was true. Growing up, I was a scrappy little kid. Within days of joining a new school, I had made a friend, Ravi. One fine day, he invited me to his house. The only person who stood out was his grandmother. She looked & felt very ancient.",
          "Before I met any of them, she was very empathetic, particularly about me being bullied. She said, \"Back when I was a kid, there were men who bullied me too. My mother told me a mantra that I should recite to get them off my back.\" She said that if I recited the mantra thrice for 3 days straight & mentioned the names of the people, bad things would happen to them. \"It won't happen suddenly, surely it will take time. But you will see the results in your lifetime.\""
        ],
        [
          "Years passed by & one day, while I was on my way back home from work, I saw a news broadcast. Several people had been found at their houses, in their beds, as if asleep. 17 people, to be exact. I realised, with growing horror, it was me. I caused it all. I recognised all 17 names. And it had taken 30 long years to take effect.",
          "I ran home, not to my wife, but to my parents. I needed to get it all out. I reach my family home & knock on the door. I open their bedroom door to find both my parents asleep, turned away from the door. Slowly, I close the door & return back home to my wife. If only my parents had paid a little more attention to me, I wouldn't have had to mention their names in the mantra."
        ]
      ]
    }
  },
  {
    "id": "page-31",
    "pageNumber": 31,
    "type": "content",
    "title": "ബാലാമണി",
    "templateData": {
      "side": "right",
      "layoutVariant": "poem",
      "bgColor": "#D8DEE2",
      "title": "ബാലാമണി",
      "author": "Alakananda",
      "authorRole": "EEE 2022-26",
      "paragraphs": [
        "ഏകാകിയായ യാമങ്ങൾ ആയിരുന്നു അവൾക്ക് ഏറെ പ്രിയപ്പെട്ടത്, എന്നാൽ വെറുക്കപ്പെട്ടതും. ആലപ്പാട്ട് തറവാട്ടിലെ പ്രമാണിയായ കേശവൻ നമ്പ്യാർ, അമ്മിണിക്കുട്ടി ദമ്പതികളുടെ ആദ്യത്തെ കണ്മണി ആയിരുന്നു ബാലാമണി. വീട്ടുമുറ്റത്തെ തേന്മാവിൻ കൊമ്പിലെ ഊഞ്ഞാലിൽ ഇരുന്ന കിനാവുകൾ കാണുകയായിരുന്നു അവൾക്കിഷ്ടം.",
        "അന്ന് വൈകുന്നേരം സ്കൂൾ വിട്ടുവന്ന ബാലാമണിയെ കാത്തിരുന്നത് ഒരു സന്തോഷവാർത്തയായിരുന്നു. അമ്മവീടിനടുത്തുള്ള കുടുംബക്ഷേത്രത്തിൽ ഉത്സവമായിരുന്നു. ഉത്സവപ്പറമ്പിലെ മനോഹരമായ കാഴ്ചകൾ ബാലാമണിയും സഹോദരങ്ങളും കണ്ടു നടന്നു, ആഹ്ലാദിച്ചു.",
        "രാവിലെ എഴുന്നേറ്റ് ബാലാമണി കണ്ടത് ഏറെ വിഷമത്തോടെ അവളെ നോക്കിക്കൊണ്ടിരിക്കുന്ന കുടുംബക്കാരെയായിരുന്നു. തന്റെ അമ്മ ഇനി മടങ്ങിവരില്ല എന്ന വാർത്ത അവളോട് പറഞ്ഞു. അമ്മയില്ലാത്ത വീട് അവൾക്ക് അന്യമായി തോന്നി. ഇന്നും സന്ധ്യായാമങ്ങളിൽ ആ ഊഞ്ഞാലിൽ അവൾ ഇരുന്ന് അമ്മയുടെ സ്നേഹം കാറ്റായി അവളെ തലോടുന്നതായി അവൾക്ക് തോന്നി."
      ]
    }
  },
  {
    "id": "page-32",
    "pageNumber": 32,
    "type": "content",
    "title": "Never Mine",
    "templateData": {
      "side": "left",
      "layoutVariant": "poem",
      "bgColor": "#121318",
      "textColor": "#F5F5F7",
      "title": "Never Mine",
      "author": "Akshaya S",
      "authorRole": "CSE 2025-29",
      "paragraphs": [
        "Oh, is that you, all over my mind?\nThe only truth that I couldn't find.\nAre those your eyes? The way you look,\nThat smile which my heart mistook.\nThe way you speak, it's kinda cold,\nYour soft hands which I wanna hold. Those curly locks, just perfect to play,\nYour crazy talks which made my day.",
        "The moments I cherished, acting fine, Knowing your heart was never mine.\nWith those useless hopes, still I hide\nThe words I never said, burning inside. Sometimes love means letting go,\nHow hard it hurts, you'll never know.\nNo matter how long, I'm gonna wait,\nUntil I see you choose someone right.",
        "Erasing all the fake scenarios I made,\nLetting all my incomplete wishes fade. With these stupid memories that I carry,\nWhich always leave my eyes blurry.\nMy sleepless nights with silent tears,\nThe hidden pain no one ever hears.\nThe day she makes your heart stay,\nI'll lose you quietly, and love you anyway."
      ]
    }
  },
  {
    "id": "page-33",
    "pageNumber": 33,
    "type": "content",
    "title": "ആട്ടിൻതോലിട്ട ചെന്നായ",
    "templateData": {
      "side": "right",
      "layoutVariant": "poem",
      "bgColor": "#D6D8E4",
      "title": "ആട്ടിൻതോലിട്ട ചെന്നായ",
      "author": "Nakshathra S",
      "authorRole": "ME 2026-30",
      "paragraphs": [
        "മതിയാക്കുക നിൻ കപടനാടകം\nചതിതൻ മുഖംമൂടി പിച്ചിച്ചീന്തുവാൻ\nതുടിക്കുന്നെൻ കരങ്ങൾ\nനിന്നോരോതേനുറും വാക്കെല്ലാ-\nമെന്റെ കായത്തിലേക്കാഴ്ത്തി-\nയിറക്കിയ വാളിൻ മുനയാ-\nണെന്നറിവാൻ വൈകി ഞാൻ",
        "രക്തദാഹിയായ യക്ഷിയേപോൽ\nഎന്നിലേ എന്നെ നീ വലിച്ചൂറ്റി കുടിച്ചു\nചെറുപുഞ്ചിരി നൽകിയരികിൽ നീ\nകാലമതിൻ യാഥാർത്ഥ്യമെന്നതിൽ\nകാട്ടി നിൻ ചിരിയുടെ മറയിലൊ-\nളിഞ്ഞുള്ള തീക്കനൽ",
        "വെറുക്കാൻ തോന്നുന്നീല\nഎന്നിലത്രമേലളവാണു നീ\nപഠിക്കീല ഞാനിനിയും\nനിൻ പക്കൽ വന്നേക്കും\nനീയെൻ ചെന്നായ എന്നറിഞ്ഞിട്ടും."
      ]
    }
  },
  {
    "id": "page-34",
    "pageNumber": 34,
    "type": "content",
    "title": "തിരിച്ചുവരവ്",
    "templateData": {
      "side": "left",
      "layoutVariant": "poem",
      "bgColor": "#CDD0D8",
      "title": "തിരിച്ചുവരവ്",
      "author": "Femisha Paul",
      "authorRole": "CSE 2026-30",
      "paragraphs": [
        "ഒരു ശാന്തമായ ഓണം പുലരി. നാടാകെ പ്രകാശവും അലങ്കാരങ്ങളും നിറയുമ്പോഴും, ആ പടിപ്പുരയിൽ കാത്തുനിന്നത് മറ്റൊരു കണ്ണീരിന്റെ നിശബ്ദതയായിരുന്നു. അതിർത്തിയിലെ മഞ്ഞുമലകളിൽ ഹരിപടൻ വീശിയടിക്കുന്ന നെഞ്ചുപിളർക്കുന്ന വാർത്തയെത്തിയിട്ട് ഇന്നേക്ക് കൃത്യം ഒരു വർഷം.",
        "എങ്കിലും, മുത്തശ്ശിയുടെ സങ്കടത്തിന് മുന്നിൽ വഴങ്ങി അവർ ചെറിയൊരു തുമ്പപ്പൂക്കളമൊരുക്കി ജാലകപ്പടിയിൽ നിൽക്കുമ്പോഴാണ്, ഉമ്മറത്തുനിന്ന് മുത്തശ്ശിയുടെ വിറയാർന്ന വിളികേട്ടത്. ഓടിയെത്തിയ ദേവൂട്ടി കണ്ടത് അവിശ്വസനീയമായ കാഴ്ചയാണ്—പ്രകാശപൂരിതമായ പുഞ്ചിരിയോടെ മുന്നിൽ നിൽക്കുന്നു, ഹരിഹരൻ!",
        "മരിച്ചുപോയെന്ന് കരുതിയ ആൾ തിരികെ വന്ന സന്തോഷത്തിൽ എല്ലാവരും കരഞ്ഞുകൊണ്ട് അവനെ കെട്ടിപ്പിടിച്ചു. സ്ഫോടനത്തിൽ അവന്റെ വലതുകൈപ്പത്തി നഷ്ടപ്പെട്ടിരുന്നു. അവളുടെ വിതുമ്പലിന് മറുപടിയായി വടക്കൻ മലനിരകളുടെ വിദൂരതകളിലേക്ക് കണ്ണുനട്ട് അവൻ തുടർന്നു, \"ആ മാരകമായ സ്ഫോടനത്തിൽ ചോര വാർന്നു എന്നെ മരണത്തിന് വിട്ടുകൊടുക്കാതെ കാത്തുസൂക്ഷിച്ച എന്റെ ഹിമാലയത്തിന്, ആ പവിത്രഭൂമിക്ക് ഞാൻ നൽകിയ പ്രണയോപഹാരമാണത്...\""
      ]
    }
  },
  {
    "id": "page-35",
    "pageNumber": 35,
    "type": "content",
    "title": "Where Silence Knows...",
    "templateData": {
      "side": "right",
      "layoutVariant": "poem",
      "bgColor": "#B8BDC4",
      "title": "Where Silence Knows...",
      "author": "Akshaya S",
      "authorRole": "CSE 2025-29",
      "paragraphs": [
        "As the misty wind passes, weaving through her floating strands,\nHer soft footsteps brush against the velvety grass.\nShivering beneath the mist, she continues to walk,\nAs silence follows her like a shadow.",
        "There was no crowd, no clamour,\nNo \"hi,\" no \"bye,\" not even a smile or a wave.\nAnd all of a sudden, everything felt new—\nNot being dramatic, but nothing felt the same again.",
        "Searching for reasons for her existence as she moves,\nIn search of answers that could never be found.\nWhispered thoughts turn into silent echoes,\nA nightmare she could never wake up from.\nYet all she could do was keep moving forward,\nAll alone, just as she had been doing all along."
      ]
    }
  },
  {
    "id": "page-36",
    "pageNumber": 36,
    "type": "content",
    "title": "If the Moon could write",
    "templateData": {
      "side": "left",
      "layoutVariant": "poem",
      "bgColor": "#0E0F14",
      "textColor": "#F5F5F7",
      "title": "If the Moon could write",
      "author": "Alvina Grace",
      "authorRole": "CSE 2024-28",
      "paragraphs": [
        "If the Moon could write\nShe'd write about all the love she had\nthat she don't know where to put.\nShe'd write about all the nights she spends alone\namidst all the burning stars in the sky.\nShe stands there alone, only to watch and fawn over\neverything that roams around her.",
        "If the moon could write,\nShe'd write about the humans who loves to the moon\nand flee back.\nOr the lovers who loved to the moon and beyond.",
        "Silently she hopes, there'll come a day\nthat fills the void in her heart with a little of love,\nlove as painful as it is.\nShe'll live alone in all eternity\nwhile watching the stars burning to death,\nsecretly hoping she'd meet the same end\njust so she could escape this misery."
      ]
    }
  },
  {
    "id": "page-37",
    "pageNumber": 37,
    "type": "content",
    "title": "വേവാനിരിക്കുന്ന മാംസങ്ങൾ",
    "templateData": {
      "side": "right",
      "layoutVariant": "poem",
      "bgColor": "#D2D4DC",
      "title": "വേവാനിരിക്കുന്ന മാംസങ്ങൾ",
      "author": "Varsha Manesh",
      "authorRole": "CSE 2025-29",
      "paragraphs": [
        "വികാരങ്ങളുടെ വിഷണ്ണഭാവത്തെ ചില ഉദ്ബോധനബോധങ്ങളുടെ താളങ്ങളിൽ ലയിപ്പിച്ച്, പുഴുത്ത് പുഴുങ്ങിയ മാംസത്തിൽ നിന്നുയരുന്ന പോയട്രിക് മണംകിട്ടുന്ന ശവത്തെ നിഗൂഢമായ ചില ആന്തരികാവസ്ഥയുടെ കഠിനമായ ആസ്വാദനശേഷിയോട് കൂടി ആസ്വദിച്ചിട്ടുണ്ടോ?",
        "ചിത്രത്തിലെന്ന പോലെ സ്ഥായിയായ വികാരങ്ങളുടെ വിഴുപ്പുകെട്ടുകളിൽ പുറത്തു ചാടാൻ കഴിയാതെ ദ്രവിച്ച് ദ്രവിച്ച് നശിച്ച് തീർന്ന പോലുള്ള മനുഷ്യരുടെ അവസ്ഥകൾ എന്ത് ദയനീയമാണ്. അച്ഛന്റെ മൃതദേഹം ചുട്ടെരിക്കാൻ വെമ്പി നിൽക്കുന്ന ആ മനുഷ്യനെ ഞാൻ ആപേക്ഷികമായി വിശകലനം ചെയ്തു.",
        "പോരുവാൻ നേരം ഞാൻ ആ മനുഷ്യനോട് ചോദിച്ചു: \"എങ്ങനെ സാധിക്കുന്നു?\" \"മരിച്ച് കഴിഞ്ഞാൽ മനുഷ്യനല്ലല്ലോ, അത് വെറും മാംസമല്ലേ\"... ചോദ്യങ്ങൾക്ക് മാത്രമല്ല ചില ഉത്തരങ്ങൾക്കും വിഴുപ്പുകെട്ടുകൾ സൃഷ്ടിക്കാൻ സാധിക്കുമെന്ന് അന്ന് ഞാൻ മനസ്സിലാക്കി."
      ]
    }
  },
  {
    "id": "page-38",
    "pageNumber": 38,
    "type": "content",
    "title": "Her",
    "templateData": {
      "side": "left",
      "layoutVariant": "poem",
      "bgColor": "#7B8498",
      "title": "Her",
      "author": "Muhammed Sinan MK",
      "authorRole": "ME 2026-30",
      "paragraphs": [
        "The echoes of your voice still haunt me,\nMemories straggle,\nrefusing to fade.\nBut I'll find strength within this darkness.\nIn my solitude, I'll\nrebuild the barricade..."
      ]
    }
  },
  {
    "id": "page-39",
    "pageNumber": 39,
    "type": "content",
    "title": "La folie",
    "templateData": {
      "side": "right",
      "layoutVariant": "poem",
      "bgColor": "#C5A783",
      "title": "La folie",
      "author": "Akshaya S",
      "authorRole": "CSE 2025-29",
      "paragraphs": [
        "How does it feel to be a fool,\nHiding all pain, tryna act so cool?\nWhy does it seem to be a dream,\nYet it's better than the silent scream?\nAll you spend are a few minutes with me,\nThose butterflies that you don't see...",
        "No matter how long you'll ignore,\nI'm gonna wait for you even more.\nMaybe we're not meant to be together,\nOhh, destiny! Why should we bother?\nIt's just you that I could think of,\nThose eyes made me forget to blink.",
        "All these stupid efforts that I make,\nFor you, it's always gonna be fake.\nIt's always you whom I can't compare,\nMy hidden love, you don't even care.\nThe unsaid words buried in my heart,\nBut all I could do is to leave you apart."
      ]
    }
  },
  {
    "id": "page-40",
    "pageNumber": 40,
    "type": "content",
    "title": "അതിര്?",
    "templateData": {
      "side": "left",
      "layoutVariant": "poem",
      "bgColor": "#EDE0C9",
      "title": "അതിര്?",
      "author": "Nakshathra S",
      "authorRole": "ME 2026-30",
      "paragraphs": [
        "ഞാൻ - നീ എന്നതിർ നീ കല്പിച്ച നാളുരഞ്ഞതാണീ\n'പ്രണയ'മെന്നൊമന നാമധേയമാമിഷ്ടം, സുഹൃത്തേ...\nസൗഹൃദം പോലും പ്രണയവൽക്കരിക്കപ്പെട്ട-\nയുലകത്തിന്നുമയല്ലോ നാം.\nസൗഹൃദത്തിൻ പരിശുദ്ധി കളങ്കപ്പെട്ടതായി വിശ്വാസമില്ലെനിക്ക്...",
        "ശല്യമെന്നുമുദ്രവീണപ്പോൾ കൂടി\nഞാൻ കൂടെ നിന്നതൊക്കെ പ്രണയമായിയാണോ നിൻ\nനയനം സ്വീകരിച്ചത്?\nനിൻ മൗനം പോലും മൂകയാക്കിയെന്നെ,\nസ്നേഹത്തിൻ വില അതിൻ 'തലക്കെട്ടി'ലാണോ ലയിക്കുന്നത്, ചേതനെ?",
        "മാപ്പ്, നിന്നിലെ മുറിപ്പാടുകൾക്ക് കാരണമായതിന്,\nഅപരിചിതത്വം സ്വീകാര്യമായിരുന്നില്ലെനിക്ക്,\nഇന്നതിൻ വലയത്തിൽ നാം...\nദുഃഖം മറക്കാൻ ഏറെ ശ്രമങ്ങൾ,\nഎല്ലാം നീരിൻ മേലുള്ള\nവരപോൽ, അവ്യക്തം."
      ]
    }
  },
  {
    "id": "page-41",
    "pageNumber": 41,
    "type": "content",
    "title": "THE MIND THAT NEVER RESTS",
    "templateData": {
      "side": "right",
      "layoutVariant": "poem",
      "bgColor": "#C5CEDB",
      "title": "THE MIND THAT NEVER RESTS",
      "author": "Evita Ann Anand",
      "authorRole": "ECE 2026-30",
      "paragraphs": [
        "I'm Evita Ann Anand, a first year ECE student. I have always been interested in how the human mind works. There hardly seems to be a single day that I have spent without overthinking something. Sometimes a simple harmless thought can lead to a series of endless thoughts, questions and possibilities.",
        "When a day is finally over and you have nothing left to do, instead of resting, your mind starts to think about a conversation that happened hours ago. Social media has made this even worse by making teenagers constantly compare themselves with others and worry about how they will be judged.",
        "Keeping our minds busy is not necessarily a bad thing. Curiosity, imagination and creativity are important qualities that every human being should have. But the real challenge is for us to know when to let our mind think and when to let it rest. Sometimes we need to stop, relax and give our minds a little rest from all these unnecessary overthinking."
      ]
    }
  },
  {
    "id": "page-42",
    "pageNumber": 42,
    "type": "content",
    "title": "Life @ CEM",
    "templateData": {
      "side": "left",
      "layoutVariant": "filmstrip",
      "title": "Life @ CEM",
      "subtitle": "Campus Cultural & Festival Chronicles",
      "image": cemCampusSunriseImg,
      "items": [
        {
          "title": "Classical Dance Showcase",
          "subtitle": "Auditorium Stage"
        },
        {
          "title": "Traditional Attire Walk",
          "subtitle": "Campus Courtyard"
        },
        {
          "title": "Drama & Mime Performance",
          "subtitle": "Main Amphitheatre"
        },
        {
          "title": "Live Band Night",
          "subtitle": "Open Air Stage"
        }
      ]
    }
  },
  {
    "id": "page-43",
    "pageNumber": 43,
    "type": "content",
    "title": "Iliad'26",
    "templateData": {
      "side": "right",
      "layoutVariant": "filmstrip",
      "title": "Iliad'26",
      "subtitle": "Arts & Cultural Fest Highlights",
      "image": cemCollectiveSunsetImg,
      "items": [
        {
          "title": "Battle of Bands",
          "subtitle": "Iliad '26 Stage"
        },
        {
          "title": "Mr. & Ms. Iliad Crowning",
          "subtitle": "Iliad '26 Finale"
        },
        {
          "title": "Group Folk Dance",
          "subtitle": "Iliad '26 Cultural Night"
        },
        {
          "title": "Confetti Celebration",
          "subtitle": "Main Arena"
        }
      ]
    }
  },
  {
    "id": "page-44",
    "pageNumber": 44,
    "type": "content",
    "title": "Life @ CEM · Holi & Iftar'25",
    "templateData": {
      "side": "left",
      "layoutVariant": "filmstrip",
      "title": "Holi & Iftar'25",
      "subtitle": "Life @ CEM · Brotherhood & Joy",
      "image": letsTalkArtImg,
      "items": [
        {
          "title": "Festival of Colours on Campus",
          "subtitle": "Holi Celebrations"
        },
        {
          "title": "Campus Gathering in Colours",
          "subtitle": "Holi @ CEM"
        },
        {
          "title": "Evening Iftar Preparation",
          "subtitle": "Iftar '25"
        },
        {
          "title": "Community Iftar Feast",
          "subtitle": "Iftar '25"
        }
      ]
    }
  },
  {
    "id": "page-45",
    "pageNumber": 45,
    "type": "content",
    "title": "Onam'25 & Victory Day",
    "templateData": {
      "side": "right",
      "layoutVariant": "filmstrip",
      "title": "Onam'25 · Victory Day",
      "subtitle": "Life @ CEM · Tradition & Triumphs",
      "image": rithuCoverImg,
      "items": [
        {
          "title": "Onam Procession & Maveli",
          "subtitle": "Onam '25"
        },
        {
          "title": "Pookkalam & Kasavu Attire",
          "subtitle": "Onam '25"
        },
        {
          "title": "Chenda Melam & Tug of War",
          "subtitle": "Victory Day"
        },
        {
          "title": "DJ Night & Stage Address",
          "subtitle": "Victory Day"
        }
      ]
    }
  },
  {
    "id": "page-46",
    "pageNumber": 46,
    "type": "content",
    "title": "Life @ CEM · Onam'26",
    "templateData": {
      "side": "left",
      "layoutVariant": "filmstrip",
      "title": "Onam'26",
      "subtitle": "Life @ CEM · Lamp Lighting & Melam",
      "image": cemCampusSunriseImg,
      "items": [
        {
          "title": "Inaugural Nilavilakku Lighting",
          "subtitle": "Onam '26"
        },
        {
          "title": "Faculty & Union Felicitation",
          "subtitle": "Onam '26"
        },
        {
          "title": "Maveli Grand Entry",
          "subtitle": "Onam '26"
        },
        {
          "title": "Shinkari Melam in Courtyard",
          "subtitle": "Onam '26"
        }
      ]
    }
  },
  {
    "id": "page-47",
    "pageNumber": 47,
    "type": "content",
    "title": "Elysion'26",
    "templateData": {
      "side": "right",
      "layoutVariant": "filmstrip",
      "title": "Elysion'26",
      "subtitle": "IEEE Tech & Cultural Symposium",
      "image": monsoonBananaLeafImg,
      "items": [
        {
          "title": "Unity Engine & VR Showcase",
          "subtitle": "Elysion '26 Tech"
        },
        {
          "title": "Interactive Workshops",
          "subtitle": "Elysion '26"
        },
        {
          "title": "Department Batch Gatherings",
          "subtitle": "Elysion '26"
        },
        {
          "title": "Twilight Musical Concert",
          "subtitle": "Elysion '26"
        }
      ]
    }
  },
  {
    "id": "page-48",
    "pageNumber": 48,
    "type": "content",
    "title": "Season III — Winter Mist",
    "templateData": {
      "side": "left",
      "layoutVariant": "divider",
      "bgColor": "#D6F0F2",
      "pullQuote": "The skies grew quiet,\nthe air felt lighter,\nand somewhere between the silence\nwe found ourselves\nbreathing again."
    }
  },
  {
    "id": "page-49",
    "pageNumber": 49,
    "type": "content",
    "title": "Contents · Winter",
    "templateData": {
      "side": "right",
      "layoutVariant": "contents",
      "title": "Contents",
      "bgColor": "#B8D4DC",
      "items": [
        {
          "title": "Her...",
          "subtitle": "Pages 50–51"
        },
        {
          "title": "പടുകൂറ്റൻ വൃക്ഷം നിലം പതിച്ചു വേരുകൾറ്റു പോയിരുന്നത്രേ...",
          "subtitle": "Page 52"
        },
        {
          "title": "Broken",
          "subtitle": "Page 53"
        },
        {
          "title": "സ്നേഹം?",
          "subtitle": "Page 54"
        },
        {
          "title": "यादों",
          "subtitle": "Page 55"
        },
        {
          "title": "ചുവപ്പിന്റെ പൊരുൾ",
          "subtitle": "Pages 56–57"
        },
        {
          "title": "കോടമഞ്ഞിനപ്പുറം!",
          "subtitle": "Pages 58–59"
        }
      ]
    }
  },
  {
    "id": "page-50",
    "pageNumber": 50,
    "type": "content",
    "title": "Her....",
    "templateData": {
      "side": "left",
      "layoutVariant": "two-column",
      "bgColor": "#D8E4E8",
      "title": "Her....",
      "columns": [
        [
          "In the middle of the city stood a roost so large that its oldest birds had forgotten where it began. It covered huge trees, and nests were attached to every part. The higher branches belonged mostly to the older birds, while the younger ones occupied the middle, where every movement was noticed and every arrival seemed to become somebody else's business.",
          "She had never minded being among them. She was not the sort of bird that disappeared completely into the background. She simply preferred the quiet. She listened more than she spoke. She had a habit of sitting somewhere for a long time, looking over the city beneath the branches.",
          "Whenever she crossed one of the central branches, some of the older birds seemed to lower their voices. Until one afternoon, something struck the branch beside her. A small piece of dry bark rolled to her feet."
        ],
        [
          "She spun around. There were birds everywhere. Some were perched along the higher branches, some were flying across the open space, and a few were watching her, but none looked as though they had done anything.",
          "Soon, the central branches became places she no longer visited. She found longer routes. Then quieter ones. Eventually, she stopped leaving her corner of the roost unless she had to. A wall formed around her without ever being built. It was made of distance, silence, lowered eyes, and closed wings.",
          "Years passed, and it was now time to leave the roost. She flew as far as she could and finally found a place she thought was suitable. There were fewer trees and fewer birds. The air moved more slowly there, and the mornings were quieter."
        ]
      ]
    }
  },
  {
    "id": "page-51",
    "pageNumber": 51,
    "type": "content",
    "title": "Her.... (Conclusion)",
    "templateData": {
      "side": "right",
      "layoutVariant": "two-column",
      "bgColor": "#D8E4E8",
      "title": "Her....",
      "columns": [
        [
          "For the first few days, she was certain that she had made the right choice. But then she began noticing something. There were fewer birds here, but somehow, they knew everything. They noticed unfamiliar wings almost immediately.",
          "The first time she found herself surrounded by unfamiliar birds, she almost retreated. Instead, she stayed. Nothing happened. The birds continued around her, busy with their own lives.",
          "Days passed. She began taking the same path every morning. Then she started sitting on a branch that overlooked the valley. A few birds began joining her—simply because there was room."
        ],
        [
          "She still preferred silence. But she no longer mistook solitude for safety. One evening, as the settlement settled beneath the fading light, she found herself walking along one of its busiest branches. She heard laughter somewhere behind her. For a moment, an old instinct returned. Then she looked ahead. So she kept walking.",
          "For the first time in a long while, she did not wonder who was watching. She had spent years believing that peace meant finding a place where nobody could see her. She was beginning to understand that perhaps peace was something else entirely. Perhaps it was being seen and discovering that she did not have to disappear because of it. She continued along the branch as the evening light slipped between the leaves. She did not look back."
        ]
      ]
    }
  },
  {
    "id": "page-52",
    "pageNumber": 52,
    "type": "content",
    "title": "“പടുകൂറ്റൻ വൃക്ഷം നിലം പതിച്ചു. വേരുകൾറ്റു പോയിരുന്നത്രേ...”",
    "templateData": {
      "side": "left",
      "layoutVariant": "two-column",
      "bgColor": "#DCE4E7",
      "title": "“പടുകൂറ്റൻ വൃക്ഷം നിലം പതിച്ചു. വേരുകൾറ്റു പോയിരുന്നത്രേ...”",
      "author": "Mahi K S",
      "authorRole": "ME 2024-28",
      "columns": [
        [
          "ഇവിടെ ഒരു വലിയ അധികാരം കൈവശം വെച്ചിരിക്കുന്ന ഒരു വ്യക്തിയെ ആണ് പരാമർശിക്കുന്നത്. ശരിക്കും ഈ വ്യക്തി ഉയരങ്ങളിൽ ഇരിക്കുന്ന, വലിയ ഒരു ഉത്തരവാദിത്തമുള്ള ഒരാളാണ്. പക്ഷേ അയാൾ തോറ്റുപോയി. ഒരുപക്ഷേ ചതി കൂടെ നിൽക്കുന്ന വ്യക്തികളിൽ നിന്ന് അദ്ദേഹത്തിന് നേരെ എന്തെങ്കിലും ചതി പറ്റിയതായിരിക്കാം.",
          "അടുത്തതായി പ്രകൃതിയെ ഈ വാക്കുകൾ കൊണ്ട് കൂട്ടി എഴുതാം. പ്രകൃതി നിലനിൽക്കുന്നത് വൃക്ഷങ്ങളും പുഴകളും മലകളും ജീവജാലങ്ങളും ഒക്കെ കൊണ്ടാണ്. എന്നാൽ പെട്ടെന്ന് കടന്നുവരുന്ന മനുഷ്യർ, പ്രകൃതിയുടെ വേരുകൾ എന്ന് വിശേഷിപ്പിക്കുന്ന ഈ വൃക്ഷങ്ങളെയും മറ്റും ചൂഷണം ചെയ്യുന്നു."
        ],
        [
          "ഇനി ഒരു പക്ഷേ പ്രണയനൈരാശ്യം ആകാം. ഒരു വ്യക്തി പതിയെ ഇല്ലാതാകുന്നതിന് കാരണം, തന്റെ പ്രണയിനിയെ അത്രമേൽ വിശ്വസിച്ചതിന്, തന്റെ ജീവിതത്തിൽ ആ പ്രണയിനിയുമായുള്ള ഒരുമിച്ച് ഒരു ജീവിതം സ്വപ്നം കണ്ടതിനു ശേഷം പെട്ടെന്ന് ചതിച്ച് ഒറ്റപ്പെടുത്തിയാൽ, അവിടെയും ആ വാക്കുകളിൽ പരാമർശിച്ച പോലെ \"പടുകൂറ്റൻ വൃക്ഷം നിലം പതിക്കാം, വേരുകൾ അറ്റു പോയിരുന്നത്രെ\".",
          "ഈ വാക്കുകളിൽ ഉൾക്കൊണ്ട് കാര്യങ്ങൾ — ചതിയും, ചൂഷണവും, ഒറ്റപ്പെടൽ, തകർന്നുപോയ സ്വപ്നം, പ്രണയം, അധികാരമോഹം — ഈ വിഷയങ്ങളൊക്കെ കൊണ്ടാണ് ഒരു പടുകൂറ്റൻ വൃക്ഷം നിലം പതിക്കുന്നത് പോലെ ചില വ്യക്തികൾ തകർന്നു പോകുന്നത്."
        ]
      ]
    }
  },
  {
    "id": "page-53",
    "pageNumber": 53,
    "type": "content",
    "title": "BROKEN",
    "templateData": {
      "side": "right",
      "layoutVariant": "poem",
      "bgColor": "#D6ECEF",
      "title": "BROKEN",
      "author": "Sreedhar Adithyan V",
      "authorRole": "EEE 2024-28",
      "paragraphs": [
        "Broken things have so much to say.\nThey carry stories of triumphs and defeats,\nYears of struggles and years of happiness.\nThere is a sad beauty in broken things—something beautiful,\nSomething different,\nSomething great.",
        "Sometimes they speak of sorrows,\nSometimes of joy.\nThey always have a story to tell.\nThey are not just broken,\nThey are pieces of everything they have survived.",
        "For some things,\nCracks are not the end of the story.\nThat's what makes them unique.\nThey're what makes them different.\nThey're what makes them them.\nThey are not something to hide.\nThey are the very things\nThat make something worth remembering"
      ]
    }
  },
  {
    "id": "page-54",
    "pageNumber": 54,
    "type": "content",
    "title": "സ്നേഹം?",
    "templateData": {
      "side": "left",
      "layoutVariant": "poem",
      "bgColor": "#CAD8B8",
      "title": "സ്നേഹം?",
      "author": "Nakshathra S",
      "authorRole": "ME 2026-30",
      "paragraphs": [
        "ഒന്നിക്കില്ലെന്നെൻ മനം ആണയിട്ടിട്ടു-\nമെന്തിനു ഞാൻ ബധിരയായി\nഅമിതമായലാമൃതം വിഷമെന്ന-\nപോൽ എന്നിലെ വിഷമായി\nമാറിയിരിക്കുന്നു മാധവാ നീ,\nമാധവൻ കൃഷ്ണനെന്നാകിൽ ഞാനാരാണെന്നു ചൊല്ക നീ.",
        "പതിനാറാം പ്രായത്തിലെ തോ-\nന്നലുകൾക്കായുസ്സെത്രപകലുകൾ?\nവിധിവിശ്വാസി ആകയാൽ, അവളെ-\nന്നെയകറ്റി നിൻപക്കൽനിന്നു-\nമെൻ മിഴിയരുവിയിലോ-\nഴുക്കിൻ വേഗത കൂടാതെ.",
        "അതുപോൽ നമ്മുടെ വികാര-\nങ്ങളും, ശാശ്വതമല്ലാത്ത-\nതിനെ വെടിഞ്ഞ് ആത്മധൈ-\nര്യത്തോടെ ജീവിക്ക നാം.\nപുതിയ നീ, പുതിയ ഞാൻ\nപുത്തൻ ലോകം."
      ]
    }
  },
  {
    "id": "page-55",
    "pageNumber": 55,
    "type": "content",
    "title": "यादों",
    "templateData": {
      "side": "right",
      "layoutVariant": "poem",
      "bgColor": "#D4E0DE",
      "title": "यादों",
      "author": "Akash Deepu Jacob",
      "authorRole": "CSE 2025-29",
      "paragraphs": [
        "कभी मैंने सोचा तक नहीं था,\nएक दिन इन यादों को भूलने का।\nयादों को भूलना कभी चाहा भी नहीं।\nआज जीने के मगर, हम यादों में जीने चले।\nयादें होती हैं भूलने की,\nउल्टा तो जीने की मज़ा भी नहीं, मंज़िल भी नहीं होगी।",
        "खोए हुए वो यादें,\nगुम हो जाने वाली बातें,\nदोनों कभी वापस नहीं आएँगे।\nफिर भी यादों के साथ हम चल पड़े,\nयादों में हम गुम हो गए।\nयादें थीं बहुत मीठी,\nपर ये तो शराब थोड़ी है,\nसालों बाद नशा और बढ़ने को।",
        "ये ज़िंदगी है अपनी,\nयादों में भीगने की नहीं,\nठहरकर नए बनने की है।\nठहरकर नए सपनों के टापू कब्ज़ा करने की है।\nयादें होती हैं सबकी,\nडूबने की नहीं, तैरने की।"
      ]
    }
  },
  {
    "id": "page-56",
    "pageNumber": 56,
    "type": "content",
    "title": "ചുവപ്പിന്റെ പൊരുൾ",
    "templateData": {
      "side": "left",
      "layoutVariant": "two-column",
      "bgColor": "#DCE2E4",
      "title": "ചുവപ്പിന്റെ പൊരുൾ",
      "columns": [
        [
          "വിഭിന്നമായ ചിന്താശേഷിയെ മുതലെടുക്കും വിധം ഹൃദയത്തിൽ നിന്നുദിച്ചുയർന്ന ചന്ദ്രലേഖയുടെ പുകച്ചുരുളുകൾ പതർച്ചയോടെ അശാന്തമായ ശ്മശാനത്തിൽ എത്തിച്ചേരുമ്പോൾ, ഞരമ്പുകളാൽ തിങ്ങിനിറഞ്ഞ രക്തക്കുഴലുകളെ വകഞ്ഞുമാറ്റി മാംസത്തിന്റെ ഉള്ളിൽ നിന്നും അസ്ഥിയെ പറിച്ചെടുക്കുന്ന വേദന എന്ത് ആസ്വാദനകരമാണെന്നോ?.",
          "ഒരാളുടെ സാമീപ്യം ഒരാൾക്ക് എത്രമാത്രം സ്വസ്ഥകരമാണ് മറിച്ച് അത് വേറൊരാൾക്ക് എത്രമാത്രം മാനസികമായ നീരിളക്കം. അപ്രതീക്ഷിതമായ കണ്ടുമുട്ടലുകൾ, അത് ഒരാളെ എത്രമാത്രം വൈകാരിക തലത്തിലേക്ക് എത്തിക്കും?"
        ],
        [
          "അഴുക്കിന്റെയും ഇഴജന്തുക്കളുടെയും ആവാസ സ്ഥലം പ്രഖ്യാപിച്ച നിലത്തിരുന്നു അവൾ, തന്റെ നഗ്നമായ ശരീരം ചേർത്തണച്ചു. ജീവിച്ചിരുന്ന നാളത്രയും എന്തിനായിരുന്നു എന്ന് സ്വയം ചോദിച്ചു കൊണ്ട്, മരണം തന്നെ കൈവരിക്കാൻ പോകുന്നു എന്ന മിഥ്യ ധാരണയിലും അവൾക്കാരെ പഴിക്കണം എന്ന് അറിയില്ലായിരുന്നു.",
          "തുണിയിൽ കൂടെ ഒഴുകുന്ന ചോര തനിക്കും ഒരു അസ്തിത്വത്തിന് പിറവി കൊടുക്കാൻ കഴിയുമെന്ന ബോധ്യമായിരുന്നില്ല മറിച്ച് എന്ത് ഏതെന്ന് അറിയാതെ വളർന്ന ഒരു കുട്ടിയുടെ പ്രതിച്ഛായ ആയിരുന്നു അവളിൽ."
        ]
      ]
    }
  },
  {
    "id": "page-57",
    "pageNumber": 57,
    "type": "content",
    "title": "ചുവപ്പിന്റെ പൊരുൾ (തുടർച്ച)",
    "templateData": {
      "side": "right",
      "layoutVariant": "poem",
      "bgColor": "#DCE2E4",
      "title": "ചുവപ്പിന്റെ പൊരുൾ",
      "author": "Varsha Manesh",
      "authorRole": "CSE 2025-29",
      "paragraphs": [
        "ഹൃദയം മുറിഞ്ഞു ചോര ഒലിച്ചു. വേദനയുടെ പ്രളയം കണ്ണുനീർ സൃഷ്ടിച്ചു. മനസ്സിന്റെ പിരിമുറുക്കം ശ്മശാനത്തിന്റെ പണി തീർത്തു. അവൾക്ക് ആ സമയം വേണ്ടിയിരുന്നത് ചേർത്ത് പിടിക്കാൻ ശേഷിയുള്ള കൈകൾ ആയിരുന്നു, തലോടാൻ പോന്ന വിരലുകൾ ആയിരുന്നു, മാതൃത്വത്തിന്റെ പൊരുൾ ആയിരുന്നു.",
        "ഹൃദയത്തിന്റെ നിറം ചുവപ്പാണെന്നും ചോരയുടെ നിറം ചുവപ്പാണെന്നുമുള്ള ധാരണ അപ്പാടെ തെറ്റായിരുന്നു എന്നുള്ള ബോധ്യമായിരിക്കണം മനസ്സിന്റെ ആദ്യത്തെ ചാഞ്ചാട്ടങ്ങളിൽ ഒന്നായി അവൾ കണക്കുകൂട്ടിയത്. തന്റെ തൊട്ടുകൂടായ്മയെ ഇല്ലാതാക്കാൻ അശുദ്ധതയെ വിശുദ്ധതയാക്കാൻ രക്തത്തിൽ അവൾ കുളിച്ചു.",
        "\"ചുവന്ന ചെമ്പരത്തിക്ക് ഭ്രാന്താണത്രെ, ചുവന്ന പനിനീർ പൂവിന് പ്രണയമാണത്രേ, കാഴ്ചയ്ക്കാണ് പ്രശ്നം പോലും! കാഴ്ചപ്പാടിനല്ലത്രെ\" അവൾ അറിഞ്ഞിരുന്നോ പ്രണയം അത്രമാത്രം ഭ്രാന്തമാണെന്ന്."
      ]
    }
  },
  {
    "id": "page-58",
    "pageNumber": 58,
    "type": "content",
    "title": "കോടമഞ്ഞിനപ്പുറം!",
    "templateData": {
      "side": "left",
      "layoutVariant": "two-column",
      "bgColor": "#CBD8D1",
      "title": "കോടമഞ്ഞിനപ്പുറം!",
      "columns": [
        [
          "കോളേജിൽ ചേർന്നിട്ട് ഒരാഴ്ച മാത്രം. പുതിയ ക്യാമ്പസ്... പുതിയ മുഖങ്ങൾ... പതിയെ സൗഹൃദങ്ങളായി മാറിക്കൊണ്ടിരുന്ന പുതിയ ബന്ധങ്ങൾ. അങ്ങനെയൊരു ദിവസം കോളേജിൽ വെറുതെയിരിക്കുമ്പോഴാണ് ഒരാൾ പെട്ടെന്ന് ചോദിച്ചത്: \"നമുക്ക് പുഴയിൽ പോയാലോ? ഇവിടെ അടുത്ത് ഒരു അടിപൊളി പുഴയുണ്ട്.\"",
          "കോളേജിന്റെ ഗേറ്റ് കടന്ന് പുറത്തേക്കിറങ്ങിയപ്പോൾ ഞങ്ങൾ 19 പേരായിരുന്നു. നടന്ന് നടന്ന് ഒടുവിൽ പുഴയ്ക്കരികിലെത്തി. അപ്പോഴാണ് പുഴയുടെ മറുവശത്ത് കോടമഞ്ഞിനുള്ളിൽ പകുതി മറഞ്ഞുനിൽക്കുന്ന ഒരു മല എല്ലാവരുടെയും ശ്രദ്ധയിൽപ്പെട്ടത്. \"അത് കയറിയാലോ?\" അങ്ങനെ പത്തൊൻപത് പേരും മല കയറിത്തുടങ്ങി."
        ],
        [
          "കയറ്റം കൂടുന്തോറും ക്ഷീണം തുടങ്ങി. അതിനിടയിൽ ഒരാൾ വളരെ ഗൗരവത്തോടെ പറഞ്ഞു: \"എന്തെങ്കിലും സംഭവിച്ചാൽ... എന്റെ മയ്യിത്ത് നാട്ടിലെ പള്ളിയിൽ തന്നെ സംസ്കരിക്കണം.\" പക്ഷേ അതും മറ്റുള്ളവർക്ക് ഒരു തമാശയായി. ഒടുവിൽ എല്ലാവരും മലമുകളിലെത്തി, കോടമഞ്ഞിൽ മറഞ്ഞ മലനിരകൾ, താഴെ നേർത്ത വെള്ളിവരപോലെ പുഴ, തണുത്ത കാറ്റ്...",
          "സൂര്യൻ അസ്തമിച്ചു. \"ഇറങ്ങാം.\" അങ്ങനെ ഇറങ്ങിത്തുടങ്ങി. കുറച്ചുദൂരം ഇറങ്ങിയപ്പോൾ ഒരാൾ പതിയെ ചോദിച്ചു: \"ഇത് നമ്മൾ കയറിയ വഴിയാണോ?\" മുന്നിലേക്ക് നോക്കിയപ്പോൾ സത്യം മനസ്സിലായി. അല്ല. കയറിവന്ന വഴിയല്ല അത്."
        ]
      ]
    }
  },
  {
    "id": "page-59",
    "pageNumber": 59,
    "type": "content",
    "title": "കോടമഞ്ഞിനപ്പുറം! (തുടർച്ച)",
    "templateData": {
      "side": "right",
      "layoutVariant": "two-column",
      "bgColor": "#CBD8D1",
      "title": "കോടമഞ്ഞിനപ്പുറം!",
      "author": "Muhammed Irfan Shibili V P & Mohammed Mikdham P P",
      "authorRole": "CSE 2024-28",
      "columns": [
        [
          "വഴി തെറ്റിയെന്ന് സമ്മതിക്കാൻ അവർക്കു ഭയമായിരുന്നു. അങ്ങനെ അവർ മുന്നോട്ട് നടന്നു. രാത്രി പൂർണ്ണമായി വീണു. 19 പേരിൽ അഞ്ചോ ആറോ പേരുടെ ഫോണുകളിൽ മാത്രമേ ചാർജുണ്ടായിരുന്നുള്ളൂ. പിന്നെ കാട് ശബ്ദിക്കാൻ തുടങ്ങി. അതിനിടയിൽ കാലുകളിൽ അട്ടകൾ പറ്റിപ്പിടിച്ചു.",
          "ഒരാളുടെ ഫോൺ വെളിച്ചം മറ്റൊരാൾക്ക്. ഒരാൾ വഴുതിയാൽ മറ്റൊരാളുടെ കൈ. ഒടുവിൽ ദൂരെ ഒരു ചെറിയ പ്രകാശം കണ്ടു. \"അവിടെ!\" തേയിലത്തോട്ടങ്ങൾക്കിടയിലൂടെ എല്ലാവരും ആ വെളിച്ചത്തിലേക്ക് നീങ്ങി."
        ],
        [
          "ഒടുവിൽ കാലിനടിയിൽ മണ്ണിന് പകരം റോഡ് അനുഭവപ്പെട്ടു. പത്തൊൻപത് പേരും ഒരുമിച്ച് ശ്വാസം വിട്ടു. പക്ഷേ കുറച്ചുനേരം കഴിഞ്ഞപ്പോൾ ആരോ പെട്ടെന്ന് നിശ്ശബ്ദനായി. അവൻ പിന്നിലേക്ക് നോക്കി, വീണ്ടും എണ്ണി നോക്കി. ഒന്ന്... രണ്ട്... മൂന്ന്... പതിനാറ്... പതിനേഴ്... പതിനെട്ട്.",
          "ഒരു നിമിഷം മുമ്പ് വരെ തങ്ങളോടൊപ്പം നടന്നിരുന്ന ഒരാൾ... ഇപ്പോൾ അവിടെ ഉണ്ടായിരുന്നില്ല. അവർ വീണ്ടും എണ്ണി. പതിനെട്ട്. ഇരുട്ടിൽ, തേയിലത്തോട്ടങ്ങളുടെ അപ്പുറത്ത്... അവർ വന്ന വഴിയിലേക്ക് നോക്കിനിൽക്കുമ്പോൾ, കുറച്ചുനേരം മുമ്പ് തമാശയായി പറഞ്ഞ ആ വാക്കുകൾ മാത്രം എല്ലാവരുടെയും മനസ്സിൽ വീണ്ടും മുഴങ്ങി......."
        ]
      ]
    }
  },
  {
    "id": "page-60",
    "pageNumber": 60,
    "type": "content",
    "title": "Through Our Lens",
    "templateData": {
      "side": "left",
      "layoutVariant": "polaroid-grid",
      "title": "Through Our Lens",
      "items": [
        {
          "title": "Golden Dusk Silhouette",
          "subtitle": "Dhanush Jayan · EEE 2022-26",
          "image": cemCollectiveSunsetImg
        },
        {
          "title": "Stage Lights & Acoustics",
          "subtitle": "Adhil P A · CSE 2024-28",
          "image": letsTalkArtImg
        },
        {
          "title": "Crimson Horizon at Munnar",
          "subtitle": "Saket Ullas · CSE 2024-28",
          "image": myFlowerTulipsImg
        }
      ]
    }
  },
  {
    "id": "page-61",
    "pageNumber": 61,
    "type": "content",
    "title": "Through Our Lens · Gallery",
    "templateData": {
      "side": "right",
      "layoutVariant": "polaroid-grid",
      "title": "Through Our Lens",
      "items": [
        {
          "title": "Amber Evening Reflections",
          "subtitle": "Dhanush Jayan · CSE 2026-30",
          "image": cemCollectiveSunsetImg
        },
        {
          "title": "Twilight Clouds over Campus",
          "subtitle": "Sreedhar Adithyan V · EEE 2024-28",
          "image": monsoonBananaLeafImg
        },
        {
          "title": "Misty Gables of CEM",
          "subtitle": "Mohammed Bilal P N · CSE 2024-28",
          "image": cemCampusSunriseImg
        },
        {
          "title": "Watchtower Silhouette",
          "subtitle": "Adhil P A · CSE 2024-28",
          "image": cemCollectiveSunsetImg
        },
        {
          "title": "Fog-Lit Windows at Night",
          "subtitle": "Aaron Verghese Shaji · CSE 2024-28",
          "image": letsTalkArtImg
        }
      ]
    }
  },
  {
    "id": "page-62",
    "pageNumber": 62,
    "type": "content",
    "title": "The CEM Collective",
    "templateData": {
      "side": "left",
      "layoutVariant": "collective-left",
      "title": "The CEM\nCollective",
      "image": cemCollectiveSunsetImg
    }
  },
  {
    "id": "page-63",
    "pageNumber": 63,
    "type": "content",
    "title": "Communities & Clubs at CEM",
    "templateData": {
      "side": "right",
      "layoutVariant": "collective-right",
      "pullQuote": "A celebration of the clubs, communities,\nand people who bring ideas to life at CEM.",
      "image": cemCollectiveSunsetImg
    }
  },
  {
    "id": "page-64",
    "pageNumber": 64,
    "type": "content",
    "title": "IEDC",
    "templateData": {
      "side": "left",
      "layoutVariant": "club",
      "title": "IEDC",
      "subtitle": "Innovation & Entrepreneurship Development Centre · CEM",
      "image": cemCampusSunriseImg,
      "columns": [
        [
          "What if a classroom idea could become a real solution? The Innovation and Entrepreneurship Development Centre (IEDC) at the College of Engineering Munnar (CEM) exists to make that possibility real.",
          "A flagship initiative of the Kerala Startup Mission (KSUM), IEDC bridges the gap between academic learning and the real-world innovation ecosystem. The statewide IEDC network connects 601 institutions across 14 regional clusters.",
          "The community is guided by Mr. Ramesh Chand K A, Nodal Officer, along with Ms. Aswathy Ashokan and Mr. B. Edmond Bernabas Enock, Assistant Nodal Officers, and is led by Anwaya V, Student Lead."
        ],
        [
          "Supporting the community is a dedicated Execom comprising Ramjith K, Samesh Santhosh Kumar, Athira V S, Adithya Prakash, Angel Mariya Joseph, Nihal M, Varsha Manesh, Athul, and Sreeram Biju.",
          "IEDC also connects CEM students to the wider startup ecosystem through initiatives such as the IEDC Summit and Idea Fest. At IEDC CEM, every idea has the potential to be a beginning."
        ]
      ]
    }
  },
  {
    "id": "page-65",
    "pageNumber": 65,
    "type": "content",
    "title": "TinkerHub CE Munnar",
    "templateData": {
      "side": "right",
      "layoutVariant": "club",
      "title": "TinkerHub",
      "subtitle": "CE Munnar · Learn. Build. Share. Keep Tinkering.",
      "image": cemCollectiveSunsetImg,
      "columns": [
        [
          "In a world where technology changes faster than textbooks can keep up, learning cannot stop at the classroom door. TinkerHub CE Munnar is a student community built around that idea: a place where curiosity becomes experimentation, ideas become projects, and learning becomes something we do together.",
          "At CE Munnar, initiatives such as First Bite of Python, community gatherings, hackathons, and hands-on sessions have helped create spaces where students can experiment beyond the academic syllabus."
        ],
        [
          "The community follows a simple philosophy: learn, build, share, and be kind. Campus Lead: Aaron Verghese Shaji · Learning Coordinator: Nihal M · WIT Lead: Dilna Mohan · Outreach Lead: Mohammed Bilal P N.",
          "TinkerHub CE Munnar is ultimately not about teaching students what technology is. It is about giving them the confidence to explore what they can create with it."
        ]
      ]
    }
  },
  {
    "id": "page-66",
    "pageNumber": 66,
    "type": "content",
    "title": "IEEE Student Branch",
    "templateData": {
      "side": "left",
      "layoutVariant": "club",
      "title": "IEEE",
      "subtitle": "IEEE Student Branch · College of Engineering Munnar",
      "image": cemCampusSunriseImg,
      "columns": [
        [
          "Technology is not just about creating what is next; it is also about learning, sharing ideas and using knowledge to make a difference. Established in 2005, IEEE SB CE Munnar has been providing students with opportunities to engage beyond the academic curriculum with more than 50 active members.",
          "Throughout the year, the branch and its chapters have conducted programmes covering cybersecurity, artificial intelligence, Git and GitHub, UI/UX design, electronics, robotics, and energy conservation."
        ],
        [
          "The branch is guided by Prof. Shahimol Basheer, Student Branch Counselor, and led by Adhil P A, Chair, and Anuparnika P K, Vice Chair. The branch continued its journey with ELYSION '26, conducted on 14 and 15 February 2026.",
          "With every session, workshop, competition and initiative, IEEE SB CE Munnar looks forward to carrying forward the spirit of \"Advancing Technology for Humanity.\""
        ]
      ]
    }
  },
  {
    "id": "page-67",
    "pageNumber": 67,
    "type": "content",
    "title": "NSS Unit No. 173",
    "templateData": {
      "side": "right",
      "layoutVariant": "club",
      "title": "NSS",
      "subtitle": "National Service Scheme (Unit No. 173) · \"Not Me But You\"",
      "image": cemCollectiveSunsetImg,
      "columns": [
        [
          "The National Service Scheme (NSS) Unit of the College of Engineering Munnar (Unit No. 173) serves as an active platform for nurturing social responsibility, leadership, teamwork, and community engagement among students. Guided by the motto \"Not Me But You,\" the unit encourages students to extend their learning beyond the classroom.",
          "The unit functions under the dedicated guidance of Programme Officer Prof. Anish Ramakrishnan, who was selected as a Special Guest for the Republic Day celebrations."
        ],
        [
          "Executive Committee 2026–2027:\n• Programme Officer: Prof. Anish Ramakrishnan\n• Volunteer Secretaries: Pranav L; Sreesha TS\n• NRPF: Jerin Jomon; Roshnamol Suresh\n• KTU Cell: Muhammad Ali; Keerthana SB\n• RUDHIRASENA: Aardra LB; Sreedhar Adithyan V\n• Energy Cell: Akshay Biju; Fathima Jinisha A\n• Media Team: Zameel Bin Ashiq; Muhammed Bilal\n• Documentation: Athul Ebi, Muhammed Sinan, Krishnapriya"
        ]
      ]
    }
  },
  {
    "id": "page-68",
    "pageNumber": 68,
    "type": "content",
    "title": "3DOT Media Club",
    "templateData": {
      "side": "left",
      "layoutVariant": "club",
      "title": "3DOT Media Club",
      "subtitle": "Visual Communication, Photography, Design & Cinema · Est. Oct 2024",
      "image": letsTalkArtImg,
      "columns": [
        [
          "3DOT Media Club of the College of Engineering Munnar (CEM) was established on 3 October 2024, under the initiative of Mrs. Radhika R., Head of the Department of Electrical and Electronics Engineering.",
          "3DOT brings together students in video editing, graphic design, photography, videography, motion graphics, content creation, social media and event coverage. With around 70 students joining the club, 3DOT has grown into a collaborative creative platform."
        ],
        [
          "Executive Committee:\n• President: Samesh (S7 ME)\n• Secretary: Bilal (S5 CSE)\n• Editing & Digital Design: Aaron (S5 CSE)\n• Photography: Zameel (S5 CSE)\n• Social Media: Adhil PA (S5 CSE)\n• Fine Arts: Anuparnika (S7 EEE)\n• Videography: Haneen (S5 CSE)\n• Content: Rithuvarna (S5 CSE)"
        ]
      ]
    }
  },
  {
    "id": "page-69",
    "pageNumber": 69,
    "type": "content",
    "title": "Music Club",
    "templateData": {
      "side": "right",
      "layoutVariant": "club",
      "title": "Music Club",
      "subtitle": "Where Campus Melodies Come Alive",
      "image": myFlowerTulipsImg,
      "columns": [
        [
          "Music has always been a powerful way to express emotions, connect people and bring life to a campus. With this vision, the Music Club of the College of Engineering Munnar (CEM) was established to provide students with a space where they can explore, develop and share their passion for music beyond the classroom.",
          "Through music, students get opportunities to develop confidence, teamwork, stage presence, communication skills and creative thinking."
        ],
        [
          "The Music Club is coordinated by Mrs. Radhika R. Krishna, Head of the Department of Electrical and Electronics Engineering. The club is headed by Muhammad Adil and Bhadra Sharma, who lead the activities and initiatives of the club with the support of its members.",
          "The Music Club is more than a platform to perform—it is a place to learn, create, connect and let the music speak."
        ]
      ]
    }
  },
  {
    "id": "page-70",
    "pageNumber": 70,
    "type": "content",
    "title": "Pillars Of CEM",
    "templateData": {
      "side": "left",
      "layoutVariant": "group-photos",
      "title": "Pillars Of CEM",
      "subtitle": "Faculty & Administrative Staff of College of Engineering Munnar",
      "items": [
        {
          "title": "Teaching Faculty Cohort",
          "subtitle": "Departments of CSE, ECE, EEE, ME & Basic Sciences",
          "image": cemCampusSunriseImg
        },
        {
          "title": "Administrative & Technical Staff",
          "subtitle": "College of Engineering Munnar",
          "image": cemCollectiveSunsetImg
        }
      ]
    }
  },
  {
    "id": "page-71",
    "pageNumber": 71,
    "type": "content",
    "title": "CEM Batches 2022–2030",
    "templateData": {
      "side": "right",
      "layoutVariant": "group-photos",
      "title": "Across The Years",
      "subtitle": "Student Cohorts of College of Engineering Munnar",
      "items": [
        {
          "title": "Batch 2026–2030",
          "subtitle": "First Year Cohort",
          "image": cemCampusSunriseImg
        },
        {
          "title": "Batch 2025–2029",
          "subtitle": "Second Year Cohort",
          "image": cemCollectiveSunsetImg
        },
        {
          "title": "Batch 2024–2028",
          "subtitle": "Third Year Cohort",
          "image": rithuCoverImg
        },
        {
          "title": "Batch 2023–2027",
          "subtitle": "Fourth Year Cohort",
          "image": monsoonBananaLeafImg
        },
        {
          "title": "Batch 2022–2026",
          "subtitle": "Graduating Cohort",
          "image": myFlowerTulipsImg
        }
      ]
    }
  },
  {
    "id": "page-72",
    "pageNumber": 72,
    "type": "content",
    "title": "Batch 2022–26",
    "templateData": {
      "side": "left",
      "layoutVariant": "group-photos",
      "title": "Batch 2022–26",
      "subtitle": "Course Completion & Convocation Cohorts",
      "items": [
        {
          "title": "CSE · Computer Science & Engineering",
          "subtitle": "Graduating Batch 2022–26",
          "image": cemCampusSunriseImg
        },
        {
          "title": "EEE · Electrical & Electronics Engineering",
          "subtitle": "Graduating Batch 2022–26",
          "image": cemCollectiveSunsetImg
        },
        {
          "title": "ME · Mechanical Engineering",
          "subtitle": "Graduating Batch 2022–26",
          "image": monsoonBananaLeafImg
        },
        {
          "title": "ECE · Electronics & Communication Engineering",
          "subtitle": "Graduating Batch 2022–26",
          "image": myFlowerTulipsImg
        }
      ]
    }
  },
  {
    "id": "page-73",
    "pageNumber": 73,
    "type": "content",
    "title": "College Union 2026–27",
    "templateData": {
      "side": "right",
      "layoutVariant": "union-grid",
      "title": "College Union 2026–27",
      "items": [
        {
          "title": "Prof. Anish R",
          "subtitle": "Staff Advisor"
        },
        {
          "title": "Sanjay Satheesan",
          "subtitle": "Chairperson"
        },
        {
          "title": "Marhoona Safar",
          "subtitle": "Vice Chairperson"
        },
        {
          "title": "Muhammed Shahmin",
          "subtitle": "General Secretary"
        },
        {
          "title": "Adhil P A",
          "subtitle": "Magazine Editor"
        },
        {
          "title": "Mikdham P P",
          "subtitle": "Arts Club Secretary"
        },
        {
          "title": "Pranav L",
          "subtitle": "UUC"
        },
        {
          "title": "Aleena Sebastian",
          "subtitle": "Lady Rep"
        },
        {
          "title": "Anusree Prasad",
          "subtitle": "Lady Rep"
        },
        {
          "title": "Haneen Shan",
          "subtitle": "CSE Rep"
        },
        {
          "title": "Muhammed Fayas P P",
          "subtitle": "EEE Rep"
        },
        {
          "title": "Akshay Baiju",
          "subtitle": "ECE Rep"
        },
        {
          "title": "Muhammed Ali A",
          "subtitle": "Mech Rep"
        },
        {
          "title": "Samesh Santhoshkumar",
          "subtitle": "Union Rep"
        },
        {
          "title": "Athul Raj",
          "subtitle": "Sports Secretary"
        }
      ]
    }
  },
  {
    "id": "page-74",
    "pageNumber": 74,
    "type": "back-cover",
    "title": "CEM · College Magazine 2025",
    "subtitle": "College of Engineering Munnar",
    "templateData": {
      "side": "back",
      "layoutVariant": "back-2025",
      "title": "CEM",
      "header": "College Magazine 2025",
      "image": cemCampusSunriseImg,
      "footerPrimary": "College of Engineering Munnar",
      "footerSecondary": "rithu-ruby.vercel.app"
    }
  }
];
