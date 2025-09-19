export interface OnboardingErrorInfo {
    title: string;
    message: string;
}

export const formatOnboardingError = (error: Error): OnboardingErrorInfo => {
    const defaultError: OnboardingErrorInfo = {
        title: "Setup Failed",
        message: "We encountered an issue while setting up your company. Please try again or contact support if the problem persists."
    };

    if (!error.message) {
        return defaultError;
    }

    const errorMessage = error.message.toLowerCase();

    // CNIC/NTN already registered
    if (errorMessage.includes("cnic/ntn") && errorMessage.includes("already registered")) {
        return {
            title: "CNIC/NTN Already Registered",
            message: "This CNIC/NTN number is already registered with another account. Please use a different CNIC/NTN or contact support if this is an error."
        };
    }

    // Opening balance errors
    if (errorMessage.includes("opening balance")) {
        if (errorMessage.includes("greater than 0")) {
            return {
                title: "Invalid Opening Balance",
                message: "Opening balance must be greater than 0. Please enter a valid amount."
            };
        } else if (errorMessage.includes("future")) {
            return {
                title: "Invalid Opening Balance",
                message: "Opening balance date cannot be in the future. Please select a valid date."
            };
        } else {
            return {
                title: "Invalid Opening Balance",
                message: "Please check your opening balance details and try again."
            };
        }
    }

    // Business activity errors
    if (errorMessage.includes("business activity")) {
        return {
            title: "Invalid Business Activity",
            message: "The selected business activity is not valid. Please select a different business activity and try again."
        };
    }

    // Network/connection errors
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        return {
            title: "Connection Error",
            message: "Unable to connect to our servers. Please check your internet connection and try again."
        };
    }

    // Permission/authorization errors
    if (errorMessage.includes("permission") || errorMessage.includes("unauthorized")) {
        return {
            title: "Access Denied",
            message: "You don't have permission to perform this action. Please contact support if you believe this is an error."
        };
    }

    // Timeout errors
    if (errorMessage.includes("timeout")) {
        return {
            title: "Request Timeout",
            message: "The request took too long to complete. Please try again."
        };
    }

    // Missing FBR data errors
    if (errorMessage.includes("missing required fbr profile data")) {
        return {
            title: "Missing FBR Information",
            message: "FBR profile information is required. Please complete the FBR profile section."
        };
    }

    // Company name/type errors
    if (errorMessage.includes("company name and type are required")) {
        return {
            title: "Missing Company Information",
            message: "Company name and type are required. Please complete the company information section."
        };
    }

    // FBR profile data errors
    if (errorMessage.includes("fbr profile data is required")) {
        return {
            title: "Missing FBR Information",
            message: "FBR profile information is required. Please complete the FBR profile section."
        };
    }

    // Account not found errors
    if (errorMessage.includes("account not found")) {
        return {
            title: "System Error",
            message: "There was an issue with the account setup. Please contact support for assistance."
        };
    }

    // Onboarding function errors
    if (errorMessage.includes("onboarding failed")) {
        return {
            title: "Setup Failed",
            message: error.message.replace("Onboarding failed: ", "")
        };
    }

    // Default case - return the original error
    return defaultError;
};
