import midtransClient from 'midtrans-client';

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
