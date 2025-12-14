import type { Metadata } from "next";
import "./globals.css";
import { FluentProviderWrapper } from "@/components/FluentProviderWrapper";

export const metadata: Metadata = {
  title: "Conecta Care - Plataforma de Home Care",
  description: "Plataforma para gestão de empresas de home care: pacientes, escalas, prontuários, financeiro e inventário.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <FluentProviderWrapper>
          {children}
        </FluentProviderWrapper>
      </body>
    </html>
  );
}
