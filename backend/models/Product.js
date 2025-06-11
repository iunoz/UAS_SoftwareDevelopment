import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: {
    type: String,
    enum: ['Hanging Lamp', 'Ceiling Lamp', 'Wall Lamp', 'Standing Lamp', 'Table Lamp', 'Uncategorized'],
    required: true,
  },
  collection: {
    type: String,
    enum: ['Minimalist Collection', 'Modern Collection', 'Classic Collection'],
    required: true,
  },
  weight: { type: Number, required: true }
}, { timestamps: true });

productSchema.virtual('soldOut').get(function() {
  return this.quantity <= 0;
});

const Product = mongoose.model('Product', productSchema);
export default Product;
