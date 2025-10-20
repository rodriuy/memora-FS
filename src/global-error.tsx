'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Asegúrate de importar tus componentes

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Puedes loguear el error a un servicio externo aquí
    console.error("Global Error Boundary Caught:", error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-headline font-bold text-destructive">¡Ups! Algo salió mal</h2>
          <p className="text-muted-foreground">
            Ocurrió un error inesperado. Puedes intentar recargar la página o volver a intentarlo más tarde.
          </p>
          {/* Opcional: Mostrar detalles del error en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-4 text-xs text-left bg-muted p-2 rounded overflow-auto max-h-40">
              {error?.message}
              {error?.stack && `\n\n${error.stack}`}
            </pre>
          )}
          <Button onClick={() => reset()}>
            Intentar de nuevo
          </Button>
        </div>
      </body>
    </html>
  );
}