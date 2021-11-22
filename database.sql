# Cria o banco de dados hardshop_api
CREATE DATABASE hardshop_api;

# Se conecta ao banco hardshop_api
\c hardshop_api

# Cria tabela de produtos
CREATE TABLE products (
  id INT GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL CHECK(LENGTH(name) < 255),
  value DECIMAL NOT NULL CHECK (value > 0),
  quantity INT NOT NULL CHECK (quantity >= 0),
  provider TEXT NOT NULL CHECK(LENGTH(provider) < 255),
  receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  PRIMARY KEY (id)
);

# Cria tabela de pedidos
CREATE TABLE orders (
  id INT GENERATED ALWAYS AS IDENTITY,
  client_name TEXT NOT NULL CHECK(LENGTH(client_name) < 255),
  client_email TEXT NOT NULL CHECK(LENGTH(client_email) < 254),
  client_cpf TEXT NOT NULL CHECK(LENGTH(client_cpf) = 11),
  client_phone TEXT NOT NULL CHECK(LENGTH(client_phone) < 15),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  PRIMARY KEY (id)
);

# Cria tabela pedido_produto
CREATE TABLE order_items (
  id INT GENERATED ALWAYS AS IDENTITY,
  product_name TEXT NOT NULL CHECK (LENGTH(product_name) < 255),
  product_value DECIMAL NOT NULL CHECK (product_value > 0),
  product_quantity INT NOT NULL CHECK (product_quantity > 0),
  order_id INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

DROP DATABASE hardshop_api;
