import { ChatIcon, CrownIcon, PlaneIcon, WalletIcon } from "@/components/layout/icons";

export const NAV_ITEMS = [
  { href: "/", label: "Chat", icon: ChatIcon },
  { href: "/platnosci", label: "Płatności", icon: WalletIcon },
  { href: "/wyjazd", label: "Wyjazd", icon: PlaneIcon },
  { href: "/sluzba", label: "Moja służba", icon: CrownIcon },
] as const;
