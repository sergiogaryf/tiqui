export default function PoliticaCompraPage() {
  return (
    <div className="pt-20 max-w-3xl mx-auto px-4 py-12 prose prose-invert">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-texto">
        Politica de compra
      </h1>
      <p className="text-texto-dim">Ultima actualizacion: Marzo 2026</p>
      <div className="space-y-4 text-texto-dim">
        <h2 className="text-texto font-semibold text-xl">Compra de entradas</h2>
        <p>Al completar una compra, recibiras tus entradas por email con un codigo QR unico. Presenta este codigo en la entrada del evento.</p>
        <h2 className="text-texto font-semibold text-xl">Reembolsos</h2>
        <p>Los reembolsos dependen de la politica del organizador. Eventos cancelados por el organizador tendran reembolso completo.</p>
        <h2 className="text-texto font-semibold text-xl">Entradas gratuitas y cortesias</h2>
        <p>Las entradas gratuitas no requieren pago pero si registro de datos del asistente.</p>
      </div>
    </div>
  );
}
