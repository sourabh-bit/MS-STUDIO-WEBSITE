import React, { useState } from "react";

// ✅ Import your portfolio images
import bridal1 from "../assets/portfolio/bridal1.jpg";
import bridal2 from "../assets/portfolio/bridal2.jpg";
import editorial1 from "../assets/portfolio/editorial1.jpg";
import editorial2 from "../assets/portfolio/editorial2.jpg";
import events1 from "../assets/portfolio/events1.jpg";
import events2 from "../assets/portfolio/events2.jpg";

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [loadedImages, setLoadedImages] = useState<{ [key: number]: boolean }>(
    {}
  );

  const categories = [
    { id: "all", name: "All Work" },
    { id: "bridal", name: "Bridal" },
    { id: "editorial", name: "Editorial" },
    { id: "events", name: "Events" },
  ];

  const portfolioItems = [
    { id: 1, category: "bridal", image: bridal1 },
    { id: 2, category: "bridal", image: bridal2 },
    { id: 3, category: "editorial", image: editorial1 },
    { id: 4, category: "editorial", image: editorial2 },
    { id: 5, category: "events", image: events1 },
    { id: 6, category: "events", image: events2 },
  ];

  const filteredItems =
    activeCategory === "all"
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeCategory);

  return (
    <section className="min-h-screen py-24 bg-background text-foreground">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl md:text-6xl font-semibold mb-4">
            Portfolio
          </h2>
          <p className="text-lg opacity-80">
            Explore our luxury makeup artistry across styles.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center gap-6 mb-12 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-2 rounded-full border transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-primary text-white border-primary"
                  : "border-foreground/20 hover:border-primary"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <a
              key={item.id}
              href={item.image}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all"
            >
              {/* Image with blur placeholder */}
              <div
                className={`w-full h-full bg-gray-200 animate-pulse absolute inset-0 rounded-2xl ${
                  loadedImages[item.id] ? "hidden" : "block"
                }`}
              ></div>

              <img
                src={item.image}
                alt="Portfolio Work"
                loading="lazy"
                onLoad={() =>
                  setLoadedImages((prev) => ({ ...prev, [item.id]: true }))
                }
                className={`w-full h-full object-cover transition-all duration-700 ease-out transform ${
                  loadedImages[item.id]
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-105"
                } group-hover:scale-110`}
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-lg font-medium">
                View Work
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
