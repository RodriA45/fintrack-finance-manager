// Renderizador de gráfico de barras con Canvas API puro (sin librerías)

interface BarChartData {
  labels: string[];
  income: number[];
  expense: number[];
}

export function renderBarChart(canvasId: string, data: BarChartData): void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const paddingLeft = 50;
  const paddingBottom = 30;
  const paddingTop = 20;
  const paddingRight = 20;

  ctx.clearRect(0, 0, W, H);

  const allValues = [...data.income, ...data.expense];
  const maxVal = Math.max(...allValues, 1);

  const chartW = W - paddingLeft - paddingRight;
  const chartH = H - paddingBottom - paddingTop;
  const groupW = chartW / data.labels.length;
  const barW = (groupW - 12) / 2;

  const isDark = document.documentElement.classList.contains("dark-mode") || document.body.classList.contains("dark-mode");

  // Grilla
  ctx.strokeStyle = isDark ? "rgba(255,255,255,0.06)" : "rgba(15, 23, 42, 0.06)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = paddingTop + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(W - paddingRight, y);
    ctx.stroke();

    // Etiquetas Y
    const val = Math.round(maxVal - (maxVal / 4) * i);
    ctx.fillStyle = isDark ? "rgba(248, 250, 252, 0.45)" : "rgba(15, 23, 42, 0.5)";
    ctx.font = "10px Inter";
    ctx.textAlign = "right";
    ctx.fillText(`$${(val / 1000).toFixed(0)}k`, paddingLeft - 6, y + 4);
  }

  // Barras
  data.labels.forEach((label, i) => {
    const x = paddingLeft + groupW * i + 6;

    // Ingreso
    const incomeH = (data.income[i] / maxVal) * chartH;
    const incomeGrad = ctx.createLinearGradient(0, paddingTop + chartH - incomeH, 0, paddingTop + chartH);
    incomeGrad.addColorStop(0, "rgba(59,143,245,0.9)");
    incomeGrad.addColorStop(1, "rgba(59,143,245,0.2)");
    ctx.fillStyle = incomeGrad;
    ctx.beginPath();
    ctx.roundRect(x, paddingTop + chartH - incomeH, barW, incomeH, [3, 3, 0, 0]);
    ctx.fill();

    // Egreso
    const expenseH = (data.expense[i] / maxVal) * chartH;
    const expenseGrad = ctx.createLinearGradient(0, paddingTop + chartH - expenseH, 0, paddingTop + chartH);
    expenseGrad.addColorStop(0, "rgba(245,101,101,0.9)");
    expenseGrad.addColorStop(1, "rgba(245,101,101,0.2)");
    ctx.fillStyle = expenseGrad;
    ctx.beginPath();
    ctx.roundRect(x + barW + 2, paddingTop + chartH - expenseH, barW, expenseH, [3, 3, 0, 0]);
    ctx.fill();

    // Etiqueta X
    ctx.fillStyle = isDark ? "rgba(248, 250, 252, 0.5)" : "rgba(15, 23, 42, 0.6)";
    ctx.font = "10px Inter";
    ctx.textAlign = "center";
    ctx.fillText(label, x + barW + 1, H - 8);
  });
}

// Gráfico de dona con Canvas API
interface DonutData {
  label: string;
  value: number;
  color: string;
}

export function renderDonutChart(canvasId: string, data: DonutData[]): void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const outerR = Math.min(cx, cy) - 10;
  const innerR = outerR * 0.62;

  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let startAngle = -Math.PI / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  data.forEach((slice) => {
    const angle = (slice.value / total) * 2 * Math.PI;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR, startAngle, startAngle + angle);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();

    startAngle += angle;
  });

  // Agujero central
  const isDark = document.documentElement.classList.contains("dark-mode") || document.body.classList.contains("dark-mode");
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
  ctx.fillStyle = isDark ? "#0d1525" : "#ffffff";
  ctx.fill();

  // Texto central
  ctx.fillStyle = isDark ? "#f8fafc" : "#0f172a";
  ctx.font = "bold 15px Outfit";
  ctx.textAlign = "center";
  const formattedVal = total >= 1000000 
    ? `$${(total / 1000000).toFixed(1)}M` 
    : total >= 1000 
      ? `$${(total / 1000).toFixed(0)}k` 
      : `$${total}`;
  ctx.fillText(formattedVal, cx, cy + 2);
  ctx.fillStyle = isDark ? "rgba(248, 250, 252, 0.4)" : "rgba(15, 23, 42, 0.5)";
  ctx.font = "10px Inter";
  ctx.fillText("TOTAL", cx, cy + 16);
}
