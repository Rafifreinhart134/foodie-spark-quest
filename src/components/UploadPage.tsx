import { useState } from 'react';
import { Camera, Video, Image, MapPin, Tag, DollarSign, Clock, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const UploadPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [uploadType, setUploadType] = useState<'video' | 'photo' | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'resep' | 'hidden_gem' | 'tips' | ''>('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [budget, setBudget] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [location, setLocation] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload content",
        variant: "destructive"
      });
      return;
    }

    if (!selectedFile || !title || !selectedCategory) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const bucketName = uploadType === 'video' ? 'videos' : 'thumbnails';

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      // Create video record
      const videoData = {
        user_id: user.id,
        title,
        description,
        category: selectedCategory as 'resep' | 'hidden_gem' | 'tips',
        tags,
        budget: budget || null,
        cooking_time: cookingTime || null,
        location: location || null,
        is_public: true,
        ...(uploadType === 'video' 
          ? { video_url: publicUrl }
          : { thumbnail_url: publicUrl }
        )
      };

      const { error: insertError } = await supabase
        .from('videos')
        .insert(videoData);

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Upload successful!",
        description: "Your content has been uploaded successfully",
      });

      // Reset form
      setUploadType(null);
      setTitle('');
      setDescription('');
      setSelectedCategory('');
      setTags([]);
      setBudget('');
      setCookingTime('');
      setLocation('');
      setSelectedFile(null);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload content",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
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
                {selectedFile ? (
                  <>
                    <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium mb-2">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      File selected ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                    <Button variant="outline" onClick={() => setSelectedFile(null)}>
                      Change File
                    </Button>
                  </>
                ) : (
                  <>
                    <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      {uploadType === 'video' ? 'Upload video (max 50MB)' : 'Upload foto (max 10MB)'}
                    </p>
                    <input
                      type="file"
                      accept={uploadType === 'video' ? 'video/*' : 'image/*'}
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button variant="outline" asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Pilih {uploadType === 'video' ? 'Video' : 'Foto'}
                      </label>
                    </Button>
                  </>
                )}
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
                    onClick={() => setSelectedCategory(category.id as 'resep' | 'hidden_gem' | 'tips')}
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
                disabled={isUploading || !selectedFile || !title || !selectedCategory}
              >
                {isUploading ? 'Uploading...' : 'Upload Konten'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadPage;