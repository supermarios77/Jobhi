import { routing } from "@/i18n/routing";
import { redirect } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  redirect(`/${routing.defaultLocale}`);
}
