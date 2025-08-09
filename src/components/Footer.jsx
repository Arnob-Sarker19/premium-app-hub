import React from "react";

export default function Footer() {
  return (
    <footer className="bg-yellow-100 dark:bg-yellow-100 text-black dark:text-red-600 py-32 mt-38">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="text-base">&copy; {new Date().getFullYear()} Premium Apps Hub. All rights reserved by ARNOB SARKER.</p>

        <div className="flex space-x-8 mt-4 md:mt-0">
          <a
            href="https://facebook.com/arnobs21"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600"
            aria-label="Facebook"
          >
            <i className="bx bxl-facebook text-4xl"></i>
          </a>
          
          <a
            href="https://linkedin.com/in/arnob-sarker21"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-500"
            aria-label="LinkedIn"
          >
            <i className="bx bxl-linkedin text-4xl"></i>
          </a>
          <a
            href="https://t.me/arnob_sarker20"
            className="hover:text-indigo-500"
            aria-label="Telegram"
          >
            <i className="bx bxl-telegram text-4xl"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}
