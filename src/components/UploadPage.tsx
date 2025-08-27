import { useState } from 'react';
import { Camera, Video, Image, MapPin, Tag, DollarSign, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const UploadPage = () => {
  const [uploadType, setUploadType] = useState<'video' | 'photo' | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [budget, setBudget] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [location, setLocation] = useState('');

  const categories = [
    { id: 'resep', name: 'Resep', emoji: '👨‍🍳', color: 'bg-food-orange' },
    { id: 'hidden_gem', name: 'Hidden Gem', emoji: '💎', color: 'bg-food-yellow' },
    { id: 'tips', name: 'Tips Dapur', emoji: '💡', color: 'bg-food-green' },
  ];

  const budgetOptions = [
    'Under Rp 10k',
    'Rp 10k - 25k',
    'Rp 25k - 50k',
    'Above Rp 50k'
  ];

  const timeOptions = [
    'Under 15 menit',
    '15 - 30 menit',
    '30 - 60 menit',
    'Above 1 jam'
  ];

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    // Here would be Supabase integration
    console.log('Upload data:', {
      type: uploadType,
      title,
      description,
      category: selectedCategory,
      tags,
      budget,
      cookingTime,
      location
    });
  };

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
          Upload Konten
        </h1>
        <p className="text-muted-foreground">Bagikan resep dan tempat favorit kamu!</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Upload Type Selection */}
        {!uploadType && (
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 text-center">Pilih Tipe Konten</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col space-y-2 hover:gradient-primary hover:text-white transition-all"
                onClick={() => setUploadType('video')}
              >
                <Video className="w-8 h-8" />
                <span>Video</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col space-y-2 hover:gradient-primary hover:text-white transition-all"
                onClick={() => setUploadType('photo')}
              >
                <Image className="w-8 h-8" />
                <span>Foto</span>
              </Button>
            </div>
          </Card>
        )}

        {/* Upload Form */}
        {uploadType && (
          <>
            {/* Media Upload Area */}
            <Card className="p-6">
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  {uploadType === 'video' ? 'Upload video (max 1 menit)' : 'Upload foto'}
                </p>
                <Button variant="outline">
                  Pilih {uploadType === 'video' ? 'Video' : 'Foto'}
                </Button>
              </div>
            </Card>

            {/* Category Selection */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Kategori</h3>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className={`h-16 flex flex-col space-y-1 ${
                      selectedCategory === category.id ? 'gradient-primary text-white' : ''
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <span className="text-xl">{category.emoji}</span>
                    <span className="text-xs">{category.name}</span>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Content Details */}
            <Card className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Judul</label>
                <Input
                  placeholder="Judul konten kamu..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Deskripsi</label>
                <Textarea
                  placeholder="Ceritakan tentang makanan atau tempat ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Tags
                </label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    placeholder="Tambah tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} variant="outline">
                    Tambah
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                      #{tag}
                      <X 
                        className="w-3 h-3 ml-1" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Budget & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Budget
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Pilih budget</option>
                    {budgetOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Waktu
                  </label>
                  <select
                    value={cookingTime}
                    onChange={(e) => setCookingTime(e.target.value)}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Pilih waktu</option>
                    {timeOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Lokasi (opsional)
                </label>
                <Input
                  placeholder="Nama tempat atau alamat..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </Card>

            {/* Submit Button */}
            <div className="sticky bottom-20 p-4">
              <Button 
                className="w-full h-12 gradient-primary text-white font-semibold shadow-glow"
                onClick={handleSubmit}
              >
                Upload Konten
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadPage;