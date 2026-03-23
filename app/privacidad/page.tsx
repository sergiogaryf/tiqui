export default function PrivacidadPage() {
  return (
    <div className="pt-20 max-w-3xl mx-auto px-4 py-12 prose prose-invert">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-texto">
        Politica de privacidad
      </h1>
      <p className="text-texto-dim">Ultima actualizacion: Marzo 2026</p>
      <div className="space-y-4 text-texto-dim">
        <p>Tiqui recopila y procesa datos personales para el funcionamiento de la plataforma de entradas.</p>
        <h2 className="text-texto font-semibold text-xl">Datos recopilados</h2>
        <p>Nombre, email, telefono (al comprar o registrarse). Datos de pago son procesados por Mercado Pago.</p>
        <h2 className="text-texto font-semibold text-xl">Uso de datos</h2>
        <p>Tus datos se usan para: generar entradas, enviar confirmaciones por email, y permitir el check-in en eventos.</p>
        <h2 className="text-texto font-semibold text-xl">Contacto</h2>
        <p>Para consultas sobre tus datos: contacto@tiqui.cl</p>
      </div>
    </div>
  );
}
