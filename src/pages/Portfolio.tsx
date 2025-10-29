import { useState } from "react";

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Work" },
    { id: "bridal", name: "Bridal" },
    { id: "editorial", name: "Editorial" },
    { id: "events", name: "Events" },
  ];

  const portfolioItems = [
    { id: 1, category: "bridal", title: "Classic Bridal Elegance", description: "Timeless beauty for a garden wedding" },
    { id: 2, category: "editorial", title: "High Fashion Editorial", description: "Bold colors for Vogue feature" },
    { id: 3, category: "bridal", title: "Modern Minimalist Bride", description: "Soft glam for intimate ceremony" },
    { id: 4, category: "events", title: "Red Carpet Glamour", description: "Award show perfection" },
    { id: 5, category: "editorial", title: "Avant-Garde Beauty", description: "Creative conceptual shoot" },
    { id: 6, category: "events", title: "Gala Evening Look", description: "Sophisticated elegance" },
  ];

  const filteredItems = activeCategory === "all" 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="font-display text-5xl md:text-7xl text-primary mb-6">
            Portfolio
          </h1>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            A curated collection of beauty transformations, editorial looks, and timeless elegance
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-16 animate-fade-up">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-8 py-3 rounded-full font-body text-sm tracking-wide transition-elegant ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-elegant"
                  : "bg-muted text-foreground hover:bg-secondary"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="group relative aspect-[3/4] bg-gradient-to-br from-accent/20 to-secondary/20 rounded-2xl overflow-hidden shadow-soft hover:shadow-elegant transition-elegant animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Placeholder for image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="font-display text-4xl text-primary/20">
                  {item.id}
                </p>
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-elegant flex flex-col justify-end p-8">
                <h3 className="font-display text-2xl text-white mb-2">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-white/90">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-20 animate-fade-in">
          <p className="font-body text-lg text-foreground/80 mb-6">
            Interested in collaborating or booking a session?
          </p>
          <a 
            href="/contact"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-full font-body tracking-wide shadow-elegant hover:shadow-soft transition-elegant"
          >
            Let's Create Something Beautiful
          </a>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
