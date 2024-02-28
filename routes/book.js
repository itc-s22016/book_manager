import express from 'express';
import { PrismaClient}  from "@prisma/client";
import {router} from "express/lib/application.js";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/book/list?", async (req, res) => {
   try {
       const page = parseInt(req.query.page) || 1;
       const pageSize = 10;
       const skip = (page -1) * pageSize;

       const books = await prisma.book.findMany({
           skip,
           take: pageSize
       });

       const formattedBooks = books.map(book => ({
           id: book.id,
           title: book.title,
           author: book.auth,
           isRental: book.isRental,
           maxPage: book.maxPage
       }));

       res.status(200).json({ boos: formattedBooks });
   } catch (error) {
       console.error('Error fetching book list:', error);
       res.status(500).json({ message: 'Faild to fetch book list'});
   }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})

export default router;