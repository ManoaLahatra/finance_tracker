export type ErrorResponse = {
    error: {
        code: string;
        message: string;
        details?: string;
    };
};

export type SuccessResponse<T> = {
    data: T;
};
