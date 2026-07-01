import { serial , text,timestamp, varchar} from 'drizzle-orm/pg-core'
import {pgTable} from 'drizzle-orm/pg-core'

export const chats = pgTable('Chats', {

    id: serial('id').primaryKey(),  //use only serial here bc this will allow neon to give a num/counter nd each new user is +1
    pdfName: text('pdf_name').notNull(),
    pdfUrl: text('pdf_url').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    userId: varchar('user_id', {length:256}).notNull(),
    foulKey:text('file+key').notNull()

})