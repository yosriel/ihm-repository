CREATE TABLE products (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(64) NOT NULL UNIQUE,
    brand VARCHAR(80) NOT NULL,
    name VARCHAR(180) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    previous_price DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(2, 1) NOT NULL,
    review_count INT NOT NULL,
    capacity VARCHAR(16) NOT NULL,
    color VARCHAR(24) NOT NULL,
    image VARCHAR(200) NOT NULL,
    seller VARCHAR(100) NOT NULL,
    seller_type VARCHAR(24) NOT NULL,
    delivery VARCHAR(12) NOT NULL,
    stock INT NOT NULL,
    max_quantity INT NOT NULL,
    CONSTRAINT products_price_nonnegative CHECK (price >= 0),
    CONSTRAINT products_previous_price_nonnegative CHECK (previous_price >= 0),
    CONSTRAINT products_rating_range CHECK (rating >= 0 AND rating <= 5),
    CONSTRAINT products_reviews_nonnegative CHECK (review_count >= 0),
    CONSTRAINT products_stock_nonnegative CHECK (stock >= 0),
    CONSTRAINT products_quantity_positive CHECK (max_quantity > 0),
    CONSTRAINT products_seller_type CHECK (seller_type IN ('falabella', 'marketplace')),
    CONSTRAINT products_delivery CHECK (delivery IN ('both', 'home'))
);

CREATE INDEX products_price_idx ON products (price);
CREATE INDEX products_brand_idx ON products (brand);
CREATE INDEX products_rating_idx ON products (rating);
CREATE INDEX products_seller_delivery_idx ON products (seller_type, delivery);

CREATE TABLE product_features (
    product_id VARCHAR(64) NOT NULL,
    feature_order INT NOT NULL,
    feature VARCHAR(180) NOT NULL,
    PRIMARY KEY (product_id, feature_order),
    CONSTRAINT product_features_product_fk FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT product_features_order_nonnegative CHECK (feature_order >= 0)
);

CREATE TABLE checkout_simulations (
    simulation_id VARCHAR(40) PRIMARY KEY,
    idempotency_key CHAR(36) NOT NULL UNIQUE,
    request_hash CHAR(64) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    currency CHAR(3) NOT NULL,
    item_count INT NOT NULL,
    delivery_method VARCHAR(12) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT simulations_subtotal_nonnegative CHECK (subtotal >= 0),
    CONSTRAINT simulations_delivery_nonnegative CHECK (delivery >= 0),
    CONSTRAINT simulations_total_valid CHECK (total = subtotal + delivery),
    CONSTRAINT simulations_items_positive CHECK (item_count > 0),
    CONSTRAINT simulations_delivery_method CHECK (delivery_method IN ('home', 'pickup'))
);

CREATE TABLE simulation_items (
    simulation_id VARCHAR(40) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (simulation_id, product_id),
    CONSTRAINT simulation_items_simulation_fk FOREIGN KEY (simulation_id) REFERENCES checkout_simulations (simulation_id),
    CONSTRAINT simulation_items_product_fk FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT simulation_items_quantity_positive CHECK (quantity > 0),
    CONSTRAINT simulation_items_price_nonnegative CHECK (unit_price >= 0)
);
