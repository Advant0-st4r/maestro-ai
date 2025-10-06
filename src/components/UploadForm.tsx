import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

type UploadFormData = {
  file: FileList;
  context: string;
};

export const UploadForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<UploadFormData>();

  const fileList = watch("file");
  const selectedFile = fileList?.[0];

  const onSubmit = async (data: UploadFormData) => {
    const file = data.file[0];
    
    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size must be less than 100MB");
      return;
    }

    // Validate file type
    const validTypes = ["audio/mpeg", "audio/mp4", "audio/wav", "video/mp4"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid audio file (MP3, MP4, WAV)");
      return;
    }

    setIsLoading(true);
    
    try {
      // Stub API call - generate mock meeting ID
      const meetingId = uuidv4();
      
      // Mock upload processing
      console.log("Upload API called:", {
        meetingId,
        fileName: file.name,
        fileSize: file.size,
        context: data.context,
      });

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success("Meeting uploaded successfully!");
      navigate(`/verify/${meetingId}`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload meeting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="audio-file" className="text-sm font-medium">
          Audio File <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <input
            id="audio-file"
            type="file"
            accept=".mp3,.mp4,.wav,audio/mpeg,audio/mp4,audio/wav,video/mp4"
            {...register("file", { required: "Please select an audio file" })}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary-hover file:cursor-pointer file:transition-colors cursor-pointer"
            aria-label="Upload audio file"
          />
        </div>
        {selectedFile && (
          <p className="text-xs text-muted-foreground">
            Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
          </p>
        )}
        {errors.file && (
          <p className="text-sm text-destructive" role="alert">
            {errors.file.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="context" className="text-sm font-medium">
          Context Notes (Optional)
        </Label>
        <Textarea
          id="context"
          placeholder="E.g., Q4 focus, strategic planning meeting..."
          {...register("context")}
          className="min-h-[80px] resize-none"
          aria-label="Context notes for the meeting"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
        aria-label="Process meeting"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Process Meeting
          </>
        )}
      </Button>
    </form>
  );
};
