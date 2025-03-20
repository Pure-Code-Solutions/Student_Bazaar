
-- Create the database
CREATE DATABASE IF NOT EXISTS studentbazaardb;
USE studentbazaardb;

-- Create the user table
CREATE TABLE user (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    cartID INT UNIQUE,
    googleID VARCHAR(255) NOT NULL UNIQUE,    -- Google OAuth ID
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    address TEXT
);

-- OAuth tokens table
CREATE TABLE oauth_token (
    tokenID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    provider VARCHAR(50) NOT NULL DEFAULT 'google',   -- 'google' or other providers
    token_type VARCHAR(50) DEFAULT 'Bearer',
    expires_at TIMESTAMP,                   -- Expiry time for the access token
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES user(userID) ON DELETE CASCADE
);

-- Create the seller profile table
CREATE TABLE seller_profile (
    sellerID INT PRIMARY KEY,
    store_name VARCHAR(100) NOT NULL,
    description TEXT,
    rating DECIMAL(3,2) DEFAULT 0.0,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sellerID) REFERENCES user(userID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create the item table
CREATE TABLE item (
    itemID INT AUTO_INCREMENT PRIMARY KEY,
    sellerID INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (sellerID) REFERENCES seller_profile(sellerID) ON DELETE CASCADE
);

-- Create the tag table
CREATE TABLE tag (
    tagID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Create a junction table to associate items with tags
CREATE TABLE item_tag (
    itemID INT NOT NULL,
    tagID INT NOT NULL,
    PRIMARY KEY (itemID, tagID),
    FOREIGN KEY (itemID) REFERENCES item(itemID) ON DELETE CASCADE,
    FOREIGN KEY (tagID) REFERENCES tag(tagID) ON DELETE CASCADE
);

-- Create the review table
CREATE TABLE review (
    reviewID INT AUTO_INCREMENT PRIMARY KEY,
    itemID INT NOT NULL,
    customerID INT NOT NULL,
    sellerID INT NOT NULL,
    number_rating DECIMAL(3,2) NOT NULL,
    FOREIGN KEY (itemID) REFERENCES item(itemID) ON DELETE CASCADE,
    FOREIGN KEY (customerID) REFERENCES user(userID) ON DELETE CASCADE,
    FOREIGN KEY (sellerID) REFERENCES seller_profile(sellerID) ON DELETE CASCADE
);

-- Create the cart table
CREATE TABLE cart (
    cartID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT UNIQUE NOT NULL,
    FOREIGN KEY (userID) REFERENCES user(userID) ON DELETE CASCADE
);

-- Create the cart_item table for many-to-many relationship
CREATE TABLE cart_item (
    cartID INT NOT NULL,
    itemID INT NOT NULL,
    quantity INT DEFAULT 1,
    PRIMARY KEY (cartID, itemID),
    FOREIGN KEY (cartID) REFERENCES cart(cartID) ON DELETE CASCADE,
    FOREIGN KEY (itemID) REFERENCES item(itemID) ON DELETE CASCADE
);

-- Create the order table
CREATE TABLE `order` (
    orderID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    itemID INT NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES user(userID) ON DELETE CASCADE,
    FOREIGN KEY (itemID) REFERENCES item(itemID) ON DELETE CASCADE
);

-- Create the wishlist table
CREATE TABLE wishlist (
    wishlistID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    itemID INT NOT NULL,
    FOREIGN KEY (userID) REFERENCES user(userID) ON DELETE CASCADE,
    FOREIGN KEY (itemID) REFERENCES item(itemID) ON DELETE CASCADE
);


-- Insert sample users
INSERT INTO user (userID, name, email, password, address)
VALUES
(1, 'Alice Johnson', 'alice.johnson@example.com', 'hashed_password1', '123 Maple St, Dorm A'),
(2, 'Bob Smith', 'bob.smith@example.com', 'hashed_password2', '456 Oak Ave, Dorm B'),
(3, 'Carol White', 'carol.white@example.com', 'hashed_password3', '789 Pine Rd, Dorm C'),
(4, 'David Lee', 'david.lee@example.com', 'hashed_password4', '321 Elm St, Dorm D'),
(5, 'Eva Adams', 'eva.adams@example.com', 'hashed_password5', '654 Birch Ln, Dorm E'),
(6, 'Frank Brown', 'frank.brown@example.com', 'hashed_password6', '987 Cedar Dr, Dorm F'),
(7, 'Grace Wilson', 'grace.wilson@example.com', 'hashed_password7', '234 Spruce Blvd, Dorm G'),
(8, 'Henry Clark', 'henry.clark@example.com', 'hashed_password8', '567 Redwood Ct, Dorm H'),
(9, 'Ivy Taylor', 'ivy.taylor@example.com', 'hashed_password9', '890 Walnut St, Dorm I'),
(10, 'Jack Carter', 'jack.carter@example.com', 'hashed_password10', '111 Poplar Ln, Dorm J');

-- Insert seller profiles referencing existing users
INSERT INTO seller_profile (sellerID, userID, bio, rating)
VALUES
(1, 1, 'Tech enthusiast selling high-end gadgets.', 4.8),
(2, 2, 'Selling gently used college textbooks.', 4.5),
(3, 3, 'Handmade dorm decor and accessories.', 4.2),
(4, 4, 'Affordable kitchenware for students.', 4.0),
(5, 5, 'Gaming consoles and accessories.', 4.7),
(6, 6, 'Stationery and office supplies.', 4.3),
(7, 7, 'Sustainable dorm room essentials.', 4.6),
(8, 8, 'Furniture and home decor.', 4.4),
(9, 9, 'Health and fitness equipment.', 4.1),
(10, 10, 'Eco-friendly reusable products.', 4.9);


-- Insert 20 sample items with sequential itemIDs (1-20)
INSERT INTO item (itemID, sellerID, name, price)
VALUES
-- Electronics
(1, 1, 'MacBook Air M2', 999.99),
(2, 2, 'Samsung Galaxy S23', 799.99),
(3, 3, 'Sony WH-1000XM5 Headphones', 349.99),
(4, 4, 'Logitech MX Master 3S Mouse', 99.99),
(5, 5, 'Apple iPad Air', 599.99),
(6, 6, 'Nintendo Switch OLED', 349.99),
(7, 7, 'Dell XPS 15', 1499.99),
(8, 8, 'Sony PlayStation 5', 499.99),
(9, 9, 'Fitbit Versa 4', 199.99),
(10, 10, 'HP Envy x360', 699.99),

-- College-related items
(11, 3, 'Calculus Textbook', 75.00),
(12, 4, 'Organic Chemistry Lab Kit', 120.00),
(13, 5, 'Backpack', 45.00),
(14, 6, 'Dorm Bedding Set', 60.00),
(15, 7, 'Graphing Calculator', 90.00),
(16, 8, 'College Planner', 20.00),
(17, 9, 'Reusable Water Bottle', 30.00),
(18, 10, 'Desk Lamp with USB Port', 35.00),
(19, 2, 'Study Desk', 120.00),
(20, 4, 'Office Chair', 150.00);

-- Textbooks
INSERT INTO tag (name) VALUES ('Textbooks'), ('Science'), ('Mathematics'), ('Engineering'), ('Arts'), ('Business'), ('Law'), ('Government'), ('Biology'), ('Chemistry');

-- Electronics
INSERT INTO tag (name) VALUES ('Electronics'), ('Laptops'), ('Tablets'), ('Smartphones'), ('Monitors'), ('Printers'), ('Headphones');

-- Stationery
INSERT INTO tag (name) VALUES ('Stationery'), ('Notebooks'), ('Pens'), ('Highlighters'), ('Planners'), ('Study Supplies'), ('Art Supplies');

-- Campus-Gear
INSERT INTO tag (name) VALUES ('Campus-Gear'), ('Backpacks'), ('University Hoodies'), ('T-Shirts'), ('Water Bottles'), ('Keychains');

-- Tech-Accessories
INSERT INTO tag (name) VALUES ('Tech-Accessories'), ('Headphones'), ('Chargers'), ('Laptop Sleeves'), ('USB Drives'), ('Screen Protectors');

-- Lab-Equipment
INSERT INTO tag (name) VALUES ('Lab-Equipment'), ('Medical Tools'), ('Microscopes'), ('Multimeters'), ('Beakers'), ('Circuit Kits');


-- Assigning Electronics items to tags
INSERT INTO item_tag (itemID, tagID) VALUES
(1, 2),   -- MacBook Air M2 → Laptops
(2, 4),   -- Samsung Galaxy S23 → Smartphones
(3, 7),   -- Sony WH-1000XM5 Headphones → Headphones
(4, 2),   -- Logitech MX Master 3S Mouse → Laptops (assuming Tech-Accessories category overlaps)
(5, 3),   -- Apple iPad Air → Tablets
(6, 8),   -- Nintendo Switch OLED → Monitors (or Gaming-related tag if exists)
(7, 2),   -- Dell XPS 15 → Laptops
(8, 4),   -- Sony PlayStation 5 → Smartphones (assuming Electronics category, could use a gaming tag if exists)
(9, 9),   -- Fitbit Versa 4 → Printers (but this seems odd, consider adding a "Wearables" tag)
(10, 2);  -- HP Envy x360 → Laptops


-- Assigning College-related items to tags
INSERT INTO item_tag (itemID, tagID) VALUES
(11, 2),   -- Calculus Textbook → Science (Textbooks category)
(12, 9),   -- Organic Chemistry Lab Kit → Chemistry (Textbooks category)
(13, 14),  -- Backpack → Backpacks (Campus-Gear category)
(14, 6),   -- Dorm Bedding Set → Study Supplies (Stationery category, or a custom "Dorm" tag if applicable)
(15, 8),   -- Graphing Calculator → Mathematics (Textbooks category)
(16, 5),   -- College Planner → Planners (Stationery category)
(17, 18),  -- Reusable Water Bottle → Water Bottles (Campus-Gear category)
(18, 19),  -- Desk Lamp with USB Port → Chargers (Tech-Accessories category, or create a "Lighting" tag)
(19, 15),  -- Study Desk → University Hoodies (Campus-Gear, but seems misaligned, maybe add "Furniture" tag)
(20, 16);  -- Office Chair → T-Shirts (Campus-Gear, same misalignment issue)

-- College-related items
INSERT INTO item_tag (itemID, tagID) VALUES
(11, 1),   -- Calculus Textbook → Textbooks
(12, 6),   -- Organic Chemistry Lab Kit → Lab-Equipment
(13, 4),   -- Backpack → Campus-Gear
(14, 4),   -- Dorm Bedding Set → Campus-Gear
(15, 3),   -- Graphing Calculator → Stationery
(16, 3),   -- College Planner → Stationery
(17, 4),   -- Reusable Water Bottle → Campus-Gear
(18, 5),   -- Desk Lamp with USB Port → Tech-Accessories
(19, 3),   -- Study Desk → Stationery
(20, 3);   -- Office Chair → Stationery