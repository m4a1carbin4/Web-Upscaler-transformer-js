/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/GlZoSOmg0Gw
 */
import { Button } from "@/components/ui/button"
import Imageupload from "./ImageControl";

export function UpscalerUI() {
  return (
    (<div className="flex flex-col items-center space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Image Upscaler</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Upload an image to upscale it</p>
      </div>
      <Imageupload/>
    </div>)
  );
}
