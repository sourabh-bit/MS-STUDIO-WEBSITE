import { Link, useLocation } from "react-router-dom";
import { Menu, X, Calendar, Instagram, Mail, Phone, GraduationCap } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const leftMenu = [
    { name: "HOMEPAGE", path: "/" },
    { name: "MEET MEERA", path: "/about" },
    { name: "MAKEUP SERVICES", path: "/services" },
  ];

  const rightMenu = [
    { name: "PORTFOLIO", path: "/portfolio" },
    { name: "THE JOURNAL", path: "/testimonials" },
    { name: "CONTACT", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const underlineClass = `
    relative inline-block pb-1
    before:absolute before:left-1/2 before:-bottom-[2px]
    before:w-0 before:h-[1px] before:bg-[#B89A94] before:opacity-80
    before:-translate-x-1/2
    before:transition-all before:duration-300
    hover:before:w-[50%]
  `;

  return (
    <nav
      className="
        fixed top-0 left-0 right-0 z-[999]
        backdrop-blur-md bg-white/15 
        border-b border-white/20
        shadow-[inset_0_0_0.5px_rgba(255,255,255,0.4)]
      "
    >

      {/* ---------------- DESKTOP NAVBAR ---------------- */}
      <div className="hidden lg:flex relative w-full items-center justify-between px-10">

        {/* LEFT — MAKEUP SCHOOL */}
        <div className="flex flex-col items-center justify-center w-[220px] pt-6 pb-4">
          <GraduationCap className="w-6 h-6 mb-1 text-[#b59565]" />
          <Link to="/classes" className="block text-[13px] tracking-[0.25em] uppercase text-[#735b50] hover:text-[#7A5E5F] transition">
            <span className={underlineClass}>Makeup School</span>
          </Link>
        </div>

        {/* CENTER — MENUS + LOGO */}
        <div className="flex flex-col items-center justify-center w-full pt-6 pb-4">
          <div className="flex items-start justify-center gap-20">

            {/* LEFT MENU */}
            <div className="text-center space-y-2 tracking-[0.26em] text-[13px] uppercase text-[#4F3F40]">
              {leftMenu.map((link) => (
                <Link key={link.path} to={link.path} className="block hover:text-[#7A5E5F] transition">
                  <span className={`${underlineClass} ${isActive(link.path) ? "text-[#7A5E5F]" : "text-[#4F3F40]"}`}>
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>

            {/* LEFT LINE */}
            <div className="h-24 w-[1px] bg-[#796866] bg-opacity-20"></div>

            {/* LOGO */}
            <Link to="/" className="flex flex-col items-center -mt-1">
              <span
                className="
                  font-script text-6xl mb-1
                  bg-gradient-to-b from-[#8A6A67] to-[#5A3F3F]
                  text-transparent bg-clip-text
                "
              >
                Meera
              </span>
              <span
                className="
                  font-display text-2xl tracking-[0.4em]
                  bg-gradient-to-b from-[#9A7A76] to-[#604848]
                  text-transparent bg-clip-text
                "
              >
                SAKHRANI
              </span>
            </Link>

            {/* RIGHT LINE */}
            <div className="h-24 w-[1px] bg-[#796866] bg-opacity-20"></div>

            {/* RIGHT MENU */}
            <div className="text-center space-y-2 tracking-[0.26em] text-[13px] uppercase text-[#4F3F40]">
              {rightMenu.map((link) => (
                <Link key={link.path} to={link.path} className="block hover:text-[#7A5E5F] transition">
                  <span className={`${underlineClass} ${isActive(link.path) ? "text-[#7A5E5F]" : "text-[#4F3F40]"}`}>
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>

          </div>
        </div>

        {/* RIGHT — BOOK APPOINTMENT */}
        <div className="flex flex-col items-center justify-center w-[220px] pt-6 pb-4 pr-10">
          <Calendar className="w-6 h-6 mb-1 text-[#b59565]" />
          <Link to="/contact" className="block hover:text-[#735b50] transition text-center">
            <span className={underlineClass}>Book Appointment</span>
          </Link>
        </div>

        {/* SOCIAL ICONS */}
        <div className="flex flex-col gap-3 absolute right-5 top-1/2 -translate-y-1/2">
          <a className="text-[#4F3F40]/80 hover:text-[#7A5E5F] transition" href="https://instagram.com/meerasakhrani">
            <Instagram className="w-4 h-4" />
          </a>
          <a className="text-[#4F3F40]/80 hover:text-[#7A5E5F] transition" href="mailto:meerasakhranibeauty@gmail.com">
            <Mail className="w-4 h-4" />
          </a>
          <a className="text-[#4F3F40]/80 hover:text-[#7A5E5F] transition" href="tel:+918448229694">
            <Phone className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* ---------------- MOBILE NAVBAR ---------------- */}
      <div className="flex lg:hidden w-full items-center justify-between px-6 h-20">

        {/* MOBILE LOGO */}
        <Link to="/" className="flex flex-col items-center">
          <span className="font-script text-4xl bg-gradient-to-b from-[#8A6A67] to-[#5A3F3F] text-transparent bg-clip-text">
            Meera
          </span>
        </Link>

        {/* HAMBURGER BUTTON */}
        <button className="text-[#4F3F40]" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {isOpen && (
        <div className="lg:hidden bg-white/20 backdrop-blur-xl border-t border-white/20 shadow-lg py-6 px-8">

          <div className="flex flex-col gap-6 text-[#4F3F40] text-[14px] uppercase tracking-[0.22em]">
            {[...leftMenu, ...rightMenu].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
              >
                <span className={`${underlineClass} block`}>
                  {link.name}
                </span>
              </Link>
            ))}
          </div>

          <div className="my-6 h-[1px] w-full bg-white/30"></div>

          {/* CTA */}
          <div className="flex flex-col gap-6 text-[#4F3F40]">
            <Link to="/classes" onClick={() => setIsOpen(false)}>
              <span className={underlineClass}>Makeup School</span>
            </Link>

            <Link to="/contact" onClick={() => setIsOpen(false)}>
              <span className={underlineClass}>Book Appointment</span>
            </Link>
          </div>

          <div className="flex justify-center gap-6 mt-8 text-[#4F3F40]">
            <Instagram className="w-6 h-6" />
            <Mail className="w-6 h-6" />
            <Phone className="w-6 h-6" />
          </div>
        </div>
      )}

    </nav>
  );
};

export default Navbar;
