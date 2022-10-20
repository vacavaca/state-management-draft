import { RequestState, useAPI } from "../lib/api"
import { useAuth } from "./auth"
import UpdatedAt from "./UpdatedAt"

function useLastPrice(symbol: string): RequestState<string> {
    const auth = useAuth()

    return useAPI(
        ['/api/v3/ticker/24hr', symbol, auth.user],
        async (url, symbol, user) => {
            const response = await fetch(`https://api.binance.com${url}?symbol=${symbol}`)
            const data = (await response.json()) as { lastPrice: string }

            return data.lastPrice
        },
        10e3
    )
}

interface Props {
    symbol: string
}

export default function Quote({ symbol }: Props) {
    const state = useLastPrice(symbol)
    return (
        <div>
            <br/>

            {state.data && (
                <div>
                    <p>{symbol} <b>Last Price: </b> {state.data}</p>
                    <UpdatedAt updatedAt={state.updatedAt} />
                </div>
            )}
            {state.isLoading && <span>Loading...</span>}
            {state.error && <span>Error!</span>}

            <br/>
            <button onClick={state.refresh}>Refresh</button>
        </div>
    )
}