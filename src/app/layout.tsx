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
  title: "San Patricios",
  description:
    "San Patricios is a community organization of Irish, Mexican, and Indigenous people and allies, united in the tradition of the Batallón de San Patricio — organizing mutual aid, community defense, and cultural education.",
};

// Keep in sync with src/components/theme-toggle.tsx's STORAGE_KEY.
const THEME_INIT_SCRIPT = `(function(){try{var k="sp-theme";var t=localStorage.getItem(k);if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}if(t==="dark"){document.documentElement.setAttribute("data-theme","dark");}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
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
