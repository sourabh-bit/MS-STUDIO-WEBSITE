import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ORIGINAL IMAGE URLs */
const allImages: string[] = [
  "https://res.cloudinary.com/dqdx30pbj/image/upload/f_auto,q_auto,w_1200/port2_qelcif.heic",
  "https://res.cloudinary.com/dqdx30pbj/image/upload/f_auto,q_auto,w_1200/bridal1_1_bhlexk.webp",
  "https://res.cloudinary.com/dqdx30pbj/image/upload/f_auto,q_auto,w_1200/port1_gmr9jg.jpg",
  "https://res.cloudinary.com/dqdx30pbj/image/upload/f_auto,q_auto,w_1200/port13_uvlo5k.jpg",
  "https://res.cloudinary.com/dqdx30pbj/image/upload/f_auto,q_auto,w_1200/port7_fu9wly.jpg",
  "https://res.cloudinary.com/dqdx30pbj/image/upload/f_auto,q_auto,w_1200/port6_r2a2uf.jpg",
  "https://res.cloudinary.com/dqdx30pbj/image/upload/f_auto,q_auto,w_1200/port12_qxuq0z.heic",
  "https://res.cloudinary.com/dqdx30pbj/image/upload/f_auto,q_auto,w_1200/port9_rlg7oa.jpg",
  "https://res.cloudinary.com/dqdx30pbj/image/upload/f_auto,q_auto,w_1200/port5_cfp8sg.heic",
  "https://res.cloudinary.com/dqdx30pbj/image/upload/f_auto,q_auto,w_1200/port8_jiplrn.jpg",
  "https://res.cloudinary.com/dqdx30pbj/image/upload/f_auto,q_auto,w_1200/v1763013327/port4_cdcolz.jpg",
  "https://res.cloudinary.com/dqdx30pbj/image/upload/v1763027380/065A9442_50_tfdjg6.jpg",
];

/* Categories */
const bridalImages = [
  allImages[0], allImages[1], allImages[2], allImages[3], allImages[4], allImages[11]
];
const editorialImages = [allImages[5], allImages[6], allImages[10]];
const eventImages = [allImages[7], allImages[8], allImages[9]];

/* Pattern */
const pattern = [
  "big", "small", "small",
  "small", "small", "small",
  "small", "big",
  "small", "small", "small",
  "small", "small", "small"
];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const categories = [
    { id: "all", name: "All Work" },
    { id: "bridal", name: "Bridal" },
    { id: "editorial", name: "Editorial" },
    { id: "events", name: "Events" },
  ];

  const filtered =
    activeCategory === "all"
      ? allImages
      : activeCategory === "bridal"
      ? bridalImages
      : activeCategory === "editorial"
      ? editorialImages
      : eventImages;

  return (
    <>
      <section className="min-h-screen py-24 bg-background text-foreground">
        <div className="container mx-auto px-6 lg:px-12">

          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl md:text-6xl font-semibold mb-4">
              Portfolio
            </h2>
            <p className="text-lg opacity-80">
              Explore our luxury makeup artistry curated beautifully.
            </p>
          </div>

          {/* Categories */}
        <div className="flex justify-center gap-6 mb-12 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                px-6 py-2 rounded-full font-medium border transition-all duration-300

                ${
                  activeCategory === cat.id
                    ? `
                      bg-[#f8e8e8] 
                      text-primary 
                      border-primary 
                      shadow-md 
                      scale-[1.05]
                    `
                    : `
                      border-[#e4c4c4] 
                      text-foreground 
                      hover:bg-[#f8e8e8] 
                      hover:border-primary 
                      hover:text-primary 
                      hover:shadow-[0_0_15px_rgba(255,192,203,0.4)] 
                      hover:scale-[1.04]
                    `
                }
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>



          {/* ⭐ RESPONSIVE GRID — DESKTOP ORIGINAL, MOBILE FIXED */}
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="
              max-w-7xl mx-auto
              grid
              grid-cols-1              /* mobile */
              md:grid-cols-3           /* desktop original */
              gap-4 md:gap-6
              auto-rows-[180px]        /* mobile height */
              md:auto-rows-[360px]     /* original browser height */
            "
          >
            {filtered.slice(0, 15).map((url, i) => {
              const type = pattern[i] || "small";

              const sizeClass =
                type === "big"
                  ? "col-span-2 md:col-span-2 row-span-2 h-[360px] md:h-[720px]"
                  : "h-[180px] md:h-[360px]";

              return (
                <div
                  key={url}
                  className={`relative overflow-hidden rounded-2xl cursor-pointer ${sizeClass}`}
                  onClick={() => setSelectedImage(url)}
                >
                  {!loadedImages[url] && (
                    <div className="absolute inset-0 bg-gray-300 animate-pulse" />
                  )}

                  <img
                    src={url}
                    onLoad={() => setLoadedImages((p) => ({ ...p, [url]: true }))}
                    className="w-full h-full object-cover transition duration-300 hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center text-white">
                    View Work
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Fullscreen Viewer */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              src={selectedImage}
              className="max-w-full max-h-[90vh] rounded-xl"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Portfolio;
