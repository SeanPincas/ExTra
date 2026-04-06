// ======================================================
// ICON LIBRARY
// Centralized icon system for ExTra
// ======================================================

import {
    Menu,
    Plus,
    User,
    Bell,
    Search,
    Calendar,
    Filter,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    RefreshCcw,
    Wallet,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    Settings,
    LogOut,
    SquareCheck,
    Eye,
    EyeOff,
    X,
    Recycle,
    CalendarDays
} from "lucide-react"

// ======================================================
// EXPORT ICONS
// ======================================================

export const Icons = {

    // NAVIGATION
    menu: Menu,
    back: ChevronLeft,
    forward: ChevronRight,
    down: ChevronDown,

    // ACTIONS
    add: Plus,
    refresh: RefreshCcw,
    filter: Filter,
    search: Search,
    close: X,
    reset: Recycle,
    today: CalendarDays,

    // USER
    user: User,
    logout: LogOut,
    settings: Settings,
    checkSquare: SquareCheck,
    eye: Eye,
    eyeOff: EyeOff,

    // FINANCE
    wallet: Wallet,
    income: TrendingUp,
    expense: TrendingDown,

    // DATA / ANALYTICS
    chart: BarChart3,
    pie: PieChart,

    // SYSTEM
    notification: Bell,
    calendar: Calendar,

}
