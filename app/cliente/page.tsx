import { AppLogo } from "@/components/AppLogo";
import ClientRealtime from "@/app/cliente/ClientRealtime";
import { decideEstimate, sendCustomerMessage } from "@/app/actions/repair-details";
import { requireClientOrder } from "@/lib/customer-auth";
import { formatMoney } from "@/lib/money";
import { repairStatusLabels, statusProgress } from "@/lib/repair-state";
import { ThemeToggle } from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function ClientPage() {
  const order = await requireClientOrder();
  const progress = statusProgress(order.status);

  if (order.status === "DELIVERED") {
    return (
      <main className="client-shell">
        {/* Fondo Interactivo Animado */}
        <div className="interactive-bg">
          <div className="glowing-blob blob-cyan"></div>
          <div className="glowing-blob blob-blue"></div>
          <div className="glowing-blob blob-purple"></div>
          <div className="grid-overlay"></div>
        </div>
        <div className="client-container">
          <header className="client-header">
            <AppLogo />
            <form action="/api/customer/logout" method="post"><button className="btn btn-secondary">Cerrar</button></form>
          </header>
          <section className="client-card delivered-card">
            <span className="eyebrow">CONSTANCIA DE CHECK-OUT</span>
            <div className="page-header client-title-row">
              <div><h2>Estancia finalizada</h2><p>Reservación {order.publicFolio}</p></div>
              <span className="badge success">SALIDA REGISTRADA</span>
            </div>
            <div className="client-summary">
              <div><span>Habitación</span><strong>{order.device.brand} {order.device.model}</strong></div>
              <div><span>Fecha de salida</span><strong>{order.deliveredAt ? order.deliveredAt.toLocaleString("es-MX") : "Registrada"}</strong></div>
              <div><span>Total pagado</span><strong>{formatMoney(order.total)}</strong></div>
              <div><span>Hotel / Sucursal</span><strong>{order.branch.name}</strong></div>
            </div>
            <div className="alert alert-info client-delivery-notice">Por seguridad, el chat y los avances detallados dejaron de estar disponibles después del check-out. Conserva tu folio para futuras referencias.</div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="client-shell">
      {/* Fondo Interactivo Animado */}
      <div className="interactive-bg">
        <div className="glowing-blob blob-cyan"></div>
        <div className="glowing-blob blob-blue"></div>
        <div className="glowing-blob blob-purple"></div>
        <div className="grid-overlay"></div>
      </div>
      <ClientRealtime />
      <div className="client-container">
        <header className="client-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <AppLogo />
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <ThemeToggle />
            <form action="/api/customer/logout" method="post"><button className="btn btn-secondary">Cerrar seguimiento</button></form>
          </div>
        </header>

        <section className="client-card client-hero-card">
          <span className="eyebrow">PORTAL DEL HUÉSPED · SEGUIMIENTO PRIVADO DE ESTANCIA</span>
          <div className="page-header client-title-row">
            <div><h2>{order.device.brand} {order.device.model}</h2><p>Reservación {order.publicFolio}</p></div>
            <span className="badge success">{repairStatusLabels[order.status]}</span>
          </div>
          {/* Stepper Interactivo Innovador */}
          <div className="stepper-container" style={{ margin: "32px 0 24px" }}>
            <div className="stepper-wrapper" style={{ display: "flex", justifyContent: "space-between", position: "relative", alignItems: "center" }}>
              <div style={{ position: "absolute", left: "0", right: "0", height: "4px", background: "rgba(255,255,255,0.08)", zIndex: 1 }} className="stepper-bar-bg" />
              <div style={{ position: "absolute", left: "0", width: `${progress === 100 ? 100 : progress === 0 ? 0 : Math.max(5, progress - 10)}%`, height: "4px", background: "linear-gradient(90deg, #d8b35b, #b8923a)", zIndex: 2, transition: "width 0.4s ease" }} className="stepper-bar-fill" />

              {[
                { label: "Reservado", minProgress: 5, desc: "Confirmando estancia" },
                { label: "Confirmada", minProgress: 20, desc: "Habitación asignada" },
                { label: "Hospedado", minProgress: 45, desc: "Check-In completo" },
                { label: "Check-Out Listo", minProgress: 90, desc: "Listo para salida" }
              ].map((step, idx) => {
                const isCompleted = progress >= step.minProgress;
                const isActive = order.status !== "DELIVERED" && isCompleted && (idx === 3 || progress < [5, 20, 45, 90][idx + 1]);
                
                return (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 3, position: "relative", flex: 1 }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: isCompleted ? "linear-gradient(135deg, #d8b35b 0%, #b8923a 100%)" : "#1e293b",
                      border: isActive ? "3px solid #f2d58f" : "1px solid rgba(255,255,255,0.1)",
                      boxShadow: isActive ? "0 0 15px rgba(216,179,91,0.6)" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isCompleted ? "#111" : "#64748b",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      transition: "all 0.3s ease"
                    }} className="step-circle">
                      {idx + 1}
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: isCompleted ? "bold" : "normal", color: isCompleted ? "#f8fafc" : "#64748b", marginTop: "8px", textAlign: "center" }} className="step-label">
                      {step.label}
                    </span>
                    <small style={{ fontSize: "0.7rem", color: "#64748b", display: "block", marginTop: "2px", textAlign: "center" }} className="step-desc">
                      {step.desc}
                    </small>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="client-summary" style={{ marginTop: "32px" }}>
            <div><span>Avance de estancia</span><strong>{progress}%</strong></div>
            <div><span>Total presupuestado</span><strong>{formatMoney(order.total)}</strong></div>
            <div><span>Anticipo pagado</span><strong>{formatMoney(order.deposit)}</strong></div>
            <div><span>Fecha estimada salida</span><strong>{order.promisedAt ? order.promisedAt.toLocaleDateString("es-MX") : "Por confirmar"}</strong></div>
          </div>
        </section>

        <section className="grid-two client-grid">
          <article className="client-card">
            <h3>Historial de la Estancia</h3>
            <div className="timeline">
              {order.updates.map((update) => (
                <div className="timeline-item" key={update.id}>
                  <strong>{repairStatusLabels[update.newStatus]}</strong>
                  <span>{update.comment}</span>
                  <small>{update.createdAt.toLocaleString("es-MX")}</small>
                </div>
              ))}
            </div>
          </article>
          <article className="client-card">
            <h3>Detalle de Habitación y Servicios</h3>
            <p>{order.diagnosis ?? "No se han registrado notas adicionales para esta habitación."}</p>
            <div className="info-row"><span>Recepcionista / Atendió</span><strong>{order.technician?.name ?? "Por asignar"}</strong></div>
            <div className="info-row"><span>Hotel / Sucursal</span><strong>{order.branch.name}</strong></div>
            <div className="info-row"><span>Notas de Reservación</span><strong>{order.issue}</strong></div>
          </article>
        </section>

        <section className="client-card">
          <h3>Cargos Adicionales / Servicios Extra</h3>
          {order.estimates.length ? order.estimates.map((estimate) => (
            <div className={`estimate-card ${estimate.status === "PENDING" ? "pending" : ""}`} key={estimate.id}>
              <div className="page-header estimate-title-row">
                <div><strong>Folio de Cargo {estimate.version} · {estimate.title}</strong><p>{estimate.reason}</p></div>
                <span className="badge">{estimate.status}</span>
              </div>
              <div className="client-summary">
                <div><span>Amenities/Consumos</span><strong>{formatMoney(estimate.partsAmount)}</strong></div>
                <div><span>Servicio/Mano obra</span><strong>{formatMoney(estimate.laborAmount)}</strong></div>
                <div><span>Impuestos</span><strong>{formatMoney(estimate.taxAmount)}</strong></div>
                <div><span>Total cargo extra</span><strong>{formatMoney(estimate.totalAmount)}</strong></div>
              </div>
              {estimate.status === "PENDING" && (
                <div className="inline-actions estimate-actions">
                  <form action={decideEstimate.bind(null, estimate.id, "ACCEPTED")}><button className="btn btn-primary">ACEPTO EL CARGO ADICIONAL Y SE SUMARÁ A MI CUENTA</button></form>
                  <form action={decideEstimate.bind(null, estimate.id, "REJECTED")}><button className="btn btn-danger">RECHAZAR CARGO EXTRA</button></form>
                </div>
              )}
            </div>
          )) : <div className="empty">No tienes cargos adicionales pendientes por autorizar.</div>}
        </section>

        <section className="client-card">
          <h3>Mensajería / Chat con Recepción</h3>
          <div className="chat">
            {order.messages.map((message) => (
              <div className={`chat-message ${message.senderType === "CUSTOMER" ? "customer" : message.senderType === "SYSTEM" ? "system" : ""}`} key={message.id}>
                {message.body}
                <small>{message.senderType === "CUSTOMER" ? "Tú" : message.senderUser?.name ?? "Sistema"} · {message.createdAt.toLocaleString("es-MX")}</small>
              </div>
            ))}
          </div>
          <form action={sendCustomerMessage} className="form-grid one client-message-form">
            <div className="field"><textarea name="body" maxLength={3000} placeholder="Escribe un mensaje para recepción o servicio a la habitación..." required /></div>
            <button className="btn btn-primary">Enviar mensaje</button>
          </form>
        </section>
      </div>
    </main>
  );
}
