'use client'

import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false;
env.useBrowserCache = false;

class MyUpscalePipeline {
    static task = 'image-to-image';
    static model = 'Xenova/swin2SR-classical-sr-x2-64';
    static instance = null;

    static async getInstance(progress_callback = null){
        if (this.instance === null){
            this.instance = pipeline(this.task,this.model,{progress_callback});
        }

        return this.instance;
    }
    
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    // Retrieve the translation pipeline. When called for the first time,
    // this will load the pipeline and save it for future use.
    let upscaler = await MyUpscalePipeline.getInstance(x => {
        // We also add a progress callback to the pipeline so that we can
        // track model loading.
        self.postMessage(x);
    });
  
    // Actually perform the translation
    let output = await upscaler(event.data.image);
  
    // Send the output back to the main thread
    self.postMessage({
        status: 'complete',
        output: output.rgba(),
    });
  });