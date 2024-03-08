'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button"
import Progress from './progress';

function Imageupload(){
    // Model loading
    const [ready, setReady] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const [progressItems, setProgressItems] = useState([]);

    // Inputs and outputs
    const [image, setImage] = useState('/Solid_black.png')

    const fileInput = useRef(null)
    const worker = useRef(null);

    const handleImage = async (e) =>{
        const file = e.target.files[0]
        if(!file) return

        const reader = new FileReader()

        reader.readAsDataURL(file)
        reader.onload = (e) => {
            if(reader.readyState === 2){
                setImage(e.target.result)
            }
        }
    }

    useEffect(() => {
        if (!worker.current) {
          // Create the worker if it does not yet exist.
          worker.current = new Worker(new URL('./worker.js', import.meta.url), {
              type: 'module'
          });
        }
    
        // Create a callback function for messages from the worker thread.
        const onMessageReceived = (e) => {
          switch (e.data.status) {
            case 'initiate':
              // Model file start load: add a new progress item to the list.
              setReady(false);
              setProgressItems(prev => [...prev, e.data]);
              break;
        
            case 'progress':
              // Model file progress: update one of the progress items.
              setProgressItems(
                prev => prev.map(item => {
                  if (item.file === e.data.file) {
                    return { ...item, progress: e.data.progress }
                  }
                  return item;
                })
              );
              break;
        
            case 'done':
              // Model file loaded: remove the progress item from the list.
              setProgressItems(
                prev => prev.filter(item => item.file !== e.data.file)
              );
              break;
        
            case 'ready':
              // Pipeline ready: the worker is ready to accept messages.
              setReady(true);
              break;
        
            case 'update':
              // Generation update: update the output text.
              setOutput(e.data.output);
              break;
        
            case 'complete':
              // Generation complete: re-enable the "Translate" button
              setDisabled(false);

              const canvas = document.createElement("canvas")
              canvas.width = e.data.output.width
              canvas.height = e.data.output.height
              var imageData = new ImageData(e.data.output.data,e.data.output.width,e.data.output.height)
              canvas.getContext('2d').putImageData(imageData,0,0);
              setImage(canvas.toDataURL())
              break;
          }
        };
    
        // Attach the callback function as an event listener.
        worker.current.addEventListener('message', onMessageReceived);
    
        // Define a cleanup function for when the component is unmounted.
        return () => worker.current.removeEventListener('message', onMessageReceived);
      });

    const upscale = () => {
        setDisabled(true);
        worker.current.postMessage(
            {
                image:image
            }
        )
    }

    return (
        <>
            <div className="w-full max-w-sm space-y-2">
                <div className="border-dashed border-2 border-gray-200 rounded-lg w-full p-4 flex items-center justify-center border-gray-300 dark:border-gray-800">
                    <div className="flex flex-col items-center space-y-2">
                        <ImageIcon className="w-12 h-12" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Drag and drop your image here</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">or</span>
                        <Button size="sm" onClick={ ()=> fileInput.current.click() }>Choose file</Button>
                        <input type="file" name="image_URL" id="input-file" accept='image/*'
		                    style={{ display : "none" }} ref={fileInput} onChange={handleImage} />
                    </div>
                </div>
            </div>
            <Button disabled={disabled} onClick={upscale}>Upscale 2x</Button>
            {progressItems.map(data => (
                <div key={data.file}>
                    <Progress text={data.file} percentage={data.progress} />
                </div>
            ))}
            <div className="mt-4">
                <img
                alt="Result Image"
                className="rounded-lg"
                //height={200}
                src={image}
                style={{
                    //aspectRatio: "300/200",
                    objectFit: "cover",
                }}
                //width={300} 
                />
            </div>
        </>
    );
}

function ImageIcon(props) {
    return (
      (<svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>)
    );
  }

export default Imageupload