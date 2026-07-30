import { db } from '@/lib/db'
import { chats } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server"
import { LogIn } from "lucide-react";
import Link from "next/link";
import FileUpload from '../components/ui/FileUpload'

export default async function Home() {
  const { userId } = await auth()
  const isAuth = !!userId

  let firstChat = null
  if (userId) {
    const userChats = await db.select().from(chats).where(eq(chats.clerkId, userId)).orderBy(desc(chats.createdAt))
    if (userChats.length > 0) {
      firstChat = userChats[0]
    }
  }

  return (
    <div className=" w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
              <h1 className = "mr-3 text-5xl font-bold">Chat with any Document</h1>
              <UserButton />       
          </div>

          <div className="flex mt-2">
            {isAuth && firstChat && (
              <Link href={`/chat/${firstChat.id}`}>
                <Button>Go to Chats</Button>
              </Link>
            )}
          </div>

            <p className="max-w-xl mt-2 text-lg text-slate-600">
              Join millions of students, researchers, and professionals to instantly answer questions and understand research with AI.
            </p>

            <div className="w-full mt-5">
              {isAuth ? 
              (
                <FileUpload/>
              ):(
                <Link href='/sign-in'>
                  <Button>Login to get started!
                    <LogIn className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                )}
            </div>

        </div>
      </div>
    </div>
  );
}