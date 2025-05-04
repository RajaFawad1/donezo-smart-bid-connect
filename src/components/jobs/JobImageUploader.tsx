import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { JobImage } from '@/types';
import { Loader2, Upload, XCircle, ImageIcon } from 'lucide-react';

interface JobImageUploaderProps {
  contractId: string;
  imageType: 'before' | 'after';
  existingImages?: JobImage[];
  onImagesUpdated?: () => void;
}

const JobImageUploader = ({ 
  contractId, 
  imageType,
  existingImages = [],
  onImagesUpdated 
}: JobImageUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [descriptions, setDescriptions] = useState<{[key: number]: string}>({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to Array
      const selectedFiles = Array.from(e.target.files);
      
      // Check file sizes (limit to 5MB)
      const validFiles = selectedFiles.filter(file => file.size <= 5 * 1024 * 1024);
      
      if (validFiles.length !== selectedFiles.length) {
        toast({
          title: "File size error",
          description: "Some files exceed the 5MB size limit and were excluded",
          variant: "destructive",
        });
      }
      
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  };

  const handleDescriptionChange = (index: number, value: string) => {
    setDescriptions(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    const newDescriptions = {...descriptions};
    delete newDescriptions[index];
    setDescriptions(newDescriptions);
  };

  const uploadImages = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadError(null);
    
    try {
      // 1. Upload each file to Supabase Storage
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${contractId}_${Date.now()}_${index}.${fileExt}`;
        const filePath = `job-images/${fileName}`;
        
        // Upload file to storage
        const { data: storageData, error: storageError } = await supabase
          .storage
          .from('job-images')
          .upload(filePath, file);
        
        if (storageError) throw storageError;
        
        // Get public URL for the file
        const { data: urlData } = supabase
          .storage
          .from('job-images')
          .getPublicUrl(filePath);
        
        const imageUrl = urlData.publicUrl;
        
        // Create record in job_images table
        const { data: imageData, error: imageError } = await supabase
          .from('job_images')
          .insert({
            contract_id: contractId,
            image_url: imageUrl,
            image_type: imageType,
            description: descriptions[index] || null
          })
          .select()
          .single();
        
        if (imageError) throw imageError;
        
        return imageData;
      });
      
      await Promise.all(uploadPromises);
      
      toast({
        title: "Images uploaded",
        description: `Successfully uploaded ${files.length} images`,
      });
      
      // Clear form
      setFiles([]);
      setDescriptions({});
      
      // Notify parent component to refresh
      if (onImagesUpdated) {
        onImagesUpdated();
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadError('Failed to upload one or more images. Please try again.');
      
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {imageType === 'before' ? 'Before Job' : 'After Completion'} Photos
        </CardTitle>
        <CardDescription>
          {imageType === 'before' ? 
            'Upload photos showing the condition before starting work' : 
            'Upload photos showing the completed work'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Existing images */}
        {existingImages.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Uploaded images:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {existingImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img 
                    src={image.image_url} 
                    alt={image.description || `Job ${imageType} image`}
                    className="h-24 w-full object-cover rounded-md"
                  />
                  {image.description && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-1 text-xs">
                      {image.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* File input */}
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor={`${imageType}-image`}>Add images</Label>
            <Input
              id={`${imageType}-image`}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
          
          {/* Preview selected files */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Selected files:</h4>
              {files.map((file, index) => (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <ImageIcon className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <Label htmlFor={`description-${index}`} className="text-xs">Description (optional)</Label>
                    <Textarea
                      id={`description-${index}`}
                      placeholder="Describe what's shown in this image"
                      value={descriptions[index] || ''}
                      onChange={(e) => handleDescriptionChange(index, e.target.value)}
                      className="h-16 mt-1"
                      disabled={uploading}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {uploadError && (
            <div className="text-red-500 text-sm">{uploadError}</div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        {files.length > 0 && (
          <Button onClick={uploadImages} disabled={uploading} className="w-full">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {files.length} {files.length === 1 ? 'image' : 'images'}
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default JobImageUploader;
