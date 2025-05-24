class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
        super(message)
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        this.data = null

        // Sending stack with excluding this class as Error
        if (stack) {
            this.stack = stack
        }
        else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }