-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "usernameId" INTEGER;

-- AlterTable
ALTER TABLE "Username" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Username_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_usernameId_fkey" FOREIGN KEY ("usernameId") REFERENCES "Username"("id") ON DELETE SET NULL ON UPDATE CASCADE;
