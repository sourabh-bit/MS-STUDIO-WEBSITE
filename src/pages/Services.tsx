import { useState } from "react";
import { Check, Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

type CategoryKey = "bridal" | "party";

type PackageOption = {
  label: string;
  price: number;
};

type ServiceCategory = {
  key: CategoryKey;
  title: string;
  subtitle: string;
  icon: typeof Heart;
  options: PackageOption[];
  features: string[];
  note: string;
};

type SelectionState = Record<CategoryKey, string>;

const prices: Record<string, number> = {
  Bridal: 30000,
  "Bridal +1": 40000,
  "Bridal +2": 50000,
  "Single Look": 3000,
  "Party +1": 5000,
  "Party +2": 7000,
};

const categories: ServiceCategory[] = [
  {
    key: "bridal",
    title: "Bridal Makeup",
    subtitle: "Starting from Rs. 30,000",
    icon: Heart,
    options: [
      { label: "Bridal", price: prices.Bridal },
      { label: "Bridal +1", price: prices["Bridal +1"] },
      { label: "Bridal +2", price: prices["Bridal +2"] },
    ],
    features: [
      "Consultation & skin prep",
      "Hairstyling & draping",
      "Premium products & lashes",
      "Touch-up guidance",
      "Delhi & destination bookings",
    ],
    note: "Pricing varies based on events, location, and customization.",
  },
  {
    key: "party",
    title: "Party & Occasion Makeup",
    subtitle: "Starting from Rs. 3,000",
    icon: Star,
    options: [
      { label: "Single Look", price: prices["Single Look"] },
      { label: "Party +1", price: prices["Party +1"] },
      { label: "Party +2", price: prices["Party +2"] },
    ],
    features: [
      "Photography-ready finish",
      "Hairstyling optional",
      "Studio & on-location",
      "Multiple looks available",
      "Delhi & destination bookings",
    ],
    note: "Pricing depends on look complexity and timing.",
  },
];

const formatPrice = (price: number) => `Rs. ${price.toLocaleString("en-IN")}`;

const Services = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<SelectionState>({
    bridal: "",
    party: "",
  });

  const selectedEntries = categories
    .map((category) => {
      const activeLabel = selected[category.key];
      const option = category.options.find(({ label }) => label === activeLabel);

      if (!option) {
        return null;
      }

      return {
        categoryKey: category.key,
        categoryTitle: category.title,
        label: option.label,
        price: option.price,
      };
    })
    .filter(Boolean) as Array<{
    categoryKey: CategoryKey;
    categoryTitle: string;
    label: string;
    price: number;
  }>;

  const total = selectedEntries.reduce((sum, item) => sum + item.price, 0);
  const hasSelection = selectedEntries.length > 0;

  const handleSelect = (categoryKey: CategoryKey, label: string) => {
    setSelected((current) => ({
      ...current,
      [categoryKey]: current[categoryKey] === label ? "" : label,
    }));
  };

  const clearAll = () => {
    setSelected({
      bridal: "",
      party: "",
    });
  };

  return (
    <div className="min-h-screen pt-4 pb-14 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-24">
      <div className="container mx-auto px-4 sm:px-6">
        <section className="mx-auto mb-8 max-w-4xl text-center sm:mb-12 lg:mb-14">
          <p className="mb-3 text-[11px] uppercase tracking-[0.34em] text-secondary sm:text-xs sm:tracking-[0.42em]">
            Services & Packages
          </p>
          <h1 className="font-display text-[2.15rem] leading-[1.05] text-primary sm:text-5xl lg:text-6xl">
            Choose your makeup experience
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-foreground/70 sm:text-base lg:text-lg">
            Tap a package below to instantly see your pricing summary update.
            On phone, each card is spaced out for a softer and easier booking
            experience.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {categories.map((category) => {
            const Icon = category.icon;
            const activeLabel = selected[category.key];

            return (
              <section
                key={category.key}
                className="rounded-[2rem] border border-[#d8bbb7] bg-gradient-to-br from-white via-[#fbfaf7] to-[#f6fbfb] p-6 shadow-[0_10px_40px_rgba(173,120,125,0.08)] sm:p-8 lg:min-h-[26rem] lg:p-8"
              >
                <div className="mb-6 flex items-start gap-4 sm:mb-7">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f7efe8] text-primary sm:h-16 sm:w-16">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-display text-[2rem] leading-tight text-primary sm:text-[2.2rem]">
                      {category.title}
                    </h2>
                    <p className="mt-1 text-base font-semibold text-[#df8d8f] sm:text-lg">
                      {category.subtitle}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {category.options.map((option) => {
                    const isSelected = activeLabel === option.label;

                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => handleSelect(category.key, option.label)}
                        className={`inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-center text-[14px] transition-all duration-300 sm:min-h-[56px] sm:px-5 sm:text-[15px] lg:px-4 xl:px-5 ${
                          isSelected
                            ? "border-primary bg-primary text-white shadow-[0_12px_25px_rgba(156,100,118,0.22)]"
                            : "border-[#ecd8d2] bg-white/90 text-primary hover:border-primary/40"
                        }`}
                      >
                        <span className="whitespace-nowrap font-medium">{option.label}</span>
                        <span className="flex items-center gap-1.5 whitespace-nowrap text-[14px] sm:text-[15px]">
                          {isSelected && <Check className="h-4 w-4" />}
                          <span>{formatPrice(option.price)}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 min-h-[1.5rem] sm:mt-4">
                  {activeLabel ? (
                    <p className="text-sm text-foreground/60 sm:text-[15px]">
                      Selected - tap again to remove.
                    </p>
                  ) : (
                    <p className="text-sm text-foreground/55 sm:text-[15px]">
                      Choose one package to update your summary below.
                    </p>
                  )}
                </div>

                <ul className="mt-4 space-y-2 text-[15px] leading-[1.55] text-foreground/68 sm:mt-5 sm:text-[1.05rem]">
                  {category.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#d9b0aa]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-5 text-sm italic leading-relaxed text-muted-foreground sm:mt-6 sm:text-[15px]">
                  {category.note}
                </p>
              </section>
            );
          })}
        </div>

        <section className="mx-auto mt-8 max-w-4xl rounded-[2rem] border border-[#ece3dc] bg-white/95 p-6 shadow-[0_12px_36px_rgba(147,109,116,0.08)] sm:mt-10 sm:p-8 lg:mt-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="font-display text-3xl text-primary sm:text-4xl">
              Selected Packages
            </h3>

            {hasSelection && (
              <button
                type="button"
                onClick={clearAll}
                className="text-sm font-medium text-foreground/55 transition hover:text-primary"
              >
                Clear all
              </button>
            )}
          </div>

          {hasSelection ? (
            <>
              <div className="space-y-4">
                {selectedEntries.map((entry, index) => (
                  <div key={`${entry.categoryKey}-${entry.label}`}>
                    <div className="flex items-start justify-between gap-4 text-sm sm:text-base">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground/85">
                          {entry.categoryTitle} - {entry.label}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold text-primary">
                        {formatPrice(entry.price)}
                      </p>
                    </div>

                    {index < selectedEntries.length - 1 && (
                      <div className="mt-4 h-px w-full bg-border/70" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-6">
                <span className="font-display text-2xl text-primary sm:text-3xl">
                  Total
                </span>
                <span className="font-display text-2xl text-primary sm:text-4xl">
                  {formatPrice(total)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate("/checkout", { state: selected })}
                className="mt-7 w-full rounded-full bg-primary px-6 py-4 text-base font-semibold text-white shadow-elegant transition-all duration-300 hover:opacity-95 sm:py-5 sm:text-lg"
              >
                Proceed to Checkout
              </button>
            </>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#e8d9d3] bg-[#fcf9f7] px-5 py-10 text-center sm:px-8 sm:py-12">
              <p className="mx-auto max-w-lg text-[15px] leading-relaxed text-foreground/60 sm:text-base">
                No package selected yet. Choose a bridal or party package above
                and your summary will appear here.
              </p>
            </div>
          )}
        </section>

        <div className="relative mx-auto mt-10 max-w-5xl sm:mt-12 lg:mt-14">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-[#f8f1ec] via-white to-[#eef6f5] blur-2xl" />

          <section className="relative rounded-[2rem] border border-[#e7e2db] bg-gradient-to-br from-white via-[#fcfbf9] to-[#f2f9f8] px-6 py-8 text-center shadow-[0_14px_38px_rgba(152,117,124,0.06)] sm:px-10 sm:py-10 lg:px-12 lg:py-12">
            <p className="mb-3 text-[11px] uppercase tracking-[0.34em] text-secondary sm:text-xs sm:tracking-[0.42em]">
              Destination Specialist
            </p>

            <h3 className="font-display text-4xl leading-tight text-primary sm:text-5xl">
              Available Worldwide
            </h3>

            <p className="mx-auto mt-4 max-w-3xl text-[15px] leading-relaxed text-foreground/70 sm:text-base lg:text-lg">
              Based in <strong>Delhi NCR</strong> and traveling across India and
              internationally for weddings and luxury events. Travel and
              accommodation may apply.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-7">
              {["Delhi NCR", "Destination Weddings", "International Bookings"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#e8ddd7] bg-white px-4 py-2.5 text-xs text-foreground/75 shadow-sm sm:px-5 sm:text-sm"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Services;
