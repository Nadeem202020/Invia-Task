import { useState } from 'react';
import { Plus, ChevronDown, Package, X } from 'lucide-react';
import api from '../api';
import StockModal from './StockModal';

export default function ProductList({ products, warehouses, onRefresh }: { products: any[], warehouses: any[], onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [error, setError] = useState('');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'remove' | 'transfer'>('add');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/products', { name, sku });
      setShowAdd(false);
      setName('');
      setSku('');
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add product');
    }
  };

  const toggleExpand = (productId: string) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  const openModal = (type: 'add' | 'remove' | 'transfer', product: any, warehouse: any) => {
    setModalType(type);
    setSelectedProduct(product);
    setSelectedWarehouse(warehouse);
    setIsModalOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-base-100">Products</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium gradient-btn text-white"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAdd ? 'Cancel' : 'Add Product'}</span>
        </button>
      </div>

      {/* Add product form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="glass-light rounded-xl p-5 mb-6 animate-slide-down">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-base-300 uppercase tracking-wider mb-2">
                Product Name
              </label>
              <input
                type="text"
                required
                className="input-dark"
                placeholder="e.g. Wireless Mouse"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-base-300 uppercase tracking-wider mb-2">
                SKU
              </label>
              <input
                type="text"
                required
                className="input-dark"
                placeholder="e.g. SKU-003"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-accent-green text-white hover:bg-emerald-500 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/15 whitespace-nowrap"
              >
                Save Product
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Error */}
      {error && (
        <div className="text-accent-rose text-sm bg-accent-rose/10 border border-accent-rose/20 p-3 rounded-xl mb-4 animate-fade-in">
          {error}
        </div>
      )}

      {/* Product cards */}
      <div className="space-y-3">
        {products.map((p, index) => (
          <div
            key={p.id}
            className="glass-light rounded-xl overflow-hidden transition-all duration-300 hover:border-base-500/40 glow-border animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Product header */}
            <div
              className="px-5 py-4 flex justify-between items-center cursor-pointer hover:bg-base-700/20 transition-colors duration-200"
              onClick={() => toggleExpand(p.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-amber/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-accent-amber" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-base-100">{p.name}</h3>
                  <p className="text-xs text-base-400 font-mono">{p.sku}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-base-400 bg-base-700/50 px-2.5 py-1 rounded-full">
                  {p.inventories?.length || 0} locations
                </span>
                <div className="text-base-400 transition-transform duration-300" style={{ transform: expandedProduct === p.id ? 'rotate(180deg)' : 'rotate(0)' }}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Expanded inventory */}
            {expandedProduct === p.id && (
              <div className="px-5 pb-5 border-t border-base-700/30 animate-fade-in">
                <h4 className="text-xs font-semibold text-base-300 uppercase tracking-wider mt-4 mb-3">
                  Inventory by Warehouse
                </h4>
                <div className="space-y-2">
                  {p.inventories.map((inv: any) => (
                    <div
                      key={inv.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-base-800/50 p-4 rounded-xl border border-base-700/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent-green" />
                        <div>
                          <span className="font-medium text-base-200 text-sm">{inv.warehouse.name}</span>
                          <span className="ml-2 text-xs text-base-400 font-mono">{inv.warehouse.code}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-accent-amber min-w-[70px] text-right tabular-nums">
                          {inv.quantity}
                          <span className="text-xs text-base-400 font-normal ml-1">units</span>
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); openModal('add', p, inv.warehouse); }}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-green/15 text-green-400 hover:bg-accent-green/25 transition-colors duration-200"
                          >
                            Add
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openModal('remove', p, inv.warehouse); }}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-rose/15 text-red-400 hover:bg-accent-rose/25 transition-colors duration-200"
                          >
                            Remove
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openModal('transfer', p, inv.warehouse); }}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-steel/15 text-blue-300 hover:bg-accent-steel/25 transition-colors duration-200"
                          >
                            Transfer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {p.inventories.length === 0 && (
                    <p className="text-sm text-base-400 italic py-4 text-center">
                      No inventory records found. Create a warehouse first.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-base-400">
            <Package className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No products found</p>
            <p className="text-xs mt-1">Click "Add Product" to get started</p>
          </div>
        )}
      </div>

      {isModalOpen && selectedProduct && selectedWarehouse && (
        <StockModal
          type={modalType}
          product={selectedProduct}
          sourceWarehouse={selectedWarehouse}
          warehouses={warehouses.filter(w => w.id !== selectedWarehouse.id)}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
