CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    description TEXT NOT NULL,
    brand VARCHAR(100) NULL,
    img TEXT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO products
(name, price, stock, description, brand, img, active)
VALUES
('Keyboard', 450.00, 10, 'USB keyboard', 'TechBrand', NULL, TRUE),
('Mouse', 250.00, 20, 'Wireless mouse', 'TechBrand', NULL, TRUE);
