import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[70vh] bg-background/95 backdrop-blur-md p-0 gap-0 border-border/50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-xl font-semibold text-foreground pr-8">{recipe.title}</h2>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-accent/50 transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            
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

          {/* Scrollable Content */}
          <div className="flex-1 overflow-hidden p-4 space-y-4">
            {/* Alat dan Bahan */}
            <div className="border border-border/50 rounded-lg overflow-hidden">
              <div className="bg-accent/30 px-3 py-2 border-b border-border/50">
                <h3 className="font-semibold text-sm text-foreground">Alat dan Bahan</h3>
              </div>
              <ScrollArea className="h-32">
                <div className="p-3 space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground text-sm">•</span>
                      <p className="text-sm text-foreground">{ingredient}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Cara Pembuatan */}
            <div className="border border-border/50 rounded-lg overflow-hidden">
              <div className="bg-accent/30 px-3 py-2 border-b border-border/50">
                <h3 className="font-semibold text-sm text-foreground">Cara Pembuatan</h3>
              </div>
              <ScrollArea className="h-32">
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
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
