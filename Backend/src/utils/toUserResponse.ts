import type { UserDocument } from '../models/User.js';
import type { UserResponseDto } from '../dtos/AuthDtos.js';

export function toUserResponse(user: UserDocument): UserResponseDto {
    return {
        id: user._id.toString(),
        // username: user.username,
        email: user.email,
        phone: user.phone,
    };
}