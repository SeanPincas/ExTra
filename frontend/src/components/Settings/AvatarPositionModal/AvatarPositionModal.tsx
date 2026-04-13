import { useEffect, useMemo, useRef, useState } from "react"
import { Icons } from "../../../utils/iconLibrary"
import styles from "./AvatarPositionModal.module.css"

interface AvatarPositionModalProps {
    imageSrc: string
    onClose: () => void
    onApply: (nextImage: string) => void
}

const PREVIEW_SIZE = 220
const OUTPUT_SIZE = 320

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
}

function AvatarPositionModal({ imageSrc, onClose, onApply }: AvatarPositionModalProps) {
    const imageRef = useRef<HTMLImageElement | null>(null)
    const dragStateRef = useRef({
        active: false,
        startX: 0,
        startY: 0,
        startOffsetX: 0,
        startOffsetY: 0,
    })

    const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 })
    const [zoom, setZoom] = useState(1)
    const [offset, setOffset] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const image = new Image()
        image.onload = () => {
            setNaturalSize({
                width: image.naturalWidth,
                height: image.naturalHeight,
            })
        }
        image.src = imageSrc
    }, [imageSrc])

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose()
            }
        }

        window.addEventListener("keydown", handleEscape)

        return () => {
            window.removeEventListener("keydown", handleEscape)
        }
    }, [onClose])

    const minZoom = useMemo(() => {
        if (!naturalSize.width || !naturalSize.height) {
            return 1
        }

        return Math.max(
            PREVIEW_SIZE / naturalSize.width,
            PREVIEW_SIZE / naturalSize.height,
        )
    }, [naturalSize])

    const maxZoom = useMemo(() => Math.max(minZoom + 1.8, minZoom * 2.6), [minZoom])

    useEffect(() => {
        setZoom(minZoom)
        setOffset({ x: 0, y: 0 })
    }, [minZoom, imageSrc])

    const boundedOffset = useMemo(() => {
        if (!naturalSize.width || !naturalSize.height) {
            return { x: 0, y: 0 }
        }

        const displayedWidth = naturalSize.width * zoom
        const displayedHeight = naturalSize.height * zoom
        const maxOffsetX = Math.max(0, (displayedWidth - PREVIEW_SIZE) / 2)
        const maxOffsetY = Math.max(0, (displayedHeight - PREVIEW_SIZE) / 2)

        return {
            x: clamp(offset.x, -maxOffsetX, maxOffsetX),
            y: clamp(offset.y, -maxOffsetY, maxOffsetY),
        }
    }, [naturalSize, offset.x, offset.y, zoom])

    useEffect(() => {
        setOffset(boundedOffset)
    }, [boundedOffset.x, boundedOffset.y])

    const beginDrag = (clientX: number, clientY: number) => {
        dragStateRef.current = {
            active: true,
            startX: clientX,
            startY: clientY,
            startOffsetX: boundedOffset.x,
            startOffsetY: boundedOffset.y,
        }
    }

    const updateDrag = (clientX: number, clientY: number) => {
        if (!dragStateRef.current.active) {
            return
        }

        setOffset({
            x: dragStateRef.current.startOffsetX + (clientX - dragStateRef.current.startX),
            y: dragStateRef.current.startOffsetY + (clientY - dragStateRef.current.startY),
        })
    }

    const endDrag = () => {
        dragStateRef.current.active = false
    }

    const handleWheelZoom = (deltaY: number) => {
        setZoom((currentZoom) => clamp(currentZoom + (deltaY > 0 ? -0.08 : 0.08), minZoom, maxZoom))
    }

    const handleApply = () => {
        const image = imageRef.current

        if (!image || !naturalSize.width || !naturalSize.height) {
            return
        }

        const displayedWidth = naturalSize.width * zoom
        const displayedHeight = naturalSize.height * zoom
        const left = (PREVIEW_SIZE - displayedWidth) / 2 + boundedOffset.x
        const top = (PREVIEW_SIZE - displayedHeight) / 2 + boundedOffset.y

        const sourceX = clamp((0 - left) / zoom, 0, naturalSize.width)
        const sourceY = clamp((0 - top) / zoom, 0, naturalSize.height)
        const sourceWidth = clamp(PREVIEW_SIZE / zoom, 1, naturalSize.width - sourceX)
        const sourceHeight = clamp(PREVIEW_SIZE / zoom, 1, naturalSize.height - sourceY)

        const canvas = document.createElement("canvas")
        canvas.width = OUTPUT_SIZE
        canvas.height = OUTPUT_SIZE

        const context = canvas.getContext("2d")
        if (!context) {
            return
        }

        context.drawImage(
            image,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            OUTPUT_SIZE,
            OUTPUT_SIZE,
        )

        onApply(canvas.toDataURL("image/jpeg", 0.92))
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
                <button
                    type="button"
                    className={styles.closeButton}
                    aria-label="Close avatar editor"
                    onClick={onClose}
                >
                    <Icons.close size={16} />
                </button>

                <div className={styles.header}>
                    <h3 className={styles.title}>Position Profile Picture</h3>
                    <p className={styles.subtitle}>Drag the image and adjust zoom until it fits the frame.</p>
                </div>

                <div className={styles.previewSection}>
                    <div
                        className={styles.previewFrame}
                        onWheel={(event) => {
                            event.preventDefault()
                            handleWheelZoom(event.deltaY)
                        }}
                        onMouseDown={(event) => beginDrag(event.clientX, event.clientY)}
                        onMouseMove={(event) => updateDrag(event.clientX, event.clientY)}
                        onMouseUp={endDrag}
                        onMouseLeave={endDrag}
                        onTouchStart={(event) => {
                            const touch = event.touches[0]
                            if (!touch) {
                                return
                            }
                            beginDrag(touch.clientX, touch.clientY)
                        }}
                        onTouchMove={(event) => {
                            const touch = event.touches[0]
                            if (!touch) {
                                return
                            }
                            updateDrag(touch.clientX, touch.clientY)
                        }}
                        onTouchEnd={endDrag}
                    >
                        <img
                            ref={imageRef}
                            src={imageSrc}
                            alt="Chosen profile picture"
                            className={styles.previewImage}
                            draggable={false}
                            style={{
                                transform: `translate(calc(-50% + ${boundedOffset.x}px), calc(-50% + ${boundedOffset.y}px)) scale(${zoom})`,
                            }}
                        />
                        <div className={styles.cropRing} aria-hidden="true" />
                    </div>

                    <div className={styles.controls}>
                        <label className={styles.sliderGroup}>
                            <span>Zoom</span>
                            <input
                                type="range"
                                min={minZoom}
                                max={maxZoom}
                                step="0.01"
                                value={zoom}
                                onChange={(event) => setZoom(Number(event.target.value))}
                            />
                        </label>

                        <button
                            type="button"
                            className={`btnBase btnMatteDark ${styles.resetButton}`}
                            onClick={() => {
                                setZoom(minZoom)
                                setOffset({ x: 0, y: 0 })
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={`btnBase btnMatteDark ${styles.cancelButton}`}
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className={`btnBase ${styles.applyButton}`}
                        onClick={handleApply}
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AvatarPositionModal
