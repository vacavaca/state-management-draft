import { useState } from "react"
import { useInterval } from "../lib/hooks"

interface Props {
    updatedAt: number
}

export default function UpdatedAt({ updatedAt }: Props) {
    const [_, update] = useState(0)

    useInterval(() => update(state => state + 1), 100)

    if (updatedAt == 0) {
        return null
    }

    const delta = ((Date.now() - updatedAt) / 1e3)

    return (
        <p style={{ opacity: delta > 0.15 ? .3 : 1 }}>Updated {delta.toFixed(1)} seconds ago</p>
    )
}