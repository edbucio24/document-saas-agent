import { serial , text,timestamp, varchar,integer,pgEnum} from 'drizzle-orm/pg-core'
import {pgTable} from 'drizzle-orm/pg-core'
export const userSystemEnum = pgEnum('user_system_enum',['system','user'])

export const chats = pgTable('Chats', {

    id: serial('id').primaryKey(),  //use only serial here bc this will allow neon to give a num/counter nd each new user is +1
    pdfName: text('pdf_name').notNull(),
    pdfUrl: text('pdf_url').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    clerkId: varchar('clerk_id', {length:256}).notNull(),
    fileKey:text('file_key').notNull()

});

export type DrizzleChat = typeof chats.$inferSelect

export const messages = pgTable('Messages',{

    id:serial('id').primaryKey(),
    chatId:integer('chat_id').references(()=>chats.id).notNull(),
    content:text('content').notNull(),
    createdAt:timestamp('created_at').notNull().defaultNow(),
    role:userSystemEnum('role').notNull()
})