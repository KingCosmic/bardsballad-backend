const z = require('zod')

function validateRegisterPost(username, email, password, deviceName) {
    const usernameValidation = z
        .string()
        .min(6, { message: "Username must be at least 6 characters." })
        .max(32, { message: "Username cannot exceed 32 characters." })
        .regex(
            /^[A-Za-z\d]{6,32}$/,
            "Username cannot contain special characters."
        );
    const emailValidation = z.string().email({ message: "Invalid email address." });
    const passwordValidation = z
        .string()
        .min(8, { message: "Password must be at least 8 characters long." })
        .max(256, { message: "Lamest DoS attack I've ever seen." })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
            message:
                "Password must contain lowercase, uppercase, number and a symbol.",
        });
    const deviceNameValidation = z
        .string()
        .max(32, { message: "Device Name cannot exceed 32 characters." })
    const registerSchema = z.object({
        username: usernameValidation,
        email: emailValidation,
        password: passwordValidation,
        deviceName: deviceNameValidation,
    });

    const registerPost = {
        username: username,
        email: email,
        password: password,
        deviceName: deviceName,
    }

    return registerSchema.safeParse(registerPost);
}

module.exports = validateRegisterPost;