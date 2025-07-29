import mongoose, { Document, Schema, Model } from 'mongoose';

// Interfaces for type safety
export interface IOrderItem {
    productId: number;
    productName: string;
    categoryId: number;
    categoryName: string;
    price: number;
    quantity: number;
    unit: string;
    totalPrice: number;
}

export interface ICustomerInfo {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    fullName?: string; // Virtual field
}

export interface IOrderSummary {
    totalItems: number;
    totalAmount: number;
    currency: string;
}

export interface IOrderSummaryResponse {
    orderNumber: string;
    customerName: string;
    totalItems: number;
    totalAmount: number;
    status: string;
    orderDate: Date;
}

// Main Order interface
export interface IOrder extends Document {
    customerInfo: ICustomerInfo;
    items: IOrderItem[];
    orderSummary: IOrderSummary;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    orderDate: Date;
    updatedAt: Date;
    orderNumber: string; // Virtual field
    
    // Instance methods
    addItem(item: IOrderItem): Promise<IOrder>;
    getSummary(): IOrderSummaryResponse;
}

// Static methods interface
export interface IOrderModel extends Model<IOrder> {
    findByEmail(email: string): Promise<IOrder[]>;
}

// Schema for order items
const orderItemSchema = new Schema<IOrderItem>({
    productId: {
        type: Number,
        required: true
    },
    productName: {
        type: String,
        required: true,
        trim: true
    },
    categoryId: {
        type: Number,
        required: true
    },
    categoryName: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unit: {
        type: String,
        default: 'יח׳',
        trim: true
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

// Main order schema
const orderSchema = new Schema<IOrder>({
    // Customer details
    customerInfo: {
        firstName: {
            type: String,
            required: [true, 'שם פרטי הוא שדה חובה'],
            trim: true,
            minlength: [2, 'שם פרטי חייב להכיל לפחות 2 תווים'],
            maxlength: [50, 'שם פרטי לא יכול להכיל יותר מ-50 תווים']
        },
        lastName: {
            type: String,
            required: [true, 'שם משפחה הוא שדה חובה'],
            trim: true,
            minlength: [2, 'שם משפחה חייב להכיל לפחות 2 תווים'],
            maxlength: [50, 'שם משפחה לא יכול להכיל יותר מ-50 תווים']
        },
        email: {
            type: String,
            required: [true, 'כתובת מייל היא שדה חובה'],
            trim: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'כתובת מייל לא תקינה']
        },
        address: {
            type: String,
            required: [true, 'כתובת מלאה היא שדה חובה'],
            trim: true,
            minlength: [10, 'כתובת חייבת להכיל לפחות 10 תווים'],
            maxlength: [200, 'כתובת לא יכולה להכיל יותר מ-200 תווים']
        }
    },

    // Order items
    items: {
        type: [orderItemSchema],
        required: true,
        validate: {
            validator: function(items: IOrderItem[]): boolean {
                return items && items.length > 0;
            },
            message: 'הזמנה חייבת להכיל לפחות מוצר אחד'
        }
    },

    // Order summary
    orderSummary: {
        totalItems: {
            type: Number,
            required: true,
            min: 1
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'ILS'
        }
    },

    // Order status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },

    // Timestamps
    orderDate: {
        type: Date,
        default: Date.now
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for order number (formatted ID)
orderSchema.virtual('orderNumber').get(function(this: IOrder): string {
    return `ORD-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Virtual for full customer name
orderSchema.virtual('customerInfo.fullName').get(function(this: IOrder): string {
    return `${this.customerInfo.firstName} ${this.customerInfo.lastName}`;
});

// Index for better query performance
orderSchema.index({ 'customerInfo.email': 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ status: 1 });

// Pre-save middleware to update timestamps and calculate totals
orderSchema.pre<IOrder>('save', function(next) {
    this.updatedAt = new Date();
    
    // Calculate total amount and items
    let totalAmount = 0;
    let totalItems = 0;
    
    this.items.forEach((item: IOrderItem) => {
        item.totalPrice = item.price * item.quantity;  // מחשב אוטומטית
        totalAmount += item.totalPrice;
        totalItems += item.quantity;
    });
    
    this.orderSummary.totalAmount = Math.round(totalAmount * 100) / 100;
    this.orderSummary.totalItems = totalItems;
    
    next();
});

// Static method to find orders by email
orderSchema.statics.findByEmail = function(email: string): Promise<IOrder[]> {
    return this.find({ 'customerInfo.email': email }).sort({ orderDate: -1 });
};

// Instance method to add item to order
orderSchema.methods.addItem = function(this: IOrder, item: IOrderItem): Promise<IOrder> {
    this.items.push(item);
    return this.save();
};

// Instance method to get order summary
orderSchema.methods.getSummary = function(this: IOrder): IOrderSummaryResponse {
    return {
        orderNumber: this.orderNumber,
        customerName: this.customerInfo.fullName || `${this.customerInfo.firstName} ${this.customerInfo.lastName}`,
        totalItems: this.orderSummary.totalItems,
        totalAmount: this.orderSummary.totalAmount,
        status: this.status,
        orderDate: this.orderDate
    };
};

const Order = mongoose.model<IOrder, IOrderModel>('Order', orderSchema);

export default Order;