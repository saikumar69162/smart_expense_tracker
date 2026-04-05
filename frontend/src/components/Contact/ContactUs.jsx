import React from 'react';
import { FiMail, FiPhone, FiMessageSquare } from 'react-icons/fi';

const ContactUs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Contact Us</h1>
        <p className="mt-1 text-gray-500">Reach out if you need support with your account or reports</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="mb-4 inline-flex rounded-lg bg-blue-50 p-3 text-blue-600">
            <FiMail size={22} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Email</h2>
          <p className="mt-2 text-gray-500">support@expenseapp.com</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="mb-4 inline-flex rounded-lg bg-green-50 p-3 text-green-600">
            <FiPhone size={22} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Phone</h2>
          <p className="mt-2 text-gray-500">+44 20 1234 5678</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="mb-4 inline-flex rounded-lg bg-purple-50 p-3 text-purple-600">
            <FiMessageSquare size={22} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Response Time</h2>
          <p className="mt-2 text-gray-500">We usually reply within 1 business day.</p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Need help with something specific?</h2>
        <p className="text-gray-600">
          Contact support for login problems, account updates, export issues, category or budget problems, and general product help.
        </p>
      </div>
    </div>
  );
};

export default ContactUs;
