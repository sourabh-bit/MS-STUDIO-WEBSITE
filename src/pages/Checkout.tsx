import { useLocation } from "react-router-dom";
import { useState } from "react";

const Checkout = () => {

  const location = useLocation();
  const initial:any = location.state || {};

  /* ---------- PACKAGES STATE ---------- */
  const [packages,setPackages] = useState({
    bridal: initial.bridal || "",
    party: initial.party || "",
  });

  /* ---------- PRICES ---------- */
  const prices:any = {
    Bridal: 30000,
    "Bridal +1": 40000,
    "Bridal +2": 50000,
    "Single Look": 3000,
    "Party +1": 5000,
    "Party +2": 7000,
  };

  const total =
    (prices[packages.bridal]||0)+
    (prices[packages.party]||0);

  const bookingAmount = Math.round(total*0.3);

  /* ---------- FORM ---------- */
  const [form,setForm]=useState({
    name:"",
    phone:"",
    eventDate:"",
    eventTime:"",
    location:"",
    looks:"",
    notes:"",
    agree:false
  });

  const handle=(e:any)=>{
    const {name,value,type,checked}=e.target;
    setForm({...form,[name]:type==="checkbox"?checked:value});
  };

  const submit=(e:any)=>{
    e.preventDefault();
    if(!form.agree) return alert("Please accept policy");
    alert("Proceed to payment");
  };

  return (
    <div className="min-h-screen py-24 bg-gradient-to-b from-white via-emerald-50/30 to-white">
      <div className="container mx-auto px-6 max-w-4xl">

        <h1 className="font-display text-5xl text-primary mb-12 text-center">
          Booking Checkout
        </h1>

        {/* ===== PACKAGE SUMMARY ===== */}
        <div className="p-8 mb-8 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 shadow-soft">

          <div className="flex justify-between mb-4">
            <p className="text-xs uppercase tracking-widest text-secondary">
              Selected Packages
            </p>

            <button
              onClick={()=>window.history.back()}
              className="text-sm text-primary underline"
            >
              Change
            </button>
          </div>

          {packages.bridal && (
            <div className="flex justify-between items-center mb-2">
              <span>Bridal Makeup — {packages.bridal}</span>

              <div className="flex gap-3">
                <span>₹{prices[packages.bridal]}</span>
                <button
                  onClick={()=>setPackages(p=>({...p,bridal:""}))}
                  className="text-xs text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {packages.party && (
            <div className="flex justify-between items-center mb-2">
              <span>Party Makeup — {packages.party}</span>

              <div className="flex gap-3">
                <span>₹{prices[packages.party]}</span>
                <button
                  onClick={()=>setPackages(p=>({...p,party:""}))}
                  className="text-xs text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between font-semibold mt-4 text-lg">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          {total>0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Pay ₹{bookingAmount} now to secure your date. Remaining on event day.
            </p>
          )}

        </div>

        {/* ===== FORM ===== */}
        <form onSubmit={submit} className="p-10 rounded-3xl border bg-white shadow-soft space-y-6">

          <input name="name" placeholder="Full Name" required onChange={handle}
            className="w-full p-4 rounded-xl border"/>

          <input name="phone" placeholder="Phone Number" required onChange={handle}
            className="w-full p-4 rounded-xl border"/>

          <input type="date" name="eventDate" required onChange={handle}
            className="w-full p-4 rounded-xl border"/>

          <input type="time" name="eventTime" onChange={handle}
            className="w-full p-4 rounded-xl border"/>

          <input name="location" placeholder="Event Location" onChange={handle}
            className="w-full p-4 rounded-xl border"/>

          <input name="looks" placeholder="Number of looks / events" onChange={handle}
            className="w-full p-4 rounded-xl border"/>

          <textarea name="notes" placeholder="Skin concerns, reference look, timing"
            onChange={handle}
            className="w-full p-4 rounded-xl border h-28"/>

          <label className="flex gap-3 text-sm">
            <input type="checkbox" name="agree" onChange={handle}/>
            I agree to Refund & Cancellation Policy
          </label>

          <button className="w-full py-4 rounded-full bg-primary text-white font-semibold shadow-elegant">
            Pay ₹{bookingAmount || "Booking Amount"}
          </button>

        </form>

      </div>
    </div>
  );
};

export default Checkout;