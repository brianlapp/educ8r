export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 mt-auto bg-white border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4">
          <img
            src="https://freeparentsearch.com/images/logo.png"
            alt="Free Parent Search Logo"
            className="h-8 w-auto object-contain"
            loading="lazy"
          />
          <p className="text-sm text-gray-600 text-center">
            © {currentYear} Free Parent Search. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}