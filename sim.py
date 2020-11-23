import random
import matplotlib.pyplot as plt
import numpy as np
import enum

class GambleOutcomes(enum.Enum):
    Won = 1
    Lost = 2
    NoPlay = 3

class Player:
    def __init__(self, startingHoldings, playerID):
        self.currentHoldings = startingHoldings
        self.holdingHistory = [startingHoldings]
        self.gameHistory = [[] for f in range(numRounds)]
        self.gamesPlayed = 0
        self.playerID = playerID
    def gamble(self):
        gambleStatus = GambleOutcomes.NoPlay
        global currentPot
        if(self.wouldGamble()):#check if this a gamble the player might make
            moneyToGamble = self.gambleAmount()
            #now to actually test if they won
            likelihood = 2.0/np.pi * np.arctan(0.2*moneyToGamble/currentPot)#2.0/np.pi * np.arctan(0.1*moneyToGamble/currentPot)
            if(likelihood < minimumProbability): likelihood = minimumProbability
           # likelihood = np.round(likelihood,3)
           # print("calculating likelihood for player",self.playerID,"-",likelihood)
            winningNum = random.uniform(0,1.0)
            if(winningNum <likelihood):
                gambleStatus = GambleOutcomes.Won
                currentPot += moneyToGamble
                self.currentHoldings += currentPot*(1-bankSkim)
                currentPot *= bankSkim
            else:
                gambleStatus = GambleOutcomes.Lost
                self.currentHoldings -= moneyToGamble 
                currentPot += moneyToGamble
            self.gamesPlayed +=1
        self.gameHistory[currRound].append(gambleStatus)
        return gambleStatus

    #would the player gamble
    def wouldGamble(self): 
        return (self.currentHoldings > 0.1) #gamble as long as they have at least $0.1
    
    #how much would the player gamble
    def gambleAmount(self):
        rand = random.uniform(0,0.5) #bet betwen 0-50% of earnings
        return min(rand*self.currentHoldings,10000) #never bet more than 1000 at a time

    #add currentHoldings to history of holdings (occurs at end of rounds)
    def updateHistory(self):
        self.holdingHistory.append(self.currentHoldings)

    def printHistory(self):
        wins = 0
        losses = 0
        noplays =0
        for game in self.gameHistory:
            for attempt in game:
                if attempt == GambleOutcomes.Won: wins+=1
                elif attempt == GambleOutcomes.Lost: losses +=1
                elif attempt == GambleOutcomes.NoPlay: noplays+=1
        hist = str(wins)+"/"+str(losses)+"/"+str(noplays)+"/"+str(self.gamesPlayed)
        
        print("Player",self.playerID,"Final Balance:",np.round(self.currentHoldings,2),"Wins/Losses/NoPlays/TotalPlays",hist)

bankHoldings = 0
bankHoldingHistory = [bankHoldings]
bankSkim = 0.05 #bank skims 5% to build big pot
bigPayoutFrequency = 100 #big pot happens every 100 times

numRounds = 500
currRound = 0
currentPot = 5 #start with a small pot first round

numPlayers = 500
defaultStartingMoney = 500 #amount each player starts with
minimumProbability = 0.01 #at least 1/100 chance for any player
#populate list of players
players = []
for i in range(numPlayers):
    p = Player(defaultStartingMoney, i)
    players.append(p)

for i in range(numRounds):
    if(i%bigPayoutFrequency==0 and i!=0):
        currentPot+= bankHoldings
        bankHoldings = 0
    print("**************************ROUND",i,"**************************") 
    #players spend money until someone wins or round ends
    roundWon = False
    attempts = 0
    while(roundWon==False):
        #pick random palyer
        randPlayer = np.random.randint(numPlayers)
        #print("P",randPlayer," ($",players[randPlayer].currentHoldings,") attempting gamble POT:",currentPot)
        gambleStatus = players[randPlayer].gamble()
        #print("outcome:",gambleStatus)
        if(gambleStatus!=GambleOutcomes.NoPlay): attempts+=1
        #if(gambleStatus==GambleOutcomes.NoPlay):
            #print("P",randPlayer,"did not play this round,",i)
        if(gambleStatus==GambleOutcomes.Won): #if player won
            print("P",randPlayer, "won round",i,"after",attempts,"attempts")
            bankHoldings += currentPot
            currentPot = 5 #start next round with $5
            roundWon = True
            break
        
    for p in players:
        p.updateHistory()
    bankHoldingHistory.append(bankHoldings)
    currRound+=1

for p in players:
    p.printHistory()

rounds = np.arange(currRound+1)
plt.figure()
for p in players:
    plt.plot(rounds, p.holdingHistory)

plt.plot(rounds, bankHoldingHistory, label='Bank Holdings')
plt.xlabel("Round number")
plt.ylabel("Current $ owned")
title = "Holdings over rounds for "+str(numPlayers)+" players"
plt.title(title)
plt.legend()

finalHoldings = []
for p in players:
    finalHoldings.append(p.currentHoldings)

plt.figure()
logbins = np.geomspace(min(finalHoldings), max(finalHoldings), 10)#split into 20 bins
plt.hist(finalHoldings, bins=logbins)
plt.xscale('log')
plt.ylabel("number of players owning amount")
plt.xlabel("final $ owned")
plt.title("Final holdings")
plt.show()


