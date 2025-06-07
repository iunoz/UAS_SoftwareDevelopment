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
        const { userId, items, address, courier, totalAmount } = req.body;

        if (!userId || typeof userId !== 'string') {
            console.error('Invalid or missing userId:', userId);
            return res.status(400).json({ success: false, message: 'Invalid or missing userId' });
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
                priceAtPurchase: item.priceAtPurchase
            };
        });

        const newOrder = new Order({
            user: userId,
            items: orderItems,
            Address: address,
            courier: courier,
            totalAmount: totalAmount,
            status: 'pending'
        });

        await newOrder.save();

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
