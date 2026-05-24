export function renderLandingPage(navigate: (page: any) => void, setupThemeToggle: (id: string) => void): void {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div class="landing-page">
      <!-- Navbar -->
      <nav class="land-nav">
        <div class="land-container land-nav-inner">
          <div class="land-logo">
            <div class="land-logo-icon">💎</div>
            Fin<span>Track</span>
          </div>
          <div class="land-nav-links">
            <a href="#beneficios">Beneficios</a>
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#testimonios">Testimonios</a>
          </div>
          <div class="land-nav-actions">
            <button id="btn-land-login" class="btn-ghost">Iniciar sesión</button>
            <button id="btn-land-register" class="btn-saas btn-primary">Empezar gratis</button>
            <button class="theme-toggle" id="land-theme-toggle" title="Cambiar tema" style="background: none; border: none; font-size: 20px; cursor: pointer; padding: 4px; margin-left: 4px;">🌙</button>
          </div>
        </div>
      </nav>

      <!-- 1. Hero Section -->
      <header class="land-hero">
        <div class="land-container land-hero-inner">
          <div class="land-hero-content">
            <div class="land-badge">✨ La nueva forma de gestionar tu dinero</div>
            <h1 class="land-title">Controlá tus <span class="gradient-text">finanzas</span> sin complicaciones</h1>
            <p class="land-subtitle">
              FinTrack es la plataforma integral diseñada para darte claridad absoluta sobre tus ingresos y gastos. Inteligente, rápida y segura.
            </p>
            <div class="land-hero-actions">
              <button id="btn-hero-start" class="btn-saas btn-primary btn-large">Empezar gratis</button>
            </div>
            <div class="land-hero-trust">
              <span>🔒 100% Seguro y Privado</span>
              <span>⭐ Tu herramienta financiera personal</span>
            </div>
          </div>
          <div class="land-hero-visual">
            <!-- Glowing auras -->
            <div class="aura aura-primary"></div>
            <div class="aura aura-secondary"></div>

            <!-- CSS Dashboard Mockup -->
            <div class="mockup-window">
              <div class="mockup-header">
                <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
              </div>
              <div class="mockup-body">
                <div class="mockup-sidebar" style="display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px 0;">
                  <div class="m-sidebar-icon active" style="font-size: 18px; opacity: 1; cursor: pointer;">🏠</div>
                  <div class="m-sidebar-icon" style="font-size: 18px; opacity: 0.4; cursor: pointer;">💳</div>
                  <div class="m-sidebar-icon" style="font-size: 18px; opacity: 0.4; cursor: pointer;">📊</div>
                </div>
                <div class="mockup-content">
                  <div class="m-stat-row">
                    <div class="m-stat" id="mockup-stat-balance">
                      <div class="m-stat-title">Balance</div>
                      <div class="m-stat-val" id="mockup-val-balance">$143.600</div>
                    </div>
                    <div class="m-stat" id="mockup-stat-income">
                      <div class="m-stat-title">Ingresos</div>
                      <div class="m-stat-val green" id="mockup-val-income">+$197.000</div>
                    </div>
                  </div>
                  <div class="m-chart-row">
                    <div class="m-chart-bar" id="mockup-chart-bars">
                      <div class="bar-col"><div class="bar-fill" style="height: 60%"></div></div>
                      <div class="bar-col"><div class="bar-fill" style="height: 80%"></div></div>
                      <div class="bar-col"><div class="bar-fill" style="height: 40%"></div></div>
                      <div class="bar-col"><div class="bar-fill" style="height: 70%"></div></div>
                    </div>
                    <div class="m-chart-pie">
                      <div class="pie-circle" id="mockup-pie-chart"></div>
                    </div>
                  </div>
                  
                  <div class="m-interactive-row">
                    <button id="mockup-btn-simulate" class="mockup-simulate-btn">
                      <span>⚡</span> Simular Ingreso (+ $50.000)
                    </button>
                  </div>

                  <div class="m-list" id="mockup-list-feed">
                    <div class="m-list-item">
                      <div class="m-circle green">💵</div>
                      <div style="display: flex; flex-direction: column; gap: 2px; flex: 1; margin-left: 8px; text-align: left;">
                        <span style="font-size: 11px; font-weight: 600; color: var(--text-primary);">Sueldo Mensual</span>
                        <span style="font-size: 9px; color: var(--text-muted);">Transferencia Recibida</span>
                      </div>
                      <div class="m-list-val green">+$150.000</div>
                    </div>
                    <div class="m-list-item">
                      <div class="m-circle red">🍔</div>
                      <div style="display: flex; flex-direction: column; gap: 2px; flex: 1; margin-left: 8px; text-align: left;">
                        <span style="font-size: 11px; font-weight: 600; color: var(--text-primary);">Hamburguesería</span>
                        <span style="font-size: 9px; color: var(--text-muted);">Gasto en comida</span>
                      </div>
                      <div class="m-list-val red">-$6.400</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Floating card 1: Credit card -->
            <div class="floating-card float-card-card">
              <div class="f-card-chip"></div>
              <div class="f-card-number">•••• •••• •••• 5930</div>
              <div class="f-card-flex">
                <div class="f-card-name">Tarjeta FinTrack</div>
                <div class="f-card-logo">💎</div>
              </div>
            </div>

            <!-- Floating card 2: Goal/progress -->
            <div class="floating-card float-card-goal">
              <div class="f-goal-header">
                <span>Meta: Viaje ✈️</span>
                <span class="f-goal-percent">80%</span>
              </div>
              <div class="f-goal-progress">
                <div class="f-goal-bar" style="width: 80%"></div>
              </div>
              <div class="f-goal-saved">Ahorrado: $240.000 / $300.000</div>
            </div>
          </div>
        </div>
      </header>

      <!-- 2. Sección Beneficios -->
      <section id="beneficios" class="land-section" style="padding-top: 20px;">
        <div class="land-container">
          <div class="land-grid-4" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;">
            <div class="feature-card" style="padding: 32px 24px; text-align: center; border-radius: 20px;">
              <div class="f-icon icon-green" style="margin: 0 auto 16px;">🏛️</div>
              <h3 style="font-size: 16px; line-height: 1.4;">Sincronización<br>Automática</h3>
            </div>
            <div class="feature-card" style="padding: 32px 24px; text-align: center; border-radius: 20px;">
              <div class="f-icon icon-blue" style="margin: 0 auto 16px;">🏷️</div>
              <h3 style="font-size: 16px; line-height: 1.4;">Categorización<br>Inteligente</h3>
            </div>
            <div class="feature-card" style="padding: 32px 24px; text-align: center; border-radius: 20px;">
              <div class="f-icon icon-green" style="margin: 0 auto 16px;">🎯</div>
              <h3 style="font-size: 16px; line-height: 1.4;">Metas de<br>Ahorro</h3>
            </div>
            <div class="feature-card" style="padding: 32px 24px; text-align: center; border-radius: 20px;">
              <div class="f-icon icon-slate" style="margin: 0 auto 16px;">📊</div>
              <h3 style="font-size: 16px; line-height: 1.4;">Reportes<br>Detallados</h3>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Funcionalidades (Alternadas) -->
      <section id="funcionalidades" class="land-section">
        <div class="land-container">
          <!-- Feature 1 -->
          <div class="feature-split">
            <div class="split-content">
              <div class="f-badge">Seguimiento en vivo</div>
              <h2>Controlá tus flujos en tiempo real</h2>
              <p>Agregá tus movimientos desde cualquier dispositivo y mirá cómo se actualizan tus balances instantáneamente. Mantené el control absoluto de tus cuentas, billeteras virtuales y efectivo en un solo lugar.</p>
              <ul class="f-list">
                <li>✅ Múltiples cuentas (Banco, Efectivo, Billeteras)</li>
                <li>✅ Historial completo de transacciones</li>
                <li>✅ Interfaz rápida e intuitiva</li>
              </ul>
            </div>
            <div class="split-visual">
              <div class="visual-placeholder v1">
                <!-- Galicia Account Card -->
                <div class="v-card float-1" style="display: flex; align-items: center; gap: 12px; width: 230px; text-align: left;">
                  <span style="font-size: 20px;">🏛️</span>
                  <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 700; font-size: 13px; color: var(--text-primary);">Banco Galicia</span>
                    <span style="color: var(--primary); font-weight: 700; font-size: 14px;">+$128.500</span>
                  </div>
                </div>
                <!-- Mercado Pago Account Card -->
                <div class="v-card float-2" style="display: flex; align-items: center; gap: 12px; width: 200px; text-align: left;">
                  <span style="font-size: 20px;">💳</span>
                  <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 700; font-size: 13px; color: var(--text-primary);">Mercado Pago</span>
                    <span style="color: var(--primary); font-weight: 700; font-size: 14px;">+$35.000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="feature-split reverse mt-xl">
            <div class="split-content">
              <div class="f-badge">Reportes Visuales</div>
              <h2>Decisiones basadas en datos puros</h2>
              <p>Nuestros gráficos dinámicos y resúmenes mensuales te permiten entender tus finanzas de un vistazo. Revisá tus ingresos frente a tus gastos y descubrí en qué categorías se va tu dinero.</p>
              <ul class="f-list">
                <li>✅ Gráficos interactivos de categorías</li>
                <li>✅ Resumen de balance general</li>
                <li>✅ Notificaciones de alertas preventivas</li>
              </ul>
            </div>
            <div class="split-visual">
               <div class="visual-placeholder v2" style="display: flex; align-items: center; justify-content: center;">
                 <!-- High Fidelity Mini Report Card -->
                 <div class="v-card float-report" style="width: 280px; display: flex; flex-direction: column; gap: 12px; background: var(--bg-card); border-radius: 16px; padding: 16px; box-shadow: var(--shadow-md); text-align: left;">
                   <div style="display: flex; justify-content: space-between; align-items: center;">
                     <span style="font-weight: 700; font-size: 12px; font-family: var(--font-display); color: var(--text-primary);">Gastos por Categoría</span>
                     <span style="font-size: 10px; color: var(--text-muted);">Este mes</span>
                   </div>
                   
                   <div style="display: flex; gap: 16px; align-items: center;">
                     <!-- Mini conic gradient donut representation -->
                     <div style="position: relative; width: 70px; height: 70px; border-radius: 50%; background: conic-gradient(var(--expense) 0% 40%, var(--warning) 40% 70%, var(--primary) 70% 100%); display: flex; align-items: center; justify-content: center;">
                       <div style="width: 42px; height: 42px; border-radius: 50%; background: var(--bg-card); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: var(--text-primary);">
                         40%
                       </div>
                     </div>
                     <div style="display: flex; flex-direction: column; gap: 4px; flex: 1;">
                       <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px;">
                         <span style="display: flex; align-items: center; gap: 4px; color: var(--text-secondary);"><span style="width: 6px; height: 6px; border-radius: 50%; background: var(--expense);"></span> Comida</span>
                         <strong style="color: var(--text-primary);">40%</strong>
                       </div>
                       <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px;">
                         <span style="display: flex; align-items: center; gap: 4px; color: var(--text-secondary);"><span style="width: 6px; height: 6px; border-radius: 50%; background: var(--warning);"></span> Servicios</span>
                         <strong style="color: var(--text-primary);">30%</strong>
                       </div>
                       <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px;">
                         <span style="display: flex; align-items: center; gap: 4px; color: var(--text-secondary);"><span style="width: 6px; height: 6px; border-radius: 50%; background: var(--primary);"></span> Otros</span>
                         <strong style="color: var(--text-primary);">30%</strong>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Cómo funciona -->
      <section class="land-section bg-gray">
        <div class="land-container">
          <div class="section-header-center">
            <h2 class="section-title">Poné en orden tu economía en 3 pasos</h2>
          </div>
          <div class="steps-grid">
            <div class="step-card">
              <div class="step-num">01</div>
              <h3>Registrate gratis</h3>
              <p>Creá tu cuenta en menos de un minuto, sin tarjetas de crédito ni fricciones.</p>
            </div>
            <div class="step-card">
              <div class="step-num">02</div>
              <h3>Cargá tus datos</h3>
              <p>Ingresá tus saldos iniciales y comenzá a registrar tus ingresos y gastos diarios.</p>
            </div>
            <div class="step-card">
              <div class="step-num">03</div>
              <h3>Analizá y mejorá</h3>
              <p>Relajate mientras FinTrack hace los cálculos y te muestra exactamente cómo optimizar.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. Showcase Dashboard (Dark Mode) -->
      <section class="land-section section-showcase">
        <div class="land-container">
          <div class="section-header-center showcase-header">
            <h2 class="section-title text-white">Una experiencia premium, por defecto</h2>
            <p class="section-subtitle text-light">Disfrutá de una interfaz diseñada a la perfección, tanto en modo claro como en modo oscuro absoluto.</p>
          </div>
          <div class="showcase-mockup">
            <div class="sm-topbar">
              <div class="sm-logo">💎 FinTrack</div>
              <div class="sm-avatar"></div>
            </div>
            <div class="sm-body">
              <!-- Card 1: Balance -->
              <div class="sm-card sm-c1" style="padding: 16px; display: flex; flex-direction: column; justify-content: space-between; text-align: left; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 600;">Balance General</span>
                  <span style="font-size: 14px;">💵</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%;">
                  <span style="font-size: 18px; font-weight: 800; font-family: var(--font-display); color: #fff;">$143.600</span>
                  <span style="font-size: 9px; color: #34d399; background: rgba(52, 211, 153, 0.12); padding: 2px 6px; border-radius: 4px; font-weight: 600;">+12.4%</span>
                </div>
              </div>

              <!-- Card 2: Ingresos -->
              <div class="sm-card sm-c2" style="padding: 16px; display: flex; flex-direction: column; justify-content: space-between; text-align: left; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 600;">Ingresos</span>
                  <span style="font-size: 14px;">📈</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%;">
                  <span style="font-size: 18px; font-weight: 800; font-family: var(--font-display); color: #34d399;">+$197.000</span>
                  <span style="font-size: 9px; color: #34d399; background: rgba(52, 211, 153, 0.12); padding: 2px 6px; border-radius: 4px; font-weight: 600;">+8.2%</span>
                </div>
              </div>

              <!-- Card 3: Egresos -->
              <div class="sm-card sm-c3" style="padding: 16px; display: flex; flex-direction: column; justify-content: space-between; text-align: left; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 600;">Egresos</span>
                  <span style="font-size: 14px;">📉</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%;">
                  <span style="font-size: 18px; font-weight: 800; font-family: var(--font-display); color: #fb7185;">-$53.400</span>
                  <span style="font-size: 9px; color: #fb7185; background: rgba(251, 113, 133, 0.12); padding: 2px 6px; border-radius: 4px; font-weight: 600;">-3.1%</span>
                </div>
              </div>

              <!-- Card Big: Details & Budgets -->
              <div class="sm-card sm-big" style="padding: 24px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 32px; text-align: left; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; height: 280px;">
                <!-- Left half: Transactions -->
                <div style="display: flex; flex-direction: column; gap: 16px;">
                  <h3 style="font-size: 14px; font-weight: 700; color: #fff; margin: 0; font-family: var(--font-display);">Movimientos Recientes</h3>
                  <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(52, 211, 153, 0.15); color: #34d399; display: flex; align-items: center; justify-content: center; font-size: 12px;">💵</div>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                          <span style="font-size: 11px; font-weight: 600; color: #f8fafc;">Sueldo Freelance</span>
                          <span style="font-size: 9px; color: #94a3b8;">Transferencia Directa</span>
                        </div>
                      </div>
                      <span style="font-size: 11px; font-weight: 700; color: #34d399;">+$120.000</span>
                    </div>
                    
                    <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(251, 113, 133, 0.15); color: #fb7185; display: flex; align-items: center; justify-content: center; font-size: 12px;">🛒</div>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                          <span style="font-size: 11px; font-weight: 600; color: #f8fafc;">Supermercado</span>
                          <span style="font-size: 9px; color: #94a3b8;">Compra Semanal</span>
                        </div>
                      </div>
                      <span style="font-size: 11px; font-weight: 700; color: #fb7185;">-$14.500</span>
                    </div>

                    <div style="display: flex; align-items: center; justify-content: space-between;">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(251, 113, 133, 0.15); color: #fb7185; display: flex; align-items: center; justify-content: center; font-size: 12px;">🚗</div>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                          <span style="font-size: 11px; font-weight: 600; color: #f8fafc;">Combustible</span>
                          <span style="font-size: 9px; color: #94a3b8;">Carga de Nafta</span>
                        </div>
                      </div>
                      <span style="font-size: 11px; font-weight: 700; color: #fb7185;">-$8.200</span>
                    </div>
                  </div>
                </div>
                
                <!-- Right half: Budgets -->
                <div style="display: flex; flex-direction: column; gap: 16px; border-left: 1px solid rgba(255,255,255,0.05); padding-left: 24px;">
                  <h3 style="font-size: 14px; font-weight: 700; color: #fff; margin: 0; font-family: var(--font-display);">Metas de Ahorro</h3>
                  <div style="display: flex; flex-direction: column; gap: 16px;">
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
                        <span style="color: #94a3b8;">Comida & Delivery</span>
                        <strong style="color: #f8fafc;">$12.000 / $20.000</strong>
                      </div>
                      <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden;">
                        <div style="height: 100%; width: 60%; background: linear-gradient(90deg, #10B981, #34d399); border-radius: 3px;"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
                        <span style="color: #94a3b8;">Salidas & Ocio</span>
                        <strong style="color: #fb7185;">$18.500 / $15.000</strong>
                      </div>
                      <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; position: relative;">
                        <div style="height: 100%; width: 100%; background: linear-gradient(90deg, #f43f5e, #fb7185); border-radius: 3px;"></div>
                      </div>
                      <span style="font-size: 9px; color: #fb7185; margin-top: 4px; display: block;">⚠️ Excedido por $3.500</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. Testimonios -->
      <section id="testimonios" class="land-section">
        <div class="land-container">
          <div class="section-header-center">
            <h2 class="section-title">Amado por miles de usuarios</h2>
          </div>
          <div class="land-grid-3">
            <div class="testimonial-card">
              <div class="t-stars">⭐⭐⭐⭐⭐</div>
              <p class="t-quote">"Desde que uso FinTrack, logré ahorrar un 20% más todos los meses. Es increíblemente fácil de usar y la interfaz es hermosa."</p>
              <div class="t-author">
                <div class="t-avatar a1"></div>
                <div class="t-info">
                  <strong>Martina L.</strong>
                  <span>Freelancer</span>
                </div>
              </div>
            </div>
            <div class="testimonial-card">
              <div class="t-stars">⭐⭐⭐⭐⭐</div>
              <p class="t-quote">"Probé decenas de apps financieras, pero ninguna tiene este nivel de detalle visual ni la claridad de los reportes. Mi favorita lejos."</p>
              <div class="t-author">
                <div class="t-avatar a2"></div>
                <div class="t-info">
                  <strong>Tomás B.</strong>
                  <span>Desarrollador de Software</span>
                </div>
              </div>
            </div>
            <div class="testimonial-card">
              <div class="t-stars">⭐⭐⭐⭐⭐</div>
              <p class="t-quote">"Pude finalmente ordenar mis gastos con Mercado Pago y el Banco en un solo lugar. Las alertas automáticas me salvaron varias veces."</p>
              <div class="t-author">
                <div class="t-avatar a3"></div>
                <div class="t-info">
                  <strong>Carolina S.</strong>
                  <span>Emprendedora</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. CTA Final -->
      <section class="land-cta-section">
        <div class="land-container">
          <div class="cta-banner">
            <h2>Empezá a controlar tu dinero hoy</h2>
            <p>Unite a la revolución financiera y tomá el control total de tu economía.</p>
            <button id="btn-footer-start" class="btn-saas btn-white btn-large">Crear cuenta gratis</button>
          </div>
        </div>
      </section>

      <!-- 8. Footer -->
      <footer class="land-footer">
        <div class="land-container">
          <div class="footer-grid">
            <div class="footer-brand">
              <div class="land-logo">💎 FinTrack</div>
              <p>Tu asistente financiero personal. Desarrollado como proyecto práctico de programación.</p>
            </div>
            <div class="footer-links">
              <h4>Secciones</h4>
              <a href="#beneficios">Beneficios</a>
              <a href="#funcionalidades">Funcionalidades</a>
              <a href="#testimonios">Testimonios</a>
            </div>
            <div class="footer-links">
              <h4>Aplicación</h4>
              <a href="#" id="btn-footer-login">Iniciar sesión</a>
              <a href="#" id="btn-footer-register">Registrarse</a>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2026 FinTrack. Proyecto de Programación III.</p>
            <div class="social-links">
              <span>GitHub</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `;

  document.getElementById("btn-land-login")?.addEventListener("click", () => navigate("login"));
  document.getElementById("btn-land-register")?.addEventListener("click", () => navigate("register"));
  document.getElementById("btn-hero-start")?.addEventListener("click", () => navigate("register"));
  document.getElementById("btn-footer-start")?.addEventListener("click", () => navigate("register"));
  document.getElementById("btn-footer-login")?.addEventListener("click", () => navigate("login"));
  document.getElementById("btn-footer-register")?.addEventListener("click", () => navigate("register"));

  setupThemeToggle("land-theme-toggle");

  // Hero mockup simulation logic
  let simulated = false;
  const btnSimulate = document.getElementById("mockup-btn-simulate");
  const valBalance = document.getElementById("mockup-val-balance");
  const valIncome = document.getElementById("mockup-val-income");
  const statBalance = document.getElementById("mockup-stat-balance");
  const statIncome = document.getElementById("mockup-stat-income");
  const chartBars = document.getElementById("mockup-chart-bars");
  const pieChart = document.getElementById("mockup-pie-chart") as HTMLElement | null;
  const listFeed = document.getElementById("mockup-list-feed");

  btnSimulate?.addEventListener("click", () => {
    simulated = !simulated;
    if (simulated) {
      // 1. Animate Text Values
      if (valBalance) {
        animateValue(valBalance, 143600, 193600, 500, "$");
      }
      if (valIncome) {
        animateValue(valIncome, 197000, 247000, 500, "+$");
      }

      // 2. Pulse highlighting
      statBalance?.classList.add("mockup-highlight");
      statIncome?.classList.add("mockup-highlight");
      setTimeout(() => {
        statBalance?.classList.remove("mockup-highlight");
        statIncome?.classList.remove("mockup-highlight");
      }, 800);

      // 3. Grow chart bars
      if (chartBars) {
        const fills = chartBars.querySelectorAll(".bar-fill");
        if (fills[0]) (fills[0] as HTMLElement).style.height = "85%";
        if (fills[1]) (fills[1] as HTMLElement).style.height = "95%";
        if (fills[2]) (fills[2] as HTMLElement).style.height = "70%";
        if (fills[3]) (fills[3] as HTMLElement).style.height = "90%";
      }

      // 4. Rotate pie-chart circle slice
      if (pieChart) {
        pieChart.style.transform = "rotate(135deg)";
      }

      // 5. Append new mock transaction
      if (listFeed) {
        const newItem = document.createElement("div");
        newItem.className = "m-list-item new-item";
        newItem.innerHTML = `
          <div class="m-circle green">💼</div>
          <div style="display: flex; flex-direction: column; gap: 2px; flex: 1; margin-left: 8px; text-align: left;">
            <span style="font-size: 11px; font-weight: 600; color: var(--text-primary);">Honorarios Freelance</span>
            <span style="font-size: 9px; color: var(--text-muted);">Ingreso extra</span>
          </div>
          <div class="m-list-val green">+$50.000</div>
        `;
        listFeed.insertBefore(newItem, listFeed.firstChild);
      }

      // 6. Update simulator button text
      if (btnSimulate) {
        btnSimulate.innerHTML = "<span>🔄</span> Restablecer Simulación";
        btnSimulate.style.borderColor = "var(--expense)";
        btnSimulate.style.color = "var(--expense)";
        btnSimulate.style.background = "var(--expense-light)";
      }
    } else {
      // Restore base values
      if (valBalance) valBalance.textContent = "$143.600";
      if (valIncome) valIncome.textContent = "+$197.000";

      if (chartBars) {
        const fills = chartBars.querySelectorAll(".bar-fill");
        if (fills[0]) (fills[0] as HTMLElement).style.height = "60%";
        if (fills[1]) (fills[1] as HTMLElement).style.height = "80%";
        if (fills[2]) (fills[2] as HTMLElement).style.height = "40%";
        if (fills[3]) (fills[3] as HTMLElement).style.height = "70%";
      }

      if (pieChart) {
        pieChart.style.transform = "rotate(45deg)";
      }

      // Remove simulation-added transaction
      if (listFeed) {
        const addedItem = listFeed.querySelector(".new-item");
        if (addedItem) {
          addedItem.remove();
        }
      }

      // Restore button text
      if (btnSimulate) {
        btnSimulate.innerHTML = "<span>⚡</span> Simular Ingreso (+ $50.000)";
        btnSimulate.style.borderColor = "var(--primary)";
        btnSimulate.style.color = "var(--primary)";
        btnSimulate.style.background = "var(--primary-light)";
      }
    }
  });

  // Helper function to animate numbers counting up
  function animateValue(obj: HTMLElement, start: number, end: number, duration: number, prefix: string) {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentVal = Math.floor(progress * (end - start) + start);
      
      const formattedVal = currentVal.toLocaleString("es-AR");
      obj.innerHTML = prefix + formattedVal;
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }
}
