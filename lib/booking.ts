import { prisma } from "@/lib/prisma"
import type { CardBrand } from "@/lib/payments"

export interface CheckoutSeat {
  seat: string
  number?: string
  name?: string
  gender?: "male" | "female" | "MALE" | "FEMALE"
  idNumber?: string
  phone?: string
}

export async function createPaidBooking({
  tripId,
  userId,
  seats,
  paymentMethod,
  paymentReference,
}: {
  tripId: string
  userId: string
  seats: CheckoutSeat[]
  paymentMethod: CardBrand
  paymentReference: string
}) {
  const normalizedSeats = seats.map((seat) => ({
    ...seat,
    number: seat.number || seat.seat,
  }))

  if (normalizedSeats.length === 0) {
    throw new Error("Select at least one seat")
  }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { route: true, bus: true },
  })

  if (!trip) {
    throw new Error("Trip not found")
  }

  const seatNumbers = normalizedSeats.map((seat) => seat.number)
  const bookedSeats = await prisma.ticket.findMany({
    where: {
      seatNumber: { in: seatNumbers },
      booking: {
        tripId,
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
    },
    select: { seatNumber: true },
  })

  if (bookedSeats.length > 0) {
    throw new Error(`Seat ${bookedSeats[0].seatNumber} is already booked`)
  }

  const serviceFee = 150
  const totalAmount = normalizedSeats.length * trip.basePrice + serviceFee

  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({
      data: {
        tripId,
        userId,
        totalAmount,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        payment: {
          create: {
            amount: totalAmount,
            method: paymentMethod,
            stripePaymentId: paymentReference,
            status: "PAID",
          },
        },
      },
      include: {
        trip: {
          include: {
            route: true,
            bus: true,
          },
        },
        tickets: true,
      },
    })

    await tx.ticket.createMany({
      data: normalizedSeats.map((seat) => ({
        bookingId: booking.id,
        seatNumber: seat.number,
        passengerName: seat.name?.trim() || "Passenger",
        passengerGender: seat.gender ? seat.gender.toUpperCase() as "MALE" | "FEMALE" : null,
        price: trip.basePrice,
        qrCode: `${booking.id}-${seat.number}-${crypto.randomUUID()}`,
        status: "VALID",
      })),
    })

    return tx.booking.findUniqueOrThrow({
      where: { id: booking.id },
      include: {
        trip: {
          include: {
            route: true,
            bus: true,
          },
        },
        tickets: true,
      },
    })
  })
}
