-- CreateTable
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" SERIAL NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "appointmentId" INTEGER,

    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Slot_dateFrom_key" ON "Slot"("dateFrom");

-- CreateIndex
CREATE UNIQUE INDEX "Slot_dateTo_key" ON "Slot"("dateTo");

-- CreateIndex
CREATE UNIQUE INDEX "Slot_appointmentId_key" ON "Slot"("appointmentId");

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
