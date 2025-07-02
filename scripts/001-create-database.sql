-- Create database
CREATE DATABASE IF NOT EXISTS premium_store;
USE premium_store;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('user', 'reseller', 'admin') DEFAULT 'user',
    phone VARCHAR(20),
    balance DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Premium accounts products table
CREATE TABLE premium_products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category_id INT,
    user_price DECIMAL(10,2) NOT NULL,
    reseller_price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    features JSON,
    tips JSON,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Product images table
CREATE TABLE product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES premium_products(id) ON DELETE CASCADE
);

-- Premium account inventory
CREATE TABLE premium_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    status ENUM('available', 'sold', 'reserved') DEFAULT 'available',
    sold_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES premium_products(id)
);

-- IndoSMM services table
CREATE TABLE indosmm_services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_id INT NOT NULL UNIQUE, -- ID from IndoSMM API
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    rate DECIMAL(10,4) NOT NULL, -- Price per 1000
    min_order INT NOT NULL,
    max_order INT NOT NULL,
    user_rate DECIMAL(10,4) NOT NULL, -- User price per 1000
    reseller_rate DECIMAL(10,4) NOT NULL, -- Reseller price per 1000
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('premium_account', 'indosmm_service') NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status ENUM('pending', 'paid', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    xendit_invoice_id VARCHAR(255),
    xendit_payment_id VARCHAR(255),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items for premium accounts
CREATE TABLE order_premium_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    account_id INT NULL, -- Linked after order is paid
    quantity INT DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    account_email VARCHAR(255) NULL,
    account_password VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES premium_products(id),
    FOREIGN KEY (account_id) REFERENCES premium_accounts(id)
);

-- Order items for IndoSMM services
CREATE TABLE order_indosmm_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    service_id INT NOT NULL,
    target VARCHAR(500) NOT NULL, -- Username or link
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    indosmm_order_id INT NULL, -- Order ID from IndoSMM API
    indosmm_status VARCHAR(50) DEFAULT 'pending',
    start_count INT DEFAULT 0,
    remains INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (service_id) REFERENCES indosmm_services(id)
);

-- Transactions table
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_id INT NULL,
    type ENUM('payment', 'refund', 'commission') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Settings table
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
