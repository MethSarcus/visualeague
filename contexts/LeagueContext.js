import { createContext, useContext } from "react";
import League from "../classes/custom/League";

export const LeagueContext = createContext();

// Export Provider.
export function LeagueProvider(props) {
	const {value, children} = props
	
	return (
	   <LeagueContext.Provider value={value}>
		{children}
	   </LeagueContext.Provider>
	)
}

// Export useContext Hook.
export function useLeagueContext() {
	return useContext(LeagueContext);
}