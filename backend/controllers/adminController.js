import Order from '../models/Order.js';
import Product from '../models/Product.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Order selesai = status 'selesai'
    const finishedOrdersArr = await Order.find({ status: 'selesai' });

    // Total penjualan (jumlah uang dari order selesai)
    const totalSales = finishedOrdersArr.reduce((sum, order) => sum + order.totalAmount, 0);

    // Produk terjual (total quantity dari order selesai)
    let totalProductsSold = 0;
    const productSales = {};
    finishedOrdersArr.forEach(order => {
      order.items.forEach(item => {
        totalProductsSold += item.quantity;
        const pid = item.product?.toString();
        productSales[pid] = (productSales[pid] || 0) + item.quantity;
      });
    });

    // Produk terlaku
    let bestProductId = null, bestQty = 0;
    Object.entries(productSales).forEach(([pid, qty]) => {
      if (qty > bestQty) {
        bestQty = qty;
        bestProductId = pid;
      }
    });
    let bestProductName = '';
    if (bestProductId) {
      // Pastikan bestProductId bertipe ObjectId
      let objectId;
      try {
        objectId = new mongoose.Types.ObjectId(bestProductId);
      } catch (e) {
        objectId = bestProductId; // fallback jika sudah string
      }
      const bestProduct = await Product.findById(objectId);
      bestProductName = bestProduct ? bestProduct.name : '(Produk tidak ditemukan)';
    } else {
      bestProductName = '(Belum ada penjualan selesai)';
    }

    // Order berjalan = status 'Sedang Dikemas' atau 'Sedang Dikirim'
    const ongoingOrders = await Order.countDocuments({
      status: { $in: ['Sedang Dikemas', 'dikirim'] }
    });
    // Order selesai
    const finishedOrders = finishedOrdersArr.length;

    // Grafik pendapatan per bulan (order selesai)
    const salesByMonth = await Order.aggregate([
      { $match: { status: 'selesai' } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$orderedAt" } },
        total: { $sum: "$totalAmount" }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalSales,
      totalProductsSold,
      bestProductName,
      ongoingOrders,
      finishedOrders,
      salesByMonth
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get dashboard stats' });
  }
};

export const getDailySales = async (req, res) => {
  try {
    const { month } = req.query; // format: '2025-06'
    if (!month) return res.status(400).json({ message: 'Month is required' });

    // Cari order selesai di bulan yang dipilih
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const salesByDay = await Order.aggregate([
      {
        $match: {
          status: 'selesai',
          orderedAt: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderedAt" } },
          total: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ salesByDay });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get daily sales' });
  }
};