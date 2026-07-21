import type { UserDocument } from '../models/User.js';
import type { UserResponseDto } from '../dtos/AuthDtos.js';

export function toUserResponse(user: UserDocument): UserResponseDto {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || 'customer',
    };
}