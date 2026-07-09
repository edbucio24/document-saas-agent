'use client'
import React from  'react'
import {useDropzone} from 'react-dropzone'
import {Inbox, Loader2} from 'lucide-react'
//import { uploadToS3 } from '@/lib/db/s3'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'react-hot-toast';
import{useRouter} from 'next/navigation'

type Props = {}

const FileUpload = ()=> {
    const router = useRouter()

    const [uploading,setUploading] = React.useState(false)

    const {mutate, isPending} = useMutation({
        mutationFn: async({file_key,file_name}:{file_key:string,file_name:string}) => {
            const response = await axios.post('/api/create-chat',{file_key,file_name});
            return response.data;
        },
    });

    const {getRootProps, getInputProps} = useDropzone({
        accept:{'application/pdf':['.pdf']},
        maxFiles:1,
        onDrop: async (acceptedFiles)=>{
            console.log(acceptedFiles);
            const file = acceptedFiles[0]
            if(file.size >10 *1024*1024){
                toast.error("File too Large");
                return
            }
            try{
                setUploading(true)

                const formdata = new FormData();
                formdata.append('file', file);
                
                const response = await axios.post('/api/s3-upload', formdata, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const data = response.data;
                if(!data?.file_key|| !data.file_name){
                    toast.error("something went wrong")
                    return;
                }
                mutate(data,{
                    onSuccess : ({chat_id}) => {
                        toast.success("chat has been created")
                        router.push(`/chat/${chat_id}`)
                    },
                    onError:(error)=>{
                        toast.error("Error creating chat")
                    }
                })
            }catch(error){
                console.log(error);
            }finally{
                setUploading(false)
            }
        },
    });
    return(
        <div className="p-2 bg-white rounded-xl">
            <div {...getRootProps({
                className: 'border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col'
            })}>
                <input {...getInputProps()}/>
                {(uploading || isPending) ? (
                    <>
                    {/*loading state*/}
                    <Loader2 className='h-10 w-10 text-blue-500 animate-spin'/>
                    <p className='mt-2 text-sm text-slate-300'>
                        Spilling Tea to GPT...
                    </p>
                    </>
                ):(
                    <>
                    <Inbox className='w-10 h-10 text-blue-500'/>
                    <p className='mt-2 text-sm text-slate-500'>Drop PDF here</p>
                </>
                )}
            </div>
        </div>
    );
}

export default FileUpload;