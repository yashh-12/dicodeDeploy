class apiResponse {
    constructor(status, data, message) {
        this.message = message;
        this.status = status;
        this.data = data;
        this.success = this.status <= 205;
    }
}

export default apiResponse