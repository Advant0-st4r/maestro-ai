import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, FileJson } from "lucide-react";

type ProfileFormData = {
  profileFile: FileList;
};

export const ProfileForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ProfileFormData>();

  const fileList = watch("profileFile");
  const selectedFile = fileList?.[0];

  const onSubmit = async (data: ProfileFormData) => {
    const file = data.profileFile[0];

    // Validate file type
    if (!file.name.endsWith(".json")) {
      toast.error("Please upload a valid JSON file");
      return;
    }

    setIsLoading(true);

    try {
      // Read and validate JSON
      const fileContent = await file.text();
      const profileData = JSON.parse(fileContent);

      // Mock API call
      console.log("Profile API called:", {
        profileData,
        fileName: file.name,
      });

      // Store in localStorage for demo
      localStorage.setItem("companyProfile", JSON.stringify(profileData));

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("Company profile uploaded successfully!");
      reset();
    } catch (error) {
      console.error("Profile upload error:", error);
      if (error instanceof SyntaxError) {
        toast.error("Invalid JSON format. Please check your file.");
      } else {
        toast.error("Failed to upload profile. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="profile-file" className="text-sm font-medium">
          Company Profile (JSON) <span className="text-destructive">*</span>
        </Label>
        <div className="text-xs text-muted-foreground mb-2">
          Example format: {`{"audience": "B2B tech", "strategy": "Q4 growth", "roles": {"Alice": "Exec"}}`}
        </div>
        <input
          id="profile-file"
          type="file"
          accept=".json,application/json"
          {...register("profileFile", { required: "Please select a JSON file" })}
          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 file:cursor-pointer file:transition-colors cursor-pointer"
          aria-label="Upload company profile JSON file"
        />
        {selectedFile && (
          <p className="text-xs text-muted-foreground">
            Selected: {selectedFile.name}
          </p>
        )}
        {errors.profileFile && (
          <p className="text-sm text-destructive" role="alert">
            {errors.profileFile.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        variant="secondary"
        className="w-full"
        aria-label="Upload profile"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <FileJson className="h-4 w-4" />
            Upload Profile
          </>
        )}
      </Button>
    </form>
  );
};
