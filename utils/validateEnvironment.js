const { z } = require('zod');

const EnvSchema = z.object({
    DATABASE_URL: z.string().min(1),

    MYSQL_DATABASE: z.string().min(1),
    MYSQL_ROOT_PASSWORD: z.string().min(1),

    JWT_ACCESS_SECRET: z.string().min(1),
    JWT_ACCESS_EXPIRES_IN: z.string().min(1),

    API_KEY_PREFIX: z.string().min(1),
    API_KEY_EXPIRES_IN: z.coerce.number(),
    API_KEY_RENEW_THRESHOLD: z.coerce.number(),

    SNOWFLAKE_INSTANCE_ID: z.coerce.number().min(0).max(4095),
    APP_LISTEN_IP: z.union([z.literal('localhost'), z.string().ip()]),
})

if (!EnvSchema.safeParse(process.env).success) {
    console.log('Environment variables are not valid. Did you copy the .env.example file?')
    console.log('Please check your .env file and try again. Exiting application.')
    process.exit(1)
} else if (process.env.SNOWFLAKE_INSTANCE_ID === '0') {
    console.log('Snowflake instance ID is set to 0. This is recommended only for testing purposes.')
    console.log('On productions servers, this should be set to a value between 1 and 4095.')
}