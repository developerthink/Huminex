"use client"

import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useFileUpload } from "@/hooks/use-file-upload"
import { Button } from "@/components/ui/button"

export default function FileUpload({
  title,
  onChange,
  initialImage
}: {
  title: string;
  onChange?: (file: File | null) => void;
  initialImage?: string;
}) {
  const maxSizeMB = 5
  const maxSize = maxSizeMB * 1024 * 1024 // 5MB
  const [initialPreview, setInitialPreview] = useState<string | null>(null)

  useEffect(() => {
    if (initialImage) {
      setInitialPreview(initialImage);
    }
  }, [initialImage]);

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
    maxSize,
    onFilesChange: (files) => {
      if (onChange) {
        onChange(files[0]?.file instanceof File ? files[0].file : null);
      }
      // When a new file is uploaded, clear the initial preview
      if (files.length > 0) {
        setInitialPreview(null);
      }
    }
  })
  
  const previewUrl = files[0]?.preview || initialPreview || null
  const fileName = files[0]?.file.name || null

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="relative w-full">
        {/* Drop area */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          className="border-primary/50 w-full data-[dragging=true]:bg-accent/50 has-[input:focus]:border-primary has-[input:focus]:ring-primary/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-[input:focus]:ring-[3px]"
        >
          <input
            {...getInputProps()}
            className="sr-only"
            aria-label="Upload image file"
          />
          {previewUrl ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="relative w-full h-full">
                <img
                  src={previewUrl}
                  alt={files[0]?.file?.name || "Uploaded image"}
                  className="mx-auto max-h-full rounded object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true"
              >
                <ImageIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-1.5  text-lg font-medium">{title}</p>
              <p className="text-muted-foreground text-xs">
                SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openFileDialog();
                }}
              >
                <UploadIcon
                  className="-ms-1 size-4 opacity-60"
                  aria-hidden="true"
                />
                Select image
              </Button>
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
              onClick={(e) => {
                // Prevent event propagation to stop form submission
                e.preventDefault();
                e.stopPropagation();
                
                if (files.length > 0) {
                  removeFile(files[0]?.id);
                } else {
                  // If there's an initial preview but no files, clear the initial preview
                  setInitialPreview(null);
                  if (onChange) {
                    onChange(null);
                  }
                }
              }}
              aria-label="Remove image"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}

    </div>
  )
}
