import { useState, useEffect } from 'react';
import { Package, Building2, Boxes, Loader2 } from 'lucide-react';
import api from '../api';
import ProductList from '../components/ProductList';
import WarehouseList from '../components/WarehouseList';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'warehouses'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, warehousesRes] = await Promise.all([
        api.get('/products'),
        api.get('/warehouses')
      ]);
      setProducts(productsRes.data);
      setWarehouses(warehousesRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute totals
  const totalStock = products.reduce(
    (sum, p) => sum + (p.inventories?.reduce((s: number, i: any) => s + i.quantity, 0) || 0),
    0
  );

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      icon: Package,
      gradient: 'from-amber-600/15 to-amber-400/10',
      iconColor: 'text-accent-amber',
      delay: 'delay-1',
    },
    {
      label: 'Warehouses',
      value: warehouses.length,
      icon: Building2,
      gradient: 'from-emerald-600/15 to-emerald-400/10',
      iconColor: 'text-accent-green',
      delay: 'delay-2',
    },
    {
      label: 'Total Stock',
      value: totalStock.toLocaleString(),
      icon: Boxes,
      gradient: 'from-slate-500/15 to-slate-400/10',
      iconColor: 'text-accent-steel',
      delay: 'delay-3',
    },
  ];

  const tabs = [
    { key: 'products' as const, label: 'Products', icon: Package },
    { key: 'warehouses' as const, label: 'Warehouses', icon: Building2 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`glass rounded-2xl p-5 animate-slide-up ${stat.delay} glow-border`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-base-100">{stat.value}</p>
                <p className="text-xs text-base-400 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === tab.key
                ? 'gradient-btn text-white shadow-lg'
                : 'glass text-base-300 hover:text-base-100 hover:bg-base-700/40'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="glass rounded-2xl p-6 min-h-[300px] animate-slide-up delay-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Loader2 className="w-8 h-8 text-accent-amber animate-spin-slow" />
            <span className="text-sm text-base-400">Loading data…</span>
          </div>
        ) : activeTab === 'products' ? (
          <ProductList products={products} warehouses={warehouses} onRefresh={fetchData} />
        ) : (
          <WarehouseList warehouses={warehouses} onRefresh={fetchData} />
        )}
      </div>
    </div>
  );
}
