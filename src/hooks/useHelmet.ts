import helmetContext, { HelmetContextValue } from "@core/contexts/helmetContext"
import { useContext } from "react"

const useHelmet = (): HelmetContextValue => {
    return useContext(helmetContext)
}

export default useHelmet;
