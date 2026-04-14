import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react"
import { getCurrentUser } from "../api/userAPI"
import type { UserProfile } from "../types/user"

const AUTH_TOKEN_KEY = "extra_token"

interface AuthContextValue {
    token: string | null
    user: UserProfile | null
    isAuthLoading: boolean
    setAuthToken: (token: string) => void
    clearAuth: () => void
    refreshCurrentUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

function AuthProvider({ children }: AuthProviderProps) {
    const [token, setToken] = useState<string | null>(() => {
        return window.localStorage.getItem(AUTH_TOKEN_KEY) || window.localStorage.getItem("token")
    })
    const [user, setUser] = useState<UserProfile | null>(null)
    const [isAuthLoading, setIsAuthLoading] = useState(true)
    const refreshInFlightRef = useRef<Promise<void> | null>(null)

    const refreshCurrentUser = async () => {
        if (refreshInFlightRef.current) {
            return refreshInFlightRef.current
        }

        if (!token) {
            setUser(null)
            setIsAuthLoading(false)
            return
        }

        const runRefresh = async () => {
            setIsAuthLoading(true)

            try {
                const currentUser = await getCurrentUser()
                setUser(currentUser)
            } catch (error: any) {
                const statusCode = error?.response?.status
                console.error("Failed to refresh current user:", error)

                // Keep auth session on temporary server limits/transient errors.
                // Only clear auth when token is truly invalid.
                if (statusCode === 401 || statusCode === 403) {
                    window.localStorage.removeItem(AUTH_TOKEN_KEY)
                    window.localStorage.removeItem("token")
                    setToken(null)
                    setUser(null)
                }
            } finally {
                setIsAuthLoading(false)
                refreshInFlightRef.current = null
            }
        }

        const promise = runRefresh()
        refreshInFlightRef.current = promise
        return promise
    }

    useEffect(() => {
        refreshCurrentUser()
    }, [token])

    const setAuthToken = (nextToken: string) => {
        window.localStorage.setItem(AUTH_TOKEN_KEY, nextToken)
        window.localStorage.setItem("token", nextToken)
        setToken(nextToken)
    }

    const clearAuth = () => {
        window.localStorage.removeItem(AUTH_TOKEN_KEY)
        window.localStorage.removeItem("token")
        setToken(null)
        setUser(null)
        setIsAuthLoading(false)
    }

    const value = useMemo(() => ({
        token,
        user,
        isAuthLoading,
        setAuthToken,
        clearAuth,
        refreshCurrentUser,
    }), [token, user, isAuthLoading])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }

    return context
}

export { AuthProvider, useAuth }
