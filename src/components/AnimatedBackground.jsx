import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadAll } from "@tsparticles/all";

const AnimatedBackground = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    let isMounted = true;

    initParticlesEngine(async (engine) => {
      await loadAll(engine);
    }).then(() => {
      if (isMounted) {
        setInit(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Lista de producciones de una GIC (puedes personalizarla)
  const gicProductions = [
    "S -> aSb",
    "S -> ε",
    "A -> aA | b",
    "B -> bB | a",
    "C -> cC | d",
    "D -> ε",
  ];

  return (
    init && (
      <Particles
        id="tsparticles"
        options={{
          background: {
            color: {
              value: "#ffffff",
            },
          },
          fpsLimit: 60,
          particles: {
            color: {
              value: ["#ffc09f", "#ffee93", "#fcf5c7", "#a0ced9", "#adf7b6"],
            },
            move: {
              enable: true,
              speed: 2,
            },
            number: {
              value: 20, // Puedes ajustar el número de producciones en pantalla
            },
            opacity: {
              value: 0.8,
            },
            shape: {
              type: "char",
              options: {
                char: {
                  value: gicProductions, // Usar las producciones de GIC
          
                  style: "",
                  weight: "10",
                  fill: true,
                },
              },
            },
            size: {
              value: { min: 5, max: 10 },
            },
          },
          detectRetina: false,
          interactivity: {
            events: {
              onHover: { enable: false },
              onClick: { enable: false },
            },
          },
        }}
      />
    )
  );
};

export default AnimatedBackground;