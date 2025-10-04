import { Navbar as HeroUINavbar, NavbarContent, NavbarItem } from "@heroui/navbar";
import { ThemeSwitch } from "@/components/theme-switch";

export const Navbar = () => {
  return (
    <HeroUINavbar
      maxWidth="xl"
      position="sticky"
      className="min-h-[40px] py-1" // Reduz a altura mínima e o padding vertical
    >
      <NavbarContent justify="end">
        <NavbarItem className="flex items-center">
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>
    </HeroUINavbar>
  );
};