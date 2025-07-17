-- Users Table: Stores creators signing up via Google OAuth.
CREATE TABLE "Users" (
    "id" TEXT NOT NULL, -- Using TEXT for IDs from OAuth providers (e.g., Google's sub)
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "image" TEXT, -- URL to profile picture from Google
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- Shops Table: Each user can have one or more shops.
CREATE TABLE "Shops" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "theme" JSONB, -- For storing customization like colors, logo, background
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shops_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Shops_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Products Table: Items available in a shop.
CREATE TABLE "Products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10, 2) NOT NULL,
    "imageUrl" TEXT,
    "shopId" INTEGER NOT NULL,
    "commands" TEXT[], -- Array of strings to store server commands
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Products_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shops"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Orders Table: Records of all purchases.
CREATE TABLE "Orders" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "shopId" INTEGER NOT NULL,
    "buyerPlayerName" TEXT NOT NULL, -- Minecraft nickname of the player
    "status" TEXT NOT NULL, -- e.g., 'completed', 'pending', 'failed'
    "totalAmount" DECIMAL(10, 2) NOT NULL,
    "paymentGateway" TEXT NOT NULL, -- e.g., 'stripe', 'custom'
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Orders_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Orders_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CommandQueue Table: For decoupling command execution from orders.
-- The Minecraft plugin will poll this table.
CREATE TABLE "CommandQueue" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false, -- True when acknowledged by the plugin
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommandQueue_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CommandQueue_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shops"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommandQueue_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Unique API keys for each shop to communicate with the plugin.
CREATE TABLE "ShopApiKeys" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "apiKey" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopApiKeys_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ShopApiKeys_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shops"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for performance
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");
CREATE INDEX "Orders_status_idx" ON "Orders"("status");
CREATE INDEX "CommandQueue_processed_idx" ON "CommandQueue"("processed");
CREATE UNIQUE INDEX "ShopApiKeys_shopId_key" ON "ShopApiKeys"("shopId"); 