import { createContext, useContext } from "react";
import League from "../classes/custom/League";

export const StatsContext = createContext();

// Export Provider.
export function LeagueProvider(props) {
	const {value, children} = props
	
	return (
	   <StatsContext.Provider value={value}>
		{children}
	   </StatsContext.Provider>
	)
}

// Export useContext Hook.
export function useLeagueContext() {
	return useContext(StatsContext);
}