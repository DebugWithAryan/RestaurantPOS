import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validateEmail, validatePhoneNumber, slugify } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, restaurantName, address } = body;

    // Validation
    if (!name || !email || !password || !restaurantName) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (phone && !validatePhoneNumber(phone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and restaurant in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: new Date(), // Auto-verify for demo
          isActive: true,
        },
      });

      // Create restaurant
      const restaurant = await tx.restaurant.create({
        data: {
          name: restaurantName,
          slug: slugify(restaurantName),
          description: 'A new restaurant',
          address: address || 'Address not provided',
          phone: phone || '+91 0000000000',
          email,
          theme: {
            primaryColor: '#f97316',
            secondaryColor: '#22c55e',
            accentColor: '#ef4444',
            fontFamily: 'Inter',
          },
          settings: {
            allowSplitBilling: true,
            acceptCash: true,
            acceptUPI: true,
            acceptCards: true,
            enableLoyalty: true,
            enableFeedback: true,
            autoAcceptOrders: false,
            requireTableConfirmation: true,
            taxRate: 18,
            serviceCharge: 5,
            currency: 'INR',
            timezone: 'Asia/Kolkata',
            workingHours: {
              monday: { isOpen: true, openTime: '10:00', closeTime: '22:00' },
              tuesday: { isOpen: true, openTime: '10:00', closeTime: '22:00' },
              wednesday: { isOpen: true, openTime: '10:00', closeTime: '22:00' },
              thursday: { isOpen: true, openTime: '10:00', closeTime: '22:00' },
              friday: { isOpen: true, openTime: '10:00', closeTime: '23:00' },
              saturday: { isOpen: true, openTime: '10:00', closeTime: '23:00' },
              sunday: { isOpen: true, openTime: '11:00', closeTime: '22:00' },
            },
            notificationSettings: {
              email: true,
              sms: true,
              whatsapp: false,
              push: true,
              orderNotifications: true,
              paymentNotifications: true,
              feedbackNotifications: true,
            },
          },
          isActive: true,
          ownerId: user.id,
        },
      });

      // Update user with restaurant ID
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { restaurantId: restaurant.id },
      });

      return { user: updatedUser, restaurant };
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        restaurantId: result.restaurant.id,
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          restaurantId: result.restaurant.id,
        },
        restaurant: {
          id: result.restaurant.id,
          name: result.restaurant.name,
          slug: result.restaurant.slug,
        },
        token,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create account' },
      { status: 500 }
    );
  }
}
