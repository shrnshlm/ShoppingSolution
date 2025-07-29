import express, { Request, Response, Router } from 'express';
import Joi from 'joi';
import Order from '../models/Order';

const router: Router = express.Router();

// Interfaces for type safety
interface CustomerInfo {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
}

interface OrderItem {
    productId: number;
    productName: string;
    categoryId: number;
    categoryName: string;
    price: number;
    quantity: number;
    unit: string;
    totalPrice: number;
}

interface OrderSummary {
    totalItems: number;
    totalAmount: number;
    currency: string;
}

interface CreateOrderRequest {
    customerInfo: CustomerInfo;
    items: OrderItem[];
    orderSummary: OrderSummary;
}

interface PaginationQuery {
    page?: string;
    limit?: string;
}

interface UpdateStatusRequest {
    status: string;
}

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
            totalPrice: Joi.number().positive().required()
        })
    ).min(1).required().messages({
        'array.min': 'הזמנה חייבת להכיל לפחות מוצר אחד'
    }),
    
    orderSummary: Joi.object({
        totalItems: Joi.number().integer().min(1).required(),
        totalAmount: Joi.number().positive().required(),
        currency: Joi.string().default('ILS')
    }).required()
});

// POST /api/orders - Create new order
router.post('/', async (req: Request<{}, {}, CreateOrderRequest>, res: Response): Promise<void> => {
    try {
        console.log('📦 Received order request:', JSON.stringify(req.body, null, 2));

        // Validate request body
        const { error, value } = orderValidationSchema.validate(req.body);
        if (error) {
            console.log('❌ Validation error:', error.details[0].message);
            res.status(400).json({
                success: false,
                error: 'נתונים לא תקינים',
                details: error.details[0].message
            });
            return;
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

    } catch (error: any) {
        console.error('❌ Error creating order:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((e: any) => e.message);
            res.status(400).json({
                success: false,
                error: 'נתונים לא תקינים',
                details: errors
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: 'שגיאה בשמירת ההזמנה',
            message: error.message
        });
    }
});

// GET /api/orders - Get all orders (with pagination)
router.get('/', async (req: Request<{}, {}, {}, PaginationQuery>, res: Response): Promise<void> => {
    try {
        const page: number = parseInt(req.query.page || '1');
        const limit: number = parseInt(req.query.limit || '10');
        const skip: number = (page - 1) * limit;

        const orders = await Order.find()
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit)
            .select('customerInfo.firstName customerInfo.lastName customerInfo.email orderSummary status orderDate')
            .lean();

        const total: number = await Order.countDocuments();
        const totalPages: number = Math.ceil(total / limit);

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

    } catch (error: any) {
        console.error('❌ Error fetching orders:', error);
        res.status(500).json({
            success: false,
            error: 'שגיאה בשליפת ההזמנות',
            message: error.message
        });
    }
});

// GET /api/orders/:id - Get specific order
router.get('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            res.status(404).json({
                success: false,
                error: 'הזמנה לא נמצאה'
            });
            return;
        }

        res.json({
            success: true,
            data: order
        });

    } catch (error: any) {
        console.error('❌ Error fetching order:', error);
        
        if (error.name === 'CastError') {
            res.status(400).json({
                success: false,
                error: 'מזהה הזמנה לא תקין'
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: 'שגיאה בשליפת ההזמנה',
            message: error.message
        });
    }
});

// GET /api/orders/customer/:email - Get orders by customer email
router.get('/customer/:email', async (req: Request<{ email: string }>, res: Response): Promise<void> => {
    try {
        const email: string = req.params.email.toLowerCase();
        const orders = await Order.findByEmail(email);

        res.json({
            success: true,
            data: {
                email,
                orderCount: orders.length,
                orders: orders.map(order => order.getSummary())
            }
        });

    } catch (error: any) {
        console.error('❌ Error fetching customer orders:', error);
        res.status(500).json({
            success: false,
            error: 'שגיאה בשליפת הזמנות הלקוח',
            message: error.message
        });
    }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', async (req: Request<{ id: string }, {}, UpdateStatusRequest>, res: Response): Promise<void> => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                error: 'סטטוס לא תקין',
                validStatuses
            });
            return;
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!order) {
            res.status(404).json({
                success: false,
                error: 'הזמנה לא נמצאה'
            });
            return;
        }

        res.json({
            success: true,
            message: 'סטטוס ההזמנה עודכן בהצלחה',
            data: order.getSummary()
        });

    } catch (error: any) {
        console.error('❌ Error updating order status:', error);
        res.status(500).json({
            success: false,
            error: 'שגיאה בעדכון סטטוס ההזמנה',
            message: error.message
        });
    }
});

// DELETE /api/orders/:id - Delete order (soft delete by changing status)
router.delete('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled', updatedAt: new Date() },
            { new: true }
        );

        if (!order) {
            res.status(404).json({
                success: false,
                error: 'הזמנה לא נמצאה'
            });
            return;
        }

        res.json({
            success: true,
            message: 'ההזמנה בוטלה בהצלחה',
            data: order.getSummary()
        });

    } catch (error: any) {
        console.error('❌ Error cancelling order:', error);
        res.status(500).json({
            success: false,
            error: 'שגיאה בביטול ההזמנה',
            message: error.message
        });
    }
});

export default router;

// CommonJS compatibility
module.exports = router;
module.exports.default = router;