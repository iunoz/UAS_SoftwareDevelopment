import midtransClient from 'midtrans-client';
import Order from '../models/Order.js';
import mongoose from 'mongoose';

const snap = new midtransClient.Snap({
    isProduction: false, // ganti ke true kalau sudah production
    serverKey: 'SB-Mid-server-l4oi4dnqPDM9PI6TERtvq3Tx',
});

export const getSnapToken = async (req, res) => {
    try {
        const { orderId, amount, name, email } = req.body;

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount,
            },
            customer_details: {
                first_name: name,
                email: email,
            },
        };

        const transaction = await snap.createTransaction(parameter);
        res.json({ token: transaction.token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal membuat transaksi Midtrans' });
    }
};

export const saveOrder = async (req, res) => {
    try {
        console.log('saveOrder request body:', req.body);
        const { userId, userName, items, address, courier, totalAmount, status } = req.body;

        if (!userId || typeof userId !== 'string') {
            console.error('Invalid or missing userId:', userId);
            return res.status(400).json({ success: false, message: 'Invalid or missing userId' });
        }
        if (!userName || typeof userName !== 'string') {
            console.error('Invalid or missing userName:', userName);
            return res.status(400).json({ success: false, message: 'Invalid or missing userName' });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            console.error('Invalid or missing items:', items);
            return res.status(400).json({ success: false, message: 'Invalid or missing items' });
        }
        if (!address || typeof address !== 'string') {
            console.error('Invalid or missing address:', address);
            return res.status(400).json({ success: false, message: 'Invalid or missing address' });
        }
        if (!courier || typeof courier !== 'string' || courier.trim() === '') {
            console.error('Invalid or missing courier:', courier);
            return res.status(400).json({ success: false, message: 'Invalid or missing courier' });
        }
        if (totalAmount === undefined || typeof totalAmount !== 'number') {
            console.error('Invalid or missing totalAmount:', totalAmount);
            return res.status(400).json({ success: false, message: 'Invalid or missing totalAmount' });
        }

        const orderItems = items.map(item => {
            if (!item.product || !item.quantity || !item.priceAtPurchase) {
                throw new Error('Invalid item in items array');
            }
            return {
                product: new mongoose.Types.ObjectId(item.product),
                quantity: item.quantity,
                priceAtPurchase: item.priceAtPurchase,
                receipt: item.receipt || ''
            };
        });

        // Since 'Belum Bayar' is now a valid enum, use status or default to 'Belum Bayar'
        const normalizedStatus = status || 'Belum Bayar';

        const newOrder = new Order({
            user: userId,
            userName: userName,
            items: orderItems,
            Address: address,
            courier: courier,
            totalAmount: totalAmount,
            status: normalizedStatus
        });

        await newOrder.save();

        // Update product stock after order is created
        for (const item of orderItems) {
            // Use findOneAndUpdate for atomicity and to avoid race conditions
            const updatedProduct = await mongoose.model('Product').findOneAndUpdate(
                { _id: item.product, quantity: { $gte: item.quantity } },
                { $inc: { quantity: -item.quantity } },
                { new: true }
            );
            if (!updatedProduct) {
                // Rollback: delete the order if stock is not enough (should not happen if frontend already checks)
                await Order.findByIdAndDelete(newOrder._id);
                return res.status(400).json({ success: false, message: 'Stock tidak mencukupi untuk produk.' });
            }
        }

        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).json({ success: false, message: 'Failed to save order' });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'Missing userId parameter' });
        }
        // Fetch all orders for user regardless of status
        const orders = await Order.find({ user: userId }).populate('items.product');
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user orders' });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!orderId) {
            return res.status(400).json({ success: false, message: 'Missing orderId parameter' });
        }
        if (!status) {
            return res.status(400).json({ success: false, message: 'Missing status in request body' });
        }

        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('items.product').sort({ orderedAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch all orders' });
    }
};
