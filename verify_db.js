const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
   console.log('Checking Environment...');
   console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);

   // Check User Model for language
   try {
      // We don't need a real user, just checking if valid syntax throws
      console.log('Checking User model schema...');
      // This will fail at runtime if 'language' is not in the generated client
      // We limit to 0 or 1.
      const user = await prisma.user.findFirst({
         select: { id: true, language: true }
      });
      console.log('User language field access: SUCCESS. Value:', user ? user.language : 'No user found');
   } catch (e) {
      console.error('User language field access: FAILED', e.message);
   }

   // Check Pasto Model for imgUrl/description
   try {
      console.log('Checking Pasto model schema...');
      const pasto = await prisma.pasto.findFirst({
         select: { codicePasto: true, imgUrl: true, description: true }
      });
      console.log('Pasto imgUrl/description access: SUCCESS.');
   } catch (e) {
      console.error('Pasto fields access: FAILED', e.message);
   }

   // Check Gemini API Connectivity
   try {
      console.log('Testing Gemini API connectivity...');
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });
      const parseResult = await model.generateContent("Hello, are you working?");
      const response = await parseResult.response;
      const text = response.text();
      console.log('Gemini API Response: SUCCESS. Length:', text.length);
   } catch (e) {
      console.error('Gemini API test: FAILED', e.message);
   }
}

main()
   .catch(e => console.error(e))
   .finally(async () => await prisma.$disconnect());
