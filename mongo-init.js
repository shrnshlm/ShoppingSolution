// MongoDB initialization script
db = db.getSiblingDB('shopping_orders');

// Create collections
db.createCollection('orders');

// Create indexes for better performance
db.orders.createIndex({ "customerInfo.email": 1 });
db.orders.createIndex({ "orderDate": -1 });
db.orders.createIndex({ "status": 1 });

// Insert sample data (optional)
db.orders.insertOne({
    customerInfo: {
        firstName: "ישראל",
        lastName: "ישראלי", 
        email: "test@example.com",
        address: "רחוב הרצל 1, תל אביב"
    },
    items: [
        {
            productId: 1,
            productName: "מוצר לדוגמה",
            categoryId: 1,
            categoryName: "קטגוריה לדוגמה",
            price: 29.99,
            quantity: 2,
            unit: "יח׳",
            totalPrice: 59.98
        }
    ],
    orderSummary: {
        totalItems: 2,
        totalAmount: 59.98,
        currency: "ILS"
    },
    status: "pending",
    orderDate: new Date(),
    orderNumber: "ORD-EXAMPLE1"
});

print("MongoDB initialized successfully with shopping_orders database");