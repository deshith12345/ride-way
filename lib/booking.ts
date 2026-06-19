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

export class BookingInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "BookingInputError"
  }
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
    number: String(seat.number || seat.seat || "").trim(),
    name: seat.name?.trim(),
    phone: seat.phone?.trim(),
  }))

  if (normalizedSeats.length === 0) {
    throw new BookingInputError("Select at least one seat")
  }

  if (normalizedSeats.length > 5) {
    throw new BookingInputError("You can book up to 5 seats at a time")
  }

  if (normalizedSeats.some((seat) => !seat.number || !/^\d+$/.test(seat.number))) {
    throw new BookingInputError("Invalid seat selection")
  }

  const uniqueSeatNumbers = new Set(normalizedSeats.map((seat) => seat.number))
  if (uniqueSeatNumbers.size !== normalizedSeats.length) {
    throw new BookingInputError("Duplicate seats are not allowed")
  }

  if (normalizedSeats.some((seat) => !seat.name || !seat.phone)) {
    throw new BookingInputError("Passenger name and phone are required for every seat")
  }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { route: true, bus: true },
  })

  if (!trip) {
    throw new BookingInputError("Trip not found")
  }

  if (trip.status !== "SCHEDULED") {
    throw new BookingInputError("This trip is not open for booking")
  }

  if (trip.departureTime <= new Date()) {
    throw new BookingInputError("This trip has already departed")
  }

  const invalidSeat = normalizedSeats.find((seat) => {
    const seatNumber = Number(seat.number)
    return seatNumber < 1 || seatNumber > trip.bus.totalSeats
  })

  if (invalidSeat) {
    throw new BookingInputError(`Seat ${invalidSeat.number} is not available on this bus`)
  }

  const seatNumbers = normalizedSeats.map((seat) => seat.number)
  const bookedSeats = await prisma.ticket.findMany({
    where: {
      seatNumber: { in: seatNumbers },
      status: { in: ["VALID", "USED"] },
      booking: {
        tripId,
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
    },
    select: { seatNumber: true },
  })

  if (bookedSeats.length > 0) {
    throw new BookingInputError(`Seat ${bookedSeats[0].seatNumber} is already booked`)
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
        passengerName: seat.name || "Passenger",
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
