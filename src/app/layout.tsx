import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/auth-session-provider";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { EnsureMemberLinked } from "@/components/providers/ensure-member-linked";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anonymous Resistance Movement",
  description:
    "The Anonymous Resistance Movement is a global collective of Anarchist Anonymous members organizing mutual aid, direct action support, and independent media.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-void text-bone">
        <AuthSessionProvider>
          <ConvexClientProvider>
            <EnsureMemberLinked />
            {children}
          </ConvexClientProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
