import { useState } from 'react';
import { X, Loader2, ArrowRightLeft, PlusCircle, MinusCircle } from 'lucide-react';
import api from '../api';

interface StockModalProps {
  type: 'add' | 'remove' | 'transfer';
  product: any;
  sourceWarehouse: any;
  warehouses: any[]; // other warehouses for transfer
  onClose: () => void;
  onSuccess: () => void;
}

export default function StockModal({ type, product, sourceWarehouse, warehouses, onClose, onSuccess }: StockModalProps) {
  const [quantity, setQuantity] = useState<number | ''>('');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const config = {
    add: {
      title: 'Add Stock',
      icon: PlusCircle,
      accent: 'text-green-400',
      accentBg: 'bg-green-500/15',
      btnClass: 'bg-accent-green hover:brightness-110 focus:ring-green-500',
      barColor: 'bg-accent-green',
    },
    remove: {
      title: 'Remove Stock',
      icon: MinusCircle,
      accent: 'text-red-400',
      accentBg: 'bg-red-500/15',
      btnClass: 'bg-accent-rose hover:brightness-110 focus:ring-red-500',
      barColor: 'bg-accent-rose',
    },
    transfer: {
      title: 'Transfer Stock',
      icon: ArrowRightLeft,
      accent: 'text-blue-300',
      accentBg: 'bg-blue-500/15',
      btnClass: 'bg-accent-steel hover:brightness-110 focus:ring-blue-500',
      barColor: 'bg-accent-steel',
    },
  };

  const c = config[type];
  const Icon = c.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    if (type === 'transfer' && !destinationWarehouseId) {
      setError('Destination warehouse is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (type === 'add') {
        await api.post('/inventory/add', {
          productId: product.id,
          warehouseId: sourceWarehouse.id,
          quantity: Number(quantity)
        });
      } else if (type === 'remove') {
        await api.post('/inventory/remove', {
          productId: product.id,
          warehouseId: sourceWarehouse.id,
          quantity: Number(quantity)
        });
      } else if (type === 'transfer') {
        await api.post('/inventory/transfer', {
          productId: product.id,
          sourceWarehouseId: sourceWarehouse.id,
          destinationWarehouseId,
          quantity: Number(quantity)
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${type} stock`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md glass rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent bar */}
        <div className={`h-1 ${c.barColor}`} />

        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-base-700/30">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${c.accentBg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${c.accent}`} />
            </div>
            <h3 className="text-lg font-bold text-base-100">{c.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-base-700/50 flex items-center justify-center text-base-400 hover:text-base-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Product info */}
          <div className="bg-base-800/50 rounded-xl p-4 border border-base-700/30">
            <p className="text-xs text-base-400 uppercase tracking-wider font-semibold mb-1">Product</p>
            <p className="font-semibold text-base-100">
              {product.name}
              <span className="text-base-400 text-xs font-mono font-normal ml-2">{product.sku}</span>
            </p>
          </div>

          {/* Warehouse info */}
          <div className="bg-base-800/50 rounded-xl p-4 border border-base-700/30">
            <p className="text-xs text-base-400 uppercase tracking-wider font-semibold mb-1">
              {type === 'transfer' ? 'Source Warehouse' : 'Warehouse'}
            </p>
            <p className="font-semibold text-base-100">
              {sourceWarehouse.name}
              <span className="text-base-400 text-xs font-mono font-normal ml-2">{sourceWarehouse.code}</span>
            </p>
          </div>

          {/* Destination (transfer only) */}
          {type === 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-base-300 uppercase tracking-wider mb-2">
                Destination Warehouse
              </label>
              <select
                required
                className="select-dark"
                value={destinationWarehouseId}
                onChange={(e) => setDestinationWarehouseId(e.target.value)}
              >
                <option value="">Select destination…</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-base-300 uppercase tracking-wider mb-2">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              required
              className="input-dark"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
              placeholder="0"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-accent-rose text-sm bg-accent-rose/10 border border-accent-rose/20 p-3 rounded-xl animate-fade-in">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-base-300 bg-base-700/40 border border-base-600/30 hover:bg-base-700/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${c.btnClass} disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin-slow" /> : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
