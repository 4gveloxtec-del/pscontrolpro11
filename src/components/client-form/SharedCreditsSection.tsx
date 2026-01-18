import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Users, CreditCard } from 'lucide-react';
import { SharedCreditPicker, SharedCreditSelection } from '@/components/SharedCreditPicker';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

interface SharedCreditsSectionProps {
  sellerId: string;
  category: string;
  serverId?: string;
  planDurationDays?: number;
  selectedCredit: SharedCreditSelection | null;
  onSelect: (selection: SharedCreditSelection | null) => void;
  hasAvailableCredits?: boolean;
}

const STORAGE_KEY = 'shared-credits-enabled';

export function SharedCreditsSection({
  sellerId,
  category,
  serverId,
  planDurationDays,
  selectedCredit,
  onSelect,
}: SharedCreditsSectionProps) {
  // Load initial state from localStorage
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'true';
  });

  // Save preference to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isEnabled));
  }, [isEnabled]);

  // Clear selection when disabled
  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    if (!checked) {
      onSelect(null);
    }
  };

  // Only show for valid categories
  const isValidCategory = category === 'IPTV' || category === 'P2P' || category === 'SSH' || category === 'Revendedor';
  
  if (!isValidCategory || !serverId) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Toggle Header */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <Users className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <Label htmlFor="shared-credits-toggle" className="cursor-pointer font-medium">
              Créditos Compartilhados
            </Label>
            <p className="text-xs text-muted-foreground">
              Aproveite vagas existentes com desconto
            </p>
          </div>
        </div>
        <Switch
          id="shared-credits-toggle"
          checked={isEnabled}
          onCheckedChange={handleToggle}
        />
      </div>

      {/* Content - Only visible when enabled */}
      <Collapsible open={isEnabled}>
        <CollapsibleContent className="animate-accordion-down">
          <SharedCreditPicker
            sellerId={sellerId}
            category={category}
            serverId={serverId}
            planDurationDays={planDurationDays}
            selectedCredit={selectedCredit}
            onSelect={onSelect}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
