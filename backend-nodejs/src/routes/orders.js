const express = require('express');
const Joi = require('joi');
const Order = require('../models/Order');

const router = express.Router();

// Validation schema for order creation
const orderValidationSchema = Joi.object({
    customerInfo: Joi.object({
        firstName: Joi.string().min(2).max(50).required().messages({
            'string.empty': 'שם פרטי הוא שדה חובה',
            'string.min': 'שם פרטי חייב להכיל לפחות 2 תווים',
            'string.max': 'שם פרטי לא יכול להכיל יותר מ-50 תווים'
        }),
        lastName: Joi.string().min(2).max(50).required().messages({
            'string.empty': 'שם משפחה הוא שדה חובה',
            'string.min': 'שם משפחה חייב להכיל לפחות 2 תווים',
            'string.max': 'שם משפחה לא יכול להכיל יותר מ-50 תווים'
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'כתובת מייל לא תקינה',
            'string.empty': 'כתובת מייל היא שדה חובה'
        }),
        address: Joi.string().min(10).max(200).required().messages({
            'string.empty': 'כתובת מלאה היא שדה חובה',
            'string.min': 'כתובת חייבת להכיל לפחות 10 תווים',
            'string.max': 'כתובת לא יכולה להכיל יותר מ-200 תווים'
        })
    }).required(),
    
    items: Joi.array().items(
        Joi.object({
            productId: Joi.number().integer().positive().required(),
            productName: Joi.string().required(),
            categoryId: Joi.number().integer().positive().required(),
            categoryName: Joi.string().required(),
            price: Joi.number().positive().required(),
            quantity: Joi.number().integer().min(1).required(),
            unit: Joi.string().default('יח׳'),
            totalPrice: Joi.number().positive().required() // ← הוסף את זה!
        })
    ).min(1).required().messages({
        'array.min': 'הזמנה חייבת להכיל לפחות מוצר אחד'
    }),
    
    orderSummary: Joi.object({ // ← הוסף את כל הבלוק הזה!
        totalItems: Joi.number().integer().min(1).required(),
        totalAmount: Joi.number().positive().required(),
        currency: Joi.string().default('ILS')
    }).required()
});

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
    try {
        console.log('📦 Received order request:', JSON.stringify(req.body, null, 2));

        // Validate request body
        const { error, value } = orderValidationSchema.validate(req.body);
        if (error) {
            console.log('❌ Validation error:', error.details[0].message);
            return res.status(400).json({
                success: false,
                error: 'נתונים לא תקינים',
                details: error.details[0].message
            });
        }

        // Create new order
        const order = new Order(value);
        const savedOrder = await order.save();

        console.log('✅ Order saved successfully:', savedOrder.orderNumber);

        res.status(201).json({
            success: true,
            message: 'ההזמנה נשמרה בהצלחה',
            data: {
                orderNumber: savedOrder.orderNumber,
                orderId: savedOrder._id,
                summary: savedOrder.getSummary()
            }
        });

    } catch (error) {
        console.error('❌ Error creating order:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                error: 'נתונים לא תקינים',
                details: errors
            });
        }

        res.status(500).json({
            success: false,
            error: 'שגיאה בשמירת ההזמנה',
            message: error.message
        });
    }
});

// GET /api/orders - Get all orders (with pagination)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find()
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit)
            .select('customerInfo.firstName customerInfo.lastName customerInfo.email orderSummary status orderDate')
            .lean();

        const total = await Order.countDocuments();
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                orders: orders.map(order => ({
                    ...order,
                    orderNumber: `ORD-${order._id.toString().slice(-8).toUpperCase()}`
                })),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalOrders: total,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        res.status(500).json({
            success: false,
            error: 'שגיאה בשליפת ההזמנות',
            message: error.message
        });
    }
});

// GET /api/orders/:id - Get specific order
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'הזמנה לא נמצאה'
            });
        }

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('❌ Error fetching order:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'מזהה הזמנה לא תקין'
            });
        }

        res.status(500).json({
            success: false,
            error: 'שגיאה בשליפת ההזמנה',
            message: error.message
        });
    }
});

// GET /api/orders/customer/:email - Get orders by customer email
router.get('/customer/:email', async (req, res) => {
    try {
        const email = req.params.email.toLowerCase();
        const orders = await Order.findByEmail(email);

        res.json({
            success: true,
            data: {
                email,
                orderCount: orders.length,
                orders: orders.map(order => order.getSummary())
            }
        });

    } catch (error) {
        console.error('❌ Error fetching customer orders:', error);
        res.status(500).json({
            success: false,
            error: 'שגיאה בשליפת הזמנות הלקוח',
            message: error.message
        });
    }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'סטטוס לא תקין',
                validStatuses
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'הזמנה לא נמצאה'
            });
        }

        res.json({
            success: true,
            message: 'סטטוס ההזמנה עודכן בהצלחה',
            data: order.getSummary()
        });

    } catch (error) {
        console.error('❌ Error updating order status:', error);
        res.status(500).json({
            success: false,
            error: 'שגיאה בעדכון סטטוס ההזמנה',
            message: error.message
        });
    }
});

// DELETE /api/orders/:id - Delete order (soft delete by changing status)
router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled', updatedAt: new Date() },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'הזמנה לא נמצאה'
            });
        }

        res.json({
            success: true,
            message: 'ההזמנה בוטלה בהצלחה',
            data: order.getSummary()
        });

    } catch (error) {
        console.error('❌ Error cancelling order:', error);
        res.status(500).json({
            success: false,
            error: 'שגיאה בביטול ההזמנה',
            message: error.message
        });
    }
});

module.exports = router;