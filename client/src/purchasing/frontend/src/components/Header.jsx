import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiUsers, FiPackage, FiShoppingCart, FiFileText, FiPlusCircle, FiBarChart2 } from 'react-icons/fi';
import './Header.css';

const Header = () => {
  return (
    <header className="App-header">
      <nav>
        <h1>HeavySync - Supplier & Purchase Order Management</h1>
        <ul className="nav-menu">
          <li>
            <NavLink to="/" end className="flex items-center gap-2">
              <FiHome className="w-4 h-4" />
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/suppliers" end className="flex items-center gap-2">
              <FiUsers className="w-4 h-4" />
              Suppliers
            </NavLink>
          </li>
          <li>
            <NavLink to="/suppliers/new" className="flex items-center gap-2">
              <FiPlusCircle className="w-4 h-4" />
              Add Supplier
            </NavLink>
          </li>
          <li>
            <NavLink to="/parts" end className="flex items-center gap-2">
              <FiPackage className="w-4 h-4" />
              Parts Inventory
            </NavLink>
          </li>
          <li>
            <NavLink to="/parts/new" className="flex items-center gap-2">
              <FiPlusCircle className="w-4 h-4" />
              Add Part
            </NavLink>
          </li>
          <li>
            <NavLink to="/purchase-orders" end className="flex items-center gap-2">
              <FiShoppingCart className="w-4 h-4" />
              Purchase Orders
            </NavLink>
          </li>
          <li>
            <NavLink to="/purchase-orders/new" className="flex items-center gap-2">
              <FiPlusCircle className="w-4 h-4" />
              Create Order
            </NavLink>
          </li>
          <li>
            <NavLink to="/quotations" className="flex items-center gap-2">
              <FiFileText className="w-4 h-4" />
              Compare Quotations
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports/purchase-orders" className="flex items-center gap-2">
              <FiBarChart2 className="w-4 h-4" />
              PO Report
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
