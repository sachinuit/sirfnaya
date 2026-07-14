import { env } from "./config/env.js";
import { app } from "./app.js";

const start = async () => {
    try {
        app.listen(env.PORT, () => {
            console.log(`API server running on port ${env.PORT}`);
            console.log(`Environment: ${env.NODE_ENV}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

start();
