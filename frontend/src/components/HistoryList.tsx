import { Clock, PlusCircle, MinusCircle, ArrowRightLeft, Package } from 'lucide-react';

interface HistoryListProps {
    history: any[];
}

export default function HistoryList({ history }: HistoryListProps) {
    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-base-400">
                <Clock className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">No history found</p>
                <p className="text-xs mt-1">Stock operations will appear here.</p>
            </div>
        );
    }

    const getConfig = (type: string) => {
        switch (type) {
            case 'ADD':
                return {
                    icon: PlusCircle,
                    color: 'text-accent-green',
                    bg: 'bg-accent-green/15',
                    border: 'border-accent-green/30',
                    label: 'Added Stock',
                };
            case 'REMOVE':
                return {
                    icon: MinusCircle,
                    color: 'text-accent-rose',
                    bg: 'bg-accent-rose/15',
                    border: 'border-accent-rose/30',
                    label: 'Removed Stock',
                };
            case 'TRANSFER':
                return {
                    icon: ArrowRightLeft,
                    color: 'text-accent-steel',
                    bg: 'bg-accent-steel/15',
                    border: 'border-accent-steel/30',
                    label: 'Transferred Stock',
                };
            default:
                return {
                    icon: Clock,
                    color: 'text-base-400',
                    bg: 'bg-base-700/50',
                    border: 'border-base-600/30',
                    label: 'Unknown',
                };
        }
    };

    return (
        <div className="space-y-4">
            {history.map((entry, index) => {
                const config = getConfig(entry.operationType);
                const Icon = config.icon;

                return (
                    <div
                        key={entry.id}
                        className={`glass-light rounded-xl p-4 flex items-center gap-4 transition-all duration-300 hover:border-base-500/40 glow-border animate-slide-up`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        {/* Icon */}
                        <div className={`w-12 h-12 shrink-0 rounded-xl ${config.bg} flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 ${config.color}`} />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-sm font-bold ${config.color}`}>
                                    {config.label}
                                </span>
                                <span className="text-xs font-mono text-base-400 whitespace-nowrap">
                                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(entry.timestamp))}
                                </span>
                            </div>

                            <div className="text-sm text-base-200 truncate flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold">{entry.quantity}</span> units of
                                <span className="inline-flex items-center gap-1 font-medium text-accent-amber bg-accent-amber/10 px-2 py-0.5 rounded ml-1">
                                    <Package className="w-3 h-3" />
                                    {entry.product.name}
                                </span>

                                {entry.operationType === 'ADD' && entry.sourceWarehouse && (
                                    <span> to <span className="font-medium text-accent-green">{entry.sourceWarehouse.name}</span></span>
                                )}

                                {entry.operationType === 'REMOVE' && entry.sourceWarehouse && (
                                    <span> from <span className="font-medium text-accent-rose">{entry.sourceWarehouse.name}</span></span>
                                )}

                                {entry.operationType === 'TRANSFER' && (
                                    <span>
                                        from <span className="font-medium text-base-300">{entry.sourceWarehouse?.name}</span> to <span className="font-medium text-accent-steel">{entry.destinationWarehouse?.name}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
