import { useState } from 'react';
import { Plus, Loader2, Building2, X } from 'lucide-react';
import api from '../api';

export default function WarehouseList({ warehouses, onRefresh }: { warehouses: any[], onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/warehouses', { name, code });
      setShowAdd(false);
      setName('');
      setCode('');
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add warehouse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-base-100">Warehouses</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium gradient-btn text-white"
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAdd ? 'Cancel' : 'Add Warehouse'}</span>
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="glass-light rounded-xl p-5 mb-6 animate-slide-down">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-base-300 uppercase tracking-wider mb-2">
                Warehouse Name
              </label>
              <input
                type="text"
                required
                className="input-dark"
                placeholder="e.g. Berlin Warehouse"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-base-300 uppercase tracking-wider mb-2">
                Code
              </label>
              <input
                type="text"
                required
                className="input-dark"
                placeholder="e.g. W-BER"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-accent-green text-white hover:bg-emerald-500 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/15 whitespace-nowrap flex items-center justify-center min-w-[150px]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin-slow" /> : 'Save Warehouse'}
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

      {/* Warehouse cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map((w, index) => (
          <div
            key={w.id}
            className="glass-light rounded-xl p-5 glow-border transition-all duration-300 hover:border-accent-green/20 animate-slide-up group"
            style={{ animationDelay: `${index * 0.07}s` }}
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-accent-green/12 flex items-center justify-center group-hover:bg-accent-green/20 transition-colors duration-200">
                <Building2 className="w-5 h-5 text-accent-green" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-base-100 truncate">{w.name}</h3>
                <span className="inline-block mt-1.5 text-xs font-mono font-medium text-accent-green bg-accent-green/10 px-2.5 py-1 rounded-full">
                  {w.code}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {warehouses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-base-400">
          <Building2 className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">No warehouses found</p>
          <p className="text-xs mt-1">Click "Add Warehouse" to get started</p>
        </div>
      )}
    </div>
  );
}
