import React from 'react';
import { Search } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = Search,
  title = 'No items found',
  description = 'Try adjusting your search filters or check back later.',
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
      <div className="w-14 h-14 bg-blue-50 text-sports-blue rounded-2xl flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-lg font-bold text-slate-800 font-display mb-1">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
