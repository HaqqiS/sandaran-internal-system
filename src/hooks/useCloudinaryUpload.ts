import imageCompression from "browser-image-compression"
import { useState } from "react"
import { api } from "~/trpc/react"

interface UploadOptions {
  projectSlug: string
  type: "reports" | "documents" | "emergency"
  maxSizeMB?: number
  maxWidthOrHeight?: number
  resourceType?: "auto" | "image" | "video" | "raw"
}

interface UploadResult {
  publicId: string
  secureUrl: string
  width: number
  height: number
  format: string
  bytes: number
  resourceType: string
}

interface UploadState {
  isCompressing: boolean
  isUploading: boolean
  progress: number
  error: string | null
}

export function useCloudinaryUpload() {
  const [state, setState] = useState<UploadState>({
    isCompressing: false,
    isUploading: false,
    progress: 0,
    error: null,
  })

  const getSignedParams = api.upload.getSignedUploadParams.useMutation()
  const deleteAsset = api.upload.deleteAsset.useMutation()

  const upload = async (
    file: File,
    options: UploadOptions,
  ): Promise<UploadResult> => {
    setState({
      isCompressing: true,
      isUploading: false,
      progress: 10,
      error: null,
    })

    try {
      // 1. Compress image if it's an image file
      let fileToUpload: File | Blob = file
      if (file.type.startsWith("image/")) {
        fileToUpload = await imageCompression(file, {
          maxSizeMB: options.maxSizeMB ?? 5,
          maxWidthOrHeight: options.maxWidthOrHeight ?? 2048,
          useWebWorker: true,
          fileType: "image/webp",
        })
      }

      setState((prev) => ({
        ...prev,
        isCompressing: false,
        isUploading: true,
        progress: 30,
      }))

      // 2. Get signed params from server
      const params = await getSignedParams.mutateAsync({
        projectSlug: options.projectSlug,
        type: options.type,
      })

      setState((prev) => ({ ...prev, progress: 50 }))

      // 3. Upload to Cloudinary
      const formData = new FormData()
      formData.append("file", fileToUpload)
      formData.append("api_key", params.apiKey)
      formData.append("timestamp", params.timestamp.toString())
      formData.append("signature", params.signature)
      formData.append("folder", params.folder)
      formData.append("type", "authenticated")
      formData.append("use_filename", "false")
      formData.append("unique_filename", "true")

      const resourceType = options.resourceType ?? "auto"

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${params.cloudName}/${resourceType}/upload`,
        { method: "POST", body: formData },
      )

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      setState((prev) => ({ ...prev, progress: 100 }))

      const data = await response.json()
      console.log("🔍 Cloudinary response:", data)

      return {
        publicId: data.public_id,
        secureUrl: data.secure_url,
        width: data.width,
        height: data.height,
        format: data.format,
        bytes: data.bytes,
        resourceType: data.resource_type,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed"
      setState((prev) => ({ ...prev, error: message }))
      throw error
    } finally {
      setState((prev) => ({
        ...prev,
        isCompressing: false,
        isUploading: false,
      }))
    }
  }

  const remove = async (publicId: string) => {
    return deleteAsset.mutateAsync({ publicId })
  }

  const reset = () => {
    setState({
      isCompressing: false,
      isUploading: false,
      progress: 0,
      error: null,
    })
  }

  return {
    upload,
    remove,
    reset,
    ...state,
    isLoading: state.isCompressing || state.isUploading,
  }
}
