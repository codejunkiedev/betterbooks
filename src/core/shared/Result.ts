export class Result<T> {
    private constructor(
        private readonly _isSuccess: boolean,
        private readonly _error?: string,
        private readonly _value?: T
    ) { }

    get isSuccess(): boolean {
        return this._isSuccess;
    }

    get isFailure(): boolean {
        return !this._isSuccess;
    }

    get error(): string {
        if (this._isSuccess) {
            throw new Error('Cannot get error from successful result');
        }
        return this._error!;
    }

    get value(): T {
        if (!this._isSuccess) {
            throw new Error('Cannot get value from failed result');
        }
        return this._value!;
    }

    static ok<U>(value?: U): Result<U> {
        return new Result<U>(true, undefined, value);
    }

    static fail<U>(error: string): Result<U> {
        return new Result<U>(false, error, undefined);
    }

    public onSuccess<U>(func: (value: T) => U): Result<U> {
        if (this.isFailure) {
            return Result.fail<U>(this.error);
        }
        try {
            const result = func(this.value);
            return Result.ok<U>(result);
        } catch (error) {
            return Result.fail<U>(`Error in success handler: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public onFailure<U>(func: (error: string) => U): Result<U> {
        if (this.isSuccess) {
            return Result.ok<U>(this.value as unknown as U);
        }
        try {
            const result = func(this.error);
            return Result.ok<U>(result);
        } catch (error) {
            return Result.fail<U>(`Error in failure handler: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 