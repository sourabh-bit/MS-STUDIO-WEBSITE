import { useState } from "react";
import { Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const navigate = useNavigate();

  const prices:any = {
    Bridal: 30000,
    "Bridal +1": 40000,
    "Bridal +2": 50000,
    "Single Look": 3000,
    "Party +1": 5000,
    "Party +2": 7000,
  };

  const [selected,setSelected]=useState({
    bridal:"",
    party:"",
  });

  const total =
    (prices[selected.bridal]||0)+
    (prices[selected.party]||0);

  const tierClass=(active:boolean)=>
    `px-6 py-3 rounded-2xl border transition ${
      active
      ? "bg-primary text-white border-primary shadow-md"
      : "bg-white border-border hover:border-primary"
    }`;

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-6">

        {/* ===== SERVICES GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Bridal */}
          <div className="p-10 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 shadow-soft">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                <Heart className="text-primary"/>
              </div>
              <div>
                <h2 className="font-display text-3xl text-primary">Bridal Makeup</h2>
                <p className="text-secondary font-semibold">Starting from ₹XX,XXX (Tentative)</p>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              {["Bridal","Bridal +1","Bridal +2"].map(t=>(
                <button
                  key={t}
                  onClick={()=>setSelected(s=>({...s,bridal:t}))}
                  className={tierClass(selected.bridal===t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <ul className="space-y-2 text-sm text-foreground/70">
              <li>Consultation & skin prep</li>
              <li>Hairstyling & draping</li>
              <li>Premium products & lashes</li>
              <li>Touch-up guidance</li>
              <li>Delhi & destination bookings</li>
            </ul>

            <p className="text-xs text-muted-foreground mt-6">
              Pricing varies based on events, location, and customization.
            </p>
          </div>

          {/* Party */}
          <div className="p-10 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 shadow-soft">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                <Star className="text-primary"/>
              </div>
              <div>
                <h2 className="font-display text-3xl text-primary">Party & Occasion Makeup</h2>
                <p className="text-secondary font-semibold">Starting from ₹X,XXX (Tentative)</p>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              {["Single Look","Party +1","Party +2"].map(t=>(
                <button
                  key={t}
                  onClick={()=>setSelected(s=>({...s,party:t}))}
                  className={tierClass(selected.party===t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <ul className="space-y-2 text-sm text-foreground/70">
              <li>Photography-ready finish</li>
              <li>Hairstyling optional</li>
              <li>Studio & on-location</li>
              <li>Multiple looks available</li>
              <li>Delhi & destination bookings</li>
            </ul>

            <p className="text-xs text-muted-foreground mt-6">
              Pricing depends on look complexity and timing.
            </p>
          </div>
        </div>

        {/* ===== DESTINATION SECTION (your UI) ===== */}
        <div className="relative max-w-5xl mx-auto mt-20">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/40 via-transparent to-emerald-100/40 blur-2xl rounded-3xl" />

          <div className="relative p-10 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 shadow-elegant text-center">

            <p className="uppercase tracking-widest text-xs text-secondary mb-3">
              Destination Specialist
            </p>

            <h3 className="font-display text-3xl md:text-4xl text-primary mb-4">
              Available Worldwide
            </h3>

            <p className="text-foreground/80 max-w-2xl mx-auto leading-relaxed mb-6">
              Based in <strong>Delhi NCR</strong> and traveling across India and internationally for weddings and luxury events. Travel and accommodation may apply.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {["Delhi NCR","Destination Weddings","International Bookings"].map(item=>(
                <span key={item} className="px-4 py-2 rounded-full bg-white border border-border text-sm shadow-sm">
                  {item}
                </span>
              ))}
            </div>

          </div>
        </div>

        {/* ===== SELECTED SUMMARY ===== */}
        {(selected.bridal || selected.party) && (
          <div className="max-w-3xl mx-auto mt-12 p-8 rounded-3xl border bg-white shadow-soft">

            <h3 className="font-display text-2xl text-primary mb-4">
              Selected Packages
            </h3>

            {selected.bridal && (
              <div className="flex justify-between text-sm mb-2">
                <span>Bridal Makeup — {selected.bridal}</span>
                <span>₹{prices[selected.bridal]}</span>
              </div>
            )}

            {selected.party && (
              <div className="flex justify-between text-sm mb-2">
                <span>Party Makeup — {selected.party}</span>
                <span>₹{prices[selected.party]}</span>
              </div>
            )}

            <div className="flex justify-between font-semibold mt-4">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <button
              onClick={()=>navigate("/checkout",{state:selected})}
              className="mt-6 w-full py-4 bg-primary text-white rounded-full shadow-elegant"
            >
              Proceed to Checkout
            </button>

          </div>
        )}

        

        {/* CTA */}
        {/* <div className="text-center mt-20">
          <a
            href="/checkout"
            className="inline-block px-10 py-4 bg-primary text-white rounded-full shadow-elegant"
          >
            Book Your Appointment
          </a>
        </div> */}

      </div>
    </div>
  );
};

export default Services;