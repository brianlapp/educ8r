
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-4 mt-auto bg-[#F1F1F1] border-t">
      <div className="container mx-auto px-3">
        <div className="flex flex-col items-center space-y-3">
          <img
            src="https://freeparentsearch.com/images/logo.png"
            alt="Free Parent Search Logo"
            className="h-6 w-auto object-contain"
            loading="lazy"
          />
          <p className="text-xs text-gray-600 text-center">
            © {currentYear} Free Parent Search. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
