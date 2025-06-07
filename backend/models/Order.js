import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true }, // Simpan harga saat transaksi
});

const orderSchema = new mongoose.Schema({
  user: { type: String, required: true },
  items: [orderItemSchema],
  Address: { type: String, required: true },
  courier: { type: String, enum: ['jne', 'jnt', 'sicepat', 'ninja', 'lion'], required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Belum Bayar', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'], default: 'Belum Bayar' },
  orderedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
