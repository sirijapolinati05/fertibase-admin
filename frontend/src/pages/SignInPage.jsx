
// src/pages/SignInPage.jsx
import { useState, useEffect } from "react";
import { User, Phone, LogIn, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SignInPage() {
  const [empId, setEmpId] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profileImage, setProfileImage] = useState(""); // Dynamic image

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emp_id: empId, password: phone })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Access Denied");
      }

      if (data.success) {
        login(data.user);
        setSuccess(true);
        setTimeout(() => navigate("/admin", { replace: true }), 1800);
      } else {
        setError("Access Denied");
      }
    } catch (err) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  // Canvas Particles
  useEffect(() => {
    const canvas = document.getElementById("particles");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speed: Math.random() * 1 + 0.5,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.6)";
        ctx.fill();
        p.y -= p.speed;
        if (p.y < 0) p.y = canvas.height;
      });
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <canvas id="particles" className="fixed inset-0 -z-20 pointer-events-none" />
      <div className="fixed inset-0 -z-30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900 animate-gradient-slow"></div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="relative w-full max-w-md group">
          <div
            className="bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900 p-1 rounded-3xl shadow-2xl transition-all duration-300 group-hover:shadow-emerald-500/50"
            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
            onMouseMove={(e) => {
              const card = e.currentTarget;
              const { left, top, width, height } = card.getBoundingClientRect();
              const x = e.clientX - left;
              const y = e.clientY - top;
              const rotateY = ((x / width) - 0.5) * 20;
              const rotateX = ((y / height) - 0.5) * -20;
              card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "rotateX(0deg) rotateY(0deg)";
            }}
          >
            <div className="bg-black bg-opacity-60 backdrop-blur-3xl rounded-3xl p-8 border border-emerald-500 border-opacity-30">
              {/* Dynamic Logo: Image or Fallback */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-cyan-600 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-2xl animate-pulse">
                    F
                  </div>
                  <div className="absolute -inset-2 bg-emerald-500 rounded-full blur-2xl opacity-50 animate-ping"></div>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
                FERTIBASE
              </h1>
              <p className="text-center text-emerald-300 text-sm mb-10 tracking-wider">
                SECURE ADMIN ACCESS
              </p>

              {success && (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-3xl flex items-center justify-center z-50 animate-pulse">
                  <div className="text-center">
                    <Zap className="w-20 h-20 text-white mx-auto mb-3 animate-bounce" />
                    <p className="text-2xl font-bold text-white">ACCESS GRANTED</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="relative group">
                  <User className="absolute top-4 left-4 text-emerald-400 size-6 transition-all group-focus-within:scale-110" />
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full pl-14 pr-4 py-4 bg-white bg-opacity-10 border border-emerald-500 border-opacity-50 rounded-2xl text-emerald-100 placeholder-emerald-300 placeholder-opacity-60 focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:ring-opacity-50 transition-all duration-300 backdrop-blur-sm text-lg font-mono tracking-widest"
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="relative group">
                  <Phone className="absolute top-4 left-4 text-emerald-400 size-6 transition-all group-focus-within:scale-110" />
                  <input
                    type="tel"
                    placeholder="Password"
                    className="w-full pl-14 pr-4 py-4 bg-white bg-opacity-10 border border-emerald-500 border-opacity-50 rounded-2xl text-emerald-100 placeholder-emerald-300 placeholder-opacity-60 focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:ring-opacity-50 transition-all duration-300 backdrop-blur-sm text-lg font-mono tracking-widest"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    maxLength={10}
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-500 bg-opacity-30 border border-red-400 text-red-200 p-4 rounded-2xl text-center text-sm font-bold tracking-wider animate-pulse">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || success}
                  className="relative w-full py-5 rounded-2xl font-bold text-white overflow-hidden transition-all duration-500 transform hover:scale-105 shadow-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        AUTHENTICATING
                      </>
                    ) : success ? (
                      "ACCESSING..."
                    ) : (
                      <>
                        <LogIn size={24} />
                        ENTER SYSTEM
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* <p className="mt-8 text-xs text-center text-emerald-300 font-mono">
                DEMO: <span className="text-cyan-400">NAVEENSIR</span> +{" "}
                <span className="text-cyan-400">9493462778</span>
              </p>  */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}