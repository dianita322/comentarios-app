import Link from "next/link";
import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const rawError = params?.error;

  let errorMessage = "Ocurrió un error no especificado.";

  if (rawError) {
    try {
      errorMessage = decodeURIComponent(rawError);
    } catch {
      errorMessage = rawError;
    }
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">{errorMessage}</p>

      <div className="mt-4 text-center text-sm">
        <Link href="/auth/login" className="underline underline-offset-4">
          Volver al inicio de sesión
        </Link>
      </div>
    </>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Ocurrió un problema
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Suspense>
                <ErrorContent searchParams={searchParams} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}