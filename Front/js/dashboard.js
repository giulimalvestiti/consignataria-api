document.addEventListener("DOMContentLoaded", async function () {
  try {
    // === 1) KPIs principales ===
    const kpiRes = await fetch("https://consignataria-api.onrender.com/api/dashboard/kpis");
    const kpis = await kpiRes.json();

    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const now = new Date();
    const mesActual = meses[now.getMonth()];
    const anioActual = now.getFullYear();

    // Títulos dinámicos
    const $tMensual = document.getElementById("tituloMensual");
    const $tAnual = document.getElementById("tituloAnual");
    if ($tMensual) $tMensual.textContent = `Ganancia acumulada en ${mesActual}`;
    if ($tAnual) $tAnual.textContent = `Ganancia acumulada en el año ${anioActual}`;

    const $tMensualCargas = document.getElementById("tituloMensualCargas");
    const $tAnualCargas = document.getElementById("tituloAnualCargas");
    if ($tMensualCargas) $tMensualCargas.textContent = `Cargas realizadas en ${mesActual}`;
    if ($tAnualCargas) $tAnualCargas.textContent = `Cargas realizadas en el año ${anioActual}`;

    // Valores KPIs
    const $ganMen = document.getElementById("gananciaMensual");
    const $ganAn = document.getElementById("gananciaAnual");
    const $aniVen = document.getElementById("animalesVendidos");
    const $pagPen = document.getElementById("pagosPendientes");

    if ($ganMen) $ganMen.textContent = `$ ${(+kpis.gananciaMensual || 0).toLocaleString("es-AR")}`;
    if ($ganAn) $ganAn.textContent = `$ ${(+kpis.gananciaAnual || 0).toLocaleString("es-AR")}`;
    if ($aniVen) $aniVen.textContent = kpis.totalCargasMensual ?? 0;
    if ($pagPen) $pagPen.textContent = kpis.totalCargasAnual ?? 0;

    // === 2) Gráfico: Ganancias Mensuales ===
    const gananciasRes = await fetch("https://consignataria-api.onrender.com/api/dashboard/ganancias-mensuales");
    const ganancias = await gananciasRes.json();
    const $cvGan = document.getElementById("graficoGanancias");

    if ($cvGan) {
      $cvGan.style.cursor = "pointer";
      new Chart($cvGan, {
        type: "line",
        data: {
          labels: ganancias.meses,
          datasets: [{
            label: "Ganancia ($)",
            data: ganancias.valores,
            borderColor: "#0066FF",
            backgroundColor: "rgba(0, 102, 255, 0.2)",
            fill: true,
            tension: 0.3,
            pointRadius: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { ticks: { callback: v => (+v || 0).toLocaleString("es-AR") } }
          },
          plugins: {
            legend: {
              position: "top",
              onClick: (e) => {
                e?.native?.stopImmediatePropagation?.();
                e?.native?.preventDefault?.();
              }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: $ ${(+ctx.parsed.y || 0).toLocaleString("es-AR")}`
              }
            }
          }
        }
      });
    }

    // === 3) Gráfico: Cargas Mensuales ===
    const cargasRes = await fetch("https://consignataria-api.onrender.com/api/dashboard/cargas-mensuales");
    const cargas = await cargasRes.json();
    const $cvCar = document.getElementById("graficoCargasMensuales");

    if ($cvCar) {
      $cvCar.style.cursor = "pointer";
      new Chart($cvCar, {
        type: "line",
        data: {
          labels: cargas.meses,
          datasets: [{
            label: "Cargas Mensuales",
            data: cargas.valores,
            borderColor: "#198754",
            backgroundColor: "rgba(25, 135, 84, 0.2)",
            fill: true,
            tension: 0.3,
            pointRadius: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              onClick: (e) => {
                e?.native?.stopImmediatePropagation?.();
                e?.native?.preventDefault?.();
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                callback: v => Number.isInteger(v) ? v : null
              }
            }
          }
        }
      });
    }

    // === 4) Gráfico: Tipos de Carga ===
    const tiposRes = await fetch("https://consignataria-api.onrender.com/api/dashboard/distribucion-tipos");
    const tipos = await tiposRes.json();
    const ctxTipos = document.getElementById("graficoTipos");
    const datosTipos = [tipos.gordos ?? 0, tipos.invernada ?? 0];

    const centerText = {
      id: 'centerText',
      afterDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta?.data?.length) return;
        const { x, y } = meta.data[0];
        const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#333';
        ctx.font = '600 16px system-ui';
        ctx.fillText('Total', x, y - 12);
        ctx.font = '700 20px system-ui';
        ctx.fillText(`${total}`, x, y + 10);
        ctx.restore();
      }
    };

    if (ctxTipos) {
      new Chart(ctxTipos, {
        type: "doughnut",
        data: {
          labels: ["Faena", "Invernada"],
          datasets: [{
            data: datosTipos,
            backgroundColor: ["#2583c2", "#f73b26"],
            borderColor: "#fff",
            borderWidth: 3,
            hoverOffset: 8
          }]
        },
        plugins: [ChartDataLabels, centerText],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "43%",
          rotation: -90 * (Math.PI / 180),
          plugins: {
            tooltip: { enabled: false },
            legend: {
              position: "top",
              labels: {
                boxWidth: 14,
                generateLabels(chart) {
                  const ds = chart.data.datasets[0];
                  return chart.data.labels.map((label, i) => ({
                    text: `${label} (${ds.data[i]})`,
                    fillStyle: ds.backgroundColor[i],
                    strokeStyle: "#fff",
                    lineWidth: 2,
                    hidden: isNaN(ds.data[i]) || ds.data[i] === 0,
                    index: i
                  }));
                }
              }
            },
            datalabels: {
              formatter: (v, ctx) => {
                const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0) || 1;
                return `${Math.round((v / total) * 100)}%`;
              },
              color: "#fff",
              font: { weight: "bold", size: 18 },
              textStrokeColor: "rgba(0,0,0,0.35)",
              textStrokeWidth: 2
            }
          }
        }
      });
    }

    // === 5) Lista de vencimientos próximos ===
    const vencimientosRes = await fetch("https://consignataria-api.onrender.com/api/dashboard/vencimientos");
    const vencimientos = await vencimientosRes.json();
    const lista = document.getElementById("listaVencimientos");

    if (lista) {
      if (Array.isArray(vencimientos) && vencimientos.length > 0) {
        lista.innerHTML = vencimientos.map(v => {
          const tipoMostrar = (v.tipo_carga || "").toLowerCase() === "gordo"
            ? "Faena"
            : (v.tipo_carga || "").charAt(0).toUpperCase() + (v.tipo_carga || "").slice(1);
          const fecha = v.fecha_vencimiento
            ? new Date(v.fecha_vencimiento).toLocaleDateString("es-ES")
            : "-";
          const monto = v.monto_vencimiento
            ? `$${Number(v.monto_vencimiento).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
            : "-";
          return `
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>${v.nro}° Vencimiento Carga ${tipoMostrar}:</strong> ${v.productor ?? ""} - ${v.contraparte ?? ""}
                <br>
                <small class="text-success"><strong>💰 Monto:</strong> ${monto}</small>
              </div>
              <span class="badge bg-secondary">${fecha}</span>
            </li>`;
        }).join("");
      } else {
        lista.innerHTML = `<li class="list-group-item text-muted">Sin vencimientos próximos</li>`;
      }
    }

    // === Advertencia vencimientos pendientes ===
    const headerRojo = document.querySelector(".card.border-danger .card-header");
    const alertaContainer = document.createElement("span");
    alertaContainer.id = "alertaVencimientos";
    alertaContainer.classList.add("ms-3");

    if (headerRojo) {
      const tituloIzquierda = document.createElement("div");
      while (headerRojo.firstChild) tituloIzquierda.appendChild(headerRojo.firstChild);
      headerRojo.style.display = "flex";
      headerRojo.style.justifyContent = "space-between";
      headerRojo.style.alignItems = "center";
      headerRojo.appendChild(tituloIzquierda);
      headerRojo.appendChild(alertaContainer);
    }

    async function verificarVencimientosPendientes() {
      try {
        const resp = await fetch("https://consignataria-api.onrender.com/api/dashboard/vencimientos-vencidos");
        const data = await resp.json();
        const cantidad = data.vencidos_sin_pagar || 0;

        if (cantidad > 0) {
          const clase = cantidad > 5 ? "text-danger" : "text-warning";
          const palabra = cantidad === 1 ? "Vencimiento" : "Vencimientos";
          alertaContainer.innerHTML = `
            <span class="${clase} fw-bold parpadeo" style="cursor:pointer; font-size:0.9rem;">
              🔔 ${cantidad} ${palabra} Sin Pagar
            </span>`;

          alertaContainer.querySelector("span").addEventListener("click", () => {
            const modal = new bootstrap.Modal(document.getElementById("modalVencimientos"));
            modal.show();
          });
        } else {
          alertaContainer.innerHTML = "";
        }
      } catch (err) {
        console.error("Error verificando vencimientos pendientes:", err);
      }
    }

    verificarVencimientosPendientes();

    const style = document.createElement("style");
style.textContent = `
  @keyframes parpadeo {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.4;
      transform: scale(1.08); /* agranda un poco */
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .parpadeo {
    animation: parpadeo 1s infinite ease-in-out;
    display: inline-block; /* necesario para que funcione el scale */
  }
`;
document.head.appendChild(style);


    // === 6) Gráfico de Rindes ===
    try {
      const topRindesRes = await fetch("https://consignataria-api.onrender.com/api/dashboard/topRindes");
      const topRindes = await topRindesRes.json();

      if (Array.isArray(topRindes) && topRindes.length > 0) {
        const labels = topRindes.map(r => r.productor);
        const data = topRindes.map(r => r.promedio_rinde);
        const ctx = document.getElementById("graficoTopRindes");

        new Chart(ctx, {
          type: "bar",
          data: {
            labels,
            datasets: [{
              label: "Promedio de Rinde (%)",
              data,
              backgroundColor: [
                "rgba(255,0,0,0.85)",
                "rgba(255,20,20,0.8)",
                "rgba(255,30,30,0.7)",
                "rgba(255,40,40,0.6)",
                "rgba(255,90,90,0.5)"
              ],
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: "🏆 Top 5 Productores con Mejor Rinde",
                font: { size: 17, weight: "bold" },
                color: "#1b3039"
              },
              legend: { display: false },
              datalabels: {
                anchor: "end",
                align: "top",
                color: "#000",
                font: { size: 13, weight: "bold" },
                formatter: v => `${v}%`
              },
              tooltip: {
                callbacks: { label: ctx => `${ctx.raw}% de rinde` }
              }
            },
            scales: { y: { min: 55, max: 66 }, x: { grid: { display: false } } }
          },
          plugins: [ChartDataLabels]
        });
      }
    } catch (error) {
      console.error("Error cargando gráfico de rindes:", error);
    }

    // === 7) Comparador de GANANCIAS ===
    const mesesES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                     "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    let chartComparador = null;

    const $modal = document.getElementById("modalComparador");
    const $yearA = document.getElementById("yearA");
    const $yearB = document.getElementById("yearB");
    const $btnActualizar = document.getElementById("btnActualizarComparador");
    const $loader = document.getElementById("loaderComparador");
    const $cvModal = document.getElementById("graficoGananciasModal");

    if ($modal && $cvGan) {
      const modalBootstrap = new bootstrap.Modal($modal);

      // === SOLO AÑOS CON DATOS (Ganancias) ===
      async function poblarAniosSelect() {
        if (!$yearA || !$yearB) return;

        const res = await fetch("https://consignataria-api.onrender.com/api/dashboard/anios", { cache: "no-store" });
        if (!res.ok) throw new Error("No se pudieron obtener los años disponibles");
        const { years } = await res.json(); // ej: [2025, 2024, 2023]

        if (!Array.isArray(years) || years.length === 0) {
          $yearA.innerHTML = "";
          $yearB.innerHTML = "";
          $yearA.disabled = true;
          $yearB.disabled = true;
          return;
        }

        const options = years.map(y => `<option value="${y}">${y}</option>`).join("");
        $yearA.innerHTML = options;
        $yearB.innerHTML = options;

        $yearA.value = String(years[0]);
        if (years[1]) {
          $yearB.value = String(years[1]);
          $yearB.disabled = false;
        } else {
          $yearB.value = String(years[0]);
          $yearB.disabled = true; // solo un año disponible
        }
      }

      async function fetchGananciasPorAnio(year) {
        const res = await fetch(`https://consignataria-api.onrender.com/api/dashboard/ganancias-mensuales?year=${year}`);
        if (!res.ok) throw new Error("No se pudo obtener ganancias para " + year);
        return res.json(); // { meses: [...], valores: [...] }
      }

      function mostrarLoader(on = true) {
        if ($loader) $loader.classList.toggle("d-none", !on);
      }

      function normalizarValores(apiData, labelsCanonicos) {
        const map = new Map();
        (apiData.meses || []).forEach((mes, i) => map.set((mes || "").toLowerCase(), apiData.valores?.[i] ?? 0));
        return labelsCanonicos.map(m => map.get(m.toLowerCase()) ?? 0);
      }

      async function renderComparador() {
        if (!$cvModal || !$yearA || !$yearB) return;

        try {
          mostrarLoader(true);

          const yA = Number($yearA.value);
          const labels = mesesES;

          const aData = await fetchGananciasPorAnio(yA);
          const valoresA = normalizarValores(aData, labels);

          const datasets = [{
            label: `Ganancia ${yA}`,
            data: valoresA,
            borderColor: "#1f78ff",
            backgroundColor: "rgba(31,120,255,0.18)",
            fill: true,
            tension: 0.3,
            pointRadius: 3
          }];

          if (!$yearB.disabled && $yearB.value && $yearB.value !== $yearA.value) {
            const yB = Number($yearB.value);
            const bData = await fetchGananciasPorAnio(yB);
            const valoresB = normalizarValores(bData, labels);

            datasets.push({
              label: `Ganancia ${yB}`,
              data: valoresB,
              borderColor: "#e4572e",
              backgroundColor: "rgba(228,87,46,0.18)",
              fill: true,
              tension: 0.3,
              pointRadius: 3
            });
          }

          if (chartComparador) chartComparador.destroy();

          chartComparador = new Chart($cvModal, {
            type: "line",
            data: { labels, datasets },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              interaction: { mode: "index", intersect: false },
              plugins: {
                legend: { position: "top" },
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      const v = ctx.parsed.y ?? 0;
                      return `${ctx.dataset.label}: $ ${v.toLocaleString("es-AR")}`;
                    }
                  }
                }
              },
              scales: {
                y: { ticks: { callback: (v) => v.toLocaleString("es-AR") } }
              }
            }
          });

        } catch (err) {
          console.error(err);
          alert("No se pudo cargar el comparador. Revisá la consola.");
        } finally {
          mostrarLoader(false);
        }
      }

      // Abre el modal de GANANCIAS al hacer clic sobre el gráfico principal
      document.getElementById("graficoGanancias").addEventListener("click", async () => {
        modalBootstrap.show();
        await poblarAniosSelect();   // <- primero cargo solo años con datos
        await renderComparador();    // <- luego dibujo el gráfico
      });

      // Botón Actualizar (GANANCIAS)
      if ($btnActualizar) $btnActualizar.addEventListener("click", renderComparador);
    }
    
      // Cerrar manualmente el modal de vencimientos
      document.getElementById("btnCerrarModalCompGanancias")?.addEventListener("click", function () {
        const modal = bootstrap.Modal.getInstance(document.getElementById("modalComparador"));
      modal?.hide();
      });
    
    
    // === 8) Comparador de CARGAS ===
    // Refs del modal de Cargas
    const $modalCargas = document.getElementById("modalComparadorCargas");
    const $yearA_c = document.getElementById("yearA_cargas");
    const $yearB_c = document.getElementById("yearB_cargas");
    const $btnActualizar_c = document.getElementById("btnActualizarComparadorCargas");
    const $loader_c = document.getElementById("loaderComparadorCargas");
    const $cvCargasModal = document.getElementById("graficoCargasModal");

    let chartComparadorCargas = null;
    const mesesES_c = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

    function mostrarLoaderCargas(on = true) {
      if ($loader_c) $loader_c.classList.toggle("d-none", !on);
    }

    async function poblarAniosSelectCargas() {
      if (!$yearA_c || !$yearB_c) return;
      const res = await fetch("https://consignataria-api.onrender.com/api/dashboard/anios", { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudieron obtener los años disponibles");
      const { years } = await res.json();

      const options = (years || []).map(y => `<option value="${y}">${y}</option>`).join("");
      $yearA_c.innerHTML = options;
      $yearB_c.innerHTML = options;

      if (years && years.length) {
        $yearA_c.value = String(years[0]);
        if (years[1]) {
          $yearB_c.value = String(years[1]);
          $yearB_c.disabled = false;
        } else {
          $yearB_c.value = String(years[0]);
          $yearB_c.disabled = true;
        }
      } else {
        $yearA_c.innerHTML = "";
        $yearB_c.innerHTML = "";
        $yearA_c.disabled = true;
        $yearB_c.disabled = true;
      }
    }

    async function fetchCargasPorAnio(year) {
      const url = `https://consignataria-api.onrender.com/api/dashboard/cargas-mensuales?year=${encodeURIComponent(year)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo obtener cargas para " + year);
      return res.json(); // { year, meses:[...], valores:[...] }
    }

    function normalizarValoresCargas(apiData, labelsCanonicos) {
      const map = new Map();
      (apiData.meses || []).forEach((mes, i) => map.set((mes || "").toLowerCase(), apiData.valores?.[i] ?? 0));
      return labelsCanonicos.map(m => map.get(m.toLowerCase()) ?? 0);
    }

    async function renderComparadorCargas() {
      if (!$cvCargasModal || !$yearA_c || !$yearB_c) return;

      try {
        mostrarLoaderCargas(true);

        const yA = Number($yearA_c.value);
        const labels = mesesES_c;

        const aData = await fetchCargasPorAnio(yA);
        const valoresA = normalizarValoresCargas(aData, labels);

        const datasets = [{
          label: `Cargas ${yA}`,
          data: valoresA,
          borderColor: "#198754",
          backgroundColor: "rgba(25,135,84,0.18)",
          fill: true,
          tension: 0.3,
          pointRadius: 3
        }];

        if (!$yearB_c.disabled && $yearB_c.value && $yearB_c.value !== $yearA_c.value) {
          const yB = Number($yearB_c.value);
          const bData = await fetchCargasPorAnio(yB);
          const valoresB = normalizarValoresCargas(bData, labels);

          datasets.push({
            label: `Cargas ${yB}`,
            data: valoresB,
            borderColor: "#e4572e",
            backgroundColor: "rgba(228,87,46,0.18)",
            fill: true,
            tension: 0.3,
            pointRadius: 3
          });
        }

        if (chartComparadorCargas) chartComparadorCargas.destroy();

        chartComparadorCargas = new Chart($cvCargasModal, {
          type: "line",
          data: { labels, datasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
           plugins: {
              legend: {
                position: "top" // comportamiento normal: toggle de series
              },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.dataset.label}: ${(+ctx.parsed.y||0).toLocaleString("es-AR")} cargas`
                }
              }
            },

            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                  callback: v => Number.isInteger(v) ? v : null
                }
              }
            }
          }
        });


      } catch (err) {
        console.error(err);
        alert("No se pudo cargar el comparador de cargas. Revisá la consola.");
      } finally {
        mostrarLoaderCargas(false);
      }
    }

    // === Apertura del modal de CARGAS desde el gráfico principal ===
    const $cvCargas = document.getElementById("graficoCargasMensuales"); // solo este
    if ($cvCargas && $modalCargas) { // reutiliza el $modalCargas ya declarado arriba
      const modalCargasBootstrap = new bootstrap.Modal($modalCargas);

      $cvCargas.addEventListener("click", async () => {
        modalCargasBootstrap.show();
        await poblarAniosSelectCargas();
        await renderComparadorCargas();
      });

      if ($btnActualizar_c) {
        $btnActualizar_c.addEventListener("click", renderComparadorCargas);
      }
    }

    // Cerrar manualmente el modal de vencimientos
      document.getElementById("btnCerrarModalCompCargas")?.addEventListener("click", function () {
        const modal = bootstrap.Modal.getInstance(document.getElementById("modalComparadorCargas"));
      modal?.hide();
      });

    

