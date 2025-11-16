import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: {
    title: string;
    username: string;
    priceRange: string;
    ingredients: string[];
    instructions: string[];
  };
}

export const RecipeModal = ({ isOpen, onClose, recipe }: RecipeModalProps) => {
  if (!isOpen) return null;
  
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose} modal={false}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/20 pointer-events-none animate-fade-in data-[state=closed]:animate-fade-out" />
        <DialogPrimitive.Content className="fixed left-1/2 top-[12vh] z-50 w-full max-w-xs -translate-x-1/2 mx-4 outline-none pointer-events-auto animate-fade-in animate-scale-in data-[state=closed]:animate-fade-out data-[state=closed]:animate-scale-out">
          <div className="bg-background/95 backdrop-blur-md rounded-lg border border-border/50 shadow-lg overflow-hidden">
            <div className="flex flex-col max-h-[35vh]">
              {/* Header */}
              <div className="p-4 border-b border-border/50 flex-shrink-0">
                <div className="flex items-start justify-between mb-3">
                  <DialogPrimitive.Title asChild>
                    <h2 className="text-xl font-semibold text-foreground pr-8">{recipe.title}</h2>
                  </DialogPrimitive.Title>
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-accent/50 transition-colors"
                  >
                    <X className="w-5 h-5 text-foreground" />
                  </button>
                </div>
                
                <DialogPrimitive.Description asChild>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-muted-foreground">@{recipe.username}</span>
                      <Badge variant="default" className="bg-yellow-500 text-black hover:bg-yellow-600">
                        UMKM
                      </Badge>
                    </div>
                    
                    <p className="text-sm font-medium text-foreground">
                      Kisaran Harga: {recipe.priceRange}
                    </p>
                  </div>
                </DialogPrimitive.Description>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {/* Alat dan Bahan */}
                <div className="border border-border/50 rounded-lg overflow-hidden flex-shrink-0">
                  <div className="bg-accent/30 px-3 py-2 border-b border-border/50">
                    <h3 className="font-semibold text-sm text-foreground">Alat dan Bahan</h3>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    <div className="p-3 space-y-2">
                      {recipe.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground text-sm">•</span>
                          <p className="text-sm text-foreground">{ingredient}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cara Pembuatan */}
                <div className="border border-border/50 rounded-lg overflow-hidden flex-shrink-0">
                  <div className="bg-accent/30 px-3 py-2 border-b border-border/50">
                    <h3 className="font-semibold text-sm text-foreground">Cara Pembuatan</h3>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    <div className="p-3 space-y-3">
                      {recipe.instructions.map((instruction, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                            {index + 1}
                          </span>
                          <p className="text-sm text-foreground pt-0.5">{instruction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
