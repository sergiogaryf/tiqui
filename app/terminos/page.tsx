export default function TerminosPage() {
  return (
    <div className="pt-20 max-w-3xl mx-auto px-4 py-12 prose prose-invert">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-texto">
        Terminos de uso
      </h1>
      <p className="text-texto-dim">Ultima actualizacion: Marzo 2026</p>
      <div className="space-y-4 text-texto-dim">
        <p>Al usar Tiqui, aceptas estos terminos. Tiqui es una plataforma de venta de entradas para eventos.</p>
        <h2 className="text-texto font-semibold text-xl">Uso de la plataforma</h2>
        <p>Los usuarios pueden comprar entradas para eventos publicados. Los organizadores pueden crear y gestionar eventos tras ser aprobados por el equipo de Tiqui.</p>
        <h2 className="text-texto font-semibold text-xl">Pagos</h2>
        <p>Los pagos se procesan a traves de Mercado Pago. Tiqui no almacena datos de tarjetas.</p>
        <h2 className="text-texto font-semibold text-xl">Cancelaciones</h2>
        <p>Las politicas de cancelacion dependen de cada organizador. Contacta al organizador del evento para solicitar un reembolso.</p>
      </div>
    </div>
  );
}
