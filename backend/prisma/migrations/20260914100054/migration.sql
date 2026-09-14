/*
  Warnings:

  - You are about to drop the column `links` on the `ContactInfo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[profileId,name]` on the table `Skill` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "LinkType" AS ENUM ('LINKEDIN', 'GITHUB', 'PORTFOLIO', 'FACEBOOK', 'TWITTER', 'OTHER');

-- AlterTable
ALTER TABLE "ContactInfo" DROP COLUMN "links";

-- CreateTable
CREATE TABLE "ProfileLink" (
    "id" TEXT NOT NULL,
    "type" "LinkType" NOT NULL,
    "url" TEXT NOT NULL,
    "contactInfoId" TEXT NOT NULL,

    CONSTRAINT "ProfileLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfileLink_contactInfoId_type_key" ON "ProfileLink"("contactInfoId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_profileId_name_key" ON "Skill"("profileId", "name");

-- AddForeignKey
ALTER TABLE "ProfileLink" ADD CONSTRAINT "ProfileLink_contactInfoId_fkey" FOREIGN KEY ("contactInfoId") REFERENCES "ContactInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
