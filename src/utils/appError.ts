 class AppError extends Error {
  name: string;
  
  
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
export default AppError;