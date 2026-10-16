import { useRef, useState } from "react"
import type { UseFieldArrayReturn, UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import { ImagePlusIcon, Link2Icon, Loader2Icon, StarIcon, Trash2Icon } from "lucide-react"
import { ACCEPTED_IMAGE_TYPES, uploadImage } from "@/api/uploads"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { errorMessage } from "@/lib/errors"
import { cn } from "@/lib/utils"
import type { ProductFormValues } from "./ProductEditorPage"

interface ProductImagesCardProps {
  form: UseFormReturn<ProductFormValues>
  images: UseFieldArrayReturn<ProductFormValues, "images">
  editable: boolean
}

export function ProductImagesCard({ form, images, editable }: ProductImagesCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [url, setUrl] = useState("")
  const values = form.watch("images")
  const errors = form.formState.errors.images

  const upload = async (files: FileList | File[]) => {
    const list = [...files]
    if (!list.length) return
    setUploading((n) => n + list.length)
    await Promise.all(
      list.map(async (file) => {
        try {
          const { url } = await uploadImage(file)
          images.append({ imageUrl: url, altText: "" }, { shouldFocus: false })
        } catch (e) {
          toast.error(errorMessage(e))
        } finally {
          setUploading((n) => n - 1)
        }
      }),
    )
  }

  const addUrl = () => {
    const value = url.trim()
    if (!/^https?:\/\//.test(value)) {
      toast.error("Enter a full image URL starting with https://")
      return
    }
    images.append({ imageUrl: value, altText: "" }, { shouldFocus: false })
    setUrl("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Images</CardTitle>
        <CardDescription>The first image is the cover. JPG, PNG, WebP or AVIF up to 5 MB.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {(images.fields.length > 0 || uploading > 0) && (
          <ul className="grid grid-cols-2 gap-3">
            {images.fields.map((field, index) => (
              <li key={field.id} className="grid gap-1.5">
                <div className="group relative aspect-[4/5] overflow-hidden rounded-lg border bg-muted">
                  {values[index]?.imageUrl && (
                    <img
                      src={values[index].imageUrl}
                      alt={values[index].altText || `Product image ${index + 1}`}
                      className="size-full object-cover"
                    />
                  )}
                  {index === 0 && (
                    <span className="absolute top-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[0.65rem] font-medium text-white backdrop-blur">
                      Cover
                    </span>
                  )}
                  {editable && (
                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                      {index > 0 && (
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="secondary"
                          aria-label="Make cover image"
                          title="Make cover"
                          onClick={() => images.move(index, 0)}
                        >
                          <StarIcon />
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="secondary"
                        aria-label="Remove image"
                        title="Remove"
                        onClick={() => images.remove(index)}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  )}
                </div>
                <Input
                  placeholder="Alt text"
                  aria-label={`Alt text for image ${index + 1}`}
                  className="h-7 text-xs"
                  {...form.register(`images.${index}.altText`)}
                />
                {errors?.[index]?.imageUrl && (
                  <p className="text-xs text-destructive">{errors[index]?.imageUrl?.message}</p>
                )}
              </li>
            ))}
            {Array.from({ length: uploading }, (_, i) => (
              <li key={`uploading-${i}`} className="grid gap-1.5">
                <div className="flex aspect-[4/5] items-center justify-center rounded-lg border bg-muted">
                  <Loader2Icon className="size-5 animate-spin text-muted-foreground" aria-label="Uploading" />
                </div>
                <div className="h-7" />
              </li>
            ))}
          </ul>
        )}

        {editable && (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                upload(e.dataTransfer.files)
              }}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted/50",
                dragging && "border-brand bg-brand/5 text-foreground",
              )}
            >
              <ImagePlusIcon className="size-5" />
              <span>
                <span className="font-medium text-foreground">Click to upload</span> or drag images here
              </span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              multiple
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => {
                if (e.target.files) upload(e.target.files)
                e.target.value = ""
              }}
            />
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2Icon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addUrl()
                    }
                  }}
                  placeholder="Or paste an image URL"
                  aria-label="Image URL"
                  className="pl-8"
                />
              </div>
              <Button type="button" variant="outline" onClick={addUrl} disabled={!url.trim()}>
                Add
              </Button>
            </div>
          </>
        )}

        {!editable && images.fields.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">No images yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
