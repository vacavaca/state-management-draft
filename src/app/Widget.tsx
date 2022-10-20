import { useState } from "react"
import { useEvent, useKeyMemo } from "../lib/hooks"
import { useAuth } from "./auth"
import Quote from "./Quote"

interface Props {

}

export default function Widget({ }: Props) {
    const auth = useAuth()
    const [symbol, setSymbol] = useState("BTCUSDT")

    const handleAuthClick = useEvent(() => !auth.user ? auth.login({}) : auth.logout())
    const handleSymbolClick = useKeyMemo(symbol => () => setSymbol(symbol), [])

    return (
        <div>
            <button onClick={handleSymbolClick("BTCUSDT")}>
                Show BTC/USDT
            </button>
            &nbsp;&nbsp;
            <button onClick={handleSymbolClick("ETHUSDT")}>
                Show ETH/USDT
            </button>
            &nbsp;&nbsp;
            <button onClick={handleAuthClick}>
                Change auth
            </button>
            
            <br/>

            <div>
                <Quote symbol={symbol} />
            </div>
        </div>
    )
}