export default class FantasyLeagueMember {
   
    public id: string;
    public displayName: string;
    public rosterId: number;
    public wins: number = 0;
    public losses: number = 0;
    public ties: number = 0;
    public pf: number = 0;
    public pa: number = 0;
    public pp: number = 0;
    public opslap: number = 0;
    public trades: number = 0;
    public powerRank: number = 0;

    constructor(id: string, displayName: string, rosterId: number) {
      this.id = id;
      this.displayName = displayName;
      this.rosterId = rosterId
    }
  }
   