import { GraduationCap } from "lucide-react"

export const AuthText = () => {
    return(
        <section className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 mb-4">
            <GraduationCap className="w-7 h-7 text-blue-600" />
          </div>

          <h1 className="text-xl font-semibold text-gray-900">Авторизация</h1>
          <p className="text-sm text-gray-500 text-center mt-1">
            Система управления анкетами абитуриентов
          </p>
        </section>
    )
}