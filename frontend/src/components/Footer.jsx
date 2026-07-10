import React from "react";

const Footer = () => {
  return (
    <footer id="contact" className="bg-textDark text-white pt-16 pb-8 px-6 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-700 pb-12 mb-8">
        <div className="col-span-1">
          <h2 className="text-2xl font-bold mb-4 text-white">🍲 Food In</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Our job is to fill your tummy with delicious food and fast delivery.
          </p>
        </div>

        <div className="col-span-1">
          <h3 className="text-lg font-semibold text-white mb-6">About</h3>
          <ul className="space-y-3 p-0 m-0 list-none text-gray-400 text-sm">
            <li className="cursor-pointer hover:text-primary transition-colors">Features</li>
            <li className="cursor-pointer hover:text-primary transition-colors">News</li>
            <li className="cursor-pointer hover:text-primary transition-colors">Menu</li>
          </ul>
        </div>

        <div className="col-span-1">
          <h3 className="text-lg font-semibold text-white mb-6">Company</h3>
          <ul className="space-y-3 p-0 m-0 list-none text-gray-400 text-sm">
            <li className="cursor-pointer hover:text-primary transition-colors">Partner</li>
            <li className="cursor-pointer hover:text-primary transition-colors">FAQ</li>
            <li className="cursor-pointer hover:text-primary transition-colors">Blog</li>
          </ul>
        </div>

        <div className="col-span-1">
          <h3 className="text-lg font-semibold text-white mb-6">Support</h3>
          <ul className="space-y-3 p-0 m-0 list-none text-gray-400 text-sm">
            <li className="cursor-pointer hover:text-primary transition-colors">Account</li>
            <li className="cursor-pointer hover:text-primary transition-colors">Feedback</li>
            <li className="cursor-pointer hover:text-primary transition-colors">Contact Us</li>
          </ul>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm">
        <p>© 2026 Food Blog React Project — Made with ❤️ and Django + React</p>
      </div>
    </footer>
  );
};

export default Footer;
