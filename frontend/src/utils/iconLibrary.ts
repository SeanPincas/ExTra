// ======================================================
// ICON LIBRARY
// Centralized icon system for ExTra
// ======================================================

import { createElement, type SVGProps } from "react"
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
    ChevronUp,
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
    CalendarDays,
    PenLine,
    Trash2,
    Camera,
    PiggyBank
} from "lucide-react"

function TripleChevronLeft(props: SVGProps<SVGSVGElement>) {
    const width = props.width ?? props.height ?? 18
    const height = props.height ?? props.width ?? 18

    return createElement(
        "svg",
        {
            ...props,
            width,
            height,
            viewBox: "0 0 24 24",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
        },
        createElement("path", {
            d: "M16.5 6.5L11 12L16.5 17.5",
            stroke: "currentColor",
            strokeWidth: "1.8",
            strokeLinecap: "round",
            strokeLinejoin: "round",
        }),
        createElement("path", {
            d: "M12.5 6.5L7 12L12.5 17.5",
            stroke: "currentColor",
            strokeWidth: "1.8",
            strokeLinecap: "round",
            strokeLinejoin: "round",
        }),
        createElement("path", {
            d: "M8.5 6.5L3 12L8.5 17.5",
            stroke: "currentColor",
            strokeWidth: "1.8",
            strokeLinecap: "round",
            strokeLinejoin: "round",
        }),
    )
}

function TripleChevronRight(props: SVGProps<SVGSVGElement>) {
    const width = props.width ?? props.height ?? 18
    const height = props.height ?? props.width ?? 18

    return createElement(
        "svg",
        {
            ...props,
            width,
            height,
            viewBox: "0 0 24 24",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
        },
        createElement("path", {
            d: "M7.5 6.5L13 12L7.5 17.5",
            stroke: "currentColor",
            strokeWidth: "1.8",
            strokeLinecap: "round",
            strokeLinejoin: "round",
        }),
        createElement("path", {
            d: "M11.5 6.5L17 12L11.5 17.5",
            stroke: "currentColor",
            strokeWidth: "1.8",
            strokeLinecap: "round",
            strokeLinejoin: "round",
        }),
        createElement("path", {
            d: "M15.5 6.5L21 12L15.5 17.5",
            stroke: "currentColor",
            strokeWidth: "1.8",
            strokeLinecap: "round",
            strokeLinejoin: "round",
        }),
    )
}

function StatsDockIcon(props: SVGProps<SVGSVGElement>) {
    const width = props.width ?? props.height ?? 18
    const height = props.height ?? props.width ?? 18

    return createElement(
        "svg",
        {
            ...props,
            width,
            height,
            viewBox: "0 0 24 24",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
        },
        createElement("rect", {
            x: "3.5",
            y: "4.5",
            width: "17",
            height: "15",
            rx: "3",
            stroke: "currentColor",
            strokeWidth: "1.7",
        }),
        createElement("path", {
            d: "M8 15V11",
            stroke: "currentColor",
            strokeWidth: "1.8",
            strokeLinecap: "round",
        }),
        createElement("path", {
            d: "M12 15V8",
            stroke: "currentColor",
            strokeWidth: "1.8",
            strokeLinecap: "round",
        }),
        createElement("path", {
            d: "M16 15V12.5",
            stroke: "currentColor",
            strokeWidth: "1.8",
            strokeLinecap: "round",
        }),
    )
}

function SortHighToLowIcon(props: SVGProps<SVGSVGElement>) {
    const width = props.width ?? props.height ?? 18
    const height = props.height ?? props.width ?? 18

    return createElement(
        "svg",
        {
            ...props,
            width,
            height,
            viewBox: "0 0 24 24",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
        },
        createElement("path", {
            d: "M4 6.5H18",
            stroke: "currentColor",
            strokeWidth: "1.9",
            strokeLinecap: "round",
        }),
        createElement("path", {
            d: "M4 11.5H15",
            stroke: "currentColor",
            strokeWidth: "1.9",
            strokeLinecap: "round",
        }),
        createElement("path", {
            d: "M4 16.5H11",
            stroke: "currentColor",
            strokeWidth: "1.9",
            strokeLinecap: "round",
        }),
        createElement("path", {
            d: "M17.5 19V8.2",
            stroke: "currentColor",
            strokeWidth: "1.9",
            strokeLinecap: "round",
        }),
        createElement("path", {
            d: "M14.5 11.2L17.5 8.2L20.5 11.2",
            stroke: "currentColor",
            strokeWidth: "1.9",
            strokeLinecap: "round",
            strokeLinejoin: "round",
        }),
    )
}

function SortLowToHighIcon(props: SVGProps<SVGSVGElement>) {
    const width = props.width ?? props.height ?? 18
    const height = props.height ?? props.width ?? 18

    return createElement(
        "svg",
        {
            ...props,
            width,
            height,
            viewBox: "0 0 24 24",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
        },
        createElement("path", {
            d: "M4 6.5H11",
            stroke: "currentColor",
            strokeWidth: "1.9",
            strokeLinecap: "round",
        }),
        createElement("path", {
            d: "M4 11.5H15",
            stroke: "currentColor",
            strokeWidth: "1.9",
            strokeLinecap: "round",
        }),
        createElement("path", {
            d: "M4 16.5H18",
            stroke: "currentColor",
            strokeWidth: "1.9",
            strokeLinecap: "round",
        }),
        createElement("path", {
            d: "M17.5 5V15.8",
            stroke: "currentColor",
            strokeWidth: "1.9",
            strokeLinecap: "round",
        }),
        createElement("path", {
            d: "M14.5 12.8L17.5 15.8L20.5 12.8",
            stroke: "currentColor",
            strokeWidth: "1.9",
            strokeLinecap: "round",
            strokeLinejoin: "round",
        }),
    )
}

// ======================================================
// EXPORT ICONS
// ======================================================

export const Icons = {

    // NAVIGATION
    menu: Menu,
    back: ChevronLeft,
    forward: ChevronRight,
    tripleBack: TripleChevronLeft,
    tripleForward: TripleChevronRight,
    down: ChevronDown,
    up: ChevronUp,

    // ACTIONS
    add: Plus,
    refresh: RefreshCcw,
    filter: Filter,
    search: Search,
    close: X,
    reset: Recycle,
    today: CalendarDays,
    edit: PenLine,
    delete: Trash2,
    camera: Camera,

    // USER
    user: User,
    logout: LogOut,
    settings: Settings,
    checkSquare: SquareCheck,
    eye: Eye,
    eyeOff: EyeOff,

    // FINANCE
    wallet: Wallet,
    savings: PiggyBank,
    income: TrendingUp,
    expense: TrendingDown,

    // DATA / ANALYTICS
    chart: BarChart3,
    pie: PieChart,
    stats: StatsDockIcon,
    sortHighToLow: SortHighToLowIcon,
    sortLowToHigh: SortLowToHighIcon,

    // SYSTEM
    notification: Bell,
    calendar: Calendar,

}
