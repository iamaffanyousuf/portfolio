const observerOptions = {
  root: null,
  threshold: 0.1,
  rootMargin: "0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, observerOptions);

document.querySelectorAll("section").forEach((section) => {
  observer.observe(section);
});

document.querySelectorAll(".nav-links a").forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    const targetElement = document.querySelector(targetId);

    window.scrollTo({
      top: targetElement.offsetTop - 80,
      behavior: "smooth",
    });
  });
});

// flip card
document.querySelectorAll(".flip-card").forEach((card) => {
  card.addEventListener("click", () => {
    card.querySelector(".flip-inner").classList.toggle("flipped");
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

// binary canvas

const canvas = document.getElementById("binary-canvas");
const ctx = canvas.getContext("2d");

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

const GRID_SIZE = 35; // Grid spacing in pixels
const VECTOR_COUNT = 18; // Number of long circuit streams

let vectors = [];

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initVectors();
});

// Grid cardinal directions (Up, Down, Left, Right)
const DIRECTIONS = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
];

function createVector() {
  const gridX = Math.floor(Math.random() * Math.floor(width / GRID_SIZE));
  const gridY = Math.floor(Math.random() * Math.floor(height / GRID_SIZE));
  const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

  const startPoint = { x: gridX * GRID_SIZE, y: gridY * GRID_SIZE };

  return {
    headX: startPoint.x,
    headY: startPoint.y,
    dir: dir,
    speed: 1.2, // Smooth, continuous vector expansion
    path: [startPoint], // Array of 90-degree corner points
    maxPathLength: 120 + Math.floor(Math.random() * 80), // Keep long vector trails
    stepsInDir: 0,
    minStepsBeforeTurn: 4 + Math.floor(Math.random() * 6), // Ensures long straight runs
    opacity: 0.12 + Math.random() * 0.15,
  };
}

function initVectors() {
  vectors = [];
  for (let i = 0; i < VECTOR_COUNT; i++) {
    vectors.push(createVector());
  }
}

initVectors();

function draw() {
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < vectors.length; i++) {
    const v = vectors[i];

    // 1. Render long continuous circuit vector line
    if (v.path.length > 0) {
      ctx.beginPath();
      ctx.moveTo(v.path[0].x, v.path[0].y);

      for (let j = 1; j < v.path.length; j++) {
        ctx.lineTo(v.path[j].x, v.path[j].y);
      }

      ctx.lineTo(v.headX, v.headY);

      ctx.strokeStyle = `rgba(0, 243, 255, ${v.opacity})`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "square";
      ctx.lineJoin = "miter";
      ctx.stroke();

      // 2. Render PCB Vias at every 90-degree corner junction
      for (let j = 0; j < v.path.length; j++) {
        const corner = v.path[j];

        // Outer copper pad ring
        ctx.beginPath();
        ctx.arc(corner.x, corner.y, 3.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 243, 255, ${v.opacity * 1.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Inner via hole core
        ctx.beginPath();
        ctx.arc(corner.x, corner.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 243, 255, ${v.opacity * 2})`;
        ctx.fill();
      }
    }

    // 3. Render leading glowing circuit signal head
    ctx.beginPath();
    ctx.arc(v.headX, v.headY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180, 250, 255, ${v.opacity * 2.2})`;
    ctx.fill();

    // Advance head along current direction
    v.headX += v.dir.dx * v.speed;
    v.headY += v.dir.dy * v.speed;

    // Check grid intersection points
    const onGridX = Math.abs(v.headX % GRID_SIZE) < v.speed;
    const onGridY = Math.abs(v.headY % GRID_SIZE) < v.speed;

    if (onGridX && onGridY) {
      v.headX = Math.round(v.headX / GRID_SIZE) * GRID_SIZE;
      v.headY = Math.round(v.headY / GRID_SIZE) * GRID_SIZE;

      v.stepsInDir++;

      if (v.stepsInDir >= v.minStepsBeforeTurn && Math.random() < 0.3) {
        v.stepsInDir = 0;

        // Record corner vertex
        v.path.push({ x: v.headX, y: v.headY });

        const possibleDirs = DIRECTIONS.filter(
          (d) => d.dx !== v.dir.dx && d.dy !== v.dir.dy,
        );
        v.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
      }
    }

    if (v.path.length > 12) {
      v.path.shift();
    }

    if (v.headX < 0 || v.headX > width || v.headY < 0 || v.headY > height) {
      vectors[i] = createVector();
    }
  }

  //
  // Render a dark radial shadow mask over the entire canvas frame
  const maskRadius = Math.max(width, height) * 0.7;
  const shadowGradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    maskRadius,
  );

  // Dark center tint for text contrast -> lighter mid region -> dark vignette edges
  shadowGradient.addColorStop(0, "rgba(5, 10, 15, 0.70)");
  shadowGradient.addColorStop(0.5, "rgba(5, 10, 15, 0.40)");
  shadowGradient.addColorStop(1, "rgba(5, 10, 15, 0.92)");

  ctx.fillStyle = shadowGradient;
  ctx.fillRect(0, 0, width, height);

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
