"use client";

import { useEffect, useRef, useState } from "react";

type ComponentType = {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type VariantType = {
  name: string;
  screen: string;
  canvas: {
    width: number;
    height: number;
  };
  components: ComponentType[];
};

export default function Home() {
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const generateWireframe = async () => {
    setLoading(true);

    const response = await fetch("http://127.0.0.1:8000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ brief }),
    });

    const data = await response.json();
    setResult(data);
    setSelectedVariant(0);
    setLoading(false);
  };

  const currentVariant: VariantType | null =
    result?.wireframe?.variants?.[selectedVariant] || null;

  const handleMouseDown = (
    index: number,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!currentVariant) return;

    const component = currentVariant.components[index];

    dragOffset.current = {
      x: e.clientX - component.x,
      y: e.clientY - component.y,
    };

    setDragIndex(index);
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (dragIndex === null || !result || !currentVariant) return;

    const updatedVariants = [...result.wireframe.variants];
    const updatedComponents = [
      ...updatedVariants[selectedVariant].components,
    ];

    updatedComponents[dragIndex] = {
      ...updatedComponents[dragIndex],
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    };

    updatedVariants[selectedVariant].components = updatedComponents;

    setResult({
      ...result,
      wireframe: {
        ...result.wireframe,
        variants: updatedVariants,
      },
    });
  };

  const handleMouseUp = () => {
    setDragIndex(null);
  };

  return (
    <main
      className="min-h-screen text-white overflow-x-hidden"
      style={{
        fontFamily: "Outfit, sans-serif",
        background:
          "radial-gradient(circle at 15% 20%, rgba(124,58,237,0.35), transparent 30%), radial-gradient(circle at 85% 70%, rgba(59,130,246,0.25), transparent 30%), linear-gradient(135deg, #000000 0%, #0f172a 45%, #000000 100%)",
      }}
    >
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 md:w-96 h-72 md:h-96 rounded-full blur-3xl opacity-20 bg-purple-500" />
        <div className="absolute bottom-20 right-10 w-80 md:w-[500px] h-80 md:h-[500px] rounded-full blur-3xl opacity-20 bg-blue-500" />
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        {/* Center Logo */}
        <div className="flex justify-center mb-10 md:mb-14">
          <div className="text-2xl md:text-3xl font-semibold tracking-tight transition-all duration-300 hover:scale-105 cursor-pointer">
            <span className="text-white">FrameMind</span>
            <span className="text-purple-400 ml-1">AI</span>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center px-2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-tight break-words max-w-6xl mx-auto">
            Design at the
            speed of AI
          </h1>

          <p className="text-zinc-300 text-base sm:text-lg md:text-xl mt-5 font-light px-4">
            Transform ideas into beautiful wireframes for web and mobile
          </p>
        </div>

        {/* Prompt Box */}
        <div className="mt-10 md:mt-16 max-w-5xl mx-auto">
          <div className="rounded-[24px] md:rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl p-4 md:p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-purple-500/10">
            <textarea
              className="w-full h-36 md:h-44 rounded-3xl bg-transparent text-white text-base md:text-lg outline-none resize-none placeholder:text-zinc-400 transition-all duration-300 hover:bg-white/[0.03] focus:bg-white/[0.04]"
              placeholder="What interface shall we design today?"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
            />

            <div className="flex items-center gap-4 mt-6 flex-wrap">
              <button
                onClick={generateWireframe}
                className="px-6 md:px-8 py-3 md:py-4 rounded-2xl bg-white text-black font-medium shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-purple-100 active:scale-95"
              >
                {loading ? "Generating..." : "Generate"}
              </button>

              {result?.wireframe?.variants && (
                <div className="flex gap-3 flex-wrap">
                  {result.wireframe.variants.map(
                    (variant: VariantType, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedVariant(index)}
                        className={`px-4 md:px-5 py-2.5 md:py-3 rounded-2xl transition-all duration-300 hover:scale-105 ${
                          selectedVariant === index
                            ? "bg-white text-black shadow-lg"
                            : "bg-white/10 text-white border border-white/10 hover:bg-white/20"
                        }`}
                      >
                        {variant.name}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Canvas */}
        {currentVariant && (
          <div className="mt-10 md:mt-16 flex justify-center pb-20 overflow-x-auto">
            <div className="rounded-[24px] md:rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-4 md:p-6 shadow-2xl max-w-full">
              <div
                className="bg-white rounded-[20px] md:rounded-[28px] relative shadow-2xl mx-auto"
                style={{
                  width: `${Math.min(currentVariant.canvas.width, window?.innerWidth ? window.innerWidth - 64 : currentVariant.canvas.width)}px`,
                  height: `${currentVariant.canvas.height}px`,
                  maxWidth: "100%",
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                {currentVariant.components.map(
                  (component, index) => (
                    <div
                      key={index}
                      onMouseDown={(e) => handleMouseDown(index, e)}
                      className="absolute border border-zinc-300 bg-zinc-100 rounded-2xl flex items-center justify-center text-black text-xs md:text-sm font-medium cursor-move shadow-sm select-none transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
                      style={{
                        left: `${component.x}px`,
                        top: `${component.y}px`,
                        width: `${component.width}px`,
                        height: `${component.height}px`,
                      }}
                    >
                      {component.type}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
