import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>HeavySync</h3>
          <p>Supplier & Purchase Order Management System</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/suppliers">Suppliers</a></li>
            <li><a href="/parts">Parts Inventory</a></li>
            <li><a href="/purchase-orders">Purchase Orders</a></li>
            <li><a href="/quotations">Quotations</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: info@heavysync.com</p>
          <p>Phone: +1 (555) 123-4567</p>
        </div>
        
        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a href="/help">Help Center</a></li>
            <li><a href="/documentation">Documentation</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} HeavySync. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
