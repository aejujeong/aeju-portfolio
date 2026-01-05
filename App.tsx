
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';

// --- Types & Interfaces ---
interface WorkItem {
  id: number;
  title: string;
  img: string; // URL or Base64 string
  url: string;
}

interface CareerItem {
  date: string;
  title: string;
  role: string;
}

interface SiteData {
  profileImg: string; // URL or Base64 string
  bio: string;
  career: CareerItem[];
  works: WorkItem[];
}

// --- Helper Functions ---
const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getThumbnail = (work: WorkItem) => {
  if (work.img) return work.img;
  const ytId = getYoutubeId(work.url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
  return 'https://placehold.co/600x400/111/333?text=NO+IMAGE';
};

// --- Initial Data ---
const DEFAULT_DATA: SiteData = {
  profileImg: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop", 
  bio: "복잡한 정보를 누구나 이해할 수 있는 영상으로 만듭니다.\n단순한 나열을 넘어 구조와 맥락을 중심으로 편집합니다.",
  career: [
    { date: '2022 — 2025', title: '한국탐사저널리즘센터', role: '뉴스 및 다큐멘터리 편집 총괄' },
    { date: '2021', title: '경기콘텐츠진흥원', role: '사업기획 및 프로젝트 총괄' },
    { date: '2012 — 2017', title: '농협은행', role: '수신 및 은행 업무 전반' }
  ],
  works: [
    { id: 1, title: 'Visual Archive_1', img: '', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
    { id: 2, title: 'Visual Archive_2', img: '', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 3, title: 'Visual Archive_3', img: '', url: '' },
    { id: 4, title: 'Visual Archive_4', img: '', url: '' },
    { id: 5, title: 'Visual Archive_5', img: '', url: '' },
    { id: 6, title: 'Visual Archive_6', img: '', url: '' },
  ]
};

// --- Framer Motion Variants ---
const ELITE_EXPO: [number, number, number, number] = [0.19, 1, 0.22, 1];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.08, 
      delayChildren: 0.05,
      ease: ELITE_EXPO 
    } 
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0, filter: "blur(4px)" },
  visible: { 
    y: 0, 
    opacity: 1, 
    filter: "blur(0px)",
    transition: { duration: 1, ease: ELITE_EXPO } 
  },
};

const revealVariants: Variants = {
  hidden: { scale: 1.05, opacity: 0, filter: "blur(6px)" },
  visible: { 
    scale: 1, 
    opacity: 1, 
    filter: "blur(0px)",
    transition: { duration: 1.4, ease: ELITE_EXPO } 
  }
};

const titleParentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.4 },
  },
};

