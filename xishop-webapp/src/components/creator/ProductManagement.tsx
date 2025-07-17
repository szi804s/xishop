'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// This is a simplified example component.
// In a real application, you would fetch product data, handle form state with a library
// like 'react-hook-form', and perform mutations (create/update) via API calls.

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  commands: string; // Stored as a single string, split by newlines
}

export default function ProductManagement() {
  const [product, setProduct] = useState<Product>({
    name: '',
    description: '',
    price: 0.00,
    commands: 'give {player} minecraft:diamond 16\n' +
              'lp user {player} parent set vip'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to your API endpoint
    // The commands would be split into an array of strings on the backend
    // e.g., product.commands.split('\n').filter(cmd => cmd.trim() !== '')
    console.log('Submitting product:', product);
    // alert('Product submitted! Check the console.');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Product</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            name="name"
            value={product.name}
            onChange={handleInputChange}
            placeholder="e.g., VIP Rank (30 Days)"
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            value={product.price}
            onChange={handleInputChange}
            placeholder="10.00"
            required
            step="0.01"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={product.description}
            onChange={handleInputChange}
            placeholder="A short description for your customers."
          />
        </div>
        <div className="border-t pt-6">
           <Label htmlFor="commands" className="text-lg font-semibold">Server Commands</Label>
           <p className="text-sm text-muted-foreground mb-2">
             Enter one command per line. Use <code className="bg-muted px-1 py-0.5 rounded">{'{player}'}</code> as a placeholder for the buyer's nickname.
           </p>
          <Textarea
            id="commands"
            name="commands"
            value={product.commands}
            onChange={handleInputChange}
            placeholder={"give {player} minecraft:diamond 16\n" +
                         "lp user {player} parent set vip\n" +
                         "eco give {player} 1000"}
            required
            rows={5}
            className="font-mono text-sm"
          />
        </div>
        <Button type="submit" className="w-full">Save Product</Button>
      </form>
    </div>
  );
} 