import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DnsFieldsSectionProps {
  dns: string;
  onChange: (dns: string) => void;
}

export function DnsFieldsSection({ dns, onChange }: DnsFieldsSectionProps) {
  // Parse DNS string into array
  const [dnsEntries, setDnsEntries] = useState<string[]>(() => {
    if (!dns) return [''];
    const entries = dns.split(',').map(d => d.trim()).filter(Boolean);
    return entries.length > 0 ? entries : [''];
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync with parent when entries change
  useEffect(() => {
    const filtered = dnsEntries.filter(d => d.trim());
    onChange(filtered.join(', '));
  }, [dnsEntries, onChange]);

  const handleDnsChange = (index: number, value: string) => {
    const newEntries = [...dnsEntries];
    newEntries[index] = value;
    setDnsEntries(newEntries);
  };

  const addDnsField = () => {
    setDnsEntries([...dnsEntries, '']);
    setIsExpanded(true);
  };

  const removeDnsField = (index: number) => {
    if (dnsEntries.length <= 1) {
      setDnsEntries(['']);
      return;
    }
    const newEntries = dnsEntries.filter((_, i) => i !== index);
    setDnsEntries(newEntries);
  };

  const hasMultipleDns = dnsEntries.length > 1 || (dnsEntries.length === 1 && dnsEntries[0]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-500" />
          DNS (opcional)
        </Label>
        {dnsEntries.filter(d => d.trim()).length > 1 && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {dnsEntries.filter(d => d.trim()).length} DNS
          </span>
        )}
      </div>

      {/* Primary DNS field - always visible */}
      <div className="flex items-center gap-2">
        <Input
          value={dnsEntries[0] || ''}
          onChange={(e) => handleDnsChange(0, e.target.value)}
          placeholder="Ex: dns.exemplo.com"
          className="flex-1"
        />
        {dnsEntries.length === 1 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDnsField}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        )}
      </div>

      {/* Additional DNS fields - collapsible */}
      {dnsEntries.length > 1 && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="w-full justify-between text-muted-foreground"
            >
              <span>{dnsEntries.length - 1} DNS adicional(is)</span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            {dnsEntries.slice(1).map((entry, index) => (
              <div key={index + 1} className="flex items-center gap-2">
                <Input
                  value={entry}
                  onChange={(e) => handleDnsChange(index + 1, e.target.value)}
                  placeholder={`DNS ${index + 2}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDnsField(index + 1)}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDnsField}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar outro DNS
            </Button>
          </CollapsibleContent>
        </Collapsible>
      )}

      <p className="text-xs text-muted-foreground">
        DNS utilizado pelo cliente. Útil para rastrear problemas de conexão.
      </p>
    </div>
  );
}
