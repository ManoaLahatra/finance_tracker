type ApiResponse = {
    status: (statusCode: number) => {
        send: (body: string) => void;
    };
};

export default function handler(_request: unknown, response: ApiResponse) {
    response.status(200).send('Welcome to the API!');
}