const charVariants: Variants = {
  hidden: { y: "40%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 1.2, ease: ELITE_EXPO } },
};

const App: React.FC = () => {
  const [data, setData] = useState<SiteData>(DEFAULT_DATA);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [editingData, setEditingData] = useState<SiteData>(DEFAULT_DATA);
  const passRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('aeju_portfolio_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(parsed);
        setEditingData(parsed);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  const saveToLocal = (newData: SiteData) => {
    setData(newData);
    localStorage.setItem('aeju_portfolio_data', JSON.stringify(newData));
    setIsAdminOpen(false);
    setIsAuth(false);
    setPassInput('');
    alert('저장되었습니다.');
  };

  const resetToDefault = () => {
    if (window.confirm('모든 데이터를 초기 상태로 되돌리시겠습니까?')) {
      localStorage.removeItem('aeju_portfolio_data');
      setData(DEFAULT_DATA);
      setEditingData(DEFAULT_DATA);
      setIsAdminOpen(false);
      setIsAuth(false);
      alert('초기화되었습니다.');
    }
  };

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleAdminTrigger = () => {
    setEditingData(data);
    setIsAdminOpen(true);
    setPassInput('');
    setTimeout(() => passRef.current?.focus(), 150);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passInput === '0818') {
      setIsAuth(true);
    } else {
      alert('Key가 올바르지 않습니다.');
      setPassInput('');
    }
  };

  const closeAdmin = () => {
    setIsAdminOpen(false);
    setIsAuth(false);
    setPassInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'profile' | { type: 'work', id: number }) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (target === 'profile') {
        setEditingData({ ...editingData, profileImg: base64 });
      } else if (typeof target === 'object' && target.type === 'work') {
        const newWorks = editingData.works.map(w => 
          w.id === target.id ? { ...w, img: base64 } : w
        );
        setEditingData({ ...editingData, works: newWorks });
      }
    };
    reader.readAsDataURL(file);
  };

  const openWorkLink = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert('영상 링크가 등록되지 않았습니다.');
    }
  };

  return (
    <main className="scroll-container bg-[#0A0A0A] text-white selection:bg-[#2962FF]">
      
      {/* SECTION 1: HERO */}
      <section id="hero" className="flex flex-col relative overflow-hidden bg-[#0A0A0A] min-h-screen">
        <div className="w-full px-6 md:px-12 lg:px-32 py-8 md:py-14 z-[100]">
          <div className="max-w-6xl w-full mx-auto flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 1.2, ease: ELITE_EXPO }}
              onClick={() => scrollToSection('hero')}
              className="text-[18px] md:text-[22px] font-black tracking-tighter cursor-pointer group"
            >
              AJ<span className="text-[#2962FF] group-hover:text-white transition-colors duration-500">.</span>
            </motion.div>
            
            <div className="flex gap-8 md:gap-12 text-[9px] md:text-[10px] tracking-[0.2em] font-medium uppercase opacity-60">
              <span onClick={() => scrollToSection('profile')} className="hover:text-[#2962FF] hover:opacity-100 cursor-pointer transition-all duration-500">PROFILE</span>
              <span onClick={() => scrollToSection('works')} className="hover:text-[#2962FF] hover:opacity-100 cursor-pointer transition-all duration-500">WORKS</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 px-4">
          <motion.div variants={titleParentVariants} initial="hidden" animate="visible" className="flex items-center justify-center overflow-hidden w-full select-none">
            <h1 className="text-[20vw] md:text-[16vw] lg:text-[13vw] font-black leading-[0.85] md:leading-none m-0 uppercase flex flex-col md:flex-row items-center md:items-baseline origin-center">
              <span className="flex overflow-hidden">
                {"PORT".split('').map((char, i) => (
                  <motion.span key={`port-${i}`} variants={charVariants} className="inline-block text-white">{char}</motion.span>
                ))}
              </span>
              <span className="flex overflow-hidden">
                {"FOLIO".split('').map((char, i) => (
                  <motion.span key={`folio-${i}`} variants={charVariants} className="inline-block text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.7)' }}>{char}</motion.span>
                ))}
              </span>
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 0.3, y: 0 }}
            transition={{ delay: 1.2, duration: 1.5, ease: ELITE_EXPO }}
            className="mt-6 md:mt-8 text-[7px] md:text-[10px] font-bold uppercase text-center tracking-[1.2em] md:tracking-[2.5em] pl-[1.2em] md:pl-[2.5em]"
          >
            <span className="whitespace-nowrap">© 2026 AEJU JEONG ARCHIVE</span>
          </motion.div>
        </div>

        <div className="w-full px-6 md:px-12 lg:px-32 pb-12 md:pb-20">
          <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-end">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5, duration: 1.2, ease: ELITE_EXPO }} className="space-y-6 md:space-y-10">
              <p className="text-[15px] md:text-[17px] lg:text-[18px] leading-[1.8] font-light text-white/70 word-keep max-w-xl whitespace-pre-line">
                {data.bio}
              </p>
              <motion.button 
                whileTap={{ scale: 0.97 }}
                onClick={() => scrollToSection('works')}
                className="bg-white text-black hover:bg-[#2962FF] hover:text-white px-8 md:px-10 py-4 md:py-5 flex items-center justify-between w-full md:w-[280px] group transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"
              >
                <span className="text-[10px] md:text-[11px] font-black tracking-widest uppercase transition-colors">EXPLORE WORKS</span>
                <i className="fa-solid fa-arrow-right text-[10px] transition-transform duration-500 group-hover:translate-x-2"></i>
              </motion.button>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.7, duration: 1.2, ease: ELITE_EXPO }} className="border-t border-white/10 pt-8">
              <div className="grid grid-cols-2 gap-6 md:gap-12">
                <div>
                  <p className="text-[7px] md:text-[7.5px] font-bold tracking-[0.25em] uppercase opacity-30 mb-3 md:mb-5">CORE MASTERY</p>
                  <ul className="text-[9px] md:text-[10px] font-black space-y-1.5 md:space-y-2 tracking-wider opacity-90">
                    <li>DOCUMENTARY EDITING</li>
                    <li>NEWS PRODUCTION</li>
                    <li>NARRATIVE CRAFT</li>
                  </ul>
                </div>
                <div>
                  <p className="text-[7px] md:text-[7.5px] font-bold tracking-[0.25em] uppercase opacity-30 mb-3 md:mb-5">PROFESSIONAL</p>
                  <ul className="text-[9px] md:text-[10px] font-black space-y-1.5 md:space-y-2 tracking-wider opacity-90">
                    <li>POST-PRODUCTION</li>
                    <li>YOUTUBE VIDEO PRODUCTION</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: BIOGRAPHY */}
      <section id="profile" className="flex flex-col justify-center px-6 md:px-16 lg:pl-48 lg:pr-12 bg-[#0A0A0A] min-h-screen py-20 md:py-0">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={containerVariants} className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 lg:gap-16 items-start">
          
          <div className="md:col-span-4 lg:col-span-3 border-l border-white/10 pl-6 lg:pl-10 py-4">
            <motion.span variants={itemVariants} className="text-[#2962FF] font-mono text-[9px] md:text-xs font-bold mb-8 block">INDEX_01</motion.span>
            
            <motion.div 
              variants={revealVariants}
              className="relative w-full aspect-[3/4] max-w-[150px] md:max-w-none lg:max-w-[130px] bg-[#111] overflow-hidden mb-10 border border-white/5 group shadow-[0_0_50px_rgba(41,98,255,0.06)]"
            >
              <img 
                src={data.profileImg} 
                className="w-full h-full object-cover transition-all duration-[1.2s] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-105" 
                alt="Profile"
              />
              <div className="absolute inset-0 border-[0.5px] border-[#2962FF] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </motion.div>

            <div className="space-y-8 md:space-y-12">
              <motion.div variants={itemVariants}>
                <p className="text-[7px] md:text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase mb-3">Education</p>
                <p className="text-xl md:text-2xl font-black tracking-tight">서울예술대학교</p>
                <p className="text-sm md:text-base text-white/50 mt-2 font-medium">방송영상과 수석 졸업</p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <p className="text-[7px] md:text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase mb-3">Tools</p>
                <div className="flex flex-wrap gap-x-2 md:gap-x-3 gap-y-1 text-sm md:text-base font-black italic tracking-tighter">
                  {["PREMIERE", "A.E", "FINAL CUT", "RESOLVE", "PS", "EXCEL"].map((tool, i) => (
                    <span key={tool}>
                      <span className="hover:text-[#2962FF] transition-colors duration-400 cursor-default">{tool}</span>
                      {i !== 5 && <span className="mx-1 text-white/20">/</span>}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          <div className="md:col-span-8 lg:col-span-9 lg:pl-20">
            <motion.p variants={itemVariants} className="text-[8px] md:text-[11px] font-bold text-white/20 tracking-[0.3em] uppercase mb-8 md:mb-10">Professional Path</motion.p>
            <div className="space-y-0">
              {data.career.map((job, i) => (
                <motion.div 
                  key={i} 
                  variants={itemVariants} 
                  whileHover={{ x: 12 }} 
                  className="group flex flex-col md:flex-row items-baseline gap-4 md:gap-8 lg:gap-14 py-8 md:py-10 border-b border-white/5 last:border-0 cursor-default transition-all duration-[0.6s] ease-[cubic-bezier(0.19,1,0.22,1)] max-w-4xl"
                >
                  <span className="text-[9px] md:text-[11px] font-mono text-white/10 min-w-[100px] md:min-w-[110px] lg:min-w-[120px] tracking-widest">{job.date}</span>
                  <div className="flex-1">
                    <h4 className="text-xl md:text-2xl lg:text-3xl font-black group-hover:text-[#2962FF] transition-colors duration-500 tracking-[-0.03em] leading-[1.1] break-keep">{job.title}</h4>
                    <p className="text-[12px] md:text-[0.9rem] lg:text-[0.95rem] text-white/30 mt-2.5 font-light tracking-wide break-all opacity-80">{job.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 3: WORKS */}
      <section id="works" className="flex flex-col justify-center px-6 md:px-12 lg:px-32 bg-[#0A0A0A] min-h-screen py-20 md:py-0">
        <div className="max-w-6xl w-full mx-auto">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-5%" }}
            variants={containerVariants}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-14 gap-6"
          >
            <motion.div variants={itemVariants} className="border-l-4 border-[#2962FF] pl-5 md:pl-6">
              <span className="text-[#2962FF] font-mono text-[9px] md:text-xs font-bold block mb-2">INDEX_02</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-none">WORKS</h2>
            </motion.div>
            <motion.div variants={itemVariants} className="text-left md:text-right opacity-30 text-[7px] md:text-[9px] font-bold tracking-widest uppercase">Visual Archive<br className="hidden md:block"/>© 2026 Edition</motion.div>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-5%" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8"
          >
            {data.works.map((work, i) => (
              <motion.div 
                key={work.id} 
                variants={itemVariants}
                whileTap={{ scale: 0.98 }}
                onClick={() => openWorkLink(work.url)}
                className="group relative aspect-video bg-[#1a1a1a] overflow-hidden cursor-pointer"
              >
                <img 
                  src={getThumbnail(work)} 
                  className="w-full h-full object-cover opacity-70 saturate-[0.35] transition-all duration-[1s] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-105 group-hover:opacity-100 group-hover:saturate-100" 
                  alt={work.title} 
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/30 backdrop-blur-[1px]">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1.05 }}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center bg-black/40"
                  >
                    <i className="fa-solid fa-play text-white text-sm md:text-base ml-1"></i>
                  </motion.div>
                </div>
                <div className="absolute bottom-4 left-4 md:bottom-5 md:left-5 z-10 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:-translate-y-1">
                  <span className="text-[7px] md:text-[8px] font-mono text-white/40 font-bold mb-1 block">ENTRY_00{work.id}</span>
                  <p className="text-[14px] md:text-[16px] font-black tracking-tight uppercase group-hover:text-[#2962FF] transition-colors duration-400">{work.title}</p>
                </div>
                <div className="absolute inset-0 border-[1px] border-transparent group-hover:border-white/10 transition-all duration-500 pointer-events-none" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- ADMIN TRIGGER --- */}
      <div 
        onClick={handleAdminTrigger}
        className="fixed bottom-4 right-4 z-[9999] w-8 h-8 flex items-center justify-center cursor-pointer opacity-5 hover:opacity-100 transition-opacity duration-700"
        title="Admin Control"
      >
        <i className="fa-solid fa-gear text-white text-[12px]"></i>
      </div>

      {/* --- ADMIN MODAL --- */}
      <AnimatePresence>
        {isAdminOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10"
          >
            {!isAuth ? (
              <motion.div 
                initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-[#111] border border-white/10 p-8 md:p-10 w-full max-w-sm text-center"
              >
                <h2 className="text-lg font-black mb-6 tracking-tight uppercase">Admin Access</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <input 
                    ref={passRef}
                    type="password" 
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    placeholder="Enter Key"
                    className="w-full bg-white/5 border border-white/10 p-4 text-center text-xl tracking-[0.4em] focus:border-[#2962FF] outline-none transition-all duration-300"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-[#2962FF] text-white font-black py-3.5 text-xs tracking-widest hover:bg-[#1a4cdb] transition-all">VERIFY</button>
                    <button type="button" onClick={closeAdmin} className="px-5 border border-white/10 text-white/40 hover:text-white text-xs font-bold transition-all">EXIT</button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ scale: 0.98, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
                className="bg-[#111] border border-white/10 w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 md:p-10 relative text-white shadow-2xl"
              >
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="text-[#2962FF] font-mono text-[10px] font-bold mb-1 uppercase tracking-widest">System Manager</h3>
                    <h2 className="text-2xl font-black tracking-tighter uppercase">Content Architecture</h2>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={resetToDefault} className="text-[9px] font-bold text-red-500 border border-red-500/20 px-4 py-2 hover:bg-red-500 hover:text-white transition-all">FACTORY RESET</button>
                    <button onClick={closeAdmin} className="text-white/40 hover:text-white transition-all"><i className="fa-solid fa-xmark text-xl"></i></button>
                  </div>
                </div>

                <div className="mb-10">
                  <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-4">Master Portrait</label>
                  <div className="flex flex-col md:flex-row gap-6 items-center bg-white/[0.02] p-6 border border-white/5">
                    <div className="w-28 aspect-[3/4] bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                      {editingData.profileImg ? <img src={editingData.profileImg} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user text-xl opacity-10"></i>}
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center justify-center bg-[#2962FF] text-white text-[9px] font-black px-6 py-3.5 cursor-pointer hover:bg-[#1a4cdb] transition-all uppercase tracking-widest">
                          UPLOAD IMAGE
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'profile')} />
                        </label>
                        <input 
                          type="text"
                          value={editingData.profileImg.startsWith('data:') ? 'Local file uploaded' : editingData.profileImg}
                          onChange={(e) => setEditingData({...editingData, profileImg: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 p-3 text-[10px] focus:border-[#2962FF] outline-none"
                          placeholder="Or direct image URL..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-10">
                  <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-3">Professional Statement</label>
                  <textarea 
                    value={editingData.bio}
                    onChange={(e) => setEditingData({...editingData, bio: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 p-4 font-light text-[14px] focus:border-[#2962FF] outline-none min-h-[100px] transition-all"
                    placeholder="Philosophy..."
                  />
                </div>

                <div className="mb-10">
                  <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-3">Timeline Mapping</label>
                  <div className="space-y-3">
                    {editingData.career.map((c, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-white/[0.02] border border-white/5">
                        <input value={c.date} onChange={(e) => {
                          const newC = [...editingData.career];
                          newC[idx].date = e.target.value;
                          setEditingData({...editingData, career: newC});
                        }} className="bg-transparent border-b border-white/10 p-2 text-[11px] focus:border-[#2962FF] outline-none" placeholder="Date"/>
                        <input value={c.title} onChange={(e) => {
                          const newC = [...editingData.career];
                          newC[idx].title = e.target.value;
                          setEditingData({...editingData, career: newC});
                        }} className="bg-transparent border-b border-white/10 p-2 text-[11px] focus:border-[#2962FF] outline-none" placeholder="Company"/>
                        <input value={c.role} onChange={(e) => {
                          const newC = [...editingData.career];
                          newC[idx].role = e.target.value;
                          setEditingData({...editingData, career: newC});
                        }} className="bg-transparent border-b border-white/10 p-2 text-[11px] focus:border-[#2962FF] outline-none" placeholder="Role"/>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-10">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Works Repository</label>
                    <button 
                      onClick={() => {
                        const newWorks = [...editingData.works, { id: Date.now(), title: 'New Archive', img: '', url: '' }];
                        setEditingData({...editingData, works: newWorks});
                      }}
                      className="text-[10px] font-black text-[#2962FF] hover:underline tracking-widest"
                    >+ CREATE NEW ENTRY</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {editingData.works.map((w, idx) => (
                      <div key={idx} className="p-5 bg-white/[0.02] border border-white/5 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-white/20">ENTRY_{idx + 1}</span>
                          <button 
                            onClick={() => {
                              const newW = editingData.works.filter((_, i) => i !== idx);
                              setEditingData({...editingData, works: newW});
                            }}
                            className="text-[8px] text-red-500/50 hover:text-red-500 font-bold uppercase transition-colors"
                          >PURGE</button>
                        </div>
                        <input value={w.title} onChange={(e) => {
                          const newW = [...editingData.works];
                          newW[idx].title = e.target.value;
                          setEditingData({...editingData, works: newW});
                        }} className="w-full bg-transparent border-b border-white/10 p-2 text-[11px] focus:border-[#2962FF] outline-none font-black uppercase tracking-tight" placeholder="Project Title"/>
                        
                        <div className="grid grid-cols-3 gap-3 items-center">
                          <div className="aspect-video bg-black flex items-center justify-center overflow-hidden border border-white/5 relative">
                            <img src={getThumbnail(w)} className="w-full h-full object-cover" />
                          </div>
                          <div className="col-span-2 space-y-2">
                             <label className="block bg-white/5 text-white text-[8px] font-black px-4 py-2 text-center cursor-pointer hover:bg-white/10 transition-all tracking-widest">
                              SWAP THUMBNAIL
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, {type: 'work', id: w.id})} />
                            </label>
                            <input value={w.img.startsWith('data:') ? 'Local file' : w.img} onChange={(e) => {
                              const newW = [...editingData.works];
                              newW[idx].img = e.target.value;
                              setEditingData({...editingData, works: newW});
                            }} className="w-full bg-transparent border-b border-white/5 p-1 text-[8px] text-white/20 focus:border-[#2962FF] outline-none" placeholder="Or URL..."/>
                          </div>
                        </div>

                        <input value={w.url} onChange={(e) => {
                          const newW = [...editingData.works];
                          newW[idx].url = e.target.value;
                          setEditingData({...editingData, works: newW});
                        }} className="w-full bg-transparent border-b border-[#2962FF]/20 p-2 text-[10px] text-[#2962FF] focus:border-[#2962FF] outline-none font-mono" placeholder="External Link (YT/Vimeo)"/>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 sticky bottom-0 bg-[#111] pt-6 pb-2">
                  <button 
                    onClick={() => saveToLocal(editingData)}
                    className="flex-1 bg-[#2962FF] text-white font-black py-4 text-[10px] tracking-[0.2em] hover:bg-[#1a4cdb] transition-all duration-300 shadow-xl shadow-blue-900/10"
                  >COMMIT ARCHIVE</button>
                  <button 
                    onClick={closeAdmin}
                    className="px-10 border border-white/10 text-white/40 font-bold py-4 text-[10px] tracking-[0.2em] hover:text-white transition-all duration-300 uppercase"
                  >CANCEL</button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default App;