// === 🔁 Refrescar dashboard al cerrar modal de vencimientos ===
const modalVencEl = document.getElementById("modalVencimientos");
if (modalVencEl) {
  modalVencEl.addEventListener("hidden.bs.modal", async function () {
    try {
      console.log("🔁 Actualizando Dashboard tras cerrar el modal de vencimientos...");

      // Refrescar KPIs
      const kpiRes = await fetch("https://consignataria-api.onrender.com/api/dashboard/kpis");
      const kpis = await kpiRes.json();
      document.getElementById("gananciaMensual").textContent = `$ ${(+kpis.gananciaMensual || 0).toLocaleString("es-AR")}`;
      document.getElementById("gananciaAnual").textContent = `$ ${(+kpis.gananciaAnual || 0).toLocaleString("es-AR")}`;
      document.getElementById("animalesVendidos").textContent = kpis.totalCargasMensual ?? 0;
      document.getElementById("pagosPendientes").textContent = kpis.totalCargasAnual ?? 0;

      // Refrescar lista de vencimientos
      const vencRes = await fetch("https://consignataria-api.onrender.com/api/dashboard/vencimientos");
      const vencimientos = await vencRes.json();
      const lista = document.getElementById("listaVencimientos");
      if (lista) {
        if (Array.isArray(vencimientos) && vencimientos.length > 0) {
          lista.innerHTML = vencimientos.map(v => {
            const tipoMostrar = (v.tipo_carga || "").toLowerCase() === "gordo"
              ? "Faena"
              : (v.tipo_carga || "").charAt(0).toUpperCase() + (v.tipo_carga || "").slice(1);
            const fecha = v.fecha_vencimiento
              ? new Date(v.fecha_vencimiento).toLocaleDateString("es-ES")
              : "-";
            const monto = v.monto_vencimiento
              ? `$${Number(v.monto_vencimiento).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
              : "-";
            return `
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>${v.nro}° Vencimiento Carga ${tipoMostrar}:</strong> ${v.productor ?? ""} - ${v.contraparte ?? ""}
                  <br>
                  <small class="text-success"><strong>💰 Monto:</strong> ${monto}</small>
                </div>
                <span class="badge bg-secondary">${fecha}</span>
              </li>`;
          }).join("");
        } else {
          lista.innerHTML = `<li class="list-group-item text-muted">Sin vencimientos próximos</li>`;
        }
      }

      // 🔔 Refrescar alerta roja
      if (typeof verificarVencimientosPendientes === "function") {
        await verificarVencimientosPendientes();
      }

    } catch (err) {
      console.error("Error actualizando dashboard tras cerrar modal:", err);
    }
  });
  // 🔁 Forzar refresco cuando se usa el botón "Cerrar" manualmente
document.getElementById("btnCerrarModal")?.addEventListener("click", () => {
  const modalEl = document.getElementById("modalVencimientos");
  // Esperamos un poquito a que el modal termine de cerrarse
  setTimeout(() => {
    modalEl.dispatchEvent(new Event("hidden.bs.modal"));
  }, 300);
});

}






  } catch (error) {
    console.error("Error cargando dashboard:", error);
  }
});





