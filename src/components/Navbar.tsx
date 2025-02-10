
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm py-2 border-b border-[#333333]" /* Added border-b */
    >
      <div className="container mx-auto px-3">
        <div className="flex justify-center items-center">
          <a href="/" className="transition-transform duration-300 hover:scale-105">
            <img
              src="https://freeparentsearch.com/images/logo.png"
              alt="Free Parent Search Logo"
              className="h-8 md:h-12 w-auto object-contain"
              loading="eager"
            />
          </a>
        </div>
      </div>
    </nav>
  );
}
