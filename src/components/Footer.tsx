export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-950 border-t border-gray-800/80 text-gray-400 text-sm py-6 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Marca e info del sistema */}
        <div className="flex flex-col items-center sm:items-start gap-1">
          <span className="font-semibold text-gray-200 text-sm tracking-wide">
            Gestión Emifer 3D
          </span>
          <p className="text-xs text-gray-500">
            © {currentYear} matute0. Todos los derechos reservados.
          </p>
        </div>

        {/* Enlaces directos */}
        <div className="flex items-center gap-6">
          {/* Correo */}
          <a
            href="mailto:matifernandezescuder@hotmail.com"
            className="flex items-center gap-2 hover:text-indigo-400 transition-colors text-xs font-medium"
            title="Enviar correo electrónico"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Contacto</span>
          </a>

          {/* Reportar Bug */}
          <a
            href="https://github.com/matute0/Emifer3dCalcFront/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-indigo-400 transition-colors text-xs font-medium"
            title="Reportar un error o problema"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 13a7 7 0 01-14 0m14 0a7 7 0 00-14 0m14 0h2m-16 0H3m14-4l2-2M5 9L3 7m12-2a5 5 0 00-10 0v1a7 7 0 0010 0V5z" />
            </svg>
            <span>Reportar Bug</span>
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/matute0"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-indigo-400 transition-colors text-xs font-medium"
            title="Ver perfil de GitHub"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>

      </div>
    </footer>
  );
}