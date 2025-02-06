
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-4 mt-auto bg-white border-t"> {/* Reduced padding */}
      <div className="container mx-auto px-3"> {/* Reduced padding */}
        <div className="flex flex-col items-center space-y-3"> {/* Reduced spacing */}
          <img
            src="https://freeparentsearch.com/images/logo.png"
            alt="Free Parent Search Logo"
            className="h-6 w-auto object-contain" /* Reduced height */
            loading="lazy"
          />
          <p className="text-xs text-gray-600 text-center"> {/* Reduced text size */}
            © {currentYear} Free Parent Search. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
