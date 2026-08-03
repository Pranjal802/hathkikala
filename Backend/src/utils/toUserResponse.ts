import type { UserDocument } from '../models/User.js';
import type { UserResponseDto } from '../dtos/AuthDtos.js';

export function toUserResponse(user: UserDocument): UserResponseDto {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || 'customer',
        addresses: (user.addresses || []).map((a: any) => ({
            id: a._id ? a._id.toString() : undefined,
            label: a.label || 'Home',
            fullName: a.fullName,
            phone: a.phone,
            line1: a.line1,
            line2: a.line2 || '',
            city: a.city,
            state: a.state,
            postalCode: a.postalCode,
            country: a.country || 'India',
            isDefault: Boolean(a.isDefault),
        })),
    };
}