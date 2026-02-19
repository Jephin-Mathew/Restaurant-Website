/*
  Warnings:

  - A unique constraint covering the columns `[dayOfWeek]` on the table `OpeningHour` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Reservation` ADD COLUMN `email` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `MenuItem_categoryId_sortOrder_idx` ON `MenuItem`(`categoryId`, `sortOrder`);

-- CreateIndex
CREATE UNIQUE INDEX `OpeningHour_dayOfWeek_key` ON `OpeningHour`(`dayOfWeek`);
