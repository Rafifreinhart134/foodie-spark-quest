import { useState } from 'react';
import { Users, DollarSign, Clock, ChefHat, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SearchFilters {
  serving?: string;
  budget?: string;
  preference?: string;
}

interface SearchWizardProps {
  onSearch: (filters: SearchFilters) => void;
}

const SearchWizard = ({ onSearch }: SearchWizardProps) => {
  const [step, setStep] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({});

  const servingOptions = [
    { id: '1', label: '1 orang', subtitle: 'Single serving', icon: '👤' },
    { id: '2', label: '2 orang', subtitle: 'Romantis/hemat', icon: '💕' },
    { id: '3-4', label: '3-4 orang', subtitle: 'Keluarga kecil', icon: '👨‍👩‍👧' },
    { id: '5+', label: '5+ orang', subtitle: 'Acara/ramean', icon: '👥' },
  ];

  const budgetOptions = [
    { id: 'hemat', label: 'Hemat', subtitle: 'Rp 20-50 ribu', icon: '💰' },
    { id: 'sedang', label: 'Sedang', subtitle: 'Rp 50-100 ribu', icon: '💵' },
    { id: 'bebas', label: 'Bebas', subtitle: '> Rp 100 ribu', icon: '💸' },
  ];

  const preferenceOptions = [
    { id: 'cepat', label: 'Cepat & Praktis', subtitle: '≤ 20 menit', icon: '⚡' },
    { id: 'sehat', label: 'Sehat & Bergizi', subtitle: 'Nutrisi seimbang', icon: '🥗' },
    { id: 'tradisional', label: 'Tradisional Indonesia', subtitle: 'Cita rasa nusantara', icon: '🇮🇩' },
    { id: 'international', label: 'International Flavors', subtitle: 'Rasa dunia', icon: '🌍' },
    { id: 'dessert', label: 'Dessert & Minuman', subtitle: 'Manis & segar', icon: '🧁' },
  ];

  const handleOptionSelect = (value: string, type: keyof SearchFilters) => {
    setFilters(prev => ({ ...prev, [type]: value }));
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete search
      const finalFilters = { ...filters, [type]: value };
      onSearch(finalFilters);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Users className="w-12 h-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Untuk Berapa Orang?</h3>
              <p className="text-muted-foreground">Pilih jumlah porsi yang dibutuhkan</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {servingOptions.map((option) => (
                <Card
                  key={option.id}
                  className="p-4 cursor-pointer hover:shadow-card transition-shadow border-2 hover:border-primary"
                  onClick={() => handleOptionSelect(option.id, 'serving')}
                >
                  <div className="text-center space-y-2">
                    <div className="text-2xl">{option.icon}</div>
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.subtitle}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <DollarSign className="w-12 h-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Budget Masakan?</h3>
              <p className="text-muted-foreground">Tentukan range budget yang sesuai</p>
            </div>
            <div className="space-y-3">
              {budgetOptions.map((option) => (
                <Card
                  key={option.id}
                  className="p-4 cursor-pointer hover:shadow-card transition-shadow border-2 hover:border-primary"
                  onClick={() => handleOptionSelect(option.id, 'budget')}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{option.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.subtitle}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <ChefHat className="w-12 h-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Preferensi Menu?</h3>
              <p className="text-muted-foreground">Pilih jenis masakan yang diinginkan</p>
            </div>
            <div className="space-y-3">
              {preferenceOptions.map((option) => (
                <Card
                  key={option.id}
                  className="p-4 cursor-pointer hover:shadow-card transition-shadow border-2 hover:border-primary"
                  onClick={() => handleOptionSelect(option.id, 'preference')}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{option.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.subtitle}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Mau masak apa hari ini? 🍳
        </h2>
        <p className="text-muted-foreground">Pilih sesuai kebutuhanmu!</p>
        
        {/* Progress indicator */}
        <div className="flex justify-center space-x-2 mt-4">
          {[1, 2, 3].map((stepNum) => (
            <div
              key={stepNum}
              className={`w-3 h-3 rounded-full transition-colors ${
                stepNum <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Selected filters */}
      {(filters.serving || filters.budget || filters.preference) && (
        <Card className="p-4">
          <p className="text-sm font-medium mb-2">Pilihan kamu:</p>
          <div className="flex flex-wrap gap-2">
            {filters.serving && (
              <Badge variant="secondary">
                👤 {servingOptions.find(o => o.id === filters.serving)?.label}
              </Badge>
            )}
            {filters.budget && (
              <Badge variant="secondary">
                💰 {budgetOptions.find(o => o.id === filters.budget)?.label}
              </Badge>
            )}
            {filters.preference && (
              <Badge variant="secondary">
                🍳 {preferenceOptions.find(o => o.id === filters.preference)?.label}
              </Badge>
            )}
          </div>
        </Card>
      )}

      {/* Step content */}
      <Card className="p-6">
        {renderStep()}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
          >
            Kembali
          </Button>
        )}
        
        {step === 1 && (
          <Button
            variant="outline"
            onClick={() => onSearch({})}
            className="ml-auto"
          >
            <Search className="w-4 h-4 mr-2" />
            Lewati & Lihat Semua
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchWizard;