import { AuthText } from "../components/authText"
import { AuthForm } from "../components/authForm"

export const Login = () => {
    return(
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
                <AuthText />
                <AuthForm /> 
            </div>
        </div>
    )
}