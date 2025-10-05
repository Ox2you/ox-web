import { Navbar as HeroUINavbar, NavbarContent, NavbarItem } from "@heroui/navbar";
import { ThemeSwitch } from "@/components/theme-switch";

export const Navbar = () => {
  return (
    <HeroUINavbar
      maxWidth="xl"
      position="sticky"
      className="min-h-[96px] py-3"
    >
      <NavbarContent justify="start">
        <NavbarItem className="flex items-center">
          <img
            src="../public/Logo.png"
            alt="Logo"
            className="h-20 w-auto max-h-[80px] object-contain"
          />
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="flex items-center">
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>
    </HeroUINavbar>
  );
};