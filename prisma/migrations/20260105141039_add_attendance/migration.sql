-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_userEmail_courseCode_date_key" ON "Attendance"("userEmail", "courseCode", "date");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
